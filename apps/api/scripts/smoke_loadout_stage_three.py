"""Opt-in Stage 3: owned corpus → usage → custom scene → Travel plan → save/retry.

Run from apps/api: .venv/bin/python -m scripts.smoke_loadout_stage_three --live --ipv4
Synthetic records only; one scene match plus one plan (at most one repair).
Never opens Stage 4, records audio or requests an assessment. Cleanup is verified.
"""
import argparse
import asyncio
import logging
from time import monotonic
from uuid import uuid4

import httpx

from scripts.smoke_speaking_logic import check, cleanup, emit, failure_code
from app.config import get_settings
from app.integrations.supabase_repository import get_supabase_repository
from app.schemas.corpus import CorpusItemCreate
from app.schemas.loadout_scene import SceneLogicRequest
from app.schemas.speaking import SpeakingSessionCreate
from app.schemas.speaking_loadout_usage import LoadoutUsageRequest
from app.schemas.speaking_plan import SpeakingPlanCreate
from app.services import loadout_scene, speaking_planning, speaking_service
from app.services.speaking_loadout_usage import loadout_usage


async def run(owner, database, known_ids):
    items = []
    for text, meaning, tag in [
        ("How about", "Make a friendly suggestion", "proposing"),
        ("just to be clear", "Check a shared understanding", "clarifying"),
    ]:
        item_id = str(uuid4())
        known_ids["corpus_items"].append(item_id)
        items.append(database.create_corpus_item(owner, item_id, CorpusItemCreate(
            kind="chunk", text=text, meaning=meaning, tags=[tag], slots={},
            source_locator={"source_title": "Synthetic Stage 3 Travel smoke"},
        )))
    usage_request = LoadoutUsageRequest(corpus_item_ids=[item.id for item in items])
    usage = loadout_usage(owner, usage_request)
    check(all(row.usage.state == "never" and row.usage.all_use_count == 0
              and row.usage.due is False for row in usage.items), "new_usage_not_never")
    brief = "Plan one free day in Kyoto with a friend. Suggest an itinerary, check our priorities, and agree on the plan."
    suggestion = await loadout_scene.suggest_scene_logic(owner, SceneLogicRequest(
        scenario_type="travel", brief=brief, corpus_item_ids=[item.id for item in items],
    ))
    check(suggestion.logic_template_id == "making_plans", "scene_logic_mismatch")
    plan = await speaking_planning.create_speaking_plan(owner, SpeakingPlanCreate(
        scenario_type="travel", brief=brief, candidate_count=1, logic_template_id=suggestion.logic_template_id,
        targets=[{"corpus_item_id": item.id, "role": "primary", "stage_index": index}
                 for index, item in enumerate(items)],
    ))
    known_ids["speaking_plans"].append(str(plan.id))
    check(plan.version == 2 and plan.scenario_type == "travel"
          and plan.logic_template.id == "making_plans", "plan_catalog_mismatch")
    check(speaking_planning.read_speaking_plan(owner, str(plan.id)) == plan, "plan_read_mismatch")
    candidate = plan.candidates[0]
    check([target.stage_index for target in candidate.targets] == [0, 1], "stage_mismatch")
    payload = SpeakingSessionCreate(
        client_id=uuid4(), scenario_type="travel", goal=candidate.goal,
        difficulty="guided", feedback_level="detailed", support_level="model_frame",
        logic_template_id="making_plans", corpus_item_ids=[item.id for item in items],
        plan_id=plan.id, candidate_id=candidate.id,
    )
    session = speaking_service.create_speaking_session(owner, payload)
    known_ids["speaking_sessions"].append(str(session.id))
    check(speaking_service.create_speaking_session(owner, payload).id == session.id, "retry_not_exact")
    check(session.logic_template == plan.logic_template and session.status == "draft", "frozen_session_mismatch")
    usage_after = loadout_usage(owner, usage_request)
    check(all(row.usage.state == "never" for row in usage_after.items), "draft_fabricates_usage")
    emit("passed", scenario="travel", logic="making_plans", target_count=2,
         checks=["owned_usage", "scene_matching", "plan_save_read", "frozen_targets", "create_exact_retry", "no_draft_usage"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", required=True)
    parser.add_argument("--ipv4", action="store_true")
    args = parser.parse_args()
    check(get_settings().text_is_configured and get_settings().supabase_server_is_configured, "configuration_missing")
    database = get_supabase_repository()
    if args.ipv4:
        old = database._client
        database._client = httpx.Client(base_url=database._rest_url, headers=database._headers,
            transport=httpx.HTTPTransport(local_address="0.0.0.0", retries=0), timeout=httpx.Timeout(15, connect=8))
        old.close()
    request = database._request
    def observed_request(method, path, **kwargs):
        try:
            return request(method, path, **kwargs)
        except httpx.HTTPError as error:
            emit("database_transport_failed", operation=method, endpoint=path,
                 error_type=type(error).__name__)
            raise
    database._request = observed_request
    logging.disable(logging.CRITICAL)
    owner = "libitu-stage3-smoke-" + uuid4().hex
    known_ids = {"speaking_sessions": [], "speaking_plans": [], "corpus_items": []}
    check(database._request("GET", "/profiles", params={"id": f"eq.{owner}", "select": "id"}).json() == [], "owner_collision")
    started = monotonic()
    try:
        asyncio.run(run(owner, database, known_ids))
    except Exception as error:
        emit("failed", code=failure_code(error))
        raise SystemExit(1) from None
    finally:
        cleanup(database, owner, known_ids)
        emit("finished", seconds=round(monotonic() - started, 2))


if __name__ == "__main__":
    main()
