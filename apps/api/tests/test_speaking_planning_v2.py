"""Versioned logic plans bind stages and examples without weakening legacy starts."""

import asyncio
import json

import pytest

from app.schemas.speaking_plan import PracticePlanCreate
from app.services import corpus_service, speaking_planning, speaking_service, store
from app.schemas.corpus import CorpusItemCreate
from test_speaking_planning import (
    OWNER, client, model_output, planning_state, proposals, request_body, saved, session_request,
)


def logic_body(stages=(0,)):
    body = request_body([saved() for _ in stages])
    body.update(logic_template_id="persuasive_pitch", candidate_count=1)
    for target, stage in zip(body["targets"], stages, strict=True):
        target.update(role="primary", stage_index=stage)
    return body


def logic_proposals(context):
    result = proposals(context)
    for candidate in result["candidates"]:
        for target in candidate["targets"]:
            source = next(item for item in context["targets"] if item["corpus_item_id"] == target["corpus_item_id"])
            target["model_line"] = (
                "If the deadline moves, then our testing plan changes."
                if source["kind"] == "structure" else "To be fair, our team also needs time to test."
            )
        if practice := context.get("practice"):
            parent = practice["scenario"]
            candidate["user_role"] = parent["ai_role" if practice["variation"] == "role_swap" else "user_role"]
            candidate["ai_role"] = parent["user_role" if practice["variation"] == "role_swap" else "ai_role"]
            candidate["setting"] = "Discuss an updated launch schedule with a different testing deadline."
            candidate["goal"] = "Agree how to deliver the launch two weeks earlier."
    return result


async def logic_generated(settings, prompt, context, **kwargs):
    assert kwargs["prompt_version"] == "speaking-plan-v9-logic"
    assert context["logic_template"]["id"] == "persuasive_pitch"
    assert 0 < kwargs["timeout_seconds"] <= 90
    return model_output(logic_proposals(context), context), {}


@pytest.fixture(autouse=True)
def logic_provider(planning_state, monkeypatch):
    monkeypatch.setattr(speaking_planning, "request_analysis_json", logic_generated)


@pytest.mark.parametrize("stages", [(0,), (0, 0, 2, 3, None)])
def test_logic_plan_freezes_one_or_five_equal_targets_and_replays(stages):
    response = client.post("/api/speaking/plans", json=logic_body(stages))
    assert response.status_code == 201, response.text
    plan = response.json()
    assert plan["version"] == 2
    assert plan["logic_template"]["steps"] == ["Context", "Tension", "Proposal", "Defend"]
    assert [target["stage_index"] for target in plan["candidates"][0]["targets"]] == list(stages)
    assert all(target["model_line"] for target in plan["candidates"][0]["targets"])
    request = session_request(plan)
    request["logic_template_id"] = "persuasive_pitch"
    created = client.post("/api/speaking/sessions", json=request)
    assert created.status_code == 201, created.text
    session = created.json()
    assert session["logic_template"] == session["mission_plan"]["logic_template"] == plan["logic_template"]
    assert [target["stage_index"] for target in session["mission_plan"]["targets"]] == list(stages)
    assert client.post("/api/speaking/sessions", json=request).json() == session


@pytest.mark.parametrize("stage", [-1, 4, True, 1.5, "1"])
def test_invalid_stage_rejected_before_model(monkeypatch, stage):
    async def never(*args, **kwargs):
        pytest.fail("Invalid logic stage reached the provider")
    monkeypatch.setattr(speaking_planning, "request_analysis_json", never)
    assert client.post("/api/speaking/plans", json=logic_body((stage,))).status_code == 422
    assert not store.speaking_plans


def test_logic_plan_rejects_legacy_priority_split_before_model(monkeypatch):
    body = logic_body((0, 1))
    body["targets"][1]["role"] = "opportunity"
    assert client.post("/api/speaking/plans", json=body).status_code == 422


def test_logic_plan_checks_corpus_ownership_before_model(monkeypatch):
    async def never(*args, **kwargs):
        pytest.fail("Unowned target reached the provider")
    monkeypatch.setattr(speaking_planning, "request_analysis_json", never)
    body = logic_body()
    body["targets"][0]["corpus_item_id"] = saved(owner="someone-else").id
    assert client.post("/api/speaking/plans", json=body).status_code == 404


def test_logic_model_schema_does_not_delegate_stage_or_logic_identity(monkeypatch):
    async def inspect(settings, prompt, context, **kwargs):
        target = context["output_schema"]["$defs"]["SpeakingPlanTarget"]
        assert "model_line" in target["required"]
        assert "stage_index" not in target["properties"]
        assert context["targets"][0]["stage_index"] == 2
        assert context["logic_template"]["steps"][2] == "Proposal"
        assert "Do not return logic_template or stage_index" in prompt
        return json.dumps(logic_proposals(context)), {}
    monkeypatch.setattr(speaking_planning, "request_analysis_json", inspect)
    assert client.post("/api/speaking/plans", json=logic_body((2,))).status_code == 201


