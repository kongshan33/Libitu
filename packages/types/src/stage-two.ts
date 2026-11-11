import type { CaptionTimingSource, CaptionWordTiming, SentenceBoundaryConfidence, SentenceBoundarySource } from "./stage-one";

/** Shared server sentences, with legacy caption segmentation as a compatibility path. */
export type SentenceUnit = {
  id: string;
  segmentId: string;
  text: string;
  /** Normalized source whitespace-token range; displayed tokens for legacy captions. */
  sourceTokenStart: number;
  sourceTokenEnd: number;
  transcriptStartIndex: number;
  transcriptEndIndex: number;
  startMs: number;
  endMs: number;
  timingSource: CaptionTimingSource;
  wordTimings?: CaptionWordTiming[];
  timingConfidence: "approximate";
  segmentationVersion?: string;
  boundarySource?: SentenceBoundarySource;
  boundaryConfidence?: SentenceBoundaryConfidence;
};

export type SoundKind = "linking" | "coalescence" | "assimilation" | "weak_form" | "reduced_form"
  | "elision" | "flap" | "glottal" | "unreleased" | "syllabic" | "voicing" | "vowel_length";
export type SoundPhenomenon = SoundKind;
export type SoundSubtype = "cv" | "glide" | "same_consonant" | "yod" | "place" | "manner"
  | "function_word" | "vowel_reduction" | "contraction" | "casual" | "td_drop" | "h_drop" | "other"
  | "tap" | "replacement" | "reinforcement" | "stop_cluster" | "n" | "l" | "m" | "voicing" | "devoicing"
  | "before_voiceless" | "before_voiced";
/** A dictionary location, never an audio timestamp or a letter-to-phone alignment. */
export type SoundAnchor = { type: "word" | "boundary" | "phone"; token_index: number; phone_index?: number | null };

/** Lexical pronunciations and conditional rules; never evidence of recorded speech. */
export type SoundAnnotation = {
  version: "sound-rules-v1" | "sound-rules-v2" | "sound-rules-v3";
  target_accent?: "GA";
  content_id: string;
  sentence_id: string;
  sentence_text: string;
  dialect: "en-US";
  provider: "cmudict-rules";
  lexicon_version: string;
  tokens: SoundToken[];
  candidates: SoundCandidate[];
  coverage: { known: number; total: number };
  warnings: string[];
};

export type SoundToken = {
  index: number;
  text: string;
  /** UTF-16 offsets in sentence_text, with an exclusive end. Not audio times. */
  start: number;
  end: number;
  pronunciations: string[][];
  ipa: string[];
  status: "known" | "unknown" | "ambiguous";
};

export type SoundCandidate = {
  id: string;
  kind: SoundKind;
  /** Optional only for legacy v1 callers; the v2/v3 decoder validates these fields. */
  subtype?: SoundSubtype;
  anchor?: SoundAnchor;
  alternative_group?: string | null;
  /** Indices into tokens, with an exclusive end. */
  token_start: number;
  token_end: number;
  source_text: string;
  phonemes_before: string;
  phonemes_after: string;
  explanation: string;
  conditions: string[];
  rule_id: string;
  status: "candidate";
};
