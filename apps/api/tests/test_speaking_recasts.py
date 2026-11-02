"""Minimal edits, delivery gates, stale analysis and frozen-report compatibility."""
import asyncio
from copy import deepcopy
from uuid import uuid4

import pytest

from test_speaking_runtime import mission, active_connection  # noqa: F401
from app.schemas.speaking import SpeakingSessionItem
from app.services import speaking_runtime_state as states
from app.services import speaking_recast_runtime as runtime
from app.services import speaking_recasts as recasts
from app.services.speaking_conversation_content import quote_ref
from app.integrations.speaking_feedback_repository import _freeze


def user(text='We product high-end chips.', revision=1):
    return {'id': 'learner', 'role': 'user', 'ordinal': 0, 'status': 'final', 'revision': revision,
            'input_source': 'text', 'text': text, 'created_at': states.iso_now()}


def partner(voice=False, text='So you produce high-end chips. Who buys them?'):
    return {'id': 'partner', 'role': 'assistant', 'ordinal': 1, 'status': 'final', 'revision': 1,
            'input_source': 'voice' if voice else 'text', 'text': text, 'created_at': states.iso_now(),
            'provider_item_id': 'audio', 'response_id': 'reply'}


def proposal(**changes):
    return recasts.CorrectionProposal.model_validate({
        'source_quote': 'We product high-end chips.', 'replacement': 'We produce high-end chips.',
        'edits': [{'before': 'product', 'after': 'produce'}], 'category': 'word_choice', 'rule_key': 'product_as_verb',
        'reason': 'Use the verb produce to describe making something.', 'confident': True, 'meaning_preserved': True,
        'complete_utterance': True, 'asr_reliable': True, 'delivery_quote': 'you produce high-end chips.', **changes})


def record(message=None, assistant=None, **changes):
    return recasts.validate_proposal('mission', message or user(), proposal(**changes), assistant)


async def ready(mission, monkeypatch, voice=False):
    c, socket = active_connection(mission)
    async def analyze(session, message, history, assistant=None):
        return record(message, assistant)
    monkeypatch.setattr(runtime, 'analyze_recast', analyze)
    c.microphone = voice
    c.surface_visible = True
    def save(d, _):
        d['runtime']['conversation_contract_version'] = 1
        d['messages'] = [user(), partner(voice)]
    await c.commit(save)
    if voice:
        c.audio_items['audio'] = {'response_id': 'reply', 'played_ms': 0, 'generated_ms': 500}
    return c, socket


async def drain(c):
    while c.coaching_tasks or c.exposure_tasks:
        await asyncio.gather(*list(c.coaching_tasks), *list(c.exposure_tasks))


def test_minimal_reconstruction_highlights_only_the_changed_word():
    value = record(assistant=partner())
    assert value['replacement'] == 'We produce high-end chips.'
    assert value['changed_spans'] == [{'start': 3, 'end': 10, 'quote': 'produce'}]
    assert value['delivery']['quote'] == 'you produce high-end chips.'
    assert user()['text'] == 'We product high-end chips.'


@pytest.mark.parametrize('changes', [
    {'confident': False}, {'meaning_preserved': False}, {'asr_reliable': False}, {'complete_utterance': False},
    {'source_quote': 'A fabricated learner sentence.'},
])
def test_uncertain_or_ungrounded_suggestions_abstain(changes):
    assert record(**changes) is None


@pytest.mark.parametrize('original,replacement,edits', [
    ('We can produce chips.', 'We must produce chips.', [{'before': 'can', 'after': 'must'}]),
    ('We produce 12 chips.', 'We produce 20 chips.', [{'before': '12', 'after': '20'}]),
    ('We work with Alice.', 'We work with Bob.', [{'before': 'Alice', 'after': 'Bob'}]),
    ('Alice makes chips.', 'Bob makes chips.', [{'before': 'Alice', 'after': 'Bob'}]),
    ('We do not agree.', 'We do agree.', [{'before': 'not ', 'after': ''}]),
    ('We make chips.', 'We manufacture expensive components.', [{'before': 'make chips', 'after': 'manufacture expensive components'}]),
    ('😀 We make chips.', 'We make chips.', [{'before': '', 'after': 'x', 'start': 1, 'end': 1}]),
    ('We make chips.', 'We made chips.', [{'before': 'makes', 'after': 'made', 'start': 3, 'end': 7}]),
])
def test_meaning_anchor_rewrites_and_invalid_ranges_are_rejected(original, replacement, edits):
    with pytest.raises((ValueError, UnicodeError)):
        recasts.minimal_edits(original, replacement, [recasts.EditProposal.model_validate(e) for e in edits])


