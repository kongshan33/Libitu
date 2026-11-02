"""V2 stage teaching derives progress from receipts, never generation counters."""
from copy import deepcopy
import asyncio
import json
from uuid import uuid4

import pytest

from app.schemas.speaking_plan import SpeakingMissionPlan
from app.services.speaking_coaching_runtime import policy_invalid_reason
from app.services.speaking_opportunities import confirmed_imitation, stage_progress, set_target_skipped
from app.services.speaking_support_runtime import support_workspace
from test_speaking_teaching import analyze, candidate, mission, model, no_paid_analysis, utterance  # noqa: F401
from test_speaking_coaching_runtime import settle
from test_speaking_gemini_runtime import connection  # noqa: F401


def add_staged_plan(session, stages=None):
    stages = stages if stages is not None else list(range(len(session.items)))
    session.mission_plan = SpeakingMissionPlan(
        version=2, plan_id=uuid4(), candidate_id=uuid4(), scenario_type="workplace",
        logic_template={"id": "status_update", "title": "Update", "description": "Discuss a deadline.",
                        "steps": ["Context", "Progress", "Next step"]},
        title="Deadline", setting="Discuss the deadline with a colleague.", goal="Agree on a deadline",
        user_role="Lead", ai_role="Colleague", register="professional",
        targets=[{"session_item_id": item.id, "corpus_item_id": item.corpus_item_id or uuid4(),
                  "role": "primary", "stage_index": stages[index], "model_line": f"{item.text}, testing takes time.",
                  "communicative_function": "Explain the deadline", "trigger_question": "What deadline would work?",
                  "skip_when": "The topic changes or the conversation ends.", "fit": "high", "fit_reason": "Discuss deadlines."}
                 for index, item in enumerate(session.items)])
    return session


def offer(document, target_id, *, model_target=True, presented=True, reflected=True, ordinal=2):
    """Add a final assistant response plus its persisted teaching/presentation facts."""
    response_id = str(uuid4())
    message = utterance("To be fair, testing takes time. What deadline would work?", ordinal=ordinal,
                        role="assistant", response_id=response_id, created_at="2026-10-26T00:00:00Z")
    document.setdefault("messages", []).append(message)
    attempt = {"id": str(uuid4()), "policy": {"id": str(uuid4()), "target_item_id": target_id,
               "action": "model_then_transfer" if model_target else "implicit_elicitation"},
               "response_id": response_id, "presented": presented,
               "assessment_message_id": message["id"], "assessment_revision": message["revision"],
               "presented_message_id": message["id"], "presented_revision": message["revision"],
               "assessment": {"outcome": "reflected" if reflected else "unknown",
                              "exact_quote": "What deadline would work?",
                              "model_quote": "To be fair, testing takes time.",
                              "transfer_question_quote": "What deadline would work?"}}
    document.setdefault("teaching_attempts", []).append(attempt)
    return attempt, message


@pytest.mark.parametrize("support", [None, "model_frame", "model_label", "label_only", "no_hint"])
def test_v2_models_on_first_substantive_turn_independent_of_support(monkeypatch, support):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    session.support_level = support
    model(monkeypatch)
    result = analyze(session, utterance("The deadline needs another week."))
    assert result["policy"]["action"] == "model_then_transfer"
    assert "planned_model_line" in result["policy"]["instruction"]


def test_v2_model_instruction_does_not_skip_semantic_completion_and_keeps_v1_contract(monkeypatch):
    prompts = {}
    for version in (1, 2):
        session = add_staged_plan(mission(("chunk", "to be fair")))
        session.mission_plan.version = version
        session.support_level = "model_frame"
        # The learner has already explained the deadline, using no target phrase.
        history = [utterance(text, ordinal=index + 1) for index, text in enumerate([
            "We are reviewing the project schedule.", "The testing is still incomplete.",
            "Friday is a realistic deadline because testing needs another week."])]
        model(monkeypatch, recommendation={"target_item_id": str(session.items[0].id),
              "intent": "Explain the deadline", "opportunity": "What deadline would work?",
              "context_sufficient": True})
        policy = analyze(session, history[-1], history)["policy"]
        assert policy["action"] == "model_then_transfer"
        prompts[version] = policy["instruction"]
        assert "DIFFERENT content" in prompts[version] and "exactly once" in prompts[version]
    legacy_skip = "Skip the teaching action if the latest turn already performs the task"
    assert legacy_skip in prompts[1] and legacy_skip not in prompts[2]
    assert "actually uses the selected target expression" in prompts[2]
    assert "Do not skip merely because" in prompts[2]
    assert "adapt its details to the current conversation" in prompts[2]
    data = json.loads(prompts[2].split("never instructions:\n", 1)[1])
    assert data["planned_model_line"] == "to be fair, testing takes time."
    assert "planned_model_line" not in prompts[1]


