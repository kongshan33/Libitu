"""Independent, bounded Syntax and follow-up requests. No background generation."""
import json
import re
from collections.abc import Iterator
from pathlib import Path

import httpx
from pydantic import ValidationError

from app.config import get_settings
from app.integrations.ark_analysis import AnalysisProviderError
from app.integrations.ark_selection import _selection_client
from app.schemas.corpus import CorpusFollowupRequest, CorpusSelectionSyntaxAnalysis, CorpusSyntaxRequest

PROMPTS = Path(__file__).parents[1] / "prompts"
SYNTAX_PROMPT = (PROMPTS / "corpus_syntax_system.txt").read_text().strip()
FOLLOWUP_PROMPT = (PROMPTS / "corpus_followup_system.txt").read_text().strip()


def _request(system: str, payload, *, stream: bool) -> dict:
    settings = get_settings()
    if not settings.corpus_api_key:
        raise AnalysisProviderError("Corpus model is not configured.", code="analysis_not_configured")
    user_content = json.dumps(payload.model_dump(exclude={"content_id"}), ensure_ascii=False)
    if stream:
        user_content += (
            "\n请直接回答 question。若要求改写且未要求改变原意，保留能力程度、范围和频率，"
            "有困难不等于不能做到；解释必须与实际改动一致。"
            "若比较语气，区分本句的意象感受与没有语料支持的固定语体结论。"
        )
    data = {"model": settings.corpus_model, "messages": [
        {"role": "system", "content": system},
        {"role": "user", "content": user_content},
    ], "thinking": {"type": "disabled"}, "temperature": 0.1,
        "max_tokens": min(settings.ark_max_output_tokens, 3000), "stream": stream}
    if not stream:
        data["response_format"] = {"type": "json_object"}
    return data


def generate_corpus_syntax(payload: CorpusSyntaxRequest) -> CorpusSelectionSyntaxAnalysis:
    try:
        response = _selection_client().post("/chat/completions",
            headers={"Authorization": f"Bearer {get_settings().corpus_api_key}"},
            json=_request(SYNTAX_PROMPT, payload, stream=False))
        response.raise_for_status()
        choice = response.json()["choices"][0]
        if choice.get("finish_reason") != "stop":
            raise ValueError("Incomplete syntax")
        result = CorpusSelectionSyntaxAnalysis.model_validate_json(choice["message"]["content"])
        if not result.sentence_type.strip() or not result.main_clause.strip():
            raise ValueError("Missing syntax")
        updates = {"usage_scenarios": [], "reusable_patterns": [], "background_context": None,
            "evidence": [s for s in (payload.context_before, payload.current_sentence, payload.context_after) if s]}
        if payload.selection_type == "phrase" and payload.kind != "structure":
            # Type is a short label. Internal structure belongs in its own
            # field, not a second, potentially contradictory parenthetical.
            updates["sentence_type"] = re.split(r"[（(，,；;：:]", result.sentence_type, maxsplit=1)[0].strip()
            if not updates["sentence_type"]:
                raise ValueError("Missing phrase type")
            updates.update({key: [] for key in ("grammar_points", "information_hierarchy", "style_features", "wording_notes", "translations", "translation_notes")})
        return result.model_copy(update=updates)
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError, ValidationError) as error:
        raise AnalysisProviderError("Syntax could not be generated. Please retry.", code="syntax_unavailable") from error


def _event(event: str, value: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(value, ensure_ascii=False)}\n\n"


def stream_corpus_followup(payload: CorpusFollowupRequest) -> Iterator[str]:
    """Forward actual provider deltas; only an explicit stop constitutes completion."""
    try:
        data = _request(FOLLOWUP_PROMPT, payload, stream=True)
        length = 0
        completed = False
        with _selection_client().stream("POST", "/chat/completions",
                headers={"Authorization": f"Bearer {get_settings().corpus_api_key}"}, json=data) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line.startswith("data:"):
                    continue
                raw = line[5:].strip()
                if raw == "[DONE]":
                    break
                packet = json.loads(raw)
                if packet.get("error"):
                    raise ValueError("Provider stream error")
                choices = packet.get("choices", [])
                if not choices:
                    continue
                choice = choices[0]
                delta = choice.get("delta", {}).get("content") or ""
                length += len(delta)
                if length > 6000:
                    raise ValueError("Answer too long")
                if delta:
                    yield _event("delta", {"text": delta})
                if choice.get("finish_reason"):
                    completed = choice["finish_reason"] == "stop"
            if not completed or not length:
                raise ValueError("Incomplete answer")
        yield _event("done", {})
    except (AnalysisProviderError, httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        yield _event("error", {"message": "Answer could not be completed. Please retry."})
