"""Opt-in, bounded Ark → Supabase v2 plan/create/retry/read smoke.

Run from apps/api:
    .venv/bin/python -m scripts.smoke_speaking_logic --live --ipv4

One plan request, at most one content repair, and no realtime/feedback request.
Uses only this run's two synthetic corpus items and a new random owner. Cleanup
deletes exact owner-scoped row IDs, then that exact profile, and verifies absence.
No prompts, model output, credentials or user content are printed.
"""

import argparse
import asyncio
import json
import logging
import os
from pathlib import Path
import re
import sys
from time import monotonic
from uuid import uuid4

_API_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_API_ROOT))
os.chdir(_API_ROOT)

import httpx
from fastapi import HTTPException

from app.config import get_settings
from app.integrations.supabase_repository import get_supabase_repository
from app.schemas.corpus import CorpusItemCreate
from app.schemas.speaking import SpeakingSessionCreate
from app.schemas.speaking_plan import SpeakingPlanCreate
from app.services import speaking_planning, speaking_service


class SmokeFailure(RuntimeError):
    """Messages are fixed, non-sensitive codes only."""


def check(condition, code):
    if not condition:
        raise SmokeFailure(code)


def emit(event, **values):
    print(json.dumps({"event": event, **values}), flush=True)


def failure_code(error):
    if isinstance(error, SmokeFailure):
        return str(error)
    if isinstance(error, HTTPException):
        value = (error.headers or {}).get("X-Speaking-Plan-Error", "")
        return value if re.fullmatch(r"[a-z_]{1,80}", value) else f"http_{error.status_code}"
    if isinstance(error, httpx.HTTPStatusError):
        return f"database_http_{error.response.status_code}"
    return type(error).__name__


def fixtures():
    rows = [
        {"kind": "chunk", "text": "to be fair", "meaning": "Acknowledge another perspective",
         "usage_context": "Acknowledge a reasonable concern before giving your view.",
         "tags": ["conceding"], "slots": {}},
        {"kind": "structure", "text": "If [condition], then [result].",
         "meaning": "Explain how a condition changes an outcome",
         "usage_context": "Explain a concrete consequence of changing a project plan.",
         "tags": ["justifying"], "slots": {"condition": "a possible condition", "result": "its consequence"}},
    ]
    return [CorpusItemCreate(**row, source_locator={
        "source_title": "Synthetic logic smoke",
        "snapshot": {"id": f"fixture-{index}", "kind": row["kind"], "text": row["text"],
                     "tags": row["tags"], "meta": "synthetic", "register": "professional",
                     "scenario_tags": ["workplace", "disagreement"],
                     "pattern_family": "conditional" if row["kind"] == "structure" else None},
    }) for index, row in enumerate(rows)]