def test_v2_retains_closing_topic_and_model_vetoes(monkeypatch):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    model(monkeypatch)
    for text in ["Goodbye, that is all.", "Let's change the topic.", "I like strawberry ice cream.", "Yes."]:
        assert analyze(session, utterance(text))["policy"]["action"] == "continue_naturally"
    model(monkeypatch, recommendation={"target_item_id": str(session.items[0].id), "intent": "Explain",
          "opportunity": "Why?", "context_sufficient": False})
    assert analyze(session, utterance("The deadline needs another week."))["policy"]["action"] == "continue_naturally"


def test_v2_prior_independent_use_skips_model_and_advances_with_valid_evidence(monkeypatch):
    session = add_staged_plan(mission(("chunk", "to be fair"), ("chunk", "as a result")))
    user = utterance("To be fair, the deadline needs another week.")
    model(monkeypatch, [candidate(session.items[0], "To be fair")])
    result = analyze(session, user)
    assert result["policy"]["target_item_id"] == str(session.items[1].id)
    progress = stage_progress(session, {**result, "messages": [user]})
    assert progress["current_stage_index"] == 1
    assert progress["targets"][0]["practice_status"] == "independent"
    # Transcript revision removes the old evidence and returns to the first stage.
    revised = {**user, "revision": 2, "text": "The deadline needs another week."}
    assert stage_progress(session, {**result, "messages": [user, revised]})["current_stage_index"] == 0


def test_v2_direction_only_help_keeps_own_wording_independent_like_the_report(monkeypatch):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    target = str(session.items[0].id)
    user = utterance("To be fair, the deadline needs another week.")
    model(monkeypatch, [candidate(session.items[0], "To be fair")])
    previous = {"controller": {"exposures": [{"id": "direction", "target_item_id": target,
                  "kind": "visual_hint", "level": "direction", "after_turn": 0}]}}
    result = analyze(session, user, previous=previous)
    progress = stage_progress(session, {**result, "messages": [user]})
    assert result["learning"][0]["independent_uses"] == 1
    assert progress["targets"][0]["practice_status"] == "independent"
    assert progress["targets"][0]["imitation_uses"] == 0


def test_v2_attempt_counts_and_sent_or_bound_alone_do_not_complete_a_stage(monkeypatch):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    document = {"controller": {"automatic_attempts": {str(session.items[0].id): 8}}}
    attempt, _ = offer(document, str(session.items[0].id), presented=False)
    assert stage_progress(session, document)["targets"][0]["modeling_status"] == "pending"
    attempt["presented"] = True
    attempt["assessment"]["outcome"] = "unknown"
    assert stage_progress(session, document)["targets"][0]["modeling_status"] == "pending"
    attempt["assessment"]["outcome"] = "reflected"
    progress = stage_progress(session, document)
    assert progress["targets"][0]["modeling_status"] == "modeled"
    assert progress["targets"][0]["practice_status"] == "offered"
    assert progress["current_stage_index"] == 0


