from copy import deepcopy
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException

from app.integrations.practice_analysis_repository import PracticeAnalysisRepository
from app.schemas.practice_analysis import ContentCheck, LayerAssessment, ProsodyResult, VoiceProsody
from app.services import practice_analysis_service as service
from app.services.acoustics.signal_prosody import analyze_signal
from app.services.acoustics.word_check import check_words
from test_signal_prosody import evidence, boundaries


@pytest.fixture
def snapshot():
    now = datetime.now(timezone.utc)
    attempt = dict(id=str(uuid4()), user_id='owner', content_id=str(uuid4()),
                   sentence_id='s1', sentence_text='We practice.', start_ms=0, end_ms=2000)
    signal = analyze_signal(evidence(), boundaries(), 'asr_word').model_dump(mode='json')
    voice = VoiceProsody(content=ContentCheck(status='matched'), alignment_status='aligned')
    reference = dict(id=str(uuid4()), user_id='owner', content_id=attempt['content_id'],
        input_mode='upload', state='completed', audio_ready=True, expires_at=(now+timedelta(days=1)).isoformat(),
        snapshot={'source_kind':'browser_capture', 'consent_version':'reference-analysis-v1','engine':{},
                  'sentences':[{'id':'s1','text':'We practice.','start_ms':0,'end_ms':2000}]},
        results=[{'sentence_id':'s1','coarse':{**signal,'boundary_source':'subtitle_word'}}])
    row = dict(id=attempt['id'], state='completed', phase='finished', analysis_version='practice-gated-v3',
        reference_id=reference['id'], created_at=now.isoformat(), input_cleaned_at=None,
        input_expires_at=(now+timedelta(days=1)).isoformat(), snapshot={'engine':{}},
        word_check=check_words('We practice.', {'text':'We practice.','reliable':True}).model_dump(mode='json'),
        coarse_checkpoint=signal, result=ProsodyResult(learner=voice, reference=voice, comparison='available',
                                                     assessment=LayerAssessment()).model_dump(mode='json'))
    return {'attempt':attempt, 'analysis':row, 'reference':reference}


def repository(snapshot):
    calls=[]
    def request(method,path,**kwargs):
        calls.append((method,path,kwargs))
        return httpx.Response(200,content="null") if snapshot is None else httpx.Response(200,json=deepcopy(snapshot))
    repo=PracticeAnalysisRepository.__new__(PracticeAnalysisRepository)
    repo.database=SimpleNamespace(_request=request)
    return repo,calls


def test_one_rpc_without_serial_reads_and_unchanged_projection(snapshot,monkeypatch):
    expected=service.format_view(snapshot['attempt'],snapshot['analysis'],snapshot['reference'])
    repo,calls=repository(snapshot)
    monkeypatch.setattr(service,'reference_for',lambda *_:pytest.fail('No second Reference lookup'))
    actual=service.read(repo,'owner',snapshot['attempt']['id'])
    assert actual==expected and actual.coarse.reference.boundary_source=='subtitle_word'
    assert calls==[('POST','/rpc/practice_analysis_read_snapshot',{'json':{'p_owner':'owner','p_id':snapshot['attempt']['id']}})]
    assert 'snapshot' not in actual.model_dump() and 'acoustic_checkpoint' not in actual.model_dump()


@pytest.mark.parametrize('change',['deleted','expired','text','start','end','sentence','content','revoked_grant','no_reference'])
def test_reference_revocation_preserves_learner_but_removes_comparison(snapshot,change,monkeypatch):
    ref=snapshot['reference']
    if change=='deleted':ref['state']='deleted'
    if change=='expired':ref['expires_at']=(datetime.now(timezone.utc)-timedelta(seconds=1)).isoformat()
    if change in ('text','start','end','sentence'):
        key={'text':'text','start':'start_ms','end':'end_ms','sentence':'id'}[change]
        ref['snapshot']['sentences'][0][key]='other' if key in ('text','id') else 999
    if change=='content':ref['content_id']=str(uuid4())
    if change=='revoked_grant':
        ref['input_mode']='file';monkeypatch.setattr(service.sources,'resolve_row',lambda _:None)
    if change=='no_reference':snapshot['reference']=None
    repo,_=repository(snapshot);view=service.read(repo,'owner',snapshot['attempt']['id'])
    assert view.result.learner and view.coarse.learner
    assert view.result.reference is None and view.result.assessment is None
    assert view.result.comparison=='unavailable' and view.coarse.reference is None


