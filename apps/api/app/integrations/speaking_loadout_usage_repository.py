"""Bounded Stage 3 reads, including missions whose assessment is not ready."""
from copy import deepcopy

import httpx
from fastapi import HTTPException

from app.config import get_settings
from app.integrations.speaking_feedback_repository import InlineFeedbackStore, get_feedback_store
from app.integrations.speaking_progress_repository import project_report
from app.integrations.supabase_repository import get_supabase_repository
from app.services import store

HISTORY_LIMIT = 100
_RESULT_FIELDS = ("session_item_id", "status", "role", "opportunity_status", "excluded_reason",
                  "independent_uses", "prompted_uses", "imitation_uses", "uncertain_assistance_uses",
                  "evidence", "qualifying_independent_evidence")
_MESSAGE_FIELDS = ("id", "role", "status", "revision", "text", "ordinal",
                   "created_at", "started_at", "finalized_at")


def project_usage_report(job: dict, corpus_id: str, session_item_id: str) -> dict:
    """Keep only this target's evidence and every revision of its quoted messages."""
    report = project_report(job, {corpus_id})
    source = job.get("source") or {}
    report["items"] = [target for target in report["items"] if target["item"].get("id") == session_item_id]
    results = (job.get("result") or {}).get("item_results", [])
    for target in report["items"]:
        matches = [row for row in results if row.get("session_item_id") == session_item_id]
        result = matches[0] if len(matches) == 1 else {}
        target["result"] = {key: deepcopy(result[key]) for key in _RESULT_FIELDS if key in result}
        refs = [*(result.get("evidence") or []), *(result.get("qualifying_independent_evidence") or [])]
        ids = {ref.get("message_id") for ref in refs if isinstance(ref, dict)}
        target["messages"] = [{key: deepcopy(row[key]) for key in _MESSAGE_FIELDS if key in row}
                              for row in source.get("messages", []) if row.get("id") in ids]
    return report


def read_loadout_usage(owner: str, corpus_ids: list[str]) -> dict:
    database = get_supabase_repository()
    if database is not None:
        try:
            value = database._request("POST", "/rpc/read_speaking_loadout_usage", json={
                "p_user_id": owner, "p_corpus_item_ids": corpus_ids, "p_limit": HISTORY_LIMIT,
            }).json()
        except (httpx.HTTPError, ValueError, TypeError):
            raise HTTPException(503, "Loadout history is temporarily unavailable. Please retry.") from None
        if (not isinstance(value, dict) or not isinstance(value.get("items"), list)
                or len(value["items"]) != len(corpus_ids)):
            raise HTTPException(503, "Loadout history returned an incomplete selection. Please retry.")
        return value
    if get_settings().supabase_server_is_configured or get_settings().processing_mode != "inline":
        raise HTTPException(503, "Loadout history storage is unavailable.")
    adapter = get_feedback_store()
    if not isinstance(adapter, InlineFeedbackStore):
        raise HTTPException(503, "Loadout history storage is unavailable.")
    with adapter._lock:
        jobs = {job["session_id"]: deepcopy(job) for job in adapter._jobs.values() if job["user_id"] == owner}
    from app.services.speaking_service import _MEMORY_LOCK
    with _MEMORY_LOCK:
        sessions = [session.model_dump(mode="json") for session in store.speaking_sessions.values()
                    if session.user_id == owner]
    sessions.sort(key=lambda row: (row["created_at"], row["id"]), reverse=True)
    summaries = []
    for corpus_id in corpus_ids:
        missions = []
        for session in sessions:
            for item in session["items"]:
                if (item.get("source_corpus_item_id") or item.get("corpus_item_id")) != corpus_id:
                    continue
                job = jobs.get(session["id"])
                report = (project_usage_report(job, corpus_id, item["id"])
                          if job and (job.get("source") or {}).get("session", {}).get("user_id") == owner else None)
                missions.append({"session_id": session["id"], "session_status": session["status"],
                                 "turn_count": session["turn_count"], "report": report})
        summaries.append({"corpus_item_id": corpus_id, "has_more": len(missions) > HISTORY_LIMIT,
                          "missions": missions[:HISTORY_LIMIT]})
    return {"items": summaries}
