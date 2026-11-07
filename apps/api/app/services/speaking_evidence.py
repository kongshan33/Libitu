"""Deterministic, revision-bound language occurrences shared by Stages 4 and 5."""
from __future__ import annotations

import re
import unicodedata

from app.services.speaking_support import variant_supported, find_variant_quote

_WORDS = re.compile(r"\w+(?:['’]\w+)*", re.UNICODE)
_SEPARATOR = re.compile(r"^[\s,\-–—]*$")

def _utf16_length(text: str) -> int:
    return len(text.encode("utf-16-le")) // 2


def _quoted(text: str, start: int | None, end: int | None, quote: str) -> bool:
    """Strict slicing also rejects offsets that split a surrogate pair."""
    if type(start) is not int or type(end) is not int or not 0 <= start < end:
        return False
    try:
        encoded = text.encode("utf-16-le")
        return end * 2 <= len(encoded) and encoded[start * 2:end * 2].decode("utf-16-le") == quote
    except (UnicodeError, AttributeError):
        return False


def _tokens(text: str) -> list[tuple[str, int, int]]:
    return [(unicodedata.normalize("NFKC", m.group()).casefold().replace("’", "'"), m.start(), m.end())
            for m in _WORDS.finditer(text)]


def _exact_spans(text: str, expression: str) -> list[tuple[int, int, str]]:
    words, target = _tokens(text), [word[0] for word in _tokens(expression)]
    if not target:
        return []
    spans = []
    for index in range(len(words) - len(target) + 1):
        selected = words[index:index + len(target)]
        if [word[0] for word in selected] != target:
            continue
        if any(not _SEPARATOR.fullmatch(text[left[2]:right[1]]) for left, right in zip(selected, selected[1:])):
            continue
        start, end = selected[0][1], selected[-1][2]
        spans.append((_utf16_length(text[:start]), _utf16_length(text[:end]), text[start:end]))
    return spans


def _structure_supported(pattern: str, quote: str, *, allow_surrounding: bool = False) -> bool:
    """A model must ground every literal anchor and fill every bracketed slot."""
    if len(pattern) > 1000:
        return False
    parts = re.split(r"(\[[^\]\n]{1,120}\])", pattern)
    fragments, anchors = [], 0
    for part in parts:
        if part.startswith("[") and part.endswith("]"):
            fragments.append(None)
        else:
            tokens = [word[0] for word in _tokens(part)]
            anchors += len(tokens)
            fragments.extend(tokens)
    if anchors < 2:
        return False
    actual = [word[0] for word in _tokens(quote)]
    # Linear-space DP avoids regex backtracking on many arbitrary user-defined slots.
    reachable = ([True] * (len(actual) + 1) if allow_surrounding
                 else [True, *([False] * len(actual))])
    for token in fragments:
        next_positions, earlier = [False] * len(reachable), False
        for index in range(len(actual)):
            if token is None:
                earlier = earlier or reachable[index]
                next_positions[index + 1] = earlier  # Every slot has at least one token.
            else:
                next_positions[index + 1] = reachable[index] and actual[index] == token
        reachable = next_positions
    return any(reachable) if allow_surrounding else reachable[-1]


def normalize_target_quote(expression: str, kind: str, text: str, quote: str,
                           start: int, end: int, match_type: str) -> dict | None:
    """Only repair a uniquely contained exact span, never a semantic verdict."""
    if not _quoted(text, start, end, quote):
        return None
    if kind == "structure":
        return ({"quote": quote, "start": start, "end": end, "match_type": "structure"}
                if match_type == "structure" and _structure_supported(expression, quote) else None)
    if match_type == "structure":
        return None
    spans = _exact_spans(quote, expression)
    if len(spans) == 1:
        left, right, exact = spans[0]
        if (start + left, start + right, exact) not in _exact_spans(text, expression):
            return None
        return {"quote": exact, "start": start + left, "end": start + right, "match_type": "exact"}
    tokens = _tokens(quote)
    contiguous = all(_SEPARATOR.fullmatch(quote[left[2]:right[1]]) for left, right in zip(tokens, tokens[1:]))
    boundaries = {(_utf16_length(text[:left]), _utf16_length(text[:right])) for _, left, right in _tokens(text)}
    bounded = any(left == start for left, _ in boundaries) and any(right == end for _, right in boundaries)
    if not spans and contiguous and bounded and match_type == "variant" and variant_supported(expression, quote):
        return {"quote": quote, "start": start, "end": end, "match_type": "variant"}
    return None


def target_candidates(items, messages: list[dict]) -> list[dict]:
    """Bounded lexical/structure candidates are observations, never earned credit."""
    candidates = []
    for item in items:
        count = 0
        for message in messages:
            if message.get("role") != "user" or message.get("status") != "final":
                continue
            text = message.get("text", "")
            spans = []
            if item.kind != "structure":
                spans = [(*span, "exact") for span in _exact_spans(text, item.text)]
                if not spans:
                    variant = find_variant_quote(text, item.text)
                    if variant:
                        spans = [(_utf16_length(text[:m.start()]), _utf16_length(text[:m.end()]),
                                  m.group(), "variant") for m in re.finditer(re.escape(variant), text)]
            else:
                for match in re.finditer(r"[^.!?\n]+", text):
                    quote = match.group().strip()
                    if quote and _structure_supported(item.text, quote):
                        left = match.start() + len(match.group()) - len(match.group().lstrip())
                        spans.append((_utf16_length(text[:left]), _utf16_length(text[:left + len(quote)]), quote, "structure"))
            for start, end, quote, match_type in spans[:8]:
                if count >= 40 or len(candidates) >= 320:
                    break
                candidates.append({"candidate_id": f"c{len(candidates)}", "session_item_id": str(item.id),
                    "message_id": message["id"], "transcript_revision": message["revision"],
                    "quote": quote, "start": start, "end": end, "match_type": match_type})
                count += 1
    return candidates


def evidence_catalog(messages: list[dict], candidates: list[dict]) -> list[dict]:
    """Freeze exact references for this request, including repeated occurrences."""
    entries, seen = [], set()
    def add(reference):
        key = tuple(reference[k] for k in ("message_id", "transcript_revision", "start", "end"))
        if key not in seen and len(entries) < 600:
            seen.add(key)
            entries.append({"evidence_id": f"e{len(entries)}", **reference})
    for message in messages:
        text = message["text"]
        for match in re.finditer(r"[\s\S]{1,4000}", text):
            add({"message_id": message["id"], "transcript_revision": message["revision"],
                 "quote": match.group(), "start": _utf16_length(text[:match.start()]),
                 "end": _utf16_length(text[:match.end()])})
    for candidate in candidates:
        add({key: candidate[key] for key in ("message_id", "transcript_revision", "quote", "start", "end")})
    return entries


