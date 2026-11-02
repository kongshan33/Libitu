"""Stage 3 history never turns missing evidence into zero usage or mastery."""
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.auth import AuthenticatedUser, require_user
from app.integrations import speaking_loadout_usage_repository as repository
from app.integrations.speaking_feedback_repository import InlineFeedbackStore
from app.integrations.speaking_runtime_repository import InlineRuntimeStore
from app.main import app
from app.schemas.speaking_loadout_usage import LoadoutUsageRequest
from app.services import speaking_loadout_usage as usage, store
from test_speaking_progress import history_report
from test_speaking_teaching import mission


def recorded_report(cid, day=1, scene="Meeting A", root=None):
    report = history_report(cid, day, scene, root)
    target = report["items"][0]
    target["result"].update(evidence=deepcopy(target["result"]["qualifying_independent_evidence"]),
                            prompted_uses=0, imitation_uses=0, uncertain_assistance_uses=0)
    return report


def recorded_mission(report):
    return {"session_id": report["session_id"], "session_status": "completed", "turn_count": 1,
            "report": report}


@pytest.fixture
def history(monkeypatch):
    cid = str(uuid4())
    reports = [recorded_report(cid, 1), recorded_report(cid, 2), recorded_report(cid, 2, "Meeting B")]
    source = {"items": [{"corpus_item_id": cid, "has_more": False,
                         "missions": [recorded_mission(report) for report in reports]}]}
    content = deepcopy(reports[0]["items"][0]["item"])
    monkeypatch.setattr(usage, "get_corpus_items", lambda owner, ids:
                        [SimpleNamespace(id=cid, model_dump=lambda **kw: content)] if cid in ids else [])
    monkeypatch.setattr(usage, "read_loadout_usage", lambda owner, ids: source)
    return cid, reports, content, source, LoadoutUsageRequest(corpus_item_ids=[cid])


def test_usage_and_qualification_are_separate_read_only_facts(history):
    _, reports, _, source, request = history
    for report in reports:
        result = report["items"][0]["result"]
        result.update(independent_uses=0, prompted_uses=1, imitation_uses=1,
                      qualifying_independent_evidence=[])
    before = deepcopy(source)
    item = usage.loadout_usage("owner", request).items[0]
    assert item.usage.state == "used" and item.usage.all_use_count == 3
    assert item.usage.last_used_at == datetime(2026, 10, 2, 8, tzinfo=timezone.utc)
    assert item.usage.due_at == datetime(2026, 10, 9, 8, tzinfo=timezone.utc)
    assert item.usage.due is True and item.usage.unknown_reasons == []
    assert item.practice.qualifying_missions == 0 and item.practice.eligible is False
    assert source == before


def test_complete_zero_is_never_and_never_is_not_due(history):
    _, reports, _, source, request = history
    for report in reports:
        report["items"][0]["result"].update(status="not_observed", independent_uses=0, evidence=[],
                                            qualifying_independent_evidence=[])
    item = usage.loadout_usage("owner", request).items[0]
    assert item.usage.state == "never" and item.usage.all_use_count == 0
    assert item.usage.last_used_at is None and item.usage.due_at is None and item.usage.due is False
    source["items"][0]["missions"] = []
    assert usage.loadout_usage("owner", request).items[0].usage.state == "never"


def test_due_uses_actual_utterance_time_and_exact_seven_days(history, monkeypatch):
    _, reports, _, source, request = history
    now = datetime(2026, 10, 26, 0, 0, tzinfo=timezone.utc)
    class Clock(datetime):
        @classmethod
        def now(cls, tz=None):
            return now
    monkeypatch.setattr(usage, "datetime", Clock)
    source["items"][0]["missions"] = [recorded_mission(reports[0])]
    report = reports[0]
    report["practiced_at"] = now.isoformat()  # report/session time must not reset Due
    message = report["items"][0]["messages"][0]
    message["finalized_at"] = (now - timedelta(days=7) + timedelta(seconds=1)).isoformat()
    assert usage.loadout_usage("owner", request).items[0].usage.due is False
    message["finalized_at"] = (now - timedelta(days=7)).isoformat()
    summary = usage.loadout_usage("owner", request)
    assert summary.items[0].usage.due is True
    assert summary.as_of == now and summary.review_rule.interval_days == 7


