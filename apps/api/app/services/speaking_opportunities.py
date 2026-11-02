"""Pure projections for frozen mission targets and their recorded opportunities."""
from __future__ import annotations

from copy import deepcopy


def is_staged_plan(session) -> bool:
    plan = getattr(session, "mission_plan", None)
    return (plan.get("version") if isinstance(plan, dict) else getattr(plan, "version", None)) == 2


def _latest_messages(document: dict) -> dict:
    latest = {}
    for row in document.get("messages", []):
        if row.get("id") and row.get("revision", -1) >= latest.get(row["id"], {}).get("revision", -1):
            latest[row["id"]] = row
    return latest


def apply_presentation_receipt(attempt: dict, receipt: dict) -> None:
    """Keep delivery time attached to its revision, even when ACK saves race."""
    same_message = attempt.get("presented_message_id") == receipt["message_id"]
    previous_revision = attempt.get("presented_revision", -1)
    if same_message and previous_revision > receipt["revision"]:
        return
    same_revision = same_message and previous_revision == receipt["revision"]
    attempt.update(presented=True,
                   presented_at=(attempt.get("presented_at") if same_revision else None) or receipt["at"],
                   presented_message_id=receipt["message_id"], presented_revision=receipt["revision"])


def confirmed_imitation(document: dict, target_id: str, message: dict, session=None) -> bool:
    """Only an acknowledged assistant example before this utterance is imitation.

    Visual labels/frames and requested help remain prompted, not imitation.
    Unknown/overlapping audio never becomes a confirmed example.
    """
    from app.services.speaking_teaching import _assistance
    users = sorted((row for row in _latest_messages(document).values()
                    if row.get("role") == "user" and row.get("status") == "final"),
                   key=lambda row: row.get("ordinal", 0))
    exposures = [row for row in (document.get("controller") or {}).get("exposures", [])
                 if row.get("kind") in {"assistant_audio", "assistant_text"}
                 and row.get("level") == "example"
                 and row.get("certainty") != "possible"]
    if session is not None:
        modeled_responses = {row.get("response_id") for row in document.get("teaching_attempts", [])
                             if (row.get("policy") or {}).get("target_item_id") == target_id
                             and (row.get("policy") or {}).get("action") == "model_then_transfer"
                             and confirmed_stage_attempt(session, document, row)}
        exposures = [row for row in exposures if row.get("response_id") in modeled_responses]
    return _assistance(target_id, message, users, {"exposures": exposures}, {}) in {"usage", "example"}


def confirmed_stage_attempt(session, document: dict, attempt: dict) -> dict | None:
    """Revalidate the exact response revision behind both assessment and delivery."""
    from app.services.speaking_teaching import find_target_quote
    assessment, policy = attempt.get("assessment") or {}, attempt.get("policy") or {}
    if attempt.get("presented") is not True or assessment.get("outcome") != "reflected":
        return None
    messages = _latest_messages(document)
    response = messages.get(attempt.get("assessment_message_id"))
    if (not response or response.get("role") != "assistant" or response.get("status") != "final"
            or response.get("response_id") != attempt.get("response_id")
            or response.get("revision") != attempt.get("assessment_revision")
            or response.get("id") != attempt.get("presented_message_id")
            or response.get("revision") != attempt.get("presented_revision")
            or response.get("playback_pending")):
        return None
    text = response.get("text", "")
    question = assessment.get("transfer_question_quote") if policy.get("action") == "model_then_transfer" else assessment.get("exact_quote")
    if not isinstance(question, str) or not question.strip() or text.count(question) != 1:
        return None
    if policy.get("action") == "model_then_transfer":
        model = assessment.get("model_quote")
        item = next((item for item in session.items if str(item.id) == policy.get("target_item_id")), None)
        if (not item or not isinstance(model, str) or not model.strip() or text.count(model) != 1
                or text.index(model) + len(model) > text.index(question)
                or not find_target_quote(model, item.text, item.kind)):
            return None
    elif policy.get("action") != "implicit_elicitation":
        return None
    return response


