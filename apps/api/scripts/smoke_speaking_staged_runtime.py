"""Opt-in bounded v2 runtime smoke; fixed synthetic plan, real Gemini/Ark teaching.

Run in apps/api: .venv/bin/python -m scripts.smoke_speaking_staged_runtime --live
At most three typed learner turns and 120 realtime seconds. Text visibility ACKs
are synthetic; this is pipeline evidence, not human/voice/learning validation.
All records belong to one generated smoke owner and are verified deleted.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import json
import re
import sys
import traceback
from uuid import uuid4

import httpx

from app.integrations.supabase_repository import get_supabase_repository
from app.schemas.corpus import CorpusItemCreate
from app.schemas.speaking import SpeakingSessionCreate
from app.schemas.speaking_plan import SpeakingPlan, SpeakingScenarioCandidate
from app.schemas.speaking_runtime import RealtimeStart
from app.services import corpus_service, speaking_planning, speaking_runtime_state, speaking_service
from app.services.speaking_gemini_runtime import GeminiSpeakingConnection
from scripts.smoke_speaking_runtime import SyntheticBrowser
from scripts.verify_speaking_planning import cleanup


def exception_shape(error: BaseException) -> dict:
    """Diagnostics deliberately omit exception text, source lines and locals."""
    return {"exception": type(error).__name__,
            "frames": [{"file": frame.filename.rsplit("/", 1)[-1], "function": frame.name, "line": frame.lineno}
                       for frame in traceback.extract_tb(error.__traceback__)[-8:]]}


class DiagnosticConnection(GeminiSpeakingConnection):
    async def send(self, document: dict) -> None:
        if document.get("type") == "error" and (error := sys.exception()) is not None:
            self.smoke_errors.append(exception_shape(error))
        await super().send(document)


def attempt_diagnostics(document: dict) -> list[dict]:
    """Keep synthetic reply/effect evidence locally before deleting smoke data."""
    result = []
    for attempt in document.get("teaching_attempts", []):
        responses = [row for row in document.get("messages", [])
                     if attempt.get("response_id") and row.get("role") == "assistant" and row.get("status") == "final"
                     and row.get("response_id") == attempt.get("response_id")]
        response = max(responses, key=lambda row: row.get("revision", 0), default=None)
        effect = attempt.get("assessment") or {}
        result.append({"action": (attempt.get("policy") or {}).get("action"),
                       "send_status": attempt.get("send_status"), "bound": bool(attempt.get("response_id")),
                       "outcome": effect.get("outcome"), "presented": attempt.get("presented") is True,
                       "assessment": {key: effect.get(key) for key in (
                           "reason", "exact_quote", "model_quote", "transfer_question_quote")},
                       "assessment_revision": attempt.get("assessment_revision"),
                       "presented_revision": attempt.get("presented_revision"),
                       "completed_response": {"revision": response.get("revision"), "text": response.get("text", "")[:8000]}
                           if response else None})
    return result


async def exercise(owner: str, session_id: str) -> dict:
    ticket = await asyncio.to_thread(speaking_runtime_state.create_ticket, owner, session_id,
                                     RealtimeStart(client_connection_id=uuid4()))
    await asyncio.to_thread(speaking_runtime_state.consume_ticket, session_id, str(ticket.runtime_id), ticket.ticket)
    browser = SyntheticBrowser()
    connection = DiagnosticConnection(browser, owner, session_id, str(ticket.runtime_id))
    connection.smoke_errors = []
    running = asyncio.create_task(connection.run())
    loop = asyncio.get_running_loop()
    deadline, ping_at = loop.time() + 120, loop.time()
    workspace, sent, imitation_sent = None, 0, False
    shown = set()
    result = {"status": "timeout", "plan_source": "fixed_synthetic_v2", "input": "typed",
              "presentation_receipts": "synthetic_text_ack", "runtime_budget_seconds": 120}

    async def submit(text):
        nonlocal sent
        if sent >= 3:
            raise RuntimeError("turn_budget")
        await browser.incoming.put({"type": "text.submit", "client_turn_id": str(uuid4()), "text": text})
        sent += 1

    try:
        while loop.time() < deadline:
            try:
                event = await asyncio.wait_for(browser.events.get(), timeout=.5)
            except asyncio.TimeoutError:
                event = None
            if event and event["type"] == "error":
                code = event.get("code", "")
                result.update(status="runtime_error" if code.startswith("runtime_") else
                              "provider_error" if code.startswith("provider_") else "unclassified_connection_error",
                              error_code=event.get("code", "unknown"))
                if event.get("message") in {"Speaking persistence is unavailable. Please retry.",
                                            "Speaking sessions could not be saved or loaded. Please retry."}:
                    result["error_detail"] = event["message"]
                break
            if event and event["type"] == "ready":
                await browser.incoming.put({"type": "microphone", "enabled": False})
            if event and event["type"] == "snapshot":
                workspace = event["workspace"]
                for message in workspace["messages"]:
                    key = (message["id"], message["revision"])
                    if message["role"] == "assistant" and message["status"] == "final" and key not in shown:
                        shown.add(key)
                        await browser.incoming.put({"type": "message.shown", "message_id": key[0], "revision": key[1]})
            if workspace:
                progress = workspace.get("stage_progress") or {}
                target = next(iter(progress.get("targets", [])), {})
                assistants = sum(message["role"] == "assistant" and message["status"] == "final"
                                 for message in workspace["messages"])
                if sent == 0 and assistants:
                    await submit("Testing needs another week. I want to agree on a realistic deadline.")
                elif not imitation_sent and target.get("modeling_status") == "modeled":
                    await submit("To be fair, we need another week for testing before we can finish the deadline.")
                    imitation_sent = True
                elif sent == 1 and assistants >= 2 and connection.injected_attempt:
                    await submit("Friday would be a realistic deadline because the testing is still incomplete.")
                if imitation_sent and target.get("imitation_uses", 0) > 0:
                    learning = next(iter(workspace.get("learning", [])), {})
                    attempts = connection.state["document"].get("teaching_attempts", [])
                    modeled = [row for row in attempts if (row.get("policy") or {}).get("action") == "model_then_transfer"]
                    result.update(status="passed" if len(modeled) == 1 and learning.get("independent_uses") == 0 else "contract_failed",
                                  model_attempts=len(modeled), imitation_uses=target["imitation_uses"],
                                  independent_uses=learning.get("independent_uses"), practice_status=target.get("practice_status"))
                    break
            if loop.time() - ping_at > 8:
                await browser.incoming.put({"type": "ping"})
                ping_at = loop.time()
            if running.done():
                result["status"] = "connection_ended"
                break
        result["user_turns_submitted"] = sent
        result["runtime_errors"] = connection.smoke_errors
        if workspace:
            result["analysis_status"] = workspace.get("analysis_status")
            result["stage_progress"] = workspace.get("stage_progress")
        result["attempts"] = attempt_diagnostics(connection.state.get("document", {}))
        return result
    finally:
        connection.stop.set()
        try:
            await asyncio.wait_for(running, 8)
        except asyncio.TimeoutError:
            running.cancel()
            await asyncio.gather(running, return_exceptions=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--ipv4", action="store_true", help="Use an IPv4-only Supabase client in this smoke process; TLS stays verified.")
    args = parser.parse_args()
    if not args.live:
        parser.error("Pass --live to permit the bounded real-provider runtime smoke.")
    database = get_supabase_repository()
    if database is None:
        raise SystemExit("Configured durable storage is required.")
    if args.ipv4:
        previous_client = database._client
        database._client = httpx.Client(
            base_url=database._rest_url, headers=database._headers,
            transport=httpx.HTTPTransport(local_address="0.0.0.0", retries=1),
            timeout=httpx.Timeout(20.0, connect=10.0),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
        previous_client.close()
    owner = "libitu-staged-runtime-smoke-" + uuid4().hex
    result = None
    database_errors = []
    request = database._request

    def traced_request(method, path, **kwargs):
        try:
            return request(method, path, **kwargs)
        except Exception as error:
            diagnostic = {"operation": path.split("?")[0], **exception_shape(error)}
            if isinstance(error, httpx.HTTPStatusError):
                diagnostic["http_status"] = error.response.status_code
                try:
                    code = error.response.json().get("code")
                    if isinstance(code, str) and re.fullmatch(r"[A-Z0-9_]{1,30}", code):
                        diagnostic["database_code"] = code
                except (ValueError, AttributeError):
                    pass
            database_errors.append(diagnostic)
            raise
    database._request = traced_request
    try:
        item = corpus_service.create_corpus_item(owner, CorpusItemCreate(
            kind="chunk", text="to be fair", meaning="Acknowledge another reasonable perspective",
            source_locator={"source_title": "Synthetic v2 runtime smoke"}))
        logic = next(value for value in speaking_service.speaking_options().logic_templates if value.id == "status_update")
        candidate = SpeakingScenarioCandidate(
            id=uuid4(), title="A realistic deadline", setting="Discuss a project deadline with a colleague.",
            goal="Agree on a realistic deadline", user_role="Project lead", ai_role="Colleague", register="professional",
            targets=[{"corpus_item_id": item.id, "role": "primary", "stage_index": 0,
                      "communicative_function": "Acknowledge a reasonable constraint", "fit": "high",
                      "fit_reason": "Testing needs extra time.", "trigger_question": "What deadline would work for your team?",
                      "skip_when": "The learner changes topic or ends the conversation.",
                      "sentence_frame": "To be fair, [constraint] matters.",
                      "model_line": "To be fair, testing needs enough time to protect quality."}])
        plan = SpeakingPlan(id=uuid4(), version=2, logic_template=logic, scenario_type="workplace", brief="",
                            created_at=datetime.now(timezone.utc), candidates=[candidate])
        speaking_planning._save_plan(owner, plan, [speaking_planning.corpus_plan_snapshot(item)])
        session = speaking_service.create_speaking_session(owner, SpeakingSessionCreate(
            client_id=uuid4(), scenario_type="workplace", goal=candidate.goal, logic_template_id=logic.id,
            corpus_item_ids=[item.id], plan_id=plan.id, candidate_id=candidate.id, support_level="model_frame"))
        result = asyncio.run(exercise(owner, str(session.id)))
    except Exception as error:
        # Exceptions from transports can include headers/URLs; emit only a class.
        result = {"status": "failed", "error_type": type(error).__name__, "plan_source": "fixed_synthetic_v2"}
    finally:
        try:
            cleanup(database, owner)
        finally:
            database._request = request
    result["database_errors"] = database_errors[-20:]
    result["supabase_transport"] = "ipv4_verified_tls" if args.ipv4 else "default_verified_tls"
    print(json.dumps(result, ensure_ascii=False))
    if result.get("status") != "passed":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
