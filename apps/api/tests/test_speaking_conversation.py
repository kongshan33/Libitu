"""Negotiated help lifecycle with injected providers and a deterministic clock."""
import asyncio
from copy import deepcopy
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from test_speaking_runtime import mission, active_connection  # noqa: F401
from app.schemas.speaking_runtime import RealtimeStart
from app.schemas.speaking_conversation import ConversationHelp
from app.schemas.speaking_plan import SpeakingPlanTarget
from app.services import speaking_runtime_state as states
from app.services import speaking_conversation_runtime as conversation
from app.services.speaking_conversation_content import quote_ref
from app.services.speaking_conversation_state import close_question


async def ready(mission, monkeypatch, voice=True):
    c, socket = active_connection(mission)
    async def wording(*args):
        return {'direction': 'You could… explain the benefit.', 'opening_words': 'We could begin by…',
                'example': 'We could begin by calling the customer.'}
    monkeypatch.setattr(conversation, 'generate_conversation_help_bundle', wording)
    c.response_saved = lambda *_: None
    c.microphone = voice
    c.surface_visible = True
    c.conversation_started = True
    message = {'id': str(uuid4()), 'revision': 1, 'text': 'Which customers would benefit?', 'role': 'assistant',
        'ordinal': 0, 'status': 'final', 'input_source': 'voice' if voice else 'text', 'created_at': states.iso_now(),
        'provider_item_id': 'audio-first', 'response_id': 'response-first'}
    ref = quote_ref(message, message['text'])
    q = {'id': str(uuid4()), 'context_version': 1, 'origin': ref, 'current': ref,
         'target_item_id': None, 'stage_index': None, 'status': 'presenting',
         'auto_rephrase': 'available', 'auto_direction': 'available', 'automatic_help_closed': False}
    def save(d, _):
        d['runtime']['conversation_contract_version'] = 1
        d['messages'] = [message]
        d['conversation_state'] = {'question': q, 'question_count': 1, 'simpler_question': 'Who would benefit?'}
    await c.commit(save)
    c.audio_items['audio-first'] = {'generated_ms': 500, 'played_ms': 500, 'response_id': 'response-first'}
    c.message_acks.add((message['id'], 1))
    return c, socket


async def drain(c):
    while c.coaching_tasks or c.exposure_tasks:
        await asyncio.gather(*list(c.coaching_tasks), *list(c.exposure_tasks))


def help_event(c, level='direction', **changes):
    q = c.state['document']['conversation_state']['question']
    return {'type': 'help.request', 'request_id': str(uuid4()), 'question_id': q['id'],
            'question_version': q['context_version'], 'level': level, **changes}


async def tick(c, value):
    c.activity_at = value
    await c.advance_silence(value)


def test_negotiation_rejects_before_claim_and_keeps_old_runtime_shape(mission):
    session, sid, adapter, settings = mission
    for version in (0, 2):
        with pytest.raises(HTTPException) as error:
            states.create_ticket(session.user_id, sid, RealtimeStart(client_connection_id=uuid4(), conversation_contract_version=version))
        assert error.value.status_code == 422
        assert not (adapter.read(session.user_id, sid) or {}).get('document', {}).get('runtime')
    ticket = states.create_ticket(session.user_id, sid, RealtimeStart(client_connection_id=uuid4(), conversation_contract_version=1))
    workspace = states.public_workspace(session.user_id, sid).model_dump(mode='json')
    assert workspace['runtime']['conversation_contract_version'] == 1
    assert workspace['conversation'] == {'contract_version': 1, 'question': None, 'help': None, 'recasts': [], 'stage_markers': []}
    assert ticket.ticket not in str(workspace)