def stage_progress(session, document: dict) -> dict | None:
    """Derive the v2 ledger from durable evidence and delivery facts, never counters.

    Rebuilding on reconnect/revision avoids a second mutable source of truth.
    Completing an opportunity means the learner answered, not that use succeeded.
    """
    if not is_staged_plan(session):
        return None
    from app.services.speaking_teaching import effective_user_turn, _quoted, _timestamp, _assistance
    plan = session.mission_plan
    plan = plan.model_dump(mode="json") if hasattr(plan, "model_dump") else plan
    steps = (plan.get("logic_template") or {}).get("steps", [])
    messages = _latest_messages(document)
    targets = []
    for target_id, target in planned_targets(session).items():
        evidence = [row for row in document.get("evidence", [])
                    if row.get("session_item_id") == target_id and row.get("appropriateness") == "appropriate"
                    and (message := messages.get(row.get("message_id")))
                    and message.get("role") == "user" and message.get("status") == "final"
                    and message.get("revision") == row.get("transcript_revision")
                    and _quoted(message.get("text", ""), row.get("start"), row.get("end"), row.get("quote"))]
        users = sorted((row for row in messages.values() if row.get("role") == "user" and row.get("status") == "final"),
                       key=lambda row: row.get("ordinal", 0))
        independent = any(_assistance(target_id, messages[row["message_id"]], users,
                                      {"exposures": (document.get("controller") or {}).get("exposures", [])},
                                      document) in {"independent", "direction"} for row in evidence)
        attempts = [row for row in document.get("teaching_attempts", [])
                    if (row.get("policy") or {}).get("target_item_id") == target_id]
        offered = [row for row in attempts if confirmed_stage_attempt(session, document, row)]
        modeled = any((row.get("policy") or {}).get("action") == "model_then_transfer" for row in offered)
        exposures = [row for row in (document.get("controller") or {}).get("exposures", [])
                     if row.get("target_item_id") == target_id
                     and row.get("kind") in {"assistant_audio", "assistant_text"}]
        confirmed = any(row.get("certainty") != "possible" for row in exposures)
        modeling = ("modeled" if modeled else "exposed" if confirmed else "uncertain" if exposures
                    else "not_needed" if independent else "pending")
        # A valid reply must occur after a confirmed opportunity response, with
        # its actual text/audio presentation preceding the learner's utterance.
        replied = False
        for attempt in offered:
            response = next((row for row in messages.values() if row.get("response_id") == attempt.get("response_id")
                             and row.get("role") == "assistant" and row.get("status") == "final"), None)
            if not response:
                continue
            for message in messages.values():
                if not effective_user_turn(message) or message.get("ordinal", 0) <= response.get("ordinal", 0):
                    continue
                shown = _timestamp(attempt.get("presented_at"))
                started = _timestamp(message.get("started_at") or message.get("created_at"))
                if shown and started and shown > started:
                    continue
                replied = True
        practice = ("skipped" if target_is_skipped(document, target_id) else "independent" if independent
                    else "attempted" if evidence else "responded" if replied else "offered" if offered else "pending")
        targets.append({"session_item_id": target_id, "stage_index": target.get("stage_index"),
                        "modeling_status": modeling, "practice_status": practice,
                        "imitation_uses": len({row["message_id"] for row in evidence
                                               if confirmed_imitation(document, target_id, messages[row["message_id"]], session)})})
    unresolved = [row for row in targets if row["practice_status"] not in {"independent", "attempted", "responded", "skipped"}]
    indices = [row["stage_index"] for row in unresolved if row["stage_index"] is not None]
    current = min(indices) if indices else None
    stages = []
    for index, label in enumerate(steps):
        members = [row for row in targets if row["stage_index"] == index]
        status = ("skipped" if not members or all(row["practice_status"] == "skipped" for row in members)
                  else "completed" if all(row["practice_status"] in {"independent", "attempted", "responded", "skipped"} for row in members)
                  else "current" if index == current else "pending")
        stages.append({"index": index, "label": label, "status": status})
    return {"current_stage_index": current, "stages": stages, "targets": targets}


def staged_target_state(session, document: dict, target_id: str | None) -> dict | None:
    progress = stage_progress(session, document)
    return next((row for row in progress["targets"] if row["session_item_id"] == target_id), None) if progress else None


