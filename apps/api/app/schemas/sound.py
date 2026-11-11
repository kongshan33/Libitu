from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


SoundKind = Literal["linking", "coalescence", "assimilation", "weak_form", "reduced_form",
                    "elision", "flap", "glottal", "unreleased", "syllabic", "voicing", "vowel_length"]
SoundSubtype = Literal["cv", "glide", "same_consonant", "yod", "place", "manner", "function_word",
                       "vowel_reduction", "contraction", "casual", "td_drop", "h_drop", "other", "tap",
                       "replacement", "reinforcement", "stop_cluster", "n", "l", "m", "voicing", "devoicing",
                       "before_voiceless", "before_voiced"]
SUBTYPES = {
    "linking": {"cv", "glide", "same_consonant"}, "coalescence": {"yod"},
    "assimilation": {"place", "manner"}, "weak_form": {"function_word", "vowel_reduction"},
    "reduced_form": {"contraction", "casual"}, "elision": {"td_drop", "h_drop", "other"},
    "flap": {"tap"}, "glottal": {"replacement", "reinforcement"}, "unreleased": {"stop_cluster"},
    "syllabic": {"n", "l", "m"}, "voicing": {"voicing", "devoicing"},
    "vowel_length": {"before_voiceless", "before_voiced"},
}


class SoundAnchor(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["word", "boundary", "phone"]
    token_index: int = Field(ge=0, lt=300)
    phone_index: int | None = Field(default=None, ge=0, lt=100)

    @model_validator(mode="after")
    def check_phone(self):
        if (self.type == "phone") != (self.phone_index is not None):
            raise ValueError("Only a phone anchor has a phone index")
        return self


class SoundToken(BaseModel):
    model_config = ConfigDict(extra="forbid")

    index: int = Field(ge=0, lt=300)
    text: str = Field(min_length=1, max_length=6000)
    # UTF-16 code units, matching JavaScript String.slice, with an exclusive end.
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    pronunciations: list[list[str]] = Field(max_length=4)
    ipa: list[str] = Field(max_length=4)
    status: Literal["known", "unknown", "ambiguous"]


class SoundCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=250)
    kind: SoundKind
    subtype: SoundSubtype
    anchor: SoundAnchor
    alternative_group: str | None = Field(default=None, min_length=1, max_length=250)
    token_start: int = Field(ge=0, lt=300)
    token_end: int = Field(gt=0, le=300)
    source_text: str = Field(min_length=1, max_length=6000)
    phonemes_before: str
    phonemes_after: str
    explanation: str
    conditions: list[str] = Field(min_length=1, max_length=12)
    rule_id: str
    status: Literal["candidate"] = "candidate"

    @model_validator(mode="after")
    def check_location(self):
        if self.subtype not in SUBTYPES[self.kind]:
            raise ValueError("Subtype does not belong to this phenomenon")
        if not self.token_start <= self.anchor.token_index < self.token_end:
            raise ValueError("Anchor is outside the candidate")
        if self.anchor.type == "boundary" and self.anchor.token_index + 1 >= self.token_end:
            raise ValueError("Boundary needs both words")
        return self


class SoundCoverage(BaseModel):
    known: int = Field(ge=0, le=300)
    total: int = Field(ge=0, le=300)


class SentenceSound(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal["sound-rules-v3"] = "sound-rules-v3"
    target_accent: Literal["GA"] = "GA"
    content_id: str
    sentence_id: str
    sentence_text: str = Field(max_length=6000)
    dialect: Literal["en-US"] = "en-US"
    provider: Literal["cmudict-rules"] = "cmudict-rules"
    lexicon_version: str
    tokens: list[SoundToken] = Field(max_length=300)
    candidates: list[SoundCandidate] = Field(max_length=80)
    coverage: SoundCoverage
    warnings: list[str] = Field(max_length=20)

    @model_validator(mode="after")
    def check_candidates(self):
        ids: set[str] = set()
        source = self.sentence_text.encode("utf-16-le")
        for candidate in self.candidates:
            if candidate.id in ids or candidate.token_end > len(self.tokens):
                raise ValueError("Duplicate candidate or invalid token span")
            ids.add(candidate.id)
            first, last = self.tokens[candidate.token_start], self.tokens[candidate.token_end - 1]
            if source[first.start * 2:last.end * 2].decode("utf-16-le") != candidate.source_text:
                raise ValueError("Candidate does not match source")
            if candidate.anchor.type == "phone":
                variants = self.tokens[candidate.anchor.token_index].pronunciations
                if not variants or any(candidate.anchor.phone_index >= len(p) for p in variants):
                    raise ValueError("Invalid dictionary phone anchor")
        return self
