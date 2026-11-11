"""Conservative text-only connected-speech candidates, never acoustic evidence."""

import hashlib
import re
from collections import OrderedDict
from dataclasses import dataclass
from itertools import islice
from threading import Lock

from app.integrations.cmudict_lexicon import (
    CONSONANTS,
    VOWELS,
    PronunciationLexicon,
    get_pronunciation_lexicon,
)
from app.schemas.sound import SentenceSound, SoundCandidate, SoundAnchor, SoundCoverage, SoundKind, SoundSubtype, SoundToken
from app.services.blueprint_service import find_blueprint_sentence, get_blueprint


RULE_VERSION = "sound-rules-v3"
MAX_CHARACTERS = 6000
MAX_TOKENS = 300
MAX_CANDIDATES = 80
MAX_PRONUNCIATIONS = 4
MAX_CACHE_ENTRIES = 128
# Keep contractions, numbers and non-English words whole. Unsupported forms stay
# unknown instead of silently turning part of them into an English word.
_WORDS = re.compile(r"['’]?[^\W_]+(?:['’][^\W_]+)*", re.UNICODE)
_IPA = {
    "AA": "ɑ", "AE": "æ", "AH": "ʌ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ",
    "EH": "ɛ", "ER": "ɝ", "EY": "eɪ", "IH": "ɪ", "IY": "i", "OW": "oʊ",
    "OY": "ɔɪ", "UH": "ʊ", "UW": "u", "B": "b", "CH": "tʃ", "D": "d",
    "DH": "ð", "F": "f", "G": "ɡ", "HH": "h", "JH": "dʒ", "K": "k", "L": "l",
    "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "ɹ", "S": "s", "SH": "ʃ",
    "T": "t", "TH": "θ", "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
}
# This whitelist is conditional on grammatical use. It is not a POS or stress
# detector. Ambiguous content-word/auxiliary uses such as "can" are excluded.
_WEAK_FORMS = {
    "a": ("/eɪ/", "/ə/", "Used as an indefinite article, not the letter A or a quoted word."),
    "an": ("/æn/", "/ən/", "Used as an indefinite article, not a name or a quoted word."),
    "and": ("/ænd/", "/ənd/", "Used as a coordinating conjunction, not a quoted word."),
    "of": ("/ʌv/", "/əv/", "Used as a preposition, not a quoted word."),
    "to": ("/tu/", "/tə/", "Used as a preposition or infinitive marker, not a quoted word."),
    "the": ("/ˈði/", "/ðə/", "Used as a definite article, not a quoted word or title."),
}
_cache: OrderedDict[tuple[str, ...], SentenceSound] = OrderedDict()
_cache_lock = Lock()


class SoundInputTooLong(ValueError):
    pass


@dataclass(frozen=True)
class _Word:
    token: SoundToken
    start: int
    end: int


def get_sentence_sound(content_id: str, sentence_id: str) -> SentenceSound | None:
    blueprint = get_blueprint(content_id)
    if blueprint is None:
        return None
    # Use exactly the same derived legacy sentence view as GET /blueprints. Do
    # not interpret sentence IDs as transcript indexes or accept client text.
    line = find_blueprint_sentence(blueprint, sentence_id)
    if line is None:
        return None
    text = "".join(part if isinstance(part, str) else part.text for part in line.parts)
    return annotate_sentence(content_id, sentence_id, text)


def annotate_sentence(content_id: str, sentence_id: str, text: str) -> SentenceSound:
    if len(text) > MAX_CHARACTERS or sum(2 if ord(char) > 0xFFFF else 1 for char in text) > MAX_CHARACTERS:
        raise SoundInputTooLong("Sound annotation supports sentences up to 6000 characters.")
    lexicon = get_pronunciation_lexicon()
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    key = (RULE_VERSION, lexicon.version, "GA", content_id, sentence_id, digest)
    with _cache_lock:
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key].model_copy(deep=True)
        result = _annotate(content_id, sentence_id, text, lexicon)
        _cache[key] = result
        while len(_cache) > MAX_CACHE_ENTRIES:
            _cache.popitem(last=False)
        return result.model_copy(deep=True)


def _symbol(phone: str) -> str:
    if phone == "AH0":
        return "ə"
    if phone == "ER0":
        return "ɚ"
    return _IPA[phone.rstrip("012")]


