# Glossika literal vocabulary v4

Source inventory and output vocabularies prepared on 2026-11-09; no training performed. See `CONTRACT.json` for source page provenance, classifications and validation results.

- `custom.vocab.json`: 117 entries, preserving all 62 old IDs.
- `adapted.vocab.json`: 481 entries, preserving all 416 old IDs.
- Full-source chart inventory includes main vowels/consonants, missing marks, source syllabic spellings, and separately classified comparison/dialect symbols. This is symbol coverage, not a claim of full-book manual transcription or acoustic truth.
- Canonical closure includes decomposed components and recomposed Unicode characters. NFC stays the literal contract; raw source text is unchanged. No semantic mappings such as ṇ → n̩ or ṃ → m̩ are applied.
- Additional closure characters are encoding support, not necessarily source-attested sounds or available training examples. Comparison/dialect entries are not automatically GA targets.
- All 549 current training labels and 92 inventory/construction cases round-trip through the actual existing encoder, under original, NFC and NFD inputs, for both vocabularies.

Reproduce from repository root:

```sh
PYTHONPATH=apps/api apps/api/.venv/bin/python -m scripts.sound_pilot.glossika_vocab_v4
```

The encoding repair resides in the new vocabulary construction. Historical encoders, datasets, heads and results remain frozen. A future training run must explicitly load the new vocabulary, create or migrate the output head to its new dimension, and save this contract with the checkpoint. Merely changing an old checkpoint's vocabulary file is invalid. There is no automatic production-model switch.