def test_repeated_quote_in_same_utterance_does_not_inflate_use_count(history):
    _, reports, _, _, request = history
    report = reports[0]
    target = report["items"][0]
    target["messages"][0]["text"] = "to be fair, to be fair"
    target["result"]["evidence"].append({"message_id": "user", "transcript_revision": 1,
                                       "quote": "to be fair", "start": 12, "end": 22})
    assert usage.loadout_usage("owner", request).items[0].usage.all_use_count == 3


def test_qualifying_history_preserves_three_two_two_and_scene_roots(history):
    _, reports, _, _, request = history
    practice = usage.loadout_usage("owner", request).items[0].practice
    assert (practice.qualifying_missions, practice.practice_days, practice.scene_roots) == (3, 2, 2)
    assert practice.eligible is True
    reports[-1]["root_session_id"] = reports[0]["root_session_id"]
    assert usage.loadout_usage("owner", request).items[0].practice.scene_roots == 1
    assert usage.loadout_usage("owner", request).items[0].practice.eligible is False


@pytest.mark.parametrize("fault,reason", [
    ("pending", "pending_assessment"), ("missing", "pending_assessment"),
    ("old_version", "unsupported_evidence"), ("old_contract", "unsupported_evidence"),
    ("edited_language", "unsupported_evidence"), ("missing_identity", "unsupported_evidence"),
    ("quote", "invalid_evidence"), ("wrong_revision", "invalid_evidence"),
    ("later_revision", "invalid_evidence"), ("assistant", "invalid_evidence"),
    ("interrupted", "invalid_evidence"), ("no_timestamp", "invalid_evidence"),
    ("naive_timestamp", "invalid_evidence"), ("future", "invalid_evidence"),
    ("uncertain", "invalid_evidence"), ("wrong_target", "invalid_evidence"),
    ("no_refs", "invalid_evidence"), ("foreign_quote", "invalid_evidence"),
    ("history_limit", "history_truncated"), ("reference_limit", "history_truncated"),
    ("repeated_session", "invalid_evidence"), ("wrong_session", "invalid_evidence"),
])
def test_any_history_gap_returns_unknown_instead_of_fabricated_zero(history, fault, reason):
    _, reports, content, source, request = history
    report, target = reports[0], reports[0]["items"][0]
    result, message = target["result"], target["messages"][0]
    if fault == "pending":
        report["status"] = "partial"
    elif fault == "missing":
        source["items"][0]["missions"][0]["report"] = None
    elif fault == "old_version":
        report["analysis_version"] = "speaking-feedback-v2"
    elif fault == "old_contract":
        report["evidence_contract_version"] = None
    elif fault == "edited_language":
        content["meaning"] = "different meaning"
    elif fault == "missing_identity":
        target["item"]["source_corpus_item_id"] = None
    elif fault == "quote":
        result["evidence"][0]["quote"] = "made up"
    elif fault == "wrong_revision":
        result["evidence"][0]["transcript_revision"] = 2
    elif fault == "later_revision":
        target["messages"].append({**message, "revision": 2, "text": "Changed words"})
    elif fault == "assistant":
        message["role"] = "assistant"
    elif fault == "interrupted":
        message["status"] = "interrupted"
    elif fault == "no_timestamp":
        message.pop("finalized_at")
    elif fault == "naive_timestamp":
        message["finalized_at"] = "2026-10-01T08:00:00"
    elif fault == "future":
        message["finalized_at"] = "2999-10-01T08:00:00Z"
    elif fault == "uncertain":
        result["status"] = "uncertain"
    elif fault == "wrong_target":
        result["session_item_id"] = str(uuid4())
    elif fault == "no_refs":
        result.pop("evidence")
    elif fault == "foreign_quote":
        message["text"] = "A different utterance."
        result["evidence"][0].update(quote=message["text"], start=0, end=len(message["text"]))
    elif fault == "history_limit":
        source["items"][0]["has_more"] = True
    elif fault == "reference_limit":
        result["evidence"] *= 40
    elif fault == "repeated_session":
        source["items"][0]["missions"].append(deepcopy(source["items"][0]["missions"][0]))
    else:
        report["session_id"] = str(uuid4())
    item = usage.loadout_usage("owner", request).items[0]
    assert item.usage.state == "unknown" and reason in item.usage.unknown_reasons
    assert item.usage.all_use_count is None and item.usage.last_used_at is None
    assert item.usage.due is None and item.usage.due_at is None


