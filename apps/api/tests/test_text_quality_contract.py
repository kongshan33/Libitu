"""Adversarial, database-free checks for deterministic evidence and bounded repair."""
import asyncio
from copy import deepcopy
import json

import httpx
import pytest

from app.services import speaking_assessment as a, speaking_assessment_contract as contract
from app.services import speaking_teaching as t
from app.services.speaking_evidence import normalize_target_quote, target_candidates, _utf16_length
from test_speaking_assessment import source, model, transport, scores
from test_speaking_teaching import mission, utterance, candidate


@pytest.mark.parametrize("prefix,quote,match_type,expected", [
    ("", "One trade-off is that", "variant", "exact"),
    ("😊 ", "One trade-off is that", "variant", "exact"),
    ("", "One trade-off is", "exact", "exact"),
    ("", "One trade-off is. One trade-off is", "variant", None),
    ("", "One trade-off was", "variant", None),
    ("", "One trade-off is", "structure", None),
    ("", "One trade-off. Is", "variant", None),
])
def test_exact_normalization_is_unique_contiguous_and_utf16_bound(prefix, quote, match_type, expected):
    text = prefix + quote + " expensive."
    result = normalize_target_quote("One trade-off is", "chunk", text, quote,
        _utf16_length(prefix), _utf16_length(prefix + quote), match_type)
    assert (result["match_type"] if result else None) == expected
    if result:
        assert result["quote"] == "One trade-off is" and result["start"] == _utf16_length(prefix)
    assert normalize_target_quote("One trade-off is", "chunk", text, quote, 999, 1000, match_type) is None


@pytest.mark.parametrize("verdict", ["appropriate", "inappropriate", "uncertain"])
def test_exact_repair_never_changes_semantic_verdict(monkeypatch, verdict):
    session = mission(("chunk", "One trade-off is"))
    message = utterance("One trade-off is that costs rise.")
    async def fake(*args):
        return t._Analysis(evidence=[candidate(session.items[0], "One trade-off is that", kind="variant", appropriateness=verdict)])
    monkeypatch.setattr(t, "_analyze_with_provider", fake)
    state = asyncio.run(t.analyze_utterance(session, message, [message], {}))
    assert [(row["quote"], row["appropriateness"], row["match_type"]) for row in state["evidence"]] == [
        ("One trade-off is", verdict, "exact")]
    assert state["analysis_trace"]["match_repairs"]


def test_candidate_ids_bind_repeated_occurrences_and_preserve_negative_judgment(monkeypatch):
    session = mission(("chunk", "to be fair"))
    message = utterance("I read 'to be fair'. To be fair, the plan is reasonable.")
    async def response(settings, prompt, context, **kwargs):
        rows = context["occurrence_candidates"]
        assert len(rows) == 2 and rows[0]["start"] != rows[1]["start"]
        return json.dumps({"candidate_reviews": [
            {"candidate_id": rows[0]["candidate_id"], "appropriateness": "inappropriate", "reason": "Quoted wording."},
            {"candidate_id": rows[1]["candidate_id"], "appropriateness": "appropriate", "reason": "Concession in context."}],
            "evidence": [], "needs_help": None, "recommendation": None}), {}
    monkeypatch.setattr(t, "request_analysis_json", response)
    state = asyncio.run(t.analyze_utterance(session, message, [message], {}))
    assert [row["appropriateness"] for row in state["evidence"]] == ["inappropriate", "appropriate"]
    assert state["analysis_trace"]["candidate_review_issues"] == []


@pytest.mark.parametrize("reviews", [[], [{"candidate_id": "unknown", "appropriateness": "appropriate", "reason": "Forged."}],
    [{"candidate_id": "c0", "appropriateness": "appropriate", "reason": "First."},
     {"candidate_id": "c0", "appropriateness": "inappropriate", "reason": "Conflict."}]])
