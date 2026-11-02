"""Question-scoped help state; opaque runtime JSON, independent of Mission versions."""
from copy import deepcopy
from app.services.speaking_recasts import public_recasts
from app.services.speaking_conversation_content import quote_ref

CONTENT = ('direction', 'opening_words', 'example')
ACTIVE = {'presenting', 'awaiting_reply', 'responding'}


def negotiated(document):
    return (document.get('runtime') or {}).get('conversation_contract_version') == 1


def retire_help(document):
    state = document.get('conversation_state') or {}
    card = state.get('help')
    if card and card['status'] != 'retired':
        card.update(status='retired', **dict.fromkeys(CONTENT))


def close_question(document, status='closed'):
    state = document.get('conversation_state') or {}
    question = state.get('question')
    if question:
        if question['status'] in ACTIVE:
            question['status'] = status
        question['automatic_help_closed'] = True
        for budget in ('auto_rephrase', 'auto_direction'):
            if question[budget] == 'available':
                question[budget] = 'suppressed'
            elif question[budget] == 'reserved':
                question[budget] = 'failed'
    retire_help(document)


def apply_stage_receipt(document, receipt):
    state = document.get('conversation_state') or {}
    questions = [*state.get('questions', []), *([state['question']] if state.get('question') else [])]
    question = next((q for q in questions if q['id'] == receipt['question_id']
                     and q['origin'] == receipt['source'] and q['stage_index'] == receipt['stage_index']), None)
    source = receipt['source']
    message = next((m for m in document.get('messages', []) if m['id'] == source['message_id']
                    and m['revision'] == source['revision'] and m['role'] == 'assistant' and m['status'] == 'final'), None)
    if not question or not message or quote_ref(message, source['quote']) != source:
        return
    rows = state.setdefault('stage_markers', [])
    if len(rows) < 200 and not any(row['question_id'] == receipt['question_id'] for row in rows):
        rows.append(deepcopy(receipt))


def stage_marker_view(document, session):
    steps = session.logic_template.steps if session and session.logic_template else []
    rows = (document.get('conversation_state') or {}).get('stage_markers', [])
    result, previous = [], None
    for message in sorted(document.get('messages', []), key=lambda m: m.get('ordinal', 0)):
        if message['role'] != 'assistant' or message['status'] != 'final':
            continue
        for row in rows:
            source, index = row['source'], row['stage_index']
            if (type(index) is not int or not 0 <= index < len(steps) or source['message_id'] != message['id']
                    or source['revision'] != message['revision'] or quote_ref(message, source['quote']) != source):
                continue
            if index != previous:
                result.append({'source': deepcopy(source), 'stage_index': index, 'label': steps[index]})
            previous = index
            break
    return result[:200]


def conversation_workspace(document, session=None):
    if not negotiated(document):
        return {}
    state = document.get('conversation_state') or {}
    return {'conversation': {'contract_version': 1, 'question': deepcopy(state.get('question')),
                             'help': deepcopy(state.get('help')), 'recasts': public_recasts(document),
                             'stage_markers': stage_marker_view(document, session)}, 'help': None, 'hint': None}


def record_conversation_receipt(document, exposure):
    # Targetless help is still a delivery fact, but can never count as target use.
    if not exposure.get('question_id'):
        return
    receipts = document.setdefault('conversation_receipts', [])
    if not any(row['id'] == exposure['id'] for row in receipts):
        receipts.append(deepcopy(exposure))