def test_local_operator_grants_are_rechecked_on_every_poll(snapshot,monkeypatch):
    snapshot['reference']['input_mode']='file'
    active=[True]
    monkeypatch.setattr(service.sources,'resolve_row',lambda _:object() if active[0] else None)
    repo,calls=repository(snapshot)
    assert service.read(repo,'owner',snapshot['attempt']['id']).result.reference
    active[0]=False
    assert service.read(repo,'owner',snapshot['attempt']['id']).result.reference is None
    assert len(calls)==2


def test_no_attempt_is_404_and_no_analysis_is_null(snapshot):
    repo,calls=repository(None)
    with pytest.raises(HTTPException) as error:service.read(repo,'wrong-owner',snapshot['attempt']['id'])
    assert error.value.status_code==404 and len(calls)==1
    snapshot['analysis']=None
    repo,calls=repository(snapshot)
    assert service.read(repo,'owner',snapshot['attempt']['id']) is None and len(calls)==1


def test_legacy_measurements_restore_frames_without_audio_or_mutating_result(snapshot, monkeypatch):
    legacy = analyze_signal(evidence(), boundaries(), 'mfa').model_dump(mode='json')
    legacy.pop('display_frames')
    snapshot['analysis']['result']['learner']['rhythm_signal'] = legacy
    snapshot['analysis']['input_cleaned_at'] = datetime.now(timezone.utc).isoformat()
    original = deepcopy(snapshot)
    repo, calls = repository(snapshot)
    monkeypatch.setattr(repo, 'display_checkpoint', lambda owner, attempt: evidence().model_dump(mode='json'))
    result = service.read(repo, 'owner', snapshot['attempt']['id'])
    assert len(result.result.learner.rhythm_signal.display_frames) == 100
    assert result.result.learner.rhythm_signal.words == analyze_signal(evidence(), boundaries(), 'mfa').words
    assert snapshot == original
    assert 'acoustic_checkpoint' not in result.model_dump_json()
    assert len(calls) == 1


def test_missing_or_deleted_evidence_never_invents_frames(snapshot, monkeypatch):
    legacy = analyze_signal(evidence(), boundaries(), 'mfa').model_dump(mode='json')
    legacy.pop('display_frames')
    snapshot['analysis']['result']['learner']['rhythm_signal'] = legacy
    repo, _ = repository(snapshot)
    monkeypatch.setattr(repo, 'display_checkpoint', lambda *_: None)
    assert service.read(repo, 'owner', snapshot['attempt']['id']).result.learner.rhythm_signal.display_frames == []
    snapshot['analysis']['state'] = 'deleted'
    monkeypatch.setattr(repo, 'display_checkpoint', lambda *_: pytest.fail('Do not read deleted evidence'))
    service.read(repo, 'owner', snapshot['attempt']['id'])


def test_reference_frames_keep_origin_and_revocation(snapshot, monkeypatch):
    legacy = analyze_signal(evidence(), boundaries(), 'mfa').model_dump(mode='json')
    legacy.pop('display_frames')
    snapshot['analysis']['result']['reference']['rhythm_signal'] = legacy
    snapshot['attempt'].update(start_ms=1130, end_ms=3130)
    snapshot['reference']['snapshot']['sentences'][0].update(start_ms=1130, end_ms=3130)
    full = deepcopy(snapshot['reference'])
    full['start_ms'] = 100
    measurements = evidence()
    for f in measurements.frames: f.time_sec += 1.03
    for s in measurements.speech: s.start_sec += 1.03; s.end_sec += 1.03
    full['results'][0]['measurements'] = measurements.model_dump(mode='json')
    monkeypatch.setattr(service, 'reference_for', lambda *_: full)
    repo, _ = repository(snapshot)
    frames = service.read(repo, 'owner', snapshot['attempt']['id']).result.reference.rhythm_signal.display_frames
    assert len(frames) == 100 and frames[0].time_sec == 0
    snapshot['reference']['state'] = 'deleted'
    monkeypatch.setattr(service, 'reference_for', lambda *_: pytest.fail('Do not restore revoked Reference'))
    assert service.read(repo, 'owner', snapshot['attempt']['id']).result.reference is None


def test_checkpoint_query_scopes_owner_parent_and_terminal_state():
    calls = []
    def request(method, path, **kwargs):
        calls.append(kwargs['params'])
        return httpx.Response(200, json=[])
    repo = PracticeAnalysisRepository.__new__(PracticeAnalysisRepository)
    repo.database = SimpleNamespace(_request=request)
    assert repo.display_checkpoint('owner', 'take') is None
    params = calls[0]
    assert params['user_id'] == params['shadow_attempts.user_id'] == 'eq.owner'
    assert params['shadow_attempts.deleted_at'] == 'is.null'
    assert params['state'] == 'in.(completed,needs_review)'