def _ipa(phones: tuple[str, ...] | list[str]) -> str:
    # Broad segment symbols only. Stress is retained explicitly in ARPABET;
    # placing IPA stress correctly would require a syllabification model.
    return "/" + "".join(_symbol(phone) for phone in phones) + "/"


def _annotate(content_id: str, sentence_id: str, text: str, lexicon: PronunciationLexicon) -> SentenceSound:
    matches = list(islice(_WORDS.finditer(text), MAX_TOKENS + 1))
    utf16 = [0]
    for character in text:
        utf16.append(utf16[-1] + (2 if ord(character) > 0xFFFF else 1))
    words: list[_Word] = []
    variants_truncated = False
    truncated_tokens: set[int] = set()
    for index, match in enumerate(matches[:MAX_TOKENS]):
        surface = match.group()
        variants = lexicon.words.get(surface.replace("’", "'").casefold(), ())
        # Uppercase initialisms/acronyms may share a spelling with an ordinary
        # word (SAT/sat, IT/it). Without an explicit acronym policy, do not pick
        # that word's pronunciation. I retains its ordinary pronoun reading;
        # uppercase A could be a letter or an article and remains unresolved.
        if surface == "A" or (surface.isupper() and sum(char.isalpha() for char in surface) > 1):
            variants = ()
        # Digit strings and mixed scripts have no reliable spoken expansion.
        if not re.fullmatch(r"'?\b[a-z]+(?:'[a-z]+)*", surface.replace("’", "'").casefold()):
            variants = ()
        variants_truncated |= len(variants) > MAX_PRONUNCIATIONS
        if len(variants) > MAX_PRONUNCIATIONS:
            truncated_tokens.add(index)
        shown = variants[:MAX_PRONUNCIATIONS]
        words.append(_Word(
            token=SoundToken(
                index=index, text=surface, start=utf16[match.start()], end=utf16[match.end()],
                pronunciations=[list(phones) for phones in shown], ipa=[_ipa(phones) for phones in shown],
                status="unknown" if not variants else "known" if len(variants) == 1 else "ambiguous",
            ),
            start=match.start(), end=match.end(),
        ))

    candidates: list[SoundCandidate] = []
    seen: set[tuple] = set()

    def add(kind: SoundKind, subtype: SoundSubtype, start: int, end: int, before: str, after: str,
            explanation: str, conditions: list[str], rule_id: str, *,
            phone: int | None = None, boundary: bool = False, alternative: str | None = None) -> None:
        identity = (kind, subtype, start, end, phone, after)
        if identity in seen or len(candidates) > MAX_CANDIDATES:
            return
        seen.add(identity)
        candidates.append(SoundCandidate(
            id=f"{rule_id}:{start}:{end}", kind=kind, subtype=subtype, token_start=start, token_end=end,
            anchor=SoundAnchor(type="phone" if phone is not None else "boundary" if boundary else "word",
                               token_index=start, phone_index=phone),
            alternative_group=alternative,
            source_text=text[words[start].start:words[end - 1].end],
            phonemes_before=before, phonemes_after=after, explanation=explanation,
            conditions=conditions, rule_id=rule_id,
        ))

    def edge(token: SoundToken, position: int) -> str | None:
        # Multiple dictionary readings may share the exact relevant boundary.
        # Inspect every variant; never choose one whole pronunciation for them.
        if token.index in truncated_tokens:
            return None
        values = {phones[position] for phones in token.pronunciations}
        return next(iter(values)) if len(values) == 1 else None

    phrase = "The words belong to the same spoken phrase without a pause or a new glottal onset."
    optional = "This is optional; keeping the separate citation sounds is also valid."
    stops = {"P", "B", "T", "D", "K", "G"}
    voiceless_codas = {"P", "T", "K", "F", "TH", "S", "SH", "CH"}
    voiced_codas = {"B", "D", "G", "V", "DH", "Z", "ZH", "JH"}
    # Reviewed spelling-to-form explanations, not inferred expansions of ambiguous phrases.
    contractions = {"i'll": "I will", "we'll": "we will", "you'll": "you will", "can't": "cannot",
                    "don't": "do not", "i'm": "I am", "we're": "we are", "they're": "they are"}
    casual = {"gonna": "going to (future/intention)", "wanna": "want to"}
    syllabic_words = {"button": "N", "cotton": "N", "mountain": "N", "bottle": "L", "little": "L"}
    h_words = {"he", "him", "his", "her", "have", "has", "had"}

    for index, word in enumerate(words):
        token = word.token
        key = token.text.replace("’", "'").casefold()
        following = words[index + 1] if index + 1 < len(words) else None
        joined = following is not None and text[word.end:following.start].isspace()
        previous_joined = index > 0 and text[words[index - 1].end:word.start].isspace()
        form = _WEAK_FORMS.get(token.text)
        if form and token.status != "unknown" and previous_joined and joined:
            before, after, grammar = form
            extra: list[str] = []
            eligible = True
            if key in {"the", "to"}:
                eligible = following.token.status == "known"
                if eligible:
                    next_vowel = following.token.pronunciations[0][0].rstrip("012") in VOWELS
                    if key == "the" and next_vowel:
                        after = "/ði/"
                        extra.append("The next word begins with a vowel sound; this weak form has a short vowel.")
                    elif key == "to" and next_vowel:
                        eligible = False
            if eligible:
                add("weak_form", "function_word", index, index + 1, before, after,
                    "This function word may use a weak form in connected speech.",
                    [grammar, "The word is unstressed and is not being contrasted or emphasized.", phrase, *extra],
                    "weak-function-v2")

        if token.status == "unknown" or token.index in truncated_tokens:
            continue
        variants = token.pronunciations
        phones = variants[0] if token.status == "known" else []
        # A deliberately narrow voicing-conditioned length cue: every reading
        # must agree on a primary-stressed vowel immediately before one final
        # obstruent. No spelling guesses, cross-word inference or audio values.
        endings = {(len(p) - 2, p[-2], p[-1]) for p in variants if len(p) >= 2}
        if len(endings) == 1 and all(len(p) >= 2 for p in variants):
            position, vowel, coda = next(iter(endings))
            if vowel.endswith("1") and vowel[:-1] in VOWELS and coda in voiceless_codas | voiced_codas:
                shorter = coda in voiceless_codas
                quality, final = _symbol(vowel), _symbol(coda)
                direction, voicing = ("shorter", "voiceless") if shorter else ("longer", "voiced")
                add("vowel_length", "before_voiceless" if shorter else "before_voiced", index, index + 1,
                    f"/{quality} + {final}/", f"[{quality}{final}]",
                    f"The vowel /{quality}/ is usually relatively {direction} before word-final {voicing} /{final}/ "
                    f"than the same vowel before its {'voiced' if shorter else 'voiceless'} counterpart.",
                    ["Compare the same vowel under similar stress, speaking rate and phrase position.",
                     "The dictionary has a primary-stressed vowel directly before one word-final obstruent; complex codas are not covered by this rule.",
                     "This is a relative GA length pattern, not a different vowel quality or a measured duration.",
                     "A phonologically voiced final consonant may be partly devoiced; the spelling alone is not the rule."],
                    f"vowel-before-{voicing}-v3", phone=position)
        if key in contractions or key in casual:
            add("reduced_form", "contraction" if key in contractions else "casual", index, index + 1,
                contractions.get(key, casual.get(key, "")), " / ".join(token.ipa),
                "The text already supplies this reduced spelling; this is not an audio observation.",
                ["Use the stated grammatical meaning, not a quoted word or name.",
                 "The dictionary readings remain alternatives; the source audio has not been checked."], "written-reduction-v2")
        if key in h_words and previous_joined and any(p[0] == "HH" for p in variants):
            add("elision", "h_drop", index, index + 1, "/h/", "∅",
                "An unstressed pronoun or auxiliary may lose its initial /h/ inside a phrase.",
                ["This is a pronoun or auxiliary, not a quoted word, lexical name or emphasized form.",
                 "It is unstressed and not at a spoken phrase boundary.", optional], "weak-h-v2")

        for position in range(1, len(phones) - 1):
            if (phones[position] in {"T", "D"} and phones[position - 1].endswith("1")
                    and phones[position - 1][:-1] in VOWELS and phones[position + 1].endswith("0")
                    and phones[position + 1][:-1] in VOWELS):
                left, right = _symbol(phones[position - 1]), _symbol(phones[position + 1])
                add("flap", "tap", index, index + 1, f"/{left}{_symbol(phones[position])}{right}/", f"[{left}ɾ{right}]",
                    "An internal /t/ or /d/ may become an alveolar tap in this American English environment.",
                    ["The preceding vowel has primary lexical stress and the following vowel is unstressed in the dictionary.",
                     "The speaker uses a style that permits tapping; careful emphasis may preserve the stop."],
                    f"flap-v2-p{position}", phone=position, alternative=f"{index}:t-before-n" if key in syllabic_words and phones[position:] == ["T", "AH0", "N"] else f"{index}:phone:{position}")

        if key in syllabic_words and all(p[-2:] == ["AH0", syllabic_words[key]] for p in variants):
            consonant = _symbol(syllabic_words[key])
            add("syllabic", "n" if syllabic_words[key] == "N" else "l", index, index + 1,
                f"/ə{consonant}/", f"[{consonant}̩]", "The final consonant may form the weak syllable without a separate schwa.",
                ["The final syllable is weak and the speaker uses this optional GA form.", optional], "syllabic-reviewed-v2")
            if syllabic_words[key] == "N" and all(p[-3:] == ["T", "AH0", "N"] for p in variants):
                for subtype, after in (("replacement", "[ʔn̩]"), ("reinforcement", "[ʔtⁿn̩]")):
                    add("glottal", subtype, index, index + 1, "/tən/", after,
                        "A glottal closure may replace /t/." if subtype == "replacement" else
                        "A glottal closure may reinforce a retained /t/ with nasal release.",
                        ["This reviewed GA environment has /t/ before a weak syllable ending in /n/.",
                         "These are alternative realizations, not simultaneous observations.", optional],
                        f"glottal-{subtype}-v2", alternative=f"{index}:t-before-n")

        # Internal stop clusters need one complete reading and no forced grapheme mapping.
        for position in range(len(phones) - 1):
            if phones[position] in stops and phones[position + 1] in stops:
                add("unreleased", "stop_cluster", index, index + 1,
                    f"/{_symbol(phones[position])}{_symbol(phones[position + 1])}/", f"[{_symbol(phones[position])}̚]",
                    "Overlapping stop closures may make the first release inaudible; the consonant is not deleted.",
                    [optional], f"unreleased-internal-v2-p{position}", phone=position)

        if not joined or following.token.status == "unknown":
            continue
        last, first = edge(token, -1), edge(following.token, 0)
        if last is not None and first is not None:
            if last in CONSONANTS and first.rstrip("012") in VOWELS:
                add("linking", "cv", index, index + 2, f"/{_symbol(last)} + {_symbol(first)}/",
                    f"[{_symbol(last)}‿{_symbol(first)}]", "The final consonant may connect directly to the following vowel sound.",
                    [phrase], "link-cv-v2", boundary=True)
            elif last == first and last in CONSONANTS:
                add("linking", "same_consonant", index, index + 2, f"/{_symbol(last)} + {_symbol(first)}/",
                    f"[{_symbol(last)}ː]", "The matching consonants may share a sustained articulation across the boundary.",
                    [phrase, "Duration varies; do not force a fixed doubling."], "link-same-v2", boundary=True)
            elif last.rstrip("012") in {"IY", "EY", "AY", "OY", "UW", "OW", "AW"} and first.rstrip("012") in VOWELS:
                glide = "j" if last.rstrip("012") in {"IY", "EY", "AY", "OY"} else "w"
                add("linking", "glide", index, index + 2, f"/{_symbol(last)} + {_symbol(first)}/",
                    f"[{_symbol(last)}{glide}{_symbol(first)}]", f"A light [{glide}]-like transition may connect these vowels.",
                    [phrase, "This is a possible transition, not an extra stressed consonant or a required insertion."],
                    "link-glide-v2", boundary=True)
            if last in {"T", "D", "S", "Z"} and first == "Y" and following.token.text.casefold() in {"you", "your"}:
                after = {"T": "tʃ", "D": "dʒ", "S": "ʃ", "Z": "ʒ"}[last]
                add("coalescence", "yod", index, index + 2, f"/{_symbol(last)} + j/", f"[{after}]",
                    "The boundary consonant and the initial /j/ of the pronoun may coalesce.",
                    ["The pronoun is unstressed and immediately follows in the same spoken phrase.", optional],
                    "coalescence-pronoun-v2", boundary=True, alternative=f"{index}:final")
            if last == "N" and first in {"P", "B", "M", "K", "G"}:
                after = "m" if first in {"P", "B", "M"} else "ŋ"
                add("assimilation", "place", index, index + 2, f"/n + {_symbol(first)}/", f"[{after} + {_symbol(first)}]",
                    "The nasal may take the place of articulation of the following consonant.",
                    [phrase, optional], "nasal-place-v2", boundary=True)
            if last in stops and first in stops and last != first:
                add("unreleased", "stop_cluster", index, index + 2, f"/{_symbol(last)} + {_symbol(first)}/", f"[{_symbol(last)}̚]",
                    "The next stop closure may mask the first release. An inaudible burst does not mean deletion.",
                    [phrase, optional], "unreleased-boundary-v2", boundary=True, alternative=f"{index}:final")

        # Preserve every lexical variant. A listed cluster/deletion pair licenses a
        # conditional explanation, not selection of one variant as recorded speech.
        cluster = phones
        if not cluster and key in {"last", "next"}:
            full = [p for p in variants if len(p) >= 2 and p[-1] in {"T", "D"} and p[-2] in CONSONANTS]
            if len(full) == 1 and all(p == full[0] or p == full[0][:-1] for p in variants):
                cluster = full[0]
        if len(cluster) >= 2 and cluster[-1] in {"T", "D"} and cluster[-2] in CONSONANTS and first in CONSONANTS:
            add("elision", "td_drop", index, index + 2, f"/{_symbol(cluster[-2])} {_symbol(cluster[-1])} # {_symbol(first)}/",
                f"[{_symbol(cluster[-2])} {_symbol(first)}]", "The final /t/ or /d/ in this cluster may be omitted; dictionary alternatives remain possible.",
                [phrase, "Omission is optional; keeping the stop is also valid. An unreleased stop is not evidence of deletion."],
                "cluster-elision-v2", alternative=f"{index}:final")
        if key in {"have", "has"} and following.token.text.casefold() == "to" and last in {"V", "Z"}:
            add("voicing", "devoicing", index, index + 2, f"/{_symbol(last)}/", "[f]" if last == "V" else "[s]",
                "This obligation construction commonly uses a voiceless consonant before to.",
                ["Have/has to expresses obligation; the words are not quoted or separated by emphasis or a phrase boundary.",
                 "This lexical pattern does not license general devoicing of every consonant cluster."],
                "obligation-devoicing-v2", boundary=True)

    warnings = [
        "These are conditional text-rule candidates, not observations of the reference audio or the learner's pronunciation.",
        "Dictionary stress is lexical stress, not sentence emphasis. IPA shows broad segment symbols without syllabification or stress marks.",
        "Candidates are independent possibilities, not a combined required pronunciation. No accuracy percentage or score is assigned.",
    ]
    if any(word.token.status == "unknown" for word in words):
        warnings.append("Unknown words, names, numbers, uppercase acronym forms and unsupported forms have no guessed pronunciation; their phone rules are skipped.")
    if any(word.token.status == "ambiguous" for word in words):
        warnings.append("Words with multiple dictionary pronunciations are ambiguous. Rules use only shared boundary phones or explicitly listed alternatives; they never select one whole reading. Grammatical weak forms remain conditional.")
    if len(matches) > MAX_TOKENS:
        warnings.append("Only the first 300 tokens were annotated; remaining sentence tokens were skipped.")
    if len(candidates) > MAX_CANDIDATES:
        warnings.append("Only the first 80 candidates are shown; additional candidates were omitted.")
    if variants_truncated:
        warnings.append("At most four dictionary pronunciations per token are shown; additional variants were omitted and the token remains ambiguous.")
    return SentenceSound(
        content_id=content_id, sentence_id=sentence_id, sentence_text=text, lexicon_version=lexicon.version,
        tokens=[word.token for word in words], candidates=candidates[:MAX_CANDIDATES],
        coverage=SoundCoverage(known=sum(word.token.status == "known" for word in words), total=len(words)),
        warnings=warnings,
    )
