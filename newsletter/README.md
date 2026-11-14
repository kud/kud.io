# Newsletter

[kud.io/newsletter](https://kud.io/newsletter) is a bilingual (French and
British English) evening edition about what mattered that day.

Editions are written in Notion, synced into `content/newsletter/` as build
artefacts, validated, then published. This repository only renders them: the
editorial line, the source catalogue and the editor's own checks live with the
editor, not here.

[`FORMAT.md`](./FORMAT.md) is the one contract both sides share: the exact
structure of an edition in Notion, which the sync parses and the validator
enforces. If it and the validator disagree, the validator is the truth and the
document is the bug: fix both in the same change.