def test_never_started_draft_does_not_create_a_false_pending_assessment(history):
    _, _, _, source, request = history
    source["items"][0]["missions"] = [{"session_id": str(uuid4()), "session_status": "draft",
                                        "turn_count": 0, "report": None}]
    assert usage.loadout_usage("owner", request).items[0].usage.state == "never"
    source["items"][0]["missions"][0]["session_status"] = "active"
    assert usage.loadout_usage("owner", request).items[0].usage.state == "unknown"


def test_missing_selected_owner_item_fails_instead_of_returning_history(history, monkeypatch):
    _, _, _, _, request = history
    monkeypatch.setattr(usage, "get_corpus_items", lambda owner, ids: [])
    monkeypatch.setattr(usage, "read_loadout_usage", lambda *args: pytest.fail("must not read unowned history"))
    with pytest.raises(HTTPException) as error:
        usage.loadout_usage("other-owner", request)
    assert error.value.status_code == 404


@pytest.mark.parametrize("fault", ["missing_row", "wrong_id", "wrong_order", "bad_more", "too_many"])
def test_incomplete_repository_contract_fails_closed(history, fault):
    _, _, _, source, request = history
    if fault == "missing_row":
        source["items"] = []
    elif fault == "wrong_id":
        source["items"][0]["corpus_item_id"] = str(uuid4())
    elif fault == "wrong_order":
        source["items"].append(deepcopy(source["items"][0]))
    elif fault == "bad_more":
        source["items"][0]["has_more"] = None
    else:
        source["items"][0]["missions"] *= 34
    with pytest.raises(HTTPException) as error:
        usage.loadout_usage("owner", request)
    assert error.value.status_code == 503


def test_route_auth_validation_owner_and_private_no_store(history):
    cid, _, _, _, _ = history
    app.dependency_overrides.clear()
    client = TestClient(app)
    payload = {"corpus_item_ids": [cid]}
    assert client.post("/api/speaking/loadout-usage", json=payload).status_code == 401
    app.dependency_overrides[require_user] = lambda: AuthenticatedUser(id="owner")
    try:
        response = client.post("/api/speaking/loadout-usage", json=payload)
        assert response.status_code == 200 and response.headers["Cache-Control"] == "private, no-store"
        assert response.json()["review_rule"] == {"id": "recorded-use-7d-v1", "interval_days": 7}
        for ids in ([cid, cid], [str(uuid4()) for _ in range(501)], ["invalid"]):
            assert client.post("/api/speaking/loadout-usage", json={"corpus_item_ids": ids}).status_code == 422
        assert client.post("/api/speaking/loadout-usage", json={**payload, "owner": "other"}).status_code == 422
    finally:
        app.dependency_overrides.clear()


def test_empty_library_needs_no_history_or_corpus_read(monkeypatch):
    monkeypatch.setattr(usage, "get_corpus_items", lambda *args: pytest.fail("unexpected read"))
    monkeypatch.setattr(usage, "read_loadout_usage", lambda *args: pytest.fail("unexpected read"))
    assert usage.loadout_usage("owner", LoadoutUsageRequest(corpus_item_ids=[])).items == []