@pytest.mark.parametrize("line", [None, "", "To be fair.", "A sentence with unrelated wording.", "To be fair, [your point].", "To be fair, our deadline is tight"])
def test_model_line_failure_has_one_bounded_repair_and_no_saved_plan(monkeypatch, line):
    calls = []
    async def invalid(settings, prompt, context, **kwargs):
        calls.append(context)
        result = logic_proposals(context)
        result["candidates"][0]["targets"][0]["model_line"] = line
        return model_output(result, context), {}
    monkeypatch.setattr(speaking_planning, "request_analysis_json", invalid)
    response = client.post("/api/speaking/plans", json=logic_body())
    assert response.status_code == 503
    assert len(calls) == 2
    assert not store.speaking_plans


def test_missing_model_line_can_be_repaired_in_original_context(monkeypatch):
    calls = []
    async def recovering(settings, prompt, context, **kwargs):
        calls.append(context)
        result = logic_proposals(context)
        if len(calls) == 1:
            result["candidates"][0]["targets"][0].pop("model_line")
        else:
            assert context["logic_template"]["id"] == "persuasive_pitch"
            assert context["repair_tasks"][0]["field"] == "model_line"
        return model_output(result, context), {}
    monkeypatch.setattr(speaking_planning, "request_analysis_json", recovering)
    assert client.post("/api/speaking/plans", json=logic_body()).status_code == 201
    assert len(calls) == 2


@pytest.mark.parametrize("mutation", ["stage", "slot"])
def test_model_cannot_change_stage_or_put_demonstration_in_slot(monkeypatch, mutation):
    calls = []
    async def invalid(settings, prompt, context, **kwargs):
        calls.append(1)
        result = logic_proposals(context)
        target = result["candidates"][0]["targets"][0]
        if mutation == "stage":
            target["stage_index"] = 3
        else:
            target["trigger_question"] = "Would you say to be fair about this plan?"
        return model_output(result, context), {}
    monkeypatch.setattr(speaking_planning, "request_analysis_json", invalid)
    assert client.post("/api/speaking/plans", json=logic_body()).status_code == 503
    assert len(calls) == 2
    assert not store.speaking_plans


def test_structure_demonstration_fills_all_slots_and_retains_anchors():
    item = corpus_service.create_corpus_item(OWNER, CorpusItemCreate(
        kind="structure", text="If [condition], then [result].", meaning="Explain a consequence", tags=[],
        slots={"condition": "a condition", "result": "the result"}, source_locator={"source_title": "Fixture"},
    ))
    body = logic_body()
    body["targets"][0]["corpus_item_id"] = item.id
    response = client.post("/api/speaking/plans", json=body)
    assert response.status_code == 201, response.text
    target = response.json()["candidates"][0]["targets"][0]
    assert target["sentence_frame"] == item.text
    assert target["model_line"] == "If the deadline moves, then our testing plan changes."
    assert speaking_planning._model_line_issue("If, then our testing plan changes.", {"kind": "structure", "text": item.text})


def test_create_rejects_logic_change_and_keeps_frozen_template(monkeypatch):
    plan = client.post("/api/speaking/plans", json=logic_body()).json()
    request = session_request(plan)
    request["logic_template_id"] = "disagreement"
    assert client.post("/api/speaking/sessions", json=request).status_code == 409
    request["logic_template_id"] = "persuasive_pitch"
    updated = tuple(template.model_copy(update={"title": "Changed later"}) if template.id == "persuasive_pitch" else template
                    for template in speaking_service._LOGIC_TEMPLATES)
    monkeypatch.setattr(speaking_service, "_LOGIC_TEMPLATES", updated)
    created = client.post("/api/speaking/sessions", json=request)
    assert created.status_code == 201, created.text
    assert created.json()["logic_template"] == plan["logic_template"]


@pytest.mark.parametrize("variation", ["details", "role_swap"])
def test_linked_logic_round_keeps_frozen_logic_stages_and_version(monkeypatch, variation):
    plan = client.post("/api/speaking/plans", json=logic_body((0, None))).json()
    request = session_request(plan)
    request.update(logic_template_id="persuasive_pitch", support_level="model_frame")
    created = client.post("/api/speaking/sessions", json=request)
    assert created.status_code == 201, created.text
    session = store.speaking_sessions[created.json()["id"]]
    session.status = "completed"
    updated = tuple(template.model_copy(update={"title": "Future title", "steps": ["Different"]})
                    if template.id == "persuasive_pitch" else template for template in speaking_service._LOGIC_TEMPLATES)
    monkeypatch.setattr(speaking_service, "_LOGIC_TEMPLATES", updated)
    linked = asyncio.run(speaking_planning.create_practice_plan(OWNER, str(session.id), PracticePlanCreate(variation=variation)))
    assert linked.version == 2
    assert linked.logic_template.model_dump() == plan["logic_template"]
    assert [target.stage_index for target in linked.candidates[0].targets] == [0, None]
    for candidate in linked.candidates:
        assert all(target.model_line for target in candidate.targets)


@pytest.mark.parametrize("logic", [None, "omitted"])
def test_legacy_requests_keep_v1_without_model_lines(monkeypatch, logic):
    from test_speaking_planning import generated
    monkeypatch.setattr(speaking_planning, "request_analysis_json", generated)
    body = request_body()
    if logic is None:
        body["logic_template_id"] = None
    response = client.post("/api/speaking/plans", json=body)
    assert response.status_code == 201
    assert response.json()["version"] == 1
    assert response.json()["logic_template"] is None