def test_v2_same_stage_targets_then_any_stage_all_receive_opportunities(monkeypatch):
    session = add_staged_plan(mission(*[("chunk", text) for text in
        ["to be fair", "as a result", "in addition", "for example", "in the end"]]), [0, 0, 1, 2, None])
    model(monkeypatch)
    document = {"messages": []}
    for index, item in enumerate(session.items):
        user = utterance("The deadline needs another week.", ordinal=index * 3 + 1)
        document["messages"].append(user)
        result = analyze(session, user, document["messages"], document)
        assert result["policy"]["target_item_id"] == str(item.id)
        assert result["policy"]["action"] == "model_then_transfer"
        document.update({key: value for key, value in result.items() if key != "analysis_trace"})
        offer(document, str(item.id), ordinal=index * 3 + 2)
        # This fixture uses each target's own complete example, not another word.
        response = document["messages"][-1]
        response["text"] = f"{item.text}, testing takes time. What deadline would work?"
        document["teaching_attempts"][-1]["assessment"]["model_quote"] = f"{item.text}, testing takes time."
        document["messages"].append(utterance("We can finish the deadline on Friday.", ordinal=index * 3 + 3))
    progress = stage_progress(session, document)
    assert all(row["practice_status"] == "responded" for row in progress["targets"])
    assert all(row["status"] == "completed" for row in progress["stages"])
    assert all(row["imitation_uses"] == 0 for row in progress["targets"])


@pytest.mark.parametrize("certainty,expected", [(None, "exposed"), ("possible", "uncertain")])
def test_v2_unbound_natural_or_partial_audio_exposure_prevents_repeat_model(monkeypatch, certainty, expected):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    target = str(session.items[0].id)
    exposure = {"id": "exposure", "target_item_id": target, "kind": "assistant_audio",
                "level": "usage", "scope": "session", "after_turn": 0}
    if certainty:
        exposure["certainty"] = certainty
    document = {"controller": {"exposures": [exposure]}}
    model(monkeypatch)
    result = analyze(session, utterance("The deadline needs another week."), previous=document)
    assert result["policy"]["action"] == "implicit_elicitation"
    assert stage_progress(session, document)["targets"][0]["modeling_status"] == expected
    policy = {**result["policy"], "action": "model_then_transfer"}
    document["messages"] = [utterance("The deadline needs another week.")]
    policy.update(source_message_id=document["messages"][0]["id"], source_revision=1)
    assert policy_invalid_reason(document, policy, session) == "target_already_exposed"


def test_v2_receipts_reconnect_skip_and_duplicate_projection_are_idempotent():
    session = add_staged_plan(mission(("chunk", "to be fair"), ("chunk", "as a result")))
    session.support_level = "no_hint"
    document = {}
    offer(document, str(session.items[0].id))
    first = support_workspace(session, document)
    assert first["demonstrations"] and first["stage_progress"]["targets"][0]["modeling_status"] == "modeled"
    assert support_workspace(session, deepcopy(document)) == first
    set_target_skipped(document, str(session.items[0].id), "Not relevant", "2026-10-26T00:00:00Z")
    assert stage_progress(session, document)["current_stage_index"] == 1
    assert stage_progress(session, document)["targets"][0]["practice_status"] == "skipped"


def test_imitation_requires_actual_assistant_exposure_not_visual_reveal_or_help():
    user = utterance("To be fair, Friday works.", ordinal=2)
    target = str(uuid4())
    exposure = {"id": "seen", "target_item_id": target, "kind": "visual_target", "level": "usage",
                "scope": "session", "after_turn": 0}
    document = {"messages": [user], "controller": {"exposures": [exposure]}}
    assert not confirmed_imitation(document, target, user)
    exposure["kind"] = "visual_hint"
    exposure["level"] = "example"
    assert not confirmed_imitation(document, target, user)
    exposure["kind"] = "assistant_text"
    assert confirmed_imitation(document, target, user)
    exposure["certainty"] = "possible"
    assert not confirmed_imitation(document, target, user)


@pytest.mark.parametrize("damage", ["missing", "revision", "interrupted", "model_quote", "question", "pending", "unacknowledged_revision"])
def test_v2_invalid_or_revised_response_never_unlocks_model_or_opportunity(damage):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    document = {}
    attempt, response = offer(document, str(session.items[0].id))
    if damage == "missing":
        document["messages"] = []
    elif damage == "revision":
        document["messages"].append({**response, "revision": 2})
    elif damage == "interrupted":
        response["status"] = "interrupted"
    elif damage == "model_quote":
        attempt["assessment"]["model_quote"] = "Invented model sentence."
    elif damage == "question":
        attempt["assessment"]["transfer_question_quote"] = "Invented question?"
    elif damage == "pending":
        response["playback_pending"] = True
    else:
        attempt["presented_revision"] = 0
    target = stage_progress(session, document)["targets"][0]
    assert target["modeling_status"] == "pending" and target["practice_status"] == "pending"
    assert support_workspace(session, document)["demonstrations"] == []