def test_missing_unknown_or_duplicate_candidate_reviews_cannot_award_credit(monkeypatch, reviews):
    session = mission(("chunk", "to be fair")); message = utterance("To be fair, this works.")
    async def response(*args, **kwargs):
        return json.dumps({"candidate_reviews": reviews, "evidence": []}), {}
    monkeypatch.setattr(t, "request_analysis_json", response)
    state = asyncio.run(t.analyze_utterance(session, message, [message], {}))
    assert state["evidence"][0]["appropriateness"] == "uncertain"
    assert state["analysis_trace"]["candidate_review_issues"]


def wire(data):
    output = model(data)
    context = a._context(data)
    refs = {(row["message_id"], row["quote"]): row["evidence_id"] for row in context["evidence_catalog"]}
    output["dimensions"] = {dimension["id"]: {"summary": dimension["summary"], "criteria": {
        criterion["id"]: {"rating": criterion["rating"], "reason": criterion["reason"],
            "evidence": [refs[(ref["message_id"], ref["quote"])] for ref in criterion["evidence"]]}
        for criterion in dimension["criteria"]}} for dimension in output["dimensions"]}
    output["item_results"] = {"t0": {"reason": "Reviewed in context.", "uses": [
        {"candidate_id": row["candidate_id"], "appropriateness": "appropriate", "reason": "Fits."}
        for row in context["occurrence_candidates"]]}}
    return output


def envelope(value):
    return httpx.Response(200, json={"choices": [{"finish_reason": "stop", "message": {"content": json.dumps(value)}}]})


def test_wire_schema_requires_all_dimensions_and_criteria():
    schema = a._context(source())["output_schema"]
    dimensions = schema["properties"]["dimensions"]
    assert set(dimensions["required"]) == set(a.CRITERIA)
    for key, criteria in a.CRITERIA.items():
        assert set(dimensions["properties"][key]["properties"]["criteria"]["required"]) == {row[0] for row in criteria}
    assert schema["properties"]["item_results"]["required"] == ["t0"]


def test_reference_ids_restore_exact_revision_and_do_not_add_public_fields():
    data = source(); context = a._context(data)
    parsed = a._parse_assessment(json.dumps(wire(data)), context=context)
    assert contract.issues(data, parsed) == []
    status, result = a.compile_assessment(data, parsed)
    assert status == "ready" and scores(result)["transfer"] == 100
    assert "evidence_id" not in result.model_dump_json() and "candidate_id" not in result.model_dump_json()
    bad = wire(data);bad["dimensions"]["task_fit"]["criteria"]["relevance"]["evidence"] = ["e999"]
    with pytest.raises(ValueError):
        a._parse_assessment(json.dumps(bad), context=context)


def test_free_conversation_uses_null_wire_targets_without_scoring_transfer():
    data = source()
    output = wire(data)
    data["session"]["items"] = []
    context = a._context(data)
    assert context["output_schema"]["properties"]["item_results"] == {"type": "null"}
    output["item_results"] = None
    parsed = a._parse_assessment(json.dumps(output), context=context)
    assert parsed.item_results == [] and contract.issues(data, parsed) == []
    status, result = a.compile_assessment(data, parsed)
    assert status == "ready" and scores(result)["transfer"] is None


def test_missing_dimension_is_repaired_once_without_changing_good_rows(monkeypatch):
    data = source(); full = wire(data); first = deepcopy(full);del first["dimensions"]["naturalness"]
    calls = []
    def handler(request):
        payload = json.loads(request.content); calls.append(payload)
        if len(calls) == 1:
            return envelope(first)
        context = json.loads(payload["messages"][1]["content"])
        assert len(context["repair_tasks"]) == 1
        assert context["repair_tasks"][0]["code"] == "missing_dimension"
        original = a._parse_assessment(json.dumps(full), context=a._context(data))
        return envelope({"repairs": {context["repair_tasks"][0]["id"]: original.model_dump()["dimensions"]}})
    transport(monkeypatch, handler)
    result = asyncio.run(a._assess_with_provider(data))
    assert len(calls) == 2 and a.compile_assessment(data, result)[0] == "ready"
    assert result._trace["repair_status"] == "complete"


