"""Asynchronous recasts; never hold the audio path waiting for model analysis."""
import asyncio
from copy import deepcopy
from uuid import NAMESPACE_URL, uuid5

from app.services import speaking_runtime_state as state_ops
from app.services.speaking_recasts import (
    analyze_recast, apply_recast_receipt, close_recasts, delivery_valid, source_valid,
)
from app.services.speaking_teaching import find_target_quote


class RecastRuntime:
    def init_recasts(self):
        self.recast_epoch = 0
        self.recast_jobs = set()
        self.recast_boundaries = set()
        self.pending_recast_receipts = {}
        self.recast_acks = set()

    def recast_input(self):
        if not self.conversation_enabled():
            return
        self.recast_epoch += 1
        ids = {r['id'] for r in self.state['document'].get('recasts', []) if r.get('eligible')}
        close_recasts(self.state['document'])
        if ids:
            async def retire():
                try:
                    def apply(d, _):
                        for row in d.get('recasts', []):
                            if row['id'] in ids:
                                row['eligible'] = False
                                if row.get('reservation') in {'available', 'reserved'}:
                                    row['reservation'] = 'closed'
                    await self.commit(apply, False)
                except Exception:
                    self.diagnostic('recast.retirement_uncommitted', {'reason': 'connection_or_storage'})
            self.background(retire())

    def schedule_recast_source(self, message):
        if not self.conversation_enabled() or not message.get('text', '').strip():
            return
        self.schedule_recast(message)
        # Voice ASR may finish after the assistant response. Bind by the source
        # captured at response creation, never by whichever user turn is latest now.
        for response in self.responses.values():
            if response.get('persisted') and (response.get('recast_source') or {}).get('id') == message['id']:
                self.recast_response_saved(response, 'final')

    def recast_response_saved(self, response, status):
        if not self.conversation_enabled() or status != 'final' or response.get('rephrase'):
            return
        source = response.get('recast_source')
        if not source:
            return
        messages = self.state['document'].get('messages', [])
        user = next((m for m in messages if m['id'] == source['id'] and m['revision'] == source['revision'] and m['status'] == 'final'), None)
        assistant = next((m for m in messages if m.get('response_id') == response['id'] and m['status'] == 'final'), None)
        if user and assistant:
            self.schedule_recast(user, assistant, response.get('recast_epoch'))

    def schedule_recast(self, message, assistant=None, epoch=None):
        key = (message['id'], message['revision'], assistant['id'] if assistant else None)
        if key in self.recast_jobs or len(self.recast_jobs) >= 200:
            return
        self.recast_jobs.add(key)
        message, assistant = deepcopy(message), deepcopy(assistant)
        captured_epoch = self.recast_epoch if epoch is None else epoch
        initially_eligible = not self.user_speaking and not self.draft_present
        history = deepcopy(self.state['document'].get('messages', []))
        async def analyze():
            try:
                candidate = await analyze_recast(self.session, message, history, assistant)
                if not candidate:
                    return
                candidate.update(runtime_id=self.runtime_id, created_at=state_ops.iso_now())
                def save(document, _):
                    if not source_valid(candidate, document.get('messages', [])):
                        return
                    rows = document.setdefault('recasts', [])
                    old = next((r for r in rows if r['source']['message_id'] == message['id']), None)
                    if old and old['source']['revision'] > message['revision']:
                        return
                    if old and old['source']['revision'] == message['revision']:
                        if old.get('delivery') or (not assistant and old.get('validated')):
                            return
                        if old.get('reservation') == 'reserved' and old['replacement'] != candidate['replacement']:
                            return
                    elif len(rows) >= 100:
                        return
                    latest = next((m for m in reversed(document.get('messages', [])) if m['role'] == 'user'), {})
                    duplicate = any(r['id'] != candidate['id'] and r.get('dedupe_key') == candidate['dedupe_key']
                                    and (r.get('presented_at') or r.get('reservation') == 'reserved') for r in rows)
                    eligible = (initially_eligible and captured_epoch == self.recast_epoch and not self.user_speaking
                                and not self.draft_present and latest.get('id') == message['id']
                                and not duplicate and not self.stop.is_set())
                    record = {**candidate, 'eligible': eligible,
                        'reservation': 'available' if eligible and (message['id'], message['revision']) not in self.recast_boundaries else 'closed'}
                    if old:
                        record['version'] = old['version'] + 1
                        rows[rows.index(old)] = record
                    else:
                        rows.append(record)
                await self.commit(save, False)
                self.recast_presentations()
            except asyncio.CancelledError:
                raise
            except Exception:
                self.diagnostic('recast.analysis_unavailable', {'source_message_id': message['id'], 'revision': message['revision']})
        self.background(analyze())

    async def reserve_recast(self, source, request_id):
        if not source or not self.conversation_enabled():
            return None
        key = (source['id'], source['revision'])
        if key in self.recast_boundaries:
            return None
        self.recast_boundaries.add(key)
        candidate = next((r for r in self.state['document'].get('recasts', []) if r['source']['message_id'] == source['id']
                          and r['source']['revision'] == source['revision'] and r.get('eligible') and r.get('reservation') == 'available'), None)
        if not candidate:
            return None  # No waiting, no separate provider response, no later catch-up.
        reserved = None
        epoch = self.recast_epoch
        def reserve(document, _):
            nonlocal reserved
            reserved = None
            for row in document.get('recasts', []):
                if (row['id'] == candidate['id'] and row.get('eligible') and row.get('reservation') == 'available'
                        and source_valid(row, document['messages']) and epoch == self.recast_epoch
                        and not self.user_speaking and not self.draft_present
                        and not any(r['id'] != row['id'] and r.get('dedupe_key') == row['dedupe_key']
                                    and (r.get('presented_at') or r.get('reservation') == 'reserved') for r in document['recasts'])):
                    row.update(reservation='reserved', request_id=request_id)
                    reserved = deepcopy(row)
        await self.commit(reserve, False)
        return reserved if epoch == self.recast_epoch else None

    def recast_presentations(self):
        if not self.conversation_enabled():
            return
        for row in self.state['document'].get('recasts', []):
            if not row.get('delivery') or row.get('presented_at') or not source_valid(row, self.state['document']['messages']):
                continue
            if not delivery_valid(row, self.state['document']['messages']) or not self.question_presented({'current': row['delivery']}):
                continue
            key = f"partner:{row['id']}:{row['version']}"
            if key in self.recast_acks:
                continue
            self.recast_acks.add(key)
            self.persist_recast_receipt(key, {'id': row['id'], 'version': row['version'], 'kind': 'partner',
                'at': state_ops.iso_now(), 'live': row.get('eligible', False) and not self.user_speaking and not self.draft_present})

    def persist_recast_receipt(self, key, receipt):
        self.pending_recast_receipts[key] = receipt
        async def persist():
            try:
                await self.commit(lambda d, _: apply_recast_receipt(d, receipt))
                self.pending_recast_receipts.pop(key, None)
            except Exception:
                self.diagnostic('recast.receipt_uncommitted', {'recast_id': receipt['id']})
        self.background(persist(), exposure=True)

    def recast_shown(self, event):
        if not self.conversation_enabled() or type(event.get('version')) is not int:
            return
        row = next((r for r in self.state['document'].get('recasts', []) if r['id'] == event.get('recast_id')
                    and r['version'] == event['version'] and r.get('presented_at') and r.get('live_visible')), None)
        if not row or not source_valid(row, self.state['document']['messages']) or not delivery_valid(row, self.state['document']['messages']):
            return
        key = f"visual:{row['id']}:{row['version']}"
        if key in self.recast_acks:
            return
        self.recast_acks.add(key)
        at = state_ops.iso_now()
        self.persist_recast_receipt(key, {'id': row['id'], 'version': row['version'], 'kind': 'visual', 'at': at})
        latest = next((m for m in reversed(self.state['document']['messages']) if m['role'] == 'user'), {})
        for target in self.session.items:
            if find_target_quote(row['replacement'], target.text, target.kind):
                self.persist_exposure({'id': str(uuid5(NAMESPACE_URL, f'libitu:recast-exposure:{self.session_id}:{key}:{target.id}')),
                    'kind': 'visual_hint', 'level': 'usage', 'scope': 'session', 'target_item_id': str(target.id),
                    'visible_at': at, 'overlap': self.user_speaking or self.transcription_pending,
                    'source_message_id': latest.get('id'), 'source_revision': latest.get('revision', 0)})