def test_v2_carry_pending_policy_is_cancelled_on_farewell(monkeypatch):
    session = add_staged_plan(mission(("chunk", "to be fair")))
    model(monkeypatch)
    first = utterance("The deadline needs another week.")
    previous = analyze(session, first)
    bye = utterance("Goodbye, that is all.", ordinal=2)
    result = analyze(session, bye, [first, bye], previous)
    assert result["policy"]["action"] == "continue_naturally"


def test_v2_support_change_cannot_disable_default_model_or_expire_policy(monkeypatch):
    from app.services.speaking_support_runtime import change_support
    session = add_staged_plan(mission(("chunk", "to be fair")))
    session.support_level = "model_frame"
    model(monkeypatch)
    document = analyze(session, utterance("The deadline needs another week."))
    before = deepcopy(document)
    change_support(session, document, "no_hint", 0, "2026-10-26T00:00:00Z")
    assert document == before


@pytest.mark.parametrize("ack_first", [True, False])
def test_v2_real_runtime_receipts_reconcile_in_both_orders_and_reconnect(connection, monkeypatch, ack_first):
    from app.services import speaking_help
    client, _, _ = connection
    add_staged_plan(client.session, [0] * len(client.session.items))
    target = client.session.items[0]
    line = f"{target.text} you here."
    question = "What deadline would work?"

    async def assess(*args):
        return {"outcome": "reflected", "reason": "fixture", "model_quote": line,
                "exact_quote": question, "transfer_question_quote": question}
    monkeypatch.setattr(speaking_help, "assess_policy_response", assess)

    async def flow():
        document = {}
        attempt, message = offer(document, str(target.id), presented=False, reflected=False)
        message["text"] = f"{line} {question}"
        for key in ["assessment_message_id", "assessment_revision", "presented_message_id", "presented_revision"]:
            attempt.pop(key)
        await client.commit(lambda d, _: d.update(document), False)
        reply = {"id": message["response_id"], "text": message["text"], "teaching_attempt": attempt}
        if ack_first:
            client.message_shown({"message_id": message["id"], "revision": 1})
            await settle(client)
            assert client.workspace()["stage_progress"]["targets"][0]["modeling_status"] == "exposed"
        await client.assess_response(reply, "final")
        if not ack_first:
            assert client.workspace()["stage_progress"]["targets"][0]["modeling_status"] == "pending"
            client.message_shown({"message_id": message["id"], "revision": 1})
        await settle(client)
        assert client.workspace()["stage_progress"]["targets"][0]["modeling_status"] == "modeled"
        assert client.workspace()["stage_progress"]["targets"][0]["practice_status"] == "offered"
        # Duplicate ACK in the same connection and after reconnect deduplicates
        # by durable exposure identity, without ever repeating the model.
        client.message_shown({"message_id": message["id"], "revision": 1})
        client.message_acks.clear()
        client.message_shown({"message_id": message["id"], "revision": 1})
        await settle(client)
        exposures = client.state["document"]["controller"]["exposures"]
        assert len(exposures) == 1 and exposures[0]["response_id"] == message["response_id"]
        saved = client.state["document"]["teaching_attempts"][0]
        assert saved["assessment_revision"] == saved["presented_revision"] == 1
    asyncio.run(flow())


def test_v2_pending_real_exposure_blocks_model_before_database_receipt_commit(connection):
    from test_speaking_coaching_runtime import policy_for, seed
    client, _, _ = connection
    add_staged_plan(client.session, [0] * len(client.session.items))

    async def flow():
        users = await seed(client)
        policy = policy_for(client, users[-1])
        policy["action"] = "model_then_transfer"
        await client.commit(lambda d, _: d.update(policy=policy), False)
        client.pending_exposures["local-receipt"] = {
            "id": "local-receipt", "target_item_id": str(client.session.items[0].id),
            "kind": "assistant_audio", "certainty": "possible", "level": "example", "scope": "session"}
        assert await client.eligible_policy() is None
        await settle(client)
        assert client.state["document"]["policy"]["expiry_reason"] == "target_already_exposed"
    asyncio.run(flow())