@pytest.mark.parametrize("failure", ["http", "invented_path", "changed_sibling"])
def test_failed_repairs_keep_first_valid_partial_and_do_not_loop(monkeypatch, failure):
    data = source(); full = wire(data); first = deepcopy(full);del first["dimensions"]["naturalness"]
    calls = []
    def handler(request):
        calls.append(request)
        if len(calls) == 1:
            return envelope(first)
        if failure == "http":
            return httpx.Response(429)
        if failure == "invented_path":
            return envelope({"repairs": {"not-requested": []}})
        replacement = a._parse_assessment(json.dumps(full), context=a._context(data)).model_dump()["dimensions"]
        replacement[0]["criteria"][0]["rating"] = 4
        return envelope({"repairs": {"r0": replacement}})
    transport(monkeypatch, handler)
    result = asyncio.run(a._assess_with_provider(data))
    assert len(calls) == 2 and len(result.dimensions) == 2
    assert result.dimensions[0].criteria[0].rating == 2
    assert a.compile_assessment(data, result)[0] == "partial"


def test_evidence_insufficiency_and_missing_transcript_do_not_trigger_repair(monkeypatch):
    data = source(); output = wire(data)
    for dimension in output["dimensions"].values():
        for criterion in dimension["criteria"].values():
            criterion.update(rating=None, reason="Not enough contextual evidence.", evidence=[])
    data["messages"].append({**data["messages"][0], "id": "missing", "status": "unavailable", "text": ""})
    calls = []
    def handler(request):
        calls.append(request);return envelope(output)
    transport(monkeypatch, handler)
    status, result = asyncio.run(a.assess_feedback(data))
    assert len(calls) == 1 and status == "partial"
    assert all(value is None for value in scores(result).values())


def test_invalid_reference_requests_only_one_criterion_repair():
    data = source(); output = model(data)
    output["dimensions"][0]["criteria"][0]["evidence"] = deepcopy(output["dimensions"][0]["criteria"][0]["evidence"])
    output["dimensions"][0]["criteria"][0]["evidence"][0]["quote"] = "invented"
    problems = contract.issues(data, a._Assessment.model_validate(output))
    assert [(p["path"], p["code"]) for p in problems] == [(["dimensions", 0, "criteria", 0], "invalid_scoring_reference")]


def test_duplicate_json_keys_are_rejected_before_scoring():
    with pytest.raises(ValueError, match="duplicate_assessment_key"):
        contract.load_json('{"dimensions": {}, "dimensions": {}}')


def test_assessment_cannot_credit_a_target_inside_a_larger_word():
    data = source()
    data["session"]["items"][0]["text"] = "to be fair"
    data["messages"][0]["text"] = "We want this to be fairness itself."
    output = model(data, quote=None)
    reference = {"message_id": data["messages"][0]["id"], "transcript_revision": 1,
                 "quote": "to be fair", "start": 13, "end": 23}
    output["item_results"][0]["uses"] = [{"reference": reference, "match_type": "exact",
                                        "appropriateness": "appropriate", "reason": "Model proposal."}]
    parsed = a._Assessment.model_validate(output)
    assert any(row["code"] == "invalid_target_reference" for row in contract.issues(data, parsed))
    _, result = a.compile_assessment(data, parsed)
    assert result.item_results[0].status != "appropriate"
    assert result.statistics.used_expressions == 0


def test_only_one_extra_terminal_brace_is_recoverable():
    audit = {}
    assert contract.load_json('{"quote":"}"}}', audit) == {"quote": "}"}
    assert audit == {"removed_single_terminal_brace": True}
    for raw in ('{"x": 1', '{"x": 1}}}', '{"x": 1} {}', '{"x": 1} prose', '[]}', '```json\\n{}\\n```'):
        with pytest.raises(ValueError):
            contract.load_json(raw)


def test_strict_schema_keeps_required_keys_and_local_validation_keeps_bounds():
    schema = contract.strict_schema(a._context(source())["output_schema"])
    assert set(schema["required"]) == set(schema["properties"])
    encoded = json.dumps(schema)
    assert '"$ref"' not in encoded and '"maxItems"' not in encoded and '"maxLength"' not in encoded
    assert schema["properties"]["dimensions"]["required"] == list(a.CRITERIA)
