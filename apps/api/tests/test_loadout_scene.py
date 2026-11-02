"""Custom scene matching is bounded, owner checked, and does not create Missions."""
import asyncio
import json

import pytest

from app.services import loadout_scene, store
from app.services.speaking_teaching import AnalysisProviderError
from test_speaking_loadout import client, clean_loadout_state, saved  # noqa: F401


@pytest.fixture(autouse=True)
def scene_state(clean_loadout_state):
    loadout_scene._CACHE.clear()
    loadout_scene._ACTIVE.clear()
    yield
    loadout_scene._CACHE.clear()
    loadout_scene._ACTIVE.clear()


def test_travel_daily_logic_is_saved_without_changing_existing_defaults():
    from uuid import uuid4
    response = client.post("/api/speaking/sessions", json={
        "client_id": str(uuid4()), "scenario_type": "travel", "goal": "Plan a day with a fellow traveler",
        "corpus_item_ids": [saved().id], "logic_template_id": "making_plans",
    })
    assert response.status_code == 201, response.text
    assert response.json()["scenario_type"] == "travel"
    assert response.json()["logic_template"]["steps"] == ["Suggest", "Check", "Adjust", "Confirm"]


def test_custom_scene_uses_family_and_owned_targets_and_caches(monkeypatch):
    item = saved()
    calls = []
    async def generated(settings, prompt, context, **kwargs):
        calls.append(context)
        assert kwargs["timeout_seconds"] == 20
        assert context["scene"] == "Arrange a city tour with a friend."
        assert [target["text"] for target in context["targets"]] == [item.text]
        assert {logic["id"] for logic in context["logic_templates"]} == {"telling_story", "making_plans", "catching_up"}
        return json.dumps({"logic_template_id": "making_plans", "reason": "Agree on an itinerary together."}), {}
    monkeypatch.setattr(loadout_scene, "request_analysis_json", generated)
    request = {"scenario_type": "travel", "brief": "Arrange a city tour with a friend.", "corpus_item_ids": [item.id]}
    first = client.post("/api/speaking/scene-logic", json=request)
    assert first.status_code == 200, first.text
    assert client.post("/api/speaking/scene-logic", json=request).json() == first.json()
    assert len(calls) == 1
    assert not store.speaking_sessions


@pytest.mark.parametrize("payload,status", [
    ({"scenario_type": "travel", "brief": " "}, 422),
    ({"scenario_type": "travel", "brief": "x" * 501}, 422),
    ({"scenario_type": "unknown", "brief": "Plan a day."}, 422),
])
def test_invalid_scene_never_calls_model(monkeypatch, payload, status):
    async def never(*args, **kwargs):
        pytest.fail("Invalid scene reached a model")
    monkeypatch.setattr(loadout_scene, "request_analysis_json", never)
    assert client.post("/api/speaking/scene-logic", json=payload).status_code == status


def test_custom_scene_checks_target_ownership_before_model(monkeypatch):
    async def never(*args, **kwargs):
        pytest.fail("Unowned language reached a model")
    monkeypatch.setattr(loadout_scene, "request_analysis_json", never)
    response = client.post("/api/speaking/scene-logic", json={"scenario_type": "everyday", "brief": "Catch up.",
                           "corpus_item_ids": [saved(owner="someone-else").id]})
    assert response.status_code == 404


@pytest.mark.parametrize("failure,status", [("family", 502), ("provider", 503)])
def test_scene_failure_keeps_selection_without_fake_suggestion(monkeypatch, failure, status):
    item = saved()
    async def generated(*args, **kwargs):
        if failure == "provider":
            raise AnalysisProviderError({"error_type": "timeout"})
        return '{"logic_template_id":"persuasive_pitch","reason":"Not in the selected family"}', {}
    monkeypatch.setattr(loadout_scene, "request_analysis_json", generated)
    response = client.post("/api/speaking/scene-logic", json={"scenario_type": "travel", "brief": "Plan a trip.",
                           "corpus_item_ids": [item.id]})
    assert response.status_code == status
    assert item.id in store.corpus_items
    assert not store.speaking_sessions
    assert not loadout_scene._ACTIVE


def test_cancelled_scene_match_releases_owner_lock(monkeypatch):
    from app.schemas.loadout_scene import SceneLogicRequest
    async def cancelled(*args, **kwargs):
        raise asyncio.CancelledError
    monkeypatch.setattr(loadout_scene, "request_analysis_json", cancelled)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(loadout_scene.suggest_scene_logic("loadout-owner", SceneLogicRequest(scenario_type="travel", brief="Plan a trip.")))
    assert not loadout_scene._ACTIVE