def test_question_8_20_budget_and_same_identity_through_rephrase(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        original = deepcopy(c.state['document']['conversation_state']['question'])
        for t in (0, 2, 4, 6):
            await tick(c, t)
        assert not c.provider.sent
        await tick(c, 8)
        assert len(c.provider.sent) == 1
        assert c.pending_request['rephrase']['id'] == original['id']
        assert c.pending_request['policy_id'] is None
        assert 'Who would benefit?' in c.provider.sent[0]['response']['instructions']
        await tick(c, 40)  # Generation does not accrue eligible silence.
        assert len(c.provider.sent) == 1
        async def analyzed(session, message, history, previous):
            assert previous == original['current']['quote']
            return {'ref': quote_ref(message, message['text']), 'target_item_id': None, 'simpler_question': None}
        monkeypatch.setattr(conversation, 'analyze_question', analyzed)
        response = {**c.pending_request, 'id': 'rephrase-response', 'text': 'Who would benefit?', 'item_id': 'audio-rephrase'}
        c.audio_items['audio-rephrase'] = {'generated_ms': 500, 'played_ms': 0, 'response_id': response['id']}
        await c.save_assistant(response, 'final')
        c.response_requested = False
        c.pending_request = None
        await drain(c)
        q = c.state['document']['conversation_state']['question']
        assert q['id'] == original['id'] and q['context_version'] == 2 and q['origin'] == original['origin']
        assert q['auto_rephrase'] == 'reserved'
        await tick(c, 42)
        assert c.question_elapsed == 8
        c.audio_items['audio-rephrase']['played_ms'] = 500
        for t in range(44, 58, 2):
            await tick(c, t)
        await drain(c)
        assert c.state['document']['conversation_state']['question']['auto_rephrase'] == 'completed'
        assert len(c.state['document']['conversation_state']['rephrase_receipts']) == 1
        card = c.state['document']['conversation_state']['help']
        assert card['level'] == 'direction' and card['status'] == 'ready'
        assert c.state['document']['conversation_state']['question']['auto_direction'] == 'reserved'
        assert not c.state['document'].get('conversation_receipts')
        c.conversation_shown({'type': 'help.shown', 'hint_id': card['id'], 'version': card['version'],
            'question_id': q['id'], 'question_version': 2, 'level': 'direction'})
        await drain(c)
        assert len(c.state['document']['conversation_receipts']) == 1
        assert c.state['document']['conversation_state']['question']['auto_direction'] == 'completed'
        await tick(c, 70)
        assert len(c.provider.sent) == 1
    asyncio.run(run())


@pytest.mark.parametrize('gate', ['playback', 'draft', 'hidden', 'speech', 'transcription', 'text_only', 'stale_activity'])
def test_silence_excludes_ineligible_time(mission, monkeypatch, gate):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        c.activity_at = 0
        if gate == 'playback': c.audio_items['audio-first']['played_ms'] = 0
        if gate == 'draft': c.draft_present = True
        if gate == 'hidden': c.surface_visible = False
        if gate == 'speech': c.user_speaking = True
        if gate == 'transcription': c.transcription_pending = True
        if gate == 'text_only': c.microphone = False
        if gate == 'stale_activity': c.activity_at = -100
        for t in range(0, 30, 2):
            await c.advance_silence(t)
        assert not c.provider.sent and c.question_elapsed == 0
    asyncio.run(run())


def test_manual_levels_replace_idempotency_and_actual_receipt(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        with pytest.raises(ValueError): await c.conversation_help(help_event(c, 'usage'))
        for level in ('direction', 'usage', 'example'):
            event = help_event(c, level)
            await c.conversation_help(event)
            await drain(c)
            card = deepcopy(c.state['document']['conversation_state']['help'])
            assert card['level'] == level and card['status'] == 'ready'
            assert sum(card.get(field) is not None for field in conversation.CONTENT) == 1
            await c.conversation_help(event)
            assert c.state['document']['conversation_state']['help'] == card
            with pytest.raises(ValueError): await c.conversation_help({**event, 'question_version': 100})
            receipt = {'type': 'help.shown', 'hint_id': card['id'], 'version': 2,
                'question_id': card['question_id'], 'question_version': card['question_version'], 'level': level}
            c.conversation_shown({**receipt, 'level': 'wrong'})
            c.conversation_shown(receipt)
            c.conversation_shown(receipt)
            await drain(c)
        assert len(c.state['document']['conversation_receipts']) == 3
        assert not c.state['document']['controller']['exposures'], 'targetless receipts must not invent target use'
    asyncio.run(run())


def test_speech_and_new_question_fence_pending_help(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        release = asyncio.Event()
        async def delayed(*_):
            await release.wait()
            return {'direction': 'You could… explain the benefit.', 'opening_words': 'We could begin by…', 'example': 'We could begin by calling the customer.'}
        monkeypatch.setattr(conversation, 'generate_conversation_help_bundle', delayed)
        await c.conversation_help(help_event(c))
        c.conversation_input()
        release.set()
        await drain(c)
        q = c.state['document']['conversation_state']['question']
        assert q['automatic_help_closed']
        assert c.state['document']['conversation_state']['help']['status'] == 'retired'
        assert not c.conversation_cards and not c.state['document'].get('conversation_receipts')
        c.draft_present = False
        await tick(c, 100)
        assert not c.provider.sent
    asyncio.run(run())


def test_reconnect_closes_budgets_and_does_not_fabricate_old_questions(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        await c.conversation_help(help_event(c))
        await drain(c)
        old = deepcopy(c.state['document']['conversation_state']['question'])
        states.create_ticket(c.owner, c.session_id, RealtimeStart(client_connection_id=uuid4(), takeover=True, conversation_contract_version=1))
        saved = states.read_state(c.owner, c.session_id)['document']['conversation_state']
        assert saved['question']['id'] == old['id'] and saved['question']['automatic_help_closed']
        assert saved['question']['status'] == 'closed' and saved['help']['status'] == 'retired'
    asyncio.run(run())


def test_quote_utf16_and_optional_plan_serialization():
    assert quote_ref({'id': 'm', 'revision': 2, 'text': '😀 Ask me.'}, 'Ask me.')['start'] == 3
    assert quote_ref({'id': 'm', 'revision': 1, 'text': 'Why? Why?'}, 'Why?') is None
    target = SpeakingPlanTarget(corpus_item_id=uuid4(), role='primary', communicative_function='Explain', fit='high',
        fit_reason='Relevant', trigger_question='What next?', skip_when='Finished')
    assert 'simpler_question' not in target.model_dump()
    assert 'simpler_question' not in target.model_dump_json()
    target.simpler_question = 'What should we do?'
    assert target.model_dump()['simpler_question'] == 'What should we do?'
    with pytest.raises(ValidationError):
        ConversationHelp(id='x', version=1, question_id='q', question_version=1, source='requested', level='direction', status='ready', direction='You could… ask.', example='Leaked answer.')


@pytest.mark.parametrize('level,text,incomplete', [
    ('direction', 'Try to use a contrast.', False),
    ('direction', 'You could… be on the same page.', False),
    ('usage', 'We should be on the same page.', False),
    ('usage', 'We agree on everything…', False),
    ('usage', 'We could be on the same page about [topic]…', True),
    ('example', 'We agree. What next?', False),
    ('example', 'The weather looks nice.', False),
])
def test_wording_rejects_leaks_frames_complete_openings_and_unrelated_examples(monkeypatch, level, text, incomplete):
    import json
    from types import SimpleNamespace
    from app.services import speaking_conversation_content as content
    item = SimpleNamespace(id='target', text='on the same page', kind='idiom')
    session = SimpleNamespace(goal='Agree on delivery', items=[item])
    async def fake(*_, **kwargs):
        bundle = {
            'direction': {'text': 'You could… explain the benefit.', 'context_relevant': True, 'incomplete_opening': False},
            'opening_words': {'text': 'We could be on the same page about…', 'context_relevant': True, 'incomplete_opening': True},
            'example': {'text': 'We could be on the same page about the delivery date.', 'context_relevant': True, 'incomplete_opening': False}}
        bundle['opening_words' if level == 'usage' else level] = {'text': text, 'context_relevant': True, 'incomplete_opening': incomplete}
        return json.dumps(bundle), {}
    monkeypatch.setattr(content, 'request_analysis_json', fake)
    with pytest.raises(ValueError):
        asyncio.run(content.generate_conversation_help_bundle(session, {'current': {'quote': 'Can we agree?'}}, [], 'target'))


def test_activity_heartbeat_does_not_reopen_closed_question_and_rejects_draft_text(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        with pytest.raises(ValueError):
            c.conversation_activity({'type': 'client.activity', 'sequence': 1, 'draft_present': True, 'surface_visible': True, 'text': 'private'})
        c.conversation_activity({'type': 'client.activity', 'sequence': 2, 'draft_present': True, 'surface_visible': True})
        c.conversation_activity({'type': 'client.activity', 'sequence': 1, 'draft_present': False, 'surface_visible': True})
        assert c.draft_present
        await drain(c)
        c.conversation_activity({'type': 'client.activity', 'sequence': 3, 'draft_present': False, 'surface_visible': True})
        assert c.state['document']['conversation_state']['question']['automatic_help_closed']
        await tick(c, 100)
        assert not c.provider.sent
    asyncio.run(run())


def test_real_invitation_gets_identity_but_late_analysis_cannot_replace_next_question(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        gate = asyncio.Event()
        async def analyze(session, message, history, previous):
            if message['response_id'] == 'older':
                await gate.wait()
                raise ValueError('old response failed')
            return {'ref': quote_ref(message, message['text']), 'target_item_id': None, 'simpler_question': None}
        monkeypatch.setattr(conversation, 'analyze_question', analyze)
        await c.save_assistant({'id': 'older', 'audio': False, 'text': 'Tell me what changed.', 'item_id': 'older-item'}, 'final')
        await asyncio.sleep(0)
        await c.save_assistant({'id': 'newer', 'audio': False, 'text': 'What happens next?', 'item_id': 'newer-item'}, 'final')
        # Let the newer result win while the older classification remains in flight.
        for task in list(c.coaching_tasks):
            if not gate.is_set():
                await asyncio.sleep(0.02)
        gate.set()
        await drain(c)
        q = c.state['document']['conversation_state']['question']
        assert q['current']['quote'] == 'What happens next?'
        assert q['status'] == 'presenting' and not q['automatic_help_closed']
        assert c.state['document']['conversation_state']['questions'], 'superseded question budgets remain archived'
    asyncio.run(run())


def test_draft_during_rephrase_fence_never_queues_it_behind_a_new_turn(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch)
        question = deepcopy(c.state['document']['conversation_state']['question'])
        async def fence():
            c.draft_present = True
            c.conversation_input()
        monkeypatch.setattr(c, 'fence', fence)
        await c.request_response(rephrase=question)
        await drain(c)
        assert not c.provider.sent and not c.queued_response
    asyncio.run(run())


def test_targetless_help_still_records_an_incidentally_visible_selected_expression(mission, monkeypatch):
    from app.schemas.speaking import SpeakingSessionItem
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        target = SpeakingSessionItem(id=uuid4(), corpus_item_id=None, ordinal=0, kind='chunk', text='calling the customer')
        c.session.items.append(target)
        for level in ('direction', 'usage', 'example'):
            await c.conversation_help(help_event(c, level))
            await drain(c)
        card = c.state['document']['conversation_state']['help']
        assert card['target_item_id'] is None
        c.conversation_shown({'type': 'help.shown', 'hint_id': card['id'], 'version': 2,
            'question_id': card['question_id'], 'question_version': card['question_version'], 'level': 'example'})
        await drain(c)
        exposures = c.state['document']['controller']['exposures']
        assert len(exposures) == 1 and exposures[0]['target_item_id'] == str(target.id)
        assert exposures[0]['level'] == 'example'
        assert not c.state['document'].get('learning'), 'exposure itself never invents learner use'
    asyncio.run(run())


def test_duplicate_response_completion_preserves_question_identity_and_budgets(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        async def analyze(session, message, history, previous):
            return {'ref': quote_ref(message, message['text']), 'target_item_id': None, 'simpler_question': None}
        monkeypatch.setattr(conversation, 'analyze_question', analyze)
        response = {'id': 'next-question', 'audio': False, 'text': 'What happens next?', 'item_id': 'next-item'}
        await c.save_assistant(response, 'final')
        await drain(c)
        await c.commit(lambda d, _: d['conversation_state']['question'].update(auto_rephrase='failed'))
        question = deepcopy(c.state['document']['conversation_state']['question'])
        await c.save_assistant(response, 'final')
        await drain(c)
        assert c.state['document']['conversation_state']['question'] == question
    asyncio.run(run())


def set_stage(c, index=1):
    from app.schemas.speaking_plan import LogicTemplate
    from app.services import store
    c.session.logic_template = LogicTemplate(id='persuasive_pitch', title='Pitch', description='A proposal',
                                             steps=['Context', 'Tension', 'Proposal', 'Defend'])
    c.state['document']['conversation_state']['question']['stage_index'] = index
    store.speaking_sessions[c.session_id].logic_template = c.session.logic_template.model_copy(deep=True)


@pytest.mark.parametrize('voice', [True, False])
def test_stage_marker_requires_actual_presentation_and_survives_reconnect(mission, monkeypatch, voice):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=voice)
        set_stage(c)
        await c.commit(lambda d, _: d['conversation_state']['question'].update(stage_index=1))
        c.audio_items['audio-first']['played_ms'] = 0
        c.message_acks.clear()
        c.conversation_presentation(); await drain(c)
        assert c.workspace()['conversation']['stage_markers'] == []
        if voice: c.audio_items['audio-first']['played_ms'] = 500
        else:
            m = c.state['document']['messages'][0]
            c.message_acks.add((m['id'], m['revision']))
        c.conversation_presentation(); c.conversation_presentation(); await drain(c)
        markers = c.workspace()['conversation']['stage_markers']
        assert len(markers) == 1 and markers[0]['label'] == 'Tension'
        assert markers[0]['source'] == c.state['document']['conversation_state']['question']['origin']
        assert 'question_id' not in markers[0]
        states.create_ticket(c.owner, c.session_id, RealtimeStart(client_connection_id=uuid4(), takeover=True, conversation_contract_version=1))
        assert states.public_workspace(c.owner, c.session_id).model_dump(mode='json')['conversation']['stage_markers'] == markers
    asyncio.run(run())


def test_stage_markers_do_not_relabel_history_or_infer_old_messages(mission, monkeypatch):
    from app.services.speaking_conversation_state import apply_stage_receipt, stage_marker_view
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        set_stage(c, 0)
        document = c.state['document']
        assert stage_marker_view(document, c.session) == []
        for index, stage in enumerate([0, 0, 1]):
            message = {**document['messages'][0], 'id': f'm-{index}', 'ordinal': index}
            question = {**document['conversation_state']['question'], 'id': f'q-{index}', 'stage_index': stage,
                        'origin': quote_ref(message, message['text'])}
            document['messages'].append(message)
            document['conversation_state'].setdefault('questions', []).append(question)
            apply_stage_receipt(document, {'question_id': question['id'], 'source': question['origin'], 'stage_index': stage})
        markers = stage_marker_view(document, c.session)
        assert [(m['source']['message_id'], m['label']) for m in markers] == [('m-0', 'Context'), ('m-2', 'Tension')]
        document['conversation_state']['question']['stage_index'] = 3
        assert stage_marker_view(document, c.session) == markers
        document['messages'][1]['revision'] = 2
        assert [m['source']['message_id'] for m in stage_marker_view(document, c.session)] == ['m-1', 'm-2']
        document['messages'][2]['status'] = 'interrupted'
        assert [m['source']['message_id'] for m in stage_marker_view(document, c.session)] == ['m-2']
    asyncio.run(run())


def test_response_uses_stage_captured_before_async_question_analysis(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        set_stage(c, 3)
        async def analyzed(_session, message, *_):
            return {'ref': quote_ref(message, message['text']), 'target_item_id': None, 'simpler_question': None}
        monkeypatch.setattr(conversation, 'analyze_question', analyzed)
        response = {'id': 'new-response', 'text': 'Which option works?', 'item_id': 'new-item', 'stage_index': 1, 'audio': False}
        await c.save_assistant(response, 'final'); await drain(c)
        q = c.state['document']['conversation_state']['question']
        assert q['stage_index'] == 1
        assert c.workspace()['conversation']['stage_markers'] == []
    asyncio.run(run())


def test_end_keeps_pending_confirmed_stage_receipt(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        set_stage(c)
        await c.commit(lambda d, _: d['conversation_state']['question'].update(stage_index=1))
        q = c.state['document']['conversation_state']['question']
        receipt = {'question_id': q['id'], 'stage_index': 1, 'source': deepcopy(q['origin'])}
        result = states.end_session(c.owner, c.session_id, receipts={'runtime_id': c.runtime_id, 'stage_receipts': {q['id']: receipt}})
        assert result.conversation.stage_markers[0].label == 'Tension'
        assert not result.evidence
    asyncio.run(run())
