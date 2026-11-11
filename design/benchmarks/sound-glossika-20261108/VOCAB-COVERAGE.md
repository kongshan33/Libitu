# Glossika literal vocabulary coverage audit

Date: 2026-11-09. Scope: whether the current IPA encoders can express source notation, not whether models can recognize it acoustically. No vocabulary, label, checkpoint, or training configuration was changed.

## Result

The current vocabularies do not cover the full book. Both exactly encode and round-trip all 549 current training labels. That only establishes coverage of this short-sentence training alphabet.

| Source inventory / construction | Custom 62-token head | Adapted 416-token head |
| --- | --- | --- |
| 12 base vowels: a ɑ æ e ɛ ə i ɪ o u ʌ ʊ | All supported | All supported |
| Consonants from the main/detail tables, including dialect WH | Missing c ɟ ɡ θ ð ʒ ʝ ɱ ʎ ʍ | Missing ɱ ʍ |
| Linguolabial t̼; voicing s̬; syllabic above ŋ̍; raised ɪ̝ | All four constructions fail | All four constructions fail |
| Source syllabic-m spelling ṃ | Fails | Fails |
| Nasal vowels under actual NFC encoder | ã ĩ ũ ẽ fail; õ works | ã ĩ ẽ fail; ũ õ work |
| Existing examples eːʲ, oːʷ, əːʴ, ɪ̃, ṇ, m̩ | Supported | Supported |

The 62 entries include blank and unknown, leaving 60 literal characters. The 416 vocabulary retains pretrained tokens and adds training-source characters; a multi-character token containing a mark does not make that mark available in every other construction.

## Source evidence and interpretation

Page references are 1-based PDF pages, not printed page numbers.

- PDF 5 and 9–14: main consonant chart and detailed table. The audit catalog has 38 consonant characters including dialect ʍ, or 37 without it. Exact literal coverage is 28/38 for custom62 and 36/38 for adapted416. These counts concern source spellings, not distinct phoneme classes.
- PDF 6–8: 12 main vowel letters plus combinations. Length ː, offglides ʲ/ʷ, rhotic modifier ʴ and nasalization ̃ are already available. A whole combination does not need a dedicated token if its components can be encoded.
- PDF 5, 10–14: missing combining marks U+033C (̼), U+032C (̬), U+030D (̍). PDF 26 visibly gives raised ɪ̝ in examples, requiring U+031D (̝).
- PDF 92: source uses ṃ in the Can explanation and m̩ in adjacent examples. Preserve the source spelling; do not silently replace it with m̩. The previously user-confirmed ṇ is already supported.
- Existing g versus source ɡ is a spelling/Unicode difference rather than a new sound. The current literal encoder nevertheless cannot encode ɡ with custom62.
- The book labels ʍ as an older/dialect WH pronunciation. It belongs in source-coverage accounting but is not automatically a required GA training target.
- PDF 6 discusses ɔ, ɚ and ɝ as comparison/replaced notations. These should not be misreported as missing members of the book's 12-vowel main system. Other accent comparisons, such as Australian ʉ, likewise need separate target policy.

## Normalization gap

The production training encoder applies NFC before longest-token matching. Although a + combining tilde could be assembled from existing tokens, NFC produces ã, which is absent. The same mechanism explains the nasal-vowel failures in the table. This is a label-encoding defect, not absence of the nasalization concept from the vocabulary.

Any fix should version the tokenizer and label contract together, preserve raw source text, and test normalization plus exact round trips. Do not change frozen experiment labels or checkpoints in place.

## Verification and limitations

- Actual `scripts.sound_pilot.ipa_adapt.encode` used for both vocabularies.
- All 549 accepted training labels round-trip exactly for both vocabularies: zero failures.
- All variants of all 588 indexed short sentences checked against custom62. Only editorial parentheses in held rows are outside its character alphabet; those are not missing speech sounds.
- All 100 PDF pages extracted with the previously audited font-CMap repairs; no remaining replacement characters. Relevant charts and representative unusual glyphs visually checked. This is not a claim that every phonetic example on all pages has been manually transcribed or acoustically verified.
- The curated main inventory and listed constructions establish that coverage is incomplete. They are not an exhaustive GA acoustic annotation taxonomy.

Reproduce from repository root:

```sh
PYTHONPATH=apps/api apps/api/.venv/bin/python .cache/sound-pilot/glossika-vocab-audit-20261109/check_coverage.py
```

Machine-readable evidence: `.cache/sound-pilot/glossika-vocab-audit-20261109/COVERAGE.json`. Repaired extraction and page renders are in the same directory. Source PDF SHA-256: `d15e475279d349eef6852a83f5eef6e95089487f1a8ad3c6dfe67d7a31e2bd09`.

Before another training run, establish a versioned full-source symbol inventory, decide source aliases explicitly, fix normalization/encoding gaps, and validate every label. Adding output symbols enables representation; it does not supply the recordings and examples needed to learn them.
