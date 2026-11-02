"""Whole-bundle validation, request coalescing, context fencing and real-only exposure."""
import asyncio
import json
from copy import deepcopy
from uuid import uuid4
from types import SimpleNamespace

import pytest

from test_speaking_runtime import mission  # noqa: F401
from test_speaking_conversation import ready, drain, help_event
from app.schemas.speaking import SpeakingSessionItem
from app.services import speaking_conversation_runtime as runtime
from app.services import speaking_conversation_content as content

BUNDLE = {'direction': 'You could… explain the benefit.', 'opening_words': 'We could begin by…',
          'example': 'We could begin by calling the customer.'}


def test_three_clicks_make_one_model_call_and_publish_only_requested_content(mission, monkeypatch):
    async def run():
        c, socket = await ready(mission, monkeypatch, voice=False)
        calls = []
        async def generate(*args):
            calls.append(args)
            return deepcopy(BUNDLE)
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', generate)
        cards = []
        for index, level in enumerate(('direction', 'usage', 'example')):
            event = help_event(c, level)
            await c.conversation_help(event); await drain(c)
            card = deepcopy(c.workspace()['conversation']['help']); cards.append(card)
            field = ('direction', 'opening_words', 'example')[index]
            assert card[field] == BUNDLE[field]
            assert sum(card.get(name) is not None for name in BUNDLE) == 1
            if index:
                versions = [row['workspace']['conversation']['help'] for row in socket.sent
                            if row.get('type') == 'snapshot' and (row['workspace'].get('conversation', {}).get('help') or {}).get('id') == event['request_id']]
                assert all(row['status'] == 'ready' for row in versions), 'cache hit has no loading write'
            assert not c.state['document'].get('conversation_receipts'), 'generating or delivering is not exposure'
        assert len(calls) == 1
        # A receipt for an unrequested level must not expose the hidden example.
        first = cards[0]
        c.conversation_shown({'type': 'help.shown', 'hint_id': first['id'], 'version': first['version'],
            'question_id': first['question_id'], 'question_version': first['question_version'], 'level': 'example'})
        assert not c.state['document'].get('conversation_receipts')
        # The prior level can actually remain painted while the next request is pending.
        event = {'type': 'help.shown', 'hint_id': first['id'], 'version': first['version'],
                 'question_id': first['question_id'], 'question_version': first['question_version'], 'level': 'direction'}
        c.conversation_shown(event); c.conversation_shown(event); await drain(c)
        receipts = c.state['document']['conversation_receipts']
        assert len(receipts) == 1 and receipts[0]['level'] == 'direction'
        assert not c.workspace()['evidence'] and not c.workspace()['learning']
        await c.close_coaching()
    asyncio.run(run())


