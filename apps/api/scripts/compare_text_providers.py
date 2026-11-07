"""Opt-in, database-free comparison of the actual Stage 1/Mission/Stage 5 paths.

From apps/api: .venv/bin/python -m scripts.compare_text_providers --live --output PATH
Defaults to two alternating rounds, six authored cases/provider; at most 40 paid requests
including Stage 1 retry, planner repair and assessment repair. No learner data.
"""
import argparse
import asyncio
from contextlib import ExitStack
from datetime import datetime, timezone
import hashlib
import gzip
import zlib
import json
from pathlib import Path
from time import perf_counter
from unittest.mock import patch
from uuid import UUID

import httpx

from app.config import Settings
from app.integrations import ark_analysis
from app.schemas.content import ContentResolveResponse
from app.schemas.speaking import SpeakingSession
from app.schemas.speaking_plan import SpeakingPlanCreate
from app.services import speaking_assessment as assessment, speaking_planning as planning, speaking_teaching as teaching


TRANSCRIPT = """0:00\tOur team has been discussing whether to launch the new service this month.
0:06\tTo be fair, the prototype works well, and customers like its simple design.
0:12\tBut liking a demo is not the same as relying on a service every day.
0:18\tThe problem isn't a lack of ideas, but rather a lack of time to test them.
0:25\tOne trade-off is that a wider launch gives us more feedback but increases support costs.
0:32\tWe only have two support engineers, and both are already busy with existing customers.
0:39\tThat's why I suggest starting with a small pilot instead of launching to everyone.
0:46\tWe could invite ten customers and check in with them twice a week.
0:52\tIf the pilot goes well, we can roll out the service to a larger group next month.
0:59\tIf it does not, we will still have time to fix the main problems.
1:05\tI am not saying we should delay forever. I am saying we should make the risk manageable.
1:12\tLet's agree on the success criteria today and review the results in two weeks."""


def uid(index):
    return str(UUID(int=index))


def fixtures():
    expressions = [("chunk", "to be fair"), ("chunk", "One trade-off is"),
                   ("structure", "The problem isn't [A], but rather [B]")]
    items = [{"id": uid(i + 10), "corpus_item_id": uid(i + 20), "ordinal": i, "kind": kind, "text": text}
             for i, (kind, text) in enumerate(expressions)]
    session = SpeakingSession(id=uid(1), client_id=uid(2), user_id="synthetic-benchmark",
        scenario_type="workplace", goal="Agree on a small service pilot and the next step.",
        difficulty="standard", feedback_level="balanced", status="completed", logic_template=None,
        created_at="2026-11-06T00:00:00Z", items=items)
    turns = [
        ("assistant", "Should we launch the service to everyone this month?"),
        ("user", "To be fair, the prototype works well. One trade-off is that a wider launch gives us more feedback but increases support costs."),
        ("assistant", "How could we manage that risk?"),
        ("user", "The problem isn't a lack of ideas, but rather a lack of time to test them. I suggest a pilot with ten customers."),
        ("assistant", "What should we do next?"),
        ("user", "I can draft the success criteria today. Let's review the pilot results together in two weeks."),
    ]
    messages = [{"id": uid(100 + i), "ordinal": i + 1, "role": role, "text": text,
                 "status": "final", "revision": 1, "input_source": "text", "created_at": "2026-11-06T00:00:00Z"}
                for i, (role, text) in enumerate(turns)]
    snapshots = [{"corpus_item_id": item["corpus_item_id"], "kind": item["kind"], "text": item["text"],
                  "meaning": "", "usage_note": "", "tags": [], "slots": {}, "source_title": "Authored fixture",
                  "register": None, "scenario_tags": [], "pattern_family": None} for item in items]
    payload = SpeakingPlanCreate(scenario_type="workplace", brief=session.goal, candidate_count=1,
        targets=[{"corpus_item_id": item["corpus_item_id"], "role": "primary"} for item in items])
    context = {"scenario_type": "workplace", "brief": session.goal, "candidate_count": 1,
               "targets": [{**item, "role": "primary"} for item in snapshots],
               "output_schema": planning._generation_schema(payload)}
    return session, messages, payload, snapshots, context


def decode_response(parts, encoding):
    data = b"".join(parts)
    if not data:
        return ""
    if encoding == "gzip":
        data = gzip.decompress(data)
    elif encoding == "deflate":
        data = zlib.decompress(data)
    return data.decode("utf-8", errors="replace")


class RecordedSyncStream(httpx.SyncByteStream):
    def __init__(self, stream, record, encoding):
        self.stream, self.record, self.parts, self.encoding = stream, record, [], encoding

    def __iter__(self):
        for part in self.stream:
            self.parts.append(part)
            yield part

    def close(self):
        self.record["response"] = decode_response(self.parts, self.encoding)
        self.stream.close()


class RecordedAsyncStream(httpx.AsyncByteStream):
    def __init__(self, stream, record, encoding):
        self.stream, self.record, self.parts, self.encoding = stream, record, [], encoding

    async def __aiter__(self):
        async for part in self.stream:
            self.parts.append(part)
            yield part

    async def aclose(self):
        self.record["response"] = decode_response(self.parts, self.encoding)
        await self.stream.aclose()


