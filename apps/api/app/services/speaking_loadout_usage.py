"""Derive Stage 3 recommendations from retained evidence without model or writes."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException

from app.integrations.speaking_loadout_usage_repository import HISTORY_LIMIT, read_loadout_usage
from app.schemas.speaking import EVIDENCE_CONTRACT_VERSION
from app.schemas.speaking_loadout_usage import (
    ItemUsage, LoadoutPracticeHistory, LoadoutUsageItem, LoadoutUsageRequest, LoadoutUsageSummary,
)
from app.services.corpus_service import get_corpus_items
from app.services.speaking_assessment import validate_reference
from app.services.speaking_progress import _qualifying_time, _reliable_messages, _scene_roots, language_identity
from app.services.speaking_support import find_variant_quote
from app.services.speaking_teaching import find_target_quote


def _usage_times(report: dict, target: dict, identity: str) -> tuple[dict[str, datetime], str | None]:
    if report.get("status") != "ready":
        return {}, "pending_assessment"
    if (report.get("analysis_version") != "speaking-feedback-v3"
            or report.get("rubric_version") != "speaking-rubric-v2"
            or report.get("evidence_contract_version") != EVIDENCE_CONTRACT_VERSION
            or language_identity(target.get("item") or {}) != identity):
        return {}, "unsupported_evidence"
    item, result = target.get("item") or {}, target.get("result") or {}
    if (item.get("id") != result.get("session_item_id")
            or result.get("status") not in {"appropriate", "inappropriate", "not_observed"}
            or not isinstance(result.get("evidence"), list)):
        return {}, "invalid_evidence"
    refs = result["evidence"]
    # A capped reference list cannot establish the complete number or latest use.
    if len(refs) >= 40:
        return {}, "history_truncated"
    users = _reliable_messages(target.get("messages") or [])
    times = {}
    for raw in refs:
        ref = validate_reference(raw, users) if isinstance(raw, dict) else None
        if ref is None:
            return {}, "invalid_evidence"
        quote = ref.quote
        if not (find_target_quote(quote, item.get("text", ""), item.get("kind", "chunk"))
                or item.get("kind") != "structure" and find_variant_quote(quote, item.get("text", ""))):
            return {}, "invalid_evidence"
        message = next(row for row in users if row["id"] == ref.message_id)
        try:
            timestamp = datetime.fromisoformat((message.get("finalized_at") or message.get("started_at")
                                               or message.get("created_at") or "").replace("Z", "+00:00"))
            if timestamp.tzinfo is None:
                raise ValueError
        except (ValueError, TypeError, AttributeError):
            return {}, "invalid_evidence"
        times[ref.message_id] = timestamp.astimezone(timezone.utc)
    if (result["status"] == "not_observed") != (not times):
        return {}, "invalid_evidence"
    return times, None


def loadout_usage(owner: str, request: LoadoutUsageRequest) -> LoadoutUsageSummary:
    as_of = datetime.now(timezone.utc)
    ids = [str(value) for value in request.corpus_item_ids]
    if not ids:
        return LoadoutUsageSummary(as_of=as_of, items=[])
    # Bound PostgREST URL length without one request per item.
    corpus = [item for offset in range(0, len(ids), 100) for item in get_corpus_items(owner, ids[offset:offset + 100])]
    if {str(item.id) for item in corpus} != set(ids):
        raise HTTPException(404, "Selected language is unavailable. Refresh your library.")
    identities = {str(item.id): language_identity(item.model_dump(mode="json")) for item in corpus}
    source = read_loadout_usage(owner, ids)
    rows = source.get("items")
    if (not isinstance(rows, list) or [row.get("corpus_item_id") for row in rows if isinstance(row, dict)] != ids):
        raise HTTPException(503, "Loadout history returned an incomplete selection. Please retry.")
    output = []
    for row in rows:
        corpus_id = row["corpus_item_id"]
        missions = row.get("missions")
        if (type(row.get("has_more")) is not bool or not isinstance(missions, list) or len(missions) > HISTORY_LIMIT):
            raise HTTPException(503, "Loadout history returned an incomplete selection. Please retry.")
        reasons = {"history_truncated"} if row["has_more"] else set()
        uses, qualifying, seen = {}, {}, set()
        for mission in missions:
            try:
                session_id = str(UUID(mission["session_id"]))
                if session_id in seen:
                    raise ValueError
                seen.add(session_id)
                # A never-started draft has no learner speech to assess.
                if mission.get("session_status") == "draft" and mission.get("turn_count") == 0:
                    continue
                report = mission.get("report")
                if not report:
                    reasons.add("pending_assessment")
                    continue
                if report.get("session_id") != session_id:
                    raise ValueError
                targets = [target for target in report.get("items", [])
                           if (target.get("item") or {}).get("source_corpus_item_id") == corpus_id]
                if len(targets) != 1:
                    reasons.add("unsupported_evidence")
                    continue
                target = targets[0]
                times, reason = _usage_times(report, target, identities[corpus_id])
                if reason:
                    reasons.add(reason)
                else:
                    if any(value > as_of for value in times.values()):
                        reasons.add("invalid_evidence")
                    uses.update({(session_id, message_id): value for message_id, value in times.items()})
                practiced_at = _qualifying_time(report, target, identities[corpus_id])
                if practiced_at and practiced_at <= as_of:
                    UUID(report["id"])
                    UUID(report["root_session_id"])
                    qualifying[session_id] = (report, practiced_at)
            except (KeyError, TypeError, ValueError, AttributeError):
                reasons.add("invalid_evidence")
        if reasons:
            usage = ItemUsage(state="unknown", unknown_reasons=sorted(reasons))
        elif uses:
            last_used = max(uses.values())
            due_at = last_used + timedelta(days=7)
            usage = ItemUsage(state="used", all_use_count=len(uses), last_used_at=last_used,
                              due_at=due_at, due=due_at <= as_of)
        else:
            usage = ItemUsage(state="never", all_use_count=0, due=False)
        days = len({date.astimezone(timezone.utc).date() for _, date in qualifying.values()})
        roots = _scene_roots([report for report, _ in qualifying.values()])
        output.append(LoadoutUsageItem(corpus_item_id=corpus_id, usage=usage, practice=LoadoutPracticeHistory(
            qualifying_missions=len(qualifying), practice_days=days, scene_roots=roots,
            eligible=len(qualifying) >= 3 and days >= 2 and roots >= 2, history_truncated=row["has_more"],
        )))
    return LoadoutUsageSummary(as_of=as_of, items=output)