def cleanup(database, owner, known_ids):
    """Reads recover unknown commit IDs; every delete includes this exact owner."""
    problems = []
    for table in ("speaking_sessions", "speaking_plans", "corpus_items"):
        ids = set(known_ids[table])
        try:
            rows = database._request("GET", f"/{table}", params={
                "user_id": f"eq.{owner}", "select": "id",
            }).json()
            ids.update(row["id"] for row in rows)
        except Exception as error:
            problems.append(f"{table}_lookup_{failure_code(error)}")
        for identifier in ids:
            try:
                database._request("DELETE", f"/{table}", params={
                    "id": f"eq.{identifier}", "user_id": f"eq.{owner}",
                })
            except Exception as error:
                problems.append(f"{table}_delete_{failure_code(error)}")
    # Also handles an uncertain corpus insert whose response never arrived.
    try:
        database._request("DELETE", "/profiles", params={"id": f"eq.{owner}"})
    except Exception as error:
        problems.append(f"profile_delete_{failure_code(error)}")
    for table, column in (("profiles", "id"), ("corpus_items", "user_id"),
                          ("speaking_plans", "user_id"), ("speaking_sessions", "user_id")):
        try:
            rows = database._request("GET", f"/{table}", params={
                column: f"eq.{owner}", "select": "id", "limit": "1",
            }).json()
            check(rows == [], f"cleanup_{table}_remains")
        except Exception as error:
            problems.append(f"{table}_verify_{failure_code(error)}")
    if problems:
        # A failed individual delete is acceptable only if final absence is known.
        if any("_verify_" in problem for problem in problems):
            emit("cleanup_failed", owner=owner, codes=problems)
            raise SmokeFailure("cleanup_not_verified")
    emit("cleanup_verified", owner=owner, remaining_rows=0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", required=True,
                        help="Authorize the bounded real provider and synthetic database smoke.")
    parser.add_argument("--ipv4", action="store_true",
                        help="Use IPv4 for this process's Supabase client; TLS verification stays enabled.")
    args = parser.parse_args()
    settings = get_settings()
    check(settings.ark_is_configured and settings.supabase_server_is_configured, "configuration_missing")
    database = get_supabase_repository()
    check(database is not None, "durable_database_missing")
    if args.ipv4:
        old = database._client
        database._client = httpx.Client(base_url=database._rest_url, headers=database._headers,
            transport=httpx.HTTPTransport(local_address="0.0.0.0", retries=0),
            timeout=httpx.Timeout(15, connect=8))
        old.close()
    # Even error diagnostics cannot print provider prompts or request bodies.
    logging.disable(logging.CRITICAL)
    owner = "libitu-logic-smoke-" + uuid4().hex
    known_ids = {"speaking_sessions": [], "speaking_plans": [], "corpus_items": []}
    previous_provider = speaking_planning.request_analysis_json
    calls = 0
    async def observed(*args, **kwargs):
        nonlocal calls
        calls += 1
        check(calls <= 2, "model_call_budget_exceeded")
        started = monotonic()
        raw, trace = await previous_provider(*args, **kwargs)
        emit("provider_completed", call=calls, elapsed_seconds=round(monotonic() - started, 2))
        return raw, trace
    speaking_planning.request_analysis_json = observed
    passed, owns_profile = False, False
    started = monotonic()
    emit("started", owner=owner, target_count=2, max_model_calls=2, plan_requests=1)
    try:
        check(database._request("GET", "/profiles", params={
            "id": f"eq.{owner}", "select": "id", "limit": "1",
        }).json() == [], "synthetic_owner_collision")
        # Only after collision verification may finally remove this random profile.
        owns_profile = True
        items = []
        for fixture in fixtures():
            item_id = str(uuid4())
            known_ids["corpus_items"].append(item_id)
            items.append(database.create_corpus_item(owner, item_id, fixture))
        emit("corpus_created", count=len(items))
        plan = asyncio.run(speaking_planning.create_speaking_plan(owner, SpeakingPlanCreate(
            scenario_type="workplace", candidate_count=1, logic_template_id="disagreement",
            brief="Discuss a proposed launch deadline, acknowledge testing constraints and agree on a practical next step.",
            targets=[{"corpus_item_id": item.id, "role": "primary", "stage_index": stage}
                     for item, stage in zip(items, (0, None), strict=True)],
        )))
        known_ids["speaking_plans"].append(str(plan.id))
        check(plan.version == 2 and plan.logic_template.id == "disagreement", "plan_logic_not_frozen")
        check(speaking_planning.read_speaking_plan(owner, str(plan.id)) == plan, "plan_read_mismatch")
        chosen = plan.candidates[0]
        check([target.stage_index for target in chosen.targets] == [0, None], "plan_stage_mismatch")
        check(all(target.model_line for target in chosen.targets), "model_line_missing")
        request = SpeakingSessionCreate(client_id=uuid4(), scenario_type=plan.scenario_type,
            goal=chosen.goal, difficulty="standard", feedback_level="balanced", support_level="model_frame",
            logic_template_id=plan.logic_template.id, corpus_item_ids=[item.id for item in items],
            plan_id=plan.id, candidate_id=chosen.id)
        session = speaking_service.create_speaking_session(owner, request)
        known_ids["speaking_sessions"].append(str(session.id))
        check(session.logic_template == plan.logic_template == session.mission_plan.logic_template,
              "session_logic_mismatch")
        check(session.mission_plan.version == 2, "session_version_mismatch")
        check([target.stage_index for target in session.mission_plan.targets] == [0, None], "session_stage_mismatch")
        check([target.model_line for target in session.mission_plan.targets]
              == [target.model_line for target in chosen.targets], "session_model_line_mismatch")
        check(speaking_service.create_speaking_session(owner, request) == session, "exact_retry_mismatch")
        check(speaking_service.get_speaking_session(owner, str(session.id)) == session, "session_read_mismatch")
        emit("contract_verified", version=2, targets=2, any_stage=True,
             logic_frozen=True, model_lines_frozen=True, exact_retry=True, read=True)
        passed = True
    except (Exception, KeyboardInterrupt) as error:
        emit("failed", code=failure_code(error))
    finally:
        speaking_planning.request_analysis_json = previous_provider
        if owns_profile:
            try:
                cleanup(database, owner, known_ids)
            except Exception as error:
                passed = False
                emit("failed", code=failure_code(error))
    emit("completed", passed=passed, model_calls=calls, elapsed_seconds=round(monotonic() - started, 2),
         qualification="synthetic_planning_persistence_only")
    return 0 if passed else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        emit("failed", code=failure_code(error))
        raise SystemExit(1) from None