def test_insertion_deletion_and_utf16_ranges_do_not_invent_bold_words():
    edits, spans = recasts.minimal_edits('😀 We make chip.', '😀 We make a chip.', [recasts.EditProposal(before='', after='a ', start=11, end=11)])
    assert spans == [{'start': 11, 'end': 12, 'quote': 'a'}]
    _, spans = recasts.minimal_edits('We make a chips.', 'We make chips.', [recasts.EditProposal(before='a ', after='')])
    assert spans == []
    assert edits[0]['start'] == 11


def test_repeated_before_requires_unambiguous_offsets():
    with pytest.raises(ValueError):
        recasts.minimal_edits('We product product parts.', 'We produce product parts.', [recasts.EditProposal(before='product', after='produce')])


@pytest.mark.parametrize('text,quote', [('We product high-end chips.', 'We product high-end chips.'), ('That sounds good.', 'That sounds good.'), ('you produce low-end chips.', 'you produce low-end chips.')])
def test_delivery_must_contain_the_actual_corrected_clause(text, quote):
    value = record(assistant=partner(text=text), delivery_quote=quote)
    assert value['delivery'] is None


def test_generation_is_private_until_matching_actual_presentation(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.schedule_recast(user(), partner())
        await drain(c)
        assert c.workspace()['conversation']['recasts'] == []
        c.message_acks.add(('partner', 1))
        c.recast_presentations()
        await drain(c)
        public = c.workspace()['conversation']['recasts']
        assert len(public) == 1
        assert not {'category', 'reason', 'rule_key', 'runtime_id', 'prompt_version'} & public[0].keys()
        assert c.state['document']['messages'][0]['text'] == user()['text']
        c.recast_presentations(); await drain(c)
        assert len(c.state['document']['recasts']) == 1
    asyncio.run(run())


def test_voice_waits_for_full_playback_and_visual_receipt_records_exposure_only(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, True)
        target = SpeakingSessionItem(id=uuid4(), corpus_item_id=None, ordinal=0, kind='chunk', text='produce high-end chips')
        c.session.items.append(target)
        c.schedule_recast(user(), partner(True)); await drain(c)
        c.message_acks.add(('partner', 1)); c.recast_presentations(); await drain(c)
        assert not c.workspace()['conversation']['recasts']
        c.audio_items['audio']['played_ms'] = 250; c.recast_presentations(); await drain(c)
        assert not c.workspace()['conversation']['recasts']
        c.audio_items['audio']['played_ms'] = 500; c.recast_presentations(); await drain(c)
        row = c.workspace()['conversation']['recasts'][0]
        event = {'type': 'recast.shown', 'recast_id': row['id'], 'version': row['version']}
        c.recast_shown(event); c.recast_shown(event); await drain(c)
        exposures = c.state['document']['controller']['exposures']
        assert len(exposures) == 1 and exposures[0]['level'] == 'usage'
        assert not c.state['document']['learning']
    asyncio.run(run())


def test_late_pair_analysis_is_report_only_after_new_input(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        gate = asyncio.Event()
        async def delayed(session, message, history, assistant=None):
            await gate.wait(); return record(message, assistant)
        monkeypatch.setattr(runtime, 'analyze_recast', delayed)
        c.message_acks.add(('partner', 1))
        c.schedule_recast(user(), partner())
        c.recast_input(); gate.set(); await drain(c)
        assert not c.workspace()['conversation']['recasts']
        frozen = _freeze(c.session, c.state['document'])
        report = recasts.report_recasts(frozen)
        assert len(report) == 1 and report[0]['delivered'] is True
        assert report[0]['category'] == 'word_choice'
        assert not c.provider.sent, 'late analysis must never request a catch-up response'
    asyncio.run(run())


def test_pending_instruction_is_reserved_once_but_not_published_as_delivery(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.schedule_recast(user()); await drain(c)
        source = {'id': 'learner', 'revision': 1}
        assert await c.reserve_recast(source, 'request-1')
        assert await c.reserve_recast(source, 'request-2') is None
        assert not c.workspace()['conversation']['recasts']
        assert recasts.report_recasts(_freeze(c.session, c.state['document']))[0]['delivered'] is False
    asyncio.run(run())


def test_transcript_revision_revokes_public_and_report_recast(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.message_acks.add(('partner', 1)); c.schedule_recast(user(), partner()); await drain(c)
        assert c.workspace()['conversation']['recasts']
        await c.commit(lambda d, _: d['messages'][0].update(revision=2, text='We produce high-end chips.'))
        assert not c.workspace()['conversation']['recasts']
        assert not recasts.report_recasts(_freeze(c.session, c.state['document']))
    asyncio.run(run())


def test_freeze_strips_private_nested_fields_and_old_sources_remain_unchanged(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        assert 'recasts' not in _freeze(c.session, c.state['document'])
        row = record(assistant=partner())
        row['source']['private'] = 'PRIVATE_SOURCE'; row['edits'][0]['private'] = 'PRIVATE_EDIT'
        row['instruction'] = 'PRIVATE_PROMPT'; row['delivery']['private'] = 'PRIVATE_DELIVERY'
        document = {**c.state['document'], 'recasts': [row]}
        frozen = _freeze(c.session, document)
        assert 'PRIVATE_' not in str(frozen)
        assert recasts.report_recasts(frozen)[0]['category'] == 'word_choice'
    asyncio.run(run())


def test_confirmed_deduplication_is_by_rule_and_edit_not_entire_category(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.message_acks.add(('partner', 1)); c.schedule_recast(user(), partner()); await drain(c)
        first = deepcopy(c.state['document']['recasts'][0])
        second = {**user(), 'id': 'second', 'ordinal': 2}
        assistant = {**partner(), 'id': 'second-partner', 'ordinal': 3, 'response_id': 'second-reply'}
        await c.commit(lambda d, _: d['messages'].extend([second, assistant]))
        c.message_acks.add(('second-partner', 1)); c.schedule_recast(second, assistant); await drain(c)
        assert len(c.workspace()['conversation']['recasts']) == 1
        assert c.state['document']['recasts'][-1]['eligible'] is False
        changed_rule = {**first, 'rule_key': 'different_word_choice', 'edits': [{'start': 3, 'end': 7, 'before': 'make', 'after': 'made'}]}
        assert recasts.correction_key(first) != recasts.correction_key(changed_rule)
    asyncio.run(run())


def test_current_reply_does_not_wait_for_analysis_or_send_a_separate_correction(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        gate = asyncio.Event()
        async def delayed(*args):
            await gate.wait(); return record()
        async def no_policy(): return None
        monkeypatch.setattr(runtime, 'analyze_recast', delayed)
        monkeypatch.setattr(c, 'eligible_policy', no_policy)
        c.schedule_recast_source(user())
        await asyncio.wait_for(c.request_response(), timeout=1)
        assert len(c.provider.sent) == 1
        assert c.pending_request['recast_source'] == {'id': 'learner', 'revision': 1}
        assert 'optional wording for that same point' not in c.provider.sent[0]['response']['instructions']
        gate.set(); await drain(c)
        assert c.state['document']['recasts'][0]['reservation'] == 'closed'
        assert len(c.provider.sent) == 1
    asyncio.run(run())


def test_end_merges_received_recast_fact_before_freezing_report(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.schedule_recast(user(), partner()); await drain(c)
        row = c.state['document']['recasts'][0]
        receipt = {'id': row['id'], 'version': row['version'], 'kind': 'partner', 'at': states.iso_now(), 'live': True}
        workspace = states.end_session(c.owner, c.session_id, {'runtime_id': c.runtime_id, 'recast_receipts': {'key': receipt}})
        saved = states.read_state(c.owner, c.session_id)['document']
        assert recasts.report_recasts(_freeze(c.session, saved))[0]['delivered'] is True
        assert workspace.session.status == 'completed'
    asyncio.run(run())


def test_voice_pair_binds_placeholder_identity_when_asr_finishes_after_reply(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=True)
        async def no_policy(): return None
        monkeypatch.setattr(c, 'eligible_policy', no_policy)
        monkeypatch.setattr(c, 'schedule_analysis', lambda message: None)
        monkeypatch.setattr(c, 'conversation_response_saved', lambda response, status: None)
        await c.commit(lambda d, _: d.update(messages=[]))
        await c.provider_event({'type': 'input_audio_buffer.committed', 'item_id': 'voice-user'})
        source = c.pending_request['recast_source']
        assert source['revision'] == 1
        await c.provider_event({'type': 'response.created', 'response': {'id': 'reply', 'metadata': {'request_id': c.pending_request['request_id']}}})
        await c.provider_event({'type': 'response.done', 'response': {'id': 'reply', 'status': 'completed', 'output': [
            {'role': 'assistant', 'id': 'audio', 'content': [{'transcript': partner()['text']}]}]}})
        assert not c.state['document'].get('recasts')
        await c.final_user_transcript('voice-user', user()['text'])
        await drain(c)
        row = c.state['document']['recasts'][0]
        assert row['source']['message_id'] == source['id'] and row['delivery'] is not None
        assert not c.workspace()['conversation']['recasts'], 'generated audio is not presented audio'
        c.audio_items['audio']['played_ms'] = 500
        c.recast_presentations(); await drain(c)
        assert len(c.workspace()['conversation']['recasts']) == 1
        assert len([e for e in c.provider.sent if e['type'] == 'response.create']) == 1
    asyncio.run(run())