async def run(output, tasks, *, rounds=2, providers=("ark", "deepseek")):
    base = Settings()
    if any(not base.model_copy(update={"text_analysis_provider": provider}).text_api_key for provider in providers):
        raise SystemExit("Both provider credentials are required.")
    session, messages, payload, snapshots, context = fixtures()
    document = {"created_at": datetime.now(timezone.utc).isoformat(), "rounds": rounds,
                "fixture_origin": "authored synthetic; no database access", "results": []}
    current = None
    request_count = 0

    def record_request(request):
        nonlocal request_count
        request_count += 1
        if request_count > rounds * len(providers) * sum(1 if task.startswith("teaching") else 2 for task in tasks):
            raise RuntimeError("paid_request_budget")
        request.headers["accept-encoding"] = "identity"
        body = json.loads(request.content)
        record = {"request": body, "prompt_sha256": hashlib.sha256(
            json.dumps(body["messages"], ensure_ascii=False, sort_keys=True).encode()).hexdigest()}
        current["requests"].append(record)
        return record

    class SyncClient(httpx.Client):
        def send(self, request, **kwargs):
            record = record_request(request)
            response = super().send(request, **kwargs)
            record["http_status"] = response.status_code
            response.stream = RecordedSyncStream(response.stream, record, response.headers.get("content-encoding"))
            return response

    class AsyncClient(httpx.AsyncClient):
        async def send(self, request, **kwargs):
            record = record_request(request)
            response = await super().send(request, **kwargs)
            record["http_status"] = response.status_code
            response.stream = RecordedAsyncStream(response.stream, record, response.headers.get("content-encoding"))
            return response

    output.parent.mkdir(parents=True, exist_ok=True)
    for round_number in range(1, rounds + 1):
        for task in tasks:
            for provider in (providers if round_number % 2 else tuple(reversed(providers))):
                settings = base.model_copy(update={"text_analysis_provider": provider})
                current = {"round": round_number, "task": task, "provider": provider,
                           "model": settings.text_model, "requests": []}
                started = perf_counter()
                with ExitStack() as stack:
                    for module in (ark_analysis, planning, teaching, assessment):
                        stack.enter_context(patch.object(module, "get_settings", lambda: settings))
                    stack.enter_context(patch.object(httpx, "Client", SyncClient))
                    stack.enter_context(patch.object(httpx, "AsyncClient", AsyncClient))
                    original_assess = assessment._assess_with_provider
                    async def observed_assess(*args, **kwargs):
                        result = await original_assess(*args, **kwargs)
                        current["assessment_trace"] = getattr(result, "_trace", {})
                        current["provider_assessment"] = result.model_dump(mode="json")
                        return result
                    stack.enter_context(patch.object(assessment, "_assess_with_provider", observed_assess))
                    ark_analysis._ark_analysis_client.cache_clear()
                    try:
                        if task == "stage1":
                            def progress(preview):
                                if preview.summary or preview.corpus_items:
                                    current.setdefault("first_useful_preview_seconds", round(perf_counter() - started, 3))
                            result = ark_analysis.analyze_transcript(ContentResolveResponse(
                                content_id="benchmark", normalized_key="text:benchmark", kind="pasted_text",
                                title="A small service pilot", language="en"), TRANSCRIPT, progress)
                            current.update(status="ready", result=result.model_dump(mode="json"))
                        elif task == "planning":
                            result, attempts = await planning._generate_valid_proposals("provider-benchmark", payload, snapshots, context)
                            current.update(status="ready", attempts=attempts, result=result.model_dump(mode="json"))
                        elif task.startswith("teaching"):
                            message = dict(messages[1])
                            if task.endswith("mention"):
                                message["text"] = "I didn't use 'to be fair'. I was only reading the phrase on the card."
                            result = await teaching.analyze_utterance(session, message, [messages[0], message], {})
                            current.update(status=result["analysis_status"], result=result)
                        else:
                            rows = [dict(row) for row in messages]
                            if task.endswith("mention"):
                                rows[1]["text"] = "I didn't use 'to be fair' or 'One trade-off is'. I was only reading the phrases on the card."
                            source = {"session": session.model_dump(mode="json"), "messages": rows,
                                      "evidence": [], "controller": {"exposures": []}}
                            status, result = await assessment.assess_feedback(source)
                            current.update(status=status, result=result.model_dump(mode="json"))
                    except Exception as error:
                        current.update(status="failed", error_type=type(error).__name__,
                            error_code=getattr(error, "code", None) or (getattr(error, "headers", None) or {}).get("X-Speaking-Plan-Error"))
                    finally:
                        if ark_analysis._ark_analysis_client.cache_info().currsize:
                            ark_analysis._ark_analysis_client().close()
                        ark_analysis._ark_analysis_client.cache_clear()
                current["elapsed_seconds"] = round(perf_counter() - started, 3)
                document["results"].append(current)
                document["real_requests"] = request_count
                output.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")
                print(json.dumps({key: current.get(key) for key in (
                    "round", "task", "provider", "status", "elapsed_seconds", "attempts", "error_code")}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--tasks", nargs="+", choices=["stage1", "planning", "teaching_use", "teaching_mention", "assessment_use", "assessment_mention"],
                        default=["stage1", "planning", "teaching_use", "teaching_mention", "assessment_use", "assessment_mention"])
    parser.add_argument("--rounds", type=int, choices=range(1, 6), default=2)
    parser.add_argument("--providers", nargs="+", choices=["ark", "deepseek"], default=["ark", "deepseek"])
    args = parser.parse_args()
    asyncio.run(run(args.output, args.tasks, rounds=args.rounds, providers=tuple(args.providers)))
