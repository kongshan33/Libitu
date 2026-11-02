"""Negotiated Stage 4 help, outside the realtime audio critical path."""
import asyncio
from copy import deepcopy
import time
from uuid import UUID, uuid4, uuid5, NAMESPACE_URL

from app.schemas.speaking_conversation import HelpRequest
from app.services import speaking_runtime_state as state_ops
from app.services.speaking_conversation_content import analyze_question, generate_conversation_help_bundle, quote_ref
from app.services.speaking_conversation_cache import ConversationHelpCache, help_context_key
from app.services.speaking_conversation_state import ACTIVE, CONTENT, apply_stage_receipt, close_question, negotiated, retire_help
from app.services.speaking_opportunities import target_is_skipped, target_version
from app.services.speaking_support import effective_support
from app.services.speaking_teaching import find_target_quote

LEVELS = ('direction', 'usage', 'example')


class ConversationRuntime:
    def init_conversation(self):
        self.conversation_epoch = 0
        self.closed_question_ids = set()
        self.activity_sequence = -1
        self.activity_window = time.monotonic()
        self.activity_count = 0
        self.activity_at = None
        self.draft_present = False
        self.surface_visible = False
        self.transcription_pending = False
        self.question_clock = None
        self.question_elapsed = 0.0
        self.question_sample = None
        self.question_analysis_pending = False
        self.conversation_cards = {}
        self.conversation_receipts = set()
        self.conversation_requests = {}
        self.conversation_help_cache = ConversationHelpCache()
        self.stage_acks = set()
        self.pending_stage_receipts = {}
        self.rephrase_seconds = self.settings.speaking_rephrase_seconds
        self.direction_seconds = self.settings.speaking_direction_seconds

    def conversation_enabled(self):
        return negotiated(self.state.get('document', {}))

    def conversation_input(self, status='responding'):
        if not self.conversation_enabled():
            return
        self.conversation_help_cache.clear()
        active = self.state['document'].get('conversation_state', {})
        question, card = active.get('question'), active.get('help')
        if question and question['status'] == status and question['automatic_help_closed'] and (not card or card['status'] == 'retired'):
            return
        self.conversation_epoch += 1
        self.question_sample = None
        # Close the local gate synchronously, before another heartbeat or model completion.
        question_id = (self.state['document'].get('conversation_state', {}).get('question') or {}).get('id')
        if question_id:
            self.closed_question_ids.add(question_id)
        close_question(self.state['document'], status)
        async def persist():
            try:
                await self.commit(lambda d, _: close_question(d, status)
                                  if (d.get("conversation_state", {}).get("question") or {}).get("id") == question_id else None)
            except Exception:
                self.diagnostic('conversation.input_uncommitted', {'reason': 'connection_fenced_or_storage'})
        self.background(persist())
        async def cancel_rephrase():
            try:
                async with self.operation_lock:
                    active_response = self.responses.get(self.active_response) or self.pending_request or {}
                    if (active_response.get('rephrase') or {}).get('id') == question_id:
                        await self.interrupt()
            except Exception:
                self.diagnostic('conversation.rephrase_cancel_unconfirmed', {'question_id': question_id})
        if question_id and ((self.responses.get(self.active_response) or self.pending_request or {}).get('rephrase') or {}).get('id') == question_id:
            self.background(cancel_rephrase())

    def conversation_activity(self, event):
        if not self.conversation_enabled():
            raise ValueError
        seq = event.get('sequence')
        if (set(event) != {'type', 'sequence', 'draft_present', 'surface_visible'} or
                type(seq) is not int or not 0 <= seq <= 2**53 - 1 or
                type(event.get('draft_present')) is not bool or type(event.get('surface_visible')) is not bool):
            raise ValueError
        if seq <= self.activity_sequence:
            return
        current = time.monotonic()
        if current - self.activity_window >= 10:
            self.activity_window, self.activity_count = current, 0
        self.activity_count += 1
        if self.activity_count > 30:
            raise ValueError('activity_rate')
        self.activity_sequence = seq
        self.activity_at = current
        if (event['draft_present'] and not self.draft_present or
                not event['surface_visible'] and self.surface_visible):
            self.recast_input()
            self.conversation_input()
        self.draft_present = event['draft_present']
        self.surface_visible = event['surface_visible']

    def question_presented(self, question):
        ref = question['current']
        message = next((m for m in self.state['document'].get('messages', [])
                        if m['id'] == ref['message_id'] and m['revision'] == ref['revision']
                        and m['status'] == 'final'), None)
        if not message or quote_ref(message, ref['quote']) != ref:
            return False
        if message['input_source'] == 'text':
            return (message['id'], message['revision']) in self.message_acks
        item = self.audio_items.get(message.get('provider_item_id'))
        return bool(item and not item.get('truncated') and item['generated_ms'] > 0
                    and item['played_ms'] >= item['generated_ms'] - 1)

    def conversation_presentation(self):
        question = (self.state.get('document', {}).get('conversation_state') or {}).get('question')
        if self.conversation_enabled() and question:
            self.stage_presentation(question)
        if (not self.conversation_enabled() or not question or question['auto_rephrase'] != 'reserved'
                or question['current'] == question['origin'] or not self.question_presented(question)):
            return
        receipt = {'question_id': question['id'], 'question_version': question['context_version'],
                   'message': deepcopy(question['current']), 'presented_at': state_ops.iso_now()}
        question['auto_rephrase'] = 'completed'
        async def persist():
            try:
                def apply(document, _):
                    state = document.get('conversation_state') or {}
                    current = state.get('question')
                    candidates = [*state.get('questions', []), *([current] if current else [])]
                    for q in candidates:
                        if q['id'] == receipt['question_id'] and q['context_version'] == receipt['question_version']:
                            if q['auto_rephrase'] == 'reserved':
                                q['auto_rephrase'] = 'completed'
                            rows = state.setdefault('rephrase_receipts', [])
                            if not any(row['question_id'] == q['id'] and row['question_version'] == q['context_version'] for row in rows):
                                rows.append(receipt)
                await self.commit(apply)
            except Exception:
                self.diagnostic('conversation.rephrase_receipt_uncommitted', {'question_id': receipt['question_id']})
        self.background(persist(), exposure=True)

    def stage_presentation(self, question):
        index = question.get('stage_index')
        steps = self.session.logic_template.steps if self.session.logic_template else []
        if (type(index) is not int or not 0 <= index < len(steps) or question['id'] in self.stage_acks
                or not self.question_presented({'current': question['origin']})):
            return
        self.stage_acks.add(question['id'])
        receipt = {'question_id': question['id'], 'stage_index': index, 'source': deepcopy(question['origin'])}
        self.pending_stage_receipts[question['id']] = receipt
        async def persist():
            try:
                await self.commit(lambda d, _: apply_stage_receipt(d, receipt))
                self.pending_stage_receipts.pop(question['id'], None)
            except Exception:
                self.diagnostic('conversation.stage_receipt_uncommitted', {'question_id': question['id']})
        self.background(persist(), exposure=True)

    def conversation_response_saved(self, response, status):
        if not self.conversation_enabled():
            return
        self.conversation_help_cache.clear()
        epoch = self.conversation_epoch
        analysis_id = response["id"]
        self.question_analysis_pending = analysis_id
        self.question_sample = None
        message = next((deepcopy(m) for m in self.state['document']['messages']
                        if m.get('response_id') == response['id']), None)
        previous = response.get('rephrase')
        async def analyze():
            try:
                result = await analyze_question(self.session, message, deepcopy(self.state['document']['messages']),
                                                previous['current']['quote'] if previous else None) if status == 'final' and message else None
                def apply(document, _):
                    state = document.setdefault('conversation_state', {})
                    current = state.get('question')
                    latest = document['messages'][-1] if document['messages'] else None
                    if (epoch != self.conversation_epoch or not latest or latest['id'] != message['id']
                            or latest['revision'] != message['revision'] or latest['status'] != 'final'):
                        return
                    if previous:
                        if not current or current['id'] != previous['id'] or current['context_version'] != previous['context_version']:
                            return
                        if not result:
                            close_question(document, 'interrupted')
                            return
                        current.update(current=result['ref'], context_version=current['context_version'] + 1,
                                       status='presenting')
                        retire_help(document)
                    elif result and state.get('question_count', 0) < 200:
                        close_question(document, 'superseded')
                        if current:
                            state.setdefault('questions', []).append(deepcopy(current))
                        state['question_count'] = state.get('question_count', 0) + 1
                        state['question'] = {'id': str(uuid4()), 'context_version': 1,
                            'origin': result['ref'], 'current': result['ref'],
                            'stage_index': response.get('stage_index'),
                            'target_item_id': result['target_item_id'], 'status': 'presenting',
                            'auto_rephrase': 'available', 'auto_direction': 'available', 'automatic_help_closed': False}
                    else:
                        close_question(document, 'superseded')
                    if self.draft_present or self.user_speaking:
                        close_question(document, 'responding')
                    state['simpler_question'] = result['simpler_question'] if result else None
                await self.commit(apply)
                self.conversation_presentation()
            except asyncio.CancelledError:
                raise
            except Exception:
                self.diagnostic('conversation.question_unavailable', {'response_id': response['id']})
                try:
                    await self.commit(lambda d, _: close_question(d, 'interrupted')
                                      if epoch == self.conversation_epoch and d.get("messages")
                                      and d["messages"][-1].get("response_id") == response["id"] else None)
                except Exception:
                    pass
            finally:
                if self.question_analysis_pending == analysis_id:
                    self.question_analysis_pending = False
        self.background(analyze())

    async def advance_conversation(self, current):
        question = (self.state['document'].get('conversation_state') or {}).get('question')
        if not question or question['status'] not in ACTIVE or self.question_analysis_pending:
            self.question_sample = None
            return
        if question['id'] != self.question_clock:
            self.question_clock, self.question_elapsed, self.question_sample = question['id'], 0.0, None
        presented = self.question_presented(question)
        self.conversation_presentation()
        eligible = (self.microphone and self.surface_visible and not self.draft_present and not self.user_speaking
                    and not self.transcription_pending and not self.response_busy() and not self.stop.is_set()
                    and self.activity_at is not None and 0 <= current - self.activity_at <= 15
                    and not question['automatic_help_closed'] and question['id'] not in self.closed_question_ids and presented)
        if not eligible:
            self.question_sample = None
            return
        if self.question_sample is not None:
            self.question_elapsed += max(0, min(current - self.question_sample, 3))
        self.question_sample = current
        if question['status'] == 'presenting':
            await self.commit(lambda d, _: d['conversation_state']['question'].update(status='awaiting_reply')
                              if d['conversation_state']['question']['id'] == question['id'] else None)
        if self.question_elapsed >= self.rephrase_seconds and question['auto_rephrase'] == 'available':
            reserved = False
            epoch = self.conversation_epoch
            def reserve(document, _):
                nonlocal reserved
                reserved = False
                q = (document.get('conversation_state') or {}).get('question')
                if q and q['id'] == question['id'] and q['auto_rephrase'] == 'available' and not q['automatic_help_closed']:
                    q['auto_rephrase'] = 'reserved'
                    reserved = True
            await self.commit(reserve)
            if reserved and epoch == self.conversation_epoch and not self.draft_present and not self.user_speaking:
                self.question_sample = None
                try:
                    await self.request_response(rephrase=deepcopy(question))
                except Exception:
                    await self.commit(lambda d, _: close_question(d, 'interrupted'))
                    raise
        elif self.question_elapsed >= self.direction_seconds and question['auto_direction'] == 'available':
            # Explicit legacy support semantics remain unchanged; V2 has its own staged control.
            if getattr(self.session.mission_plan, 'version', None) != 2 and effective_support(self.session, self.state['document']) is not None:
                await self.commit(lambda d, _: d['conversation_state']['question'].update(auto_direction='suppressed'))
            else:
                try:
                    await self.conversation_help({'type': 'help.request', 'request_id': str(uuid4()),
                        'question_id': question['id'], 'question_version': question['context_version'], 'level': 'direction'}, automatic=True)
                except ValueError:
                    # Fast activity may close the gate while the CAS read is in flight.
                    self.diagnostic('conversation.automatic_help_suppressed', {'question_id': question['id']})

    async def conversation_help(self, event, automatic=False):
        started = time.monotonic()
        request = HelpRequest.model_validate(event).model_dump()
        request['request_id'] = str(UUID(request['request_id']))
        request_id = request['request_id']
        if request_id in self.conversation_requests:
            if self.conversation_requests[request_id] != request:
                raise ValueError('request_id_conflict')
            await self.send({'type': 'snapshot', 'workspace': self.workspace()})
            return
        if len(self.conversation_requests) >= 100:
            raise ValueError('request_limit')
        if (not self.conversation_enabled() or self.user_speaking or self.draft_present
                or self.transcription_pending or self.response_busy() or self.question_analysis_pending
                or not self.surface_visible):
            raise ValueError('question_unavailable')
        epoch = self.conversation_epoch
        support = effective_support(self.session, self.state['document'])
        reserved = None
        cache_key = None
        def reserve(document, _):
            nonlocal reserved, cache_key
            reserved = None
            state = document.get('conversation_state') or {}
            q, old = state.get('question'), state.get('help')
            if (epoch != self.conversation_epoch or not q or q['id'] != request['question_id'] or q['context_version'] != request['question_version']
                    or q['status'] not in ACTIVE or not self.question_presented(q)
                    or effective_support(self.session, document) != support):
                raise ValueError('question_unavailable')
            target = request['target_item_id'] or q.get('target_item_id')
            if target and (target not in {str(i.id) for i in self.session.items} or
                           target_is_skipped(document, target)):
                raise ValueError('target_unavailable')
            same = old and old['question_id'] == q['id'] and old['question_version'] == q['context_version'] and old['target_item_id'] == target
            prior = LEVELS.index(old['level']) if same and old['status'] in {'ready', 'unavailable'} else -1
            expected = prior if same and old['status'] == 'unavailable' else min(prior + 1, 2)
            if LEVELS.index(request['level']) != expected and request['level'] != 'direction':
                raise ValueError('invalid_help_progression')
            if automatic:
                if q['automatic_help_closed'] or q['auto_direction'] != 'available':
                    return
                q['auto_direction'] = 'reserved'
            else:
                q['automatic_help_closed'] = True
                for key in ('auto_rephrase', 'auto_direction'):
                    if q[key] == 'available':
                        q[key] = 'suppressed'
            reserved = {'id': request_id, 'version': 1, 'question_id': q['id'], 'question_version': q['context_version'],
                'target_item_id': target, 'source': 'automatic' if automatic else 'requested', 'level': request['level'],
                'status': 'loading', **dict.fromkeys(CONTENT), 'error_code': None}
            cache_key = help_context_key(document, q, target, support, target_version(document, target), epoch)
            cached = self.conversation_help_cache.peek(cache_key)
            if cached:
                field = CONTENT[LEVELS.index(request['level'])]
                reserved.update(status='ready', version=2, **{field: cached[field]})
            state['help'] = reserved
        await self.commit(reserve)
        if not reserved:
            return
        self.conversation_requests[request_id] = request
        question = deepcopy(self.state['document']['conversation_state']['question'])
        card = deepcopy(reserved)
        target_revision = target_version(self.state["document"], card["target_item_id"])
        if card['status'] == 'ready':
            self.conversation_cards[(card['id'], card['version'])] = deepcopy(card)
            self.diagnostic('conversation.help_ready', {'request_id': request_id, 'cache_hit': True,
                            'elapsed_ms': round((time.monotonic() - started) * 1000, 2)})
            return
        history = deepcopy(self.state['document']['messages'])
        async def build_bundle():
            generated_at = time.monotonic()
            outcome = 'cancelled'
            try:
                bundle = await generate_conversation_help_bundle(self.session, question, history, card['target_item_id'])
                outcome = 'ready'
                return bundle
            except Exception:
                outcome = 'unavailable'
                raise
            finally:
                self.diagnostic('conversation.help_bundle', {'question_id': question['id'], 'outcome': outcome,
                                'elapsed_ms': round((time.monotonic() - generated_at) * 1000, 2)})
        async def generate():
            try:
                document = self.state['document']
                current = (document.get('conversation_state') or {}).get('question')
                if (not current or epoch != self.conversation_epoch
                        or help_context_key(document, current, card['target_item_id'], effective_support(self.session, document),
                                            target_version(document, card['target_item_id']), self.conversation_epoch) != cache_key):
                    return
                bundle = await self.conversation_help_cache.get(cache_key, lambda: asyncio.create_task(build_bundle()))
                wording = bundle[CONTENT[LEVELS.index(card['level'])]]
                card.update(status='ready', version=2, **{CONTENT[LEVELS.index(card['level'])]: wording})
            except asyncio.CancelledError:
                if asyncio.current_task().cancelling():
                    raise
                return  # Context invalidation cancelled the shared generation, not this request.
            except Exception:
                card.update(status='unavailable', version=2, error_code='unavailable')
            def finish(document, _):
                state = document.get('conversation_state') or {}
                q, active = state.get('question'), state.get('help')
                if (epoch != self.conversation_epoch or effective_support(self.session, document) != support
                        or target_is_skipped(document, card["target_item_id"])
                        or target_version(document, card["target_item_id"]) != target_revision
                        or not active or active['id'] != request_id or active['status'] != 'loading'
                        or not q or q['id'] != question['id'] or q['context_version'] != question['context_version']
                        or q['status'] not in ACTIVE or not self.question_presented(q)
                        or help_context_key(document, q, card['target_item_id'], effective_support(self.session, document),
                                            target_version(document, card['target_item_id']), self.conversation_epoch) != cache_key):
                    return
                state['help'] = deepcopy(card)
                if automatic and card['status'] == 'unavailable':
                    q['auto_direction'] = 'failed'
            try:
                await self.commit(finish, False)
                saved = self.state['document'].get('conversation_state', {}).get('help')
                if saved and saved == card and card['status'] == 'ready':
                    self.conversation_cards[(card['id'], card['version'])] = deepcopy(card)
                    self.diagnostic('conversation.help_ready', {'request_id': request_id, 'cache_hit': False,
                                    'elapsed_ms': round((time.monotonic() - started) * 1000, 2)})
                await self.send({'type': 'snapshot', 'workspace': self.workspace()})
            except Exception:
                self.diagnostic('conversation.help_discarded', {'request_id': request_id})
        self.background(generate())

    async def conversation_dismiss(self, event):
        def dismiss(document, _):
            state = document.get('conversation_state') or {}
            card = state.get('help')
            if card and card['id'] == event.get('hint_id') and card['version'] == event.get('version'):
                close_question(document, 'awaiting_reply')
        await self.commit(dismiss)

    def conversation_shown(self, event):
        if not self.conversation_enabled() or type(event.get('version')) is not int:
            return
        key = (event.get('hint_id'), event['version'])
        card = self.conversation_cards.get(key)
        if not card or key in self.conversation_receipts or any(event.get(k) != card[k] for k in ('question_id', 'question_version', 'level')):
            return
        self.conversation_receipts.add(key)
        level = card['level']
        item = next((i for i in self.session.items if str(i.id) == card['target_item_id']), None)
        if level == 'direction' and item and find_target_quote(card['direction'], item.text, item.kind):
            level = 'usage'
        latest = next((m for m in reversed(self.state['document']['messages']) if m['role'] == 'user'), {})
        exposure = {'id': str(uuid5(NAMESPACE_URL, f'libitu:conversation-help:{self.session_id}:{key}')),
            'kind': 'visual_hint', 'level': level, 'target_item_id': card['target_item_id'], 'scope': 'session',
            'visible_at': state_ops.iso_now(), 'overlap': self.user_speaking or self.transcription_pending,
            'source_message_id': latest.get('id'), 'source_revision': latest.get('revision', 0),
            'question_id': card['question_id'], 'question_version': card['question_version'],
            'hint_id': card['id'], 'hint_version': card['version']}
        self.persist_exposure(exposure)
        # A generic aid can incidentally reveal another selected expression.
        # Record those actual words too; target assignment is not an exposure filter.
        wording = card.get(CONTENT[LEVELS.index(card['level'])]) or ''
        for other in self.session.items:
            target_id = str(other.id)
            if target_id != card['target_item_id'] and find_target_quote(wording, other.text, other.kind):
                self.persist_exposure({**exposure,
                    'id': str(uuid5(NAMESPACE_URL, exposure['id'] + ':' + target_id)),
                    'target_item_id': target_id, 'level': 'example' if card['level'] == 'example' else 'usage'})
        self.diagnostic('conversation.help_shown', {'exposure': exposure}, event_id=exposure['id'])
        if card['source'] == 'automatic':
            async def complete():
                try:
                    def apply(d, _):
                        q = (d.get('conversation_state') or {}).get('question')
                        if q and q['id'] == card['question_id'] and q['auto_direction'] == 'reserved':
                            q['auto_direction'] = 'completed'
                    await self.commit(apply, False)
                except Exception:
                    pass
            self.background(complete(), exposure=True)
