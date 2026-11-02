import asyncio
from copy import deepcopy
import json

import pytest

from app.services import speaking_plan_provider as provider, speaking_planning as planning
from app.services.speaking_plan_repair import ordered_output, repair_context, apply_repairs
from test_speaking_plan_inspection import fixture
from test_speaking_planning import client, planning_state, proposals, request_body, session_request  # noqa: F401


def run(monkeypatch, context, reply):
    original = deepcopy(context)

    async def model(settings, prompt, wire, **kwargs):
        assert [target["corpus_item_id"] for target in wire["targets"]] == ["t0", "t1"]
        assert wire["output_schema"]["$defs"]["SpeakingPlanTarget"]["properties"]["corpus_item_id"] == {
            "type": "string", "enum": ["t0", "t1"],
            "description": "Copy the supplied short target reference exactly.",
        }
        assert kwargs == {"max_tokens": 700, "timeout_seconds": 12}
        return json.dumps(reply) if not isinstance(reply, str) else reply, {"elapsed_ms": 1}

    monkeypatch.setattr(provider, "request_analysis_json", model)
    raw, trace = asyncio.run(provider.request_plan_json(None, "prompt", context,
                                                      max_tokens=700, timeout_seconds=12))
    assert context == original
    assert trace == {"elapsed_ms": 1}
    return raw


def test_reordered_references_restore_exact_identity_without_moving_content(monkeypatch):
    payload, snapshots, context, document = fixture()
    for index, target in enumerate(document["candidates"][0]["targets"]):
        target["corpus_item_id"] = f"t{index}"
        target["fit_reason"] = f"Reason for target {index}"
    document["candidates"][0]["targets"].reverse()
    raw = run(monkeypatch, context, document)
    result = planning._inspect_output(ordered_output(raw, context), payload, snapshots)
    assert [str(target.corpus_item_id) for target in result.candidates[0].targets] == [
        target["corpus_item_id"] for target in context["targets"]]
    assert [target.fit_reason for target in result.candidates[0].targets] == [
        "Reason for target 0", "Reason for target 1"]


@pytest.mark.parametrize("reference", ["t9", "T0", "t0 ", "t1", None, ["t0"], "12345678-abcd-abcd-abcd-000000000000"])
def test_unknown_duplicate_or_invalid_reference_cannot_be_accepted(monkeypatch, reference):
    payload, snapshots, context, document = fixture()
    document["candidates"][0]["targets"][0]["corpus_item_id"] = reference
    document["candidates"][0]["targets"][1]["corpus_item_id"] = "t1"
    raw = run(monkeypatch, context, document)
    with pytest.raises(planning._PlanContractError):
        planning._inspect_output(ordered_output(raw, context), payload, snapshots)


def test_target_array_repair_uses_same_mapping_and_revalidates_frames(monkeypatch):
    payload, snapshots, context, document = fixture()
    repair = repair_context(document, context, [{"path": ["candidates", 0, "targets"], "type": "target_identity_or_role"}])
    targets = deepcopy(document["candidates"][0]["targets"])
    for index, target in enumerate(targets):
        target["corpus_item_id"] = f"t{index}"
    raw = run(monkeypatch, repair, {"repairs": {"r0": targets}})
    accepted = apply_repairs(document, repair, raw)
    assert accepted == document
    planning._inspect_output(accepted, payload, snapshots)
    targets[0]["sentence_frame"] = "{{target}}"
    raw = run(monkeypatch, repair, {"repairs": {"r0": targets}})
    with pytest.raises(planning._PlanContractError, match="plan_invalid_frame"):
        planning._inspect_output(apply_repairs(document, repair, raw), payload, snapshots)


def test_scalar_patch_does_not_rewrite_natural_language(monkeypatch):
    _, _, context, document = fixture()
    repair = repair_context(document, context, [{"path": ["candidates", 0, "title"], "type": "duplicate_title"}])
    raw = run(monkeypatch, repair, {"repairs": {"r0": "Discuss t0 and t1 measurements"}})
    assert json.loads(raw) == {"repairs": {"r0": "Discuss t0 and t1 measurements"}}


@pytest.mark.parametrize("raw", ['{"candidates":[],"candidates":[]}', '{"repairs":{"r0":1,"r0":2}}', 'not json'])
def test_malformed_and_duplicate_json_never_pass_through(monkeypatch, raw):
    _, _, context, _ = fixture()
    assert run(monkeypatch, context, raw) == "null"


def test_structure_repair_includes_exact_anchors_and_rejected_sentence(monkeypatch):
    payload, _, context, document = fixture()
    payload.logic_template_id = "stakeholder_alignment"
    context["output_schema"] = planning._generation_schema(payload)
    context["targets"][0].update(kind="structure", text="The more you [action], the more you [result].")
    bad = "The more we test, the more we learn."
    document["candidates"][0]["targets"][0]["model_line"] = bad
    repair = repair_context(document, context, [{
        "path": ["candidates", 0, "targets", 0, "model_line"], "type": "model_line_missing_target",
    }])

    async def model(settings, prompt, wire, **kwargs):
        assert wire["targets"][0]["model_line_anchors"] == ["The more you", ", the more you"]
        assert wire["repair_tasks"][0]["current_value"] == bad
        return '{"repairs":{"r0":"The more you test, the more you learn."}}', {}

    monkeypatch.setattr(provider, "request_analysis_json", model)
    raw, _ = asyncio.run(provider.request_plan_json(None, planning.LOGIC_PLAN_PROMPT, repair))
    fixed = apply_repairs(document, repair, raw)
    assert planning._model_line_issue(fixed["candidates"][0]["targets"][0]["model_line"], context["targets"][0]) is None
    assert "model_line_anchors" not in context["targets"][0]


def test_wire_references_never_enter_saved_plan_or_mission(monkeypatch, planning_state):
    body = request_body()

    async def model(settings, prompt, context, **kwargs):
        assert context["targets"][0]["corpus_item_id"] == "t0"
        return json.dumps(proposals(context)), {}

    monkeypatch.setattr(provider, "request_analysis_json", model)
    monkeypatch.setattr(planning, "request_analysis_json", provider.request_plan_json)
    response = client.post("/api/speaking/plans", json=body)
    assert response.status_code == 201, response.text
    plan = response.json()
    assert plan["candidates"][0]["targets"][0]["corpus_item_id"] == body["targets"][0]["corpus_item_id"]
    request = session_request(plan)
    mission = client.post("/api/speaking/sessions", json=request)
    assert mission.status_code == 201, mission.text
    assert mission.json()["mission_plan"]["targets"][0]["corpus_item_id"] == body["targets"][0]["corpus_item_id"]
    assert client.post("/api/speaking/sessions", json=request).json() == mission.json()
