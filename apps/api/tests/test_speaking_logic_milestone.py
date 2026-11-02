"""The selected v2 plan survives creation, observed use and frozen assessment."""
import asyncio
import json
from uuid import uuid4

import pytest

from app.integrations.speaking_feedback_repository import _freeze
from app.schemas.speaking import SpeakingSessionCreate
from app.schemas.speaking_plan import SpeakingPlanCreate
from app.services import speaking_assessment, speaking_planning, speaking_service
from app.services.speaking_support_runtime import support_workspace
from test_speaking_assessment import model as assessment_model, reference
from test_speaking_planning import OWNER, planning_state, proposals, saved  # noqa: F401
from test_speaking_stages import offer
from test_speaking_teaching import analyze, candidate, model, utterance


@pytest.mark.parametrize("exposure,independent,imitation,prompted,uncertain", [
    (None, 1, 0, 0, 0),
    ("assistant_text", 0, 1, 1, 0),
    ("visual_target", 0, 0, 1, 0),
    ("partial_audio", 0, 0, 0, 1),
])
def test_selected_logic_plan_to_frozen_usage_report(monkeypatch, exposure, independent, imitation, prompted, uncertain):
    async def generated(settings, prompt, context, **kwargs):
        assert kwargs["prompt_version"] == "speaking-plan-v9-logic"
        assert context["logic_template"]["id"] == "disagreement"
        output = proposals(context)
        for scene in output["candidates"]:
            scene["targets"][0]["model_line"] = "To be fair, testing takes time."
        return json.dumps(output), {}

    monkeypatch.setattr(speaking_planning, "request_analysis_json", generated)
    item = saved()
    plan = asyncio.run(speaking_planning.create_speaking_plan(OWNER, SpeakingPlanCreate(
        scenario_type="workplace", brief="Agree on a deadline", candidate_count=1,
        logic_template_id="disagreement", targets=[{"corpus_item_id": item.id,
                                                       "role": "primary", "stage_index": 0}],
    )))
    scene = plan.candidates[0]
    request = SpeakingSessionCreate(client_id=uuid4(), scenario_type="workplace", goal=scene.goal,
        difficulty="challenging", support_level="model_frame", logic_template_id="disagreement",
        corpus_item_ids=[item.id], plan_id=plan.id, candidate_id=scene.id)
    session = speaking_service.create_speaking_session(OWNER, request)
    assert session.logic_template == plan.logic_template
    assert session.mission_plan.version == 2
    assert session.mission_plan.targets[0].stage_index == 0
    assert speaking_service.create_speaking_session(OWNER, request).id == session.id

    first = utterance("The deadline needs another week.", ordinal=1)
    model(monkeypatch)
    state = analyze(session, first)
    assert state["policy"]["action"] == "model_then_transfer"
    state["messages"] = [first]
    target_id = str(session.items[0].id)
    if exposure:
        response_id = None
        if exposure == "assistant_text":
            _, response = offer(state, target_id)
            response_id = response["response_id"]
        state["controller"]["exposures"].append({
            "id": str(uuid4()), "target_item_id": target_id, "after_turn": 1,
            "scope": "session", "kind": "assistant_audio" if exposure == "partial_audio" else exposure,
            "level": "usage" if exposure == "visual_target" else "example",
            "response_id": response_id,
            **({"certainty": "possible"} if exposure == "partial_audio" else {}),
        })
    learner = utterance("To be fair, Friday gives us enough time for testing.", ordinal=3)
    state["messages"].append(learner)
    model(monkeypatch, [candidate(session.items[0], "To be fair")])
    state.update(analyze(session, learner, state["messages"], state))
    assert state["policy"]["action"] != "model_then_transfer"

    source = _freeze(session.model_copy(update={"status": "completed", "turn_count": 2}), state)
    assert source["session"]["mission_plan"]["logic_template"]["id"] == "disagreement"
    assert source["session"]["mission_plan"]["targets"][0]["model_line"] == "To be fair, testing takes time."
    if exposure == "assistant_text":
        assert support_workspace(session, source)["stage_progress"]["targets"][0]["modeling_status"] == "modeled"
    reviewed = assessment_model(source, quote=None)
    reviewed["item_results"] = [{"session_item_id": target_id, "reason": "Observed in context.",
        "uses": [{"reference": reference(learner, "To be fair"), "match_type": "exact",
                  "appropriateness": "appropriate", "reason": "Acknowledges a reasonable deadline."}]}]
    _, report = speaking_assessment.compile_assessment(source, reviewed)
    result = report.item_results[0]
    assert (result.independent_uses, result.imitation_uses, result.prompted_uses,
            result.uncertain_assistance_uses) == (independent, imitation, prompted, uncertain)
