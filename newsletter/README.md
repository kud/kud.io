# Newsletter rules

The rules behind [kud.io/newsletter](https://kud.io/newsletter), a bilingual
(French and British English) evening edition about what genuinely mattered
that day.

Editions are written in Notion, synced into `content/newsletter/` as build
artefacts, validated, then published. These files are the editor's standing
instructions, versioned here so they can be read, argued with and changed in
one place rather than living inside a scheduler prompt.

Read them in this order:

1. [`EDITORIAL.md`](./EDITORIAL.md): what an edition is for, its shape and how
   to write an item.
2. [`FORMAT.md`](./FORMAT.md): the exact structure of an edition in Notion,
   which the sync parses and the validator enforces.
3. [`SOURCES.md`](./SOURCES.md): the public discovery catalogue.
4. [`SAFETY.md`](./SAFETY.md): what can never be published, and the URL rules
   the validator checks.

`FORMAT.md` and `SAFETY.md` describe deterministic checks. If one of them and
the validator disagree, the validator is the truth and the document is the
bug: fix both in the same change.
