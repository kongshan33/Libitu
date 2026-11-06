"""Conservative lexical checks for a normalized learning expression."""
import re

from app.integrations.cmudict_lexicon import LexiconUnavailable, get_pronunciation_lexicon


def normalize_inflected_ipa(source: str, learning: str, ipa: str) -> str:
    """Remove a regular inflection only when dictionary phones prove its suffix.

    Never infer pronunciations for unknown words, changed token boundaries,
    irregular stems or ambiguous variants. Keep the provider's vowel choices,
    stress marks and weak forms. This is lexical evidence, not audio analysis.
    """
    original, normalized = source.lower().split(), learning.lower().split()
    parts = ipa.strip("/ ").split()
    if original == normalized or not (len(original) == len(normalized) == len(parts)):
        return ipa
    if any(not re.fullmatch(r"[a-z]+", word) for word in original + normalized):
        return ipa
    try:
        words = get_pronunciation_lexicon().words
    except LexiconUnavailable:
        return ipa
    # Only regular plural/third-person/past suffixes with a stable stem qualify.
    endings = {("S",): ("s",), ("Z",): ("z",), ("T",): ("t",), ("D",): ("d",),
        ("IH0", "Z"): ("ɪz", "əz"), ("AH0", "Z"): ("əz", "ɪz"),
        ("IH0", "D"): ("ɪd", "əd"), ("AH0", "D"): ("əd", "ɪd")}
    changed = False
    for index, (old, new) in enumerate(zip(original, normalized, strict=True)):
        if old == new or old not in {new + "s", new + "es", new + "d", new + "ed"}:
            continue
        old_variants, new_variants = words.get(old, ()), words.get(new, ())
        # Multiple pronunciations can signal a part-of-speech change.
        if not old_variants or len(new_variants) != 1:
            continue
        base = new_variants[0]
        if any(full[:len(base)] != base for full in old_variants):
            continue
        suffixes = [full[len(base):] for full in old_variants]
        # If the base already ends in that sound, an IPA suffix is ambiguous.
        if any(suffix not in endings or base[-1].rstrip("012") == suffix[-1].rstrip("012") for suffix in suffixes):
            continue
        for ending in dict.fromkeys(ending for suffix in suffixes for ending in endings[suffix]):
            if parts[index].endswith(ending) and len(parts[index]) > len(ending):
                parts[index] = parts[index][:-len(ending)]
                changed = True
                break
    return f"/{' '.join(parts)}/" if changed else ipa