def test_inflight_same_context_is_shared_and_failure_retry_is_not_poisoned(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        gate, entered = asyncio.Event(), asyncio.Event()
        calls = 0
        async def generate(*_):
            nonlocal calls
            calls += 1; entered.set(); await gate.wait()
            if calls == 1: raise ValueError('invalid bundle')
            return deepcopy(BUNDLE)
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', generate)
        first = help_event(c)
        await c.conversation_help(first); await entered.wait()
        await c.conversation_help(first)  # Network replay.
        latest = help_event(c)
        await c.conversation_help(latest)  # Another request joins the same generation.
        gate.set(); await drain(c)
        assert calls == 1
        assert c.workspace()['conversation']['help']['status'] == 'unavailable'
        await c.conversation_help(help_event(c)); await drain(c)
        assert calls == 2 and c.workspace()['conversation']['help']['status'] == 'ready'
    asyncio.run(run())


@pytest.mark.parametrize('change', ['version', 'question', 'revision', 'support', 'target_version', 'input'])
def test_ready_bundle_cannot_cross_context_changes(mission, monkeypatch, change):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        item = SpeakingSessionItem(id=uuid4(), corpus_item_id=None, ordinal=0, kind='chunk', text='begin by')
        c.session.items.append(item)
        await c.commit(lambda d, _: d['conversation_state']['question'].update(target_item_id=str(item.id)))
        calls = []
        async def generate(*args): calls.append(args); return deepcopy(BUNDLE)
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', generate)
        await c.conversation_help(help_event(c)); await drain(c)
        def mutate(d, _):
            q = d['conversation_state']['question']
            if change == 'version': q['context_version'] += 1
            elif change == 'question': q['id'] = str(uuid4())
            elif change == 'revision':
                d['messages'][0]['revision'] += 1
                q['current']['revision'] += 1
                c.message_acks.add((q['current']['message_id'], q['current']['revision']))
            elif change == 'support': d['support'] = {'level': 'label_only', 'version': 1}
            elif change == 'target_version': d['target_states'] = {str(item.id): {'version': 1}}
        if change == 'input': c.conversation_input(); await drain(c)
        else: await c.commit(mutate)
        await c.conversation_help(help_event(c)); await drain(c)
        assert len(calls) == 2
    asyncio.run(run())


def test_target_switch_discards_bundle_and_disconnect_cancels_generation(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        c.session.items = [SpeakingSessionItem(id=uuid4(), corpus_item_id=None, ordinal=0, kind='chunk', text='begin by')]
        calls = []
        async def generate(*args): calls.append(args[-1]); return deepcopy(BUNDLE)
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', generate)
        await c.conversation_help(help_event(c)); await drain(c)
        await c.conversation_help(help_event(c, target_item_id=str(c.session.items[0].id))); await drain(c)
        assert calls == [None, str(c.session.items[0].id)]
        gate = asyncio.Event()
        async def blocked(*_): gate.set(); await asyncio.Event().wait()
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', blocked)
        await c.conversation_help(help_event(c)); await gate.wait()
        await c.close_coaching()
        assert c.conversation_help_cache.task is None
    asyncio.run(run())


def test_bundle_schema_uses_one_call_and_rejects_any_invalid_level(monkeypatch):
    session = SimpleNamespace(goal='Agree on delivery', items=[])
    raw = {field: {'text': text, 'context_relevant': True, 'incomplete_opening': field == 'opening_words'} for field, text in BUNDLE.items()}
    calls = []
    async def provider(*args, **kwargs): calls.append(kwargs); return json.dumps(raw), {}
    monkeypatch.setattr(content, 'request_analysis_json', provider)
    async def run():
        result = await content.generate_conversation_help_bundle(session, {'current': {'quote': 'What next?'}}, [], None)
        assert result == BUNDLE and len(calls) == 1
        assert calls[0]['prompt_version'] == 'conversation-help-bundle-v1'
        raw['example']['context_relevant'] = False
        with pytest.raises(ValueError): await content.generate_conversation_help_bundle(session, {'current': {'quote': 'What next?'}}, [], None)
    asyncio.run(run())


def test_new_question_version_replaces_inflight_bundle_without_poisoning_new_cache(mission, monkeypatch):
    async def run():
        c, _ = await ready(mission, monkeypatch, voice=False)
        entered, cancelled = asyncio.Event(), asyncio.Event()
        calls = []
        async def generate(_session, question, *_):
            calls.append(question['context_version'])
            if question['context_version'] == 1:
                entered.set()
                try: await asyncio.Event().wait()
                finally: cancelled.set()
            return deepcopy(BUNDLE)
        monkeypatch.setattr(runtime, 'generate_conversation_help_bundle', generate)
        await c.conversation_help(help_event(c)); await entered.wait()
        await c.commit(lambda d, _: d['conversation_state']['question'].update(context_version=2))
        request = help_event(c)
        await c.conversation_help(request); await drain(c)
        assert cancelled.is_set() and calls == [1, 2]
        card = c.workspace()['conversation']['help']
        assert card['id'] == request['request_id'] and card['question_version'] == 2 and card['status'] == 'ready'
        await c.conversation_help(help_event(c, 'usage')); await drain(c)
        assert calls == [1, 2], 'obsolete cancellation must not clear the newer cache'
    asyncio.run(run())