def frozen_job(report, owner):
    target = report["items"][0]
    return {**{key: deepcopy(report[key]) for key in ("id", "session_id", "status", "analysis_version", "rubric_version")},
            "user_id": owner,
            "source": {"session": {"user_id": owner, "evidence_contract_version": report["evidence_contract_version"],
                "items": [deepcopy(target["item"])],
                "mission_plan": {**report["scene"], "targets": [{"session_item_id": target["item"]["id"], "role": "primary"}]}},
                "messages": deepcopy(target["messages"])},
            "result": {"item_results": [deepcopy(target["result"])]}}


def test_projection_keeps_prompted_and_all_revisions_without_other_private_data():
    cid = str(uuid4())
    report = recorded_report(cid)
    job = frozen_job(report, "owner")
    target = report["items"][0]
    job["result"]["item_results"][0].update(independent_uses=0, prompted_uses=1, imitation_uses=1,
                                            qualifying_independent_evidence=[])
    job["source"]["messages"].extend([{**target["messages"][0], "revision": 2, "text": "revised"},
                                       {"id": "unrelated", "role": "assistant", "text": "private other content"}])
    job["source"]["session"]["items"].append({"id": str(uuid4()), "source_corpus_item_id": str(uuid4()), "text": "private"})
    before = deepcopy(job)
    projected = repository.project_usage_report(job, cid, target["item"]["id"])
    assert len(projected["items"]) == 1
    item = projected["items"][0]
    assert item["result"]["prompted_uses"] == item["result"]["imitation_uses"] == 1
    assert [row["revision"] for row in item["messages"]] == [1, 2]
    assert "private" not in str(projected) and job == before


def test_inline_read_includes_unassessed_and_legacy_sessions_and_fences_owner(monkeypatch):
    owner, cid = "usage-owner", str(uuid4())
    adapter = InlineFeedbackStore(InlineRuntimeStore())
    sessions = []
    for who, client, state in ((owner, uuid4(), "active"), (owner, None, "completed"), ("other", uuid4(), "completed")):
        session = mission(("chunk", "to be fair"))
        session.user_id, session.client_id, session.status = who, client, state
        session.items[0].corpus_item_id = UUID(cid)
        sessions.append(session)
    monkeypatch.setattr(store, "speaking_sessions", {str(row.id): row for row in sessions})
    monkeypatch.setattr(repository, "get_feedback_store", lambda: adapter)
    monkeypatch.setattr(repository, "get_supabase_repository", lambda: None)
    result = repository.read_loadout_usage(owner, [cid])
    assert {row["session_id"] for row in result["items"][0]["missions"]} == {str(row.id) for row in sessions[:2]}
    assert all(row["report"] is None for row in result["items"][0]["missions"])
    assert adapter._jobs == {}  # never enqueue a report for a Loadout read


@pytest.mark.parametrize("failure", ["transport", "bad_json", "partial_response", "durable_missing"])
def test_repository_failure_never_falls_back_to_empty_local_history(monkeypatch, failure):
    cid = str(uuid4())
    def request(*args, **kwargs):
        assert kwargs["json"] == {"p_user_id": "owner", "p_corpus_item_ids": [cid], "p_limit": 100}
        if failure == "transport":
            raise httpx.ConnectError("unavailable")
        if failure == "bad_json":
            raise ValueError("invalid json")
        return SimpleNamespace(json=lambda: {"items": []})
    monkeypatch.setattr(repository, "get_supabase_repository", lambda:
                        None if failure == "durable_missing" else SimpleNamespace(_request=request))
    monkeypatch.setattr(repository, "get_settings", lambda:
                        SimpleNamespace(supabase_server_is_configured=True, processing_mode="inline"))
    monkeypatch.setattr(repository, "get_feedback_store", lambda: pytest.fail("must not fall back"))
    with pytest.raises(HTTPException) as error:
        repository.read_loadout_usage("owner", [cid])
    assert error.value.status_code == 503