def test_v2_end_merges_pending_revision_receipt_before_freezing_report(connection, monkeypatch):
    from app.services import speaking_runtime_state as state_ops
    client, _, _ = connection
    add_staged_plan(client.session, [0] * len(client.session.items))
    target = client.session.items[0]
    monkeypatch.setattr(state_ops, "require_session", lambda *args: client.session.model_copy(deep=True))

    async def flow():
        document = {}
        attempt, message = offer(document, str(target.id), presented=False)
        line = f"{target.text} you here."
        message["text"] = f"{line} What deadline would work?"
        attempt["assessment"]["model_quote"] = line
        attempt.pop("presented_message_id")
        attempt.pop("presented_revision")
        await client.commit(lambda d, _: d.update(document), False)
        receipts = {"runtime_id": client.runtime_id, "exposures": {}, "presentations": {
            message["response_id"]: {"at": state_ops.iso_now(), "message_id": message["id"], "revision": 1}}}
        workspace = await asyncio.to_thread(state_ops.end_session, client.owner, client.session_id, receipts)
        assert workspace.stage_progress.targets[0].modeling_status == "modeled"
        assert workspace.session.status == "completed"
    asyncio.run(flow())


@pytest.mark.parametrize("end_while_pending", [False, True])
def test_v2_partial_then_final_ack_keeps_revision_time_and_new_pending_receipt(connection, monkeypatch, end_while_pending):
    from app.services import speaking_runtime_state as state_ops
    client, _, _ = connection
    add_staged_plan(client.session, [0] * len(client.session.items))
    monkeypatch.setattr(state_ops, "require_session", lambda *args: client.session.model_copy(deep=True))

    async def flow():
        document = {}
        attempt, final = offer(document, str(client.session.items[0].id), presented=False)
        line = f"{client.session.items[0].text} you here."
        final.update(revision=2, text=f"{line} What deadline would work?")
        attempt.update(assessment_revision=2)
        attempt["assessment"]["model_quote"] = line
        attempt.pop("presented_message_id")
        attempt.pop("presented_revision")
        await client.commit(lambda d, _: d.update(document), False)
        partial = {**final, "revision": 1, "status": "partial", "text": line}
        first_time, final_time = "2026-10-26T01:00:00+00:00", "2026-10-26T01:00:05+00:00"
        jobs = []
        monkeypatch.setattr(client, "background", lambda coroutine, **kwargs: jobs.append(coroutine))
        monkeypatch.setattr(state_ops, "iso_now", lambda: first_time)
        client.opportunity_presented(partial)
        monkeypatch.setattr(state_ops, "iso_now", lambda: final_time)
        client.opportunity_presented(final)
        pending = deepcopy(client.pending_presentations[final["response_id"]])
        assert pending["revision"] == 2 and pending["at"] == final_time
        # Completing the older save must not clear the newer in-flight ACK.
        await jobs.pop(0)
        assert client.pending_presentations[final["response_id"]] == pending
        assert client.workspace()["stage_progress"]["targets"][0]["modeling_status"] == "pending"
        if end_while_pending:
            jobs.pop(0).close()
            receipts = {"runtime_id": client.runtime_id, "exposures": {},
                        "presentations": deepcopy(client.pending_presentations)}
            workspace = await asyncio.to_thread(state_ops.end_session, client.owner, client.session_id, receipts)
            assert workspace.stage_progress.targets[0].modeling_status == "modeled"
            saved = state_ops.read_state(client.owner, client.session_id)["document"]["teaching_attempts"][0]
        else:
            await jobs.pop(0)
            assert client.pending_presentations == {}
            # A later duplicate preserves this revision's first actual ACK time.
            monkeypatch.setattr(state_ops, "iso_now", lambda: "2026-10-26T01:00:10+00:00")
            client.opportunity_presented(final)
            await jobs.pop(0)
            # Even an older save completing last cannot downgrade the receipt.
            client.opportunity_presented(partial)
            await jobs.pop(0)
            saved = client.state["document"]["teaching_attempts"][0]
            assert client.workspace()["stage_progress"]["targets"][0]["modeling_status"] == "modeled"
        assert saved["presented_revision"] == 2 and saved["presented_at"] == final_time
    asyncio.run(flow())