def staged_policy_invalid_reason(session, document: dict, policy: dict) -> str | None:
    progress = stage_progress(session, document)
    if progress is None or policy.get("action") not in {"model_then_transfer", "implicit_elicitation"}:
        return None
    target = next((row for row in progress["targets"] if row["session_item_id"] == policy.get("target_item_id")), None)
    if target is None or target["practice_status"] in {"attempted", "responded", "independent", "skipped"}:
        return "target_answered"
    if target["stage_index"] != progress["current_stage_index"]:
        return "stage_changed"
    if policy.get("action") == "model_then_transfer" and target["modeling_status"] != "pending":
        return "target_already_exposed"
    if target["practice_status"] == "offered":
        return "awaiting_target_reply"
    if any((row.get("policy") or {}).get("target_item_id") == target["session_item_id"]
           and (row.get("policy") or {}).get("id") != policy.get("id")
           and row.get("response_id") and not row.get("assessment")
           for row in document.get("teaching_attempts", [])):
        return "attempt_in_flight"
    return None


def planned_targets(session) -> dict[str, dict]:
    plan = getattr(session, "mission_plan", None)
    if hasattr(plan, "model_dump"):
        plan = plan.model_dump(mode="json")
    if not isinstance(plan, dict):
        return {}
    by_corpus = {str(item.corpus_item_id): str(item.id) for item in session.items if item.corpus_item_id}
    item_ids = {str(item.id) for item in session.items}
    result = {}
    for target in plan.get("targets", []):
        if not isinstance(target, dict):
            continue
        target_id = str(target.get("session_item_id") or by_corpus.get(str(target.get("corpus_item_id")), ""))
        if target_id in item_ids:
            result[target_id] = deepcopy(target)
    return result


def target_is_skipped(document: dict, target_id: str | None) -> bool:
    return (document.get("target_states", {}).get(target_id) or {}).get("skipped") is True


def target_version(document: dict, target_id: str | None) -> int:
    return (document.get("target_states", {}).get(target_id) or {}).get("version", 0)


def set_target_skipped(document: dict, target_id: str, reason: str | None, now: str) -> None:
    """CAS-safe, idempotent state change; restoring never erases skip history."""
    states = document.setdefault("target_states", {})
    old = states.get(target_id, {})
    skipped = reason is not None
    if old.get("skipped", False) == skipped and (not skipped or old.get("reason") == reason):
        return
    history = deepcopy(old.get("history", []))
    history.append({"action": "skip" if skipped else "restore", "reason": reason, "at": now})
    states[target_id] = {
        "skipped": skipped, "reason": reason, "skipped_at": now if skipped else old.get("skipped_at"),
        "restored_at": old.get("restored_at") if skipped else now,
        "version": old.get("version", 0) + 1, "history": history,
    }
    policy = document.get("policy") or {}
    if policy.get("target_item_id") == target_id and policy.get("status") == "pending":
        policy.update(status="expired", expiry_reason="target_state_changed")
    if (document.get("help") or {}).get("target_item_id") == target_id:
        document["help"] = None
        document["hint"] = None


def opportunity_view(session, document: dict) -> list[dict]:
    """Sending, compliance and actual presentation remain separate facts."""
    targets = planned_targets(session)
    rows = []
    for item in session.items:
        target_id = str(item.id)
        target = targets.get(target_id)
        if target is None:
            continue  # Historical sessions retain their existing reporting contract.
        state = document.get("target_states", {}).get(target_id) or {}
        attempts = [row for row in document.get("teaching_attempts", [])
                    if (row.get("policy") or {}).get("target_item_id") == target_id]
        sent = any(row.get("send_status") == "sent" for row in attempts)
        bound = any(row.get("response_id") for row in attempts)
        reflected = any((row.get("assessment") or {}).get("outcome") == "reflected" for row in attempts)
        presented = any(row.get("presented") is True for row in attempts)
        offered = any((row.get("assessment") or {}).get("outcome") == "reflected"
                      and row.get("presented") is True for row in attempts)
        if is_staged_plan(session):
            offered = any(confirmed_stage_attempt(session, document, row) for row in attempts)
        used = any(row.get("session_item_id") == target_id and row.get("appropriateness") == "appropriate"
                   for row in document.get("evidence", []))
        rows.append({
            "session_item_id": target_id, "role": target["role"],
            "status": "skipped" if state.get("skipped") else "used" if used else "offered" if offered else "planned",
            "skipped_reason": state.get("reason") if state.get("skipped") else None,
            "skipped_at": state.get("skipped_at"), "sent": sent, "bound": bound,
            "reflected": reflected, "presented": presented,
            "last_response_id": next((row["response_id"] for row in reversed(attempts) if row.get("response_id")), None),
        })
    return rows
