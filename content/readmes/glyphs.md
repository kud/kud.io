---
title: "glyphs"
description: "Multi-language source of truth for terminal glyphs — Nerd Font codepoints and unicode fallbacks, typed and escape-safe"
hasDocs: true
---

## Features

- **One source, many outputs** — a single `glyphs.json` (`name → { nerd, unicode?, emoji? }`) generates every language binding, so no project hand-maps codepoints again.
- **Escapes by construction** — codepoints are always emitted as normalised escapes (`\u{XXXX}` in TypeScript, `$'\U0000XXXX'` in zsh), never as raw Private-Use-Area bytes that are invisible in editors and mangle in diffs.
- **Typed TypeScript API** — a `glyphs` record, a `glyph(name, variant?)` lookup with a `GlyphName` union that rejects typos at compile time, and a `Variant` type (`"nerd" | "unicode" | "emoji"`).
- **Consumer-agnostic zsh rendering** — `renderZsh({ prefix, variant, names })` emits `$prefix_NAME=...` assignments under whatever namespace the caller wants. The library names no specific consumer.
- **Multi-scalar emoji handled correctly** — emoji values are literal strings that may be grapheme clusters (`⚠️` = U+26A0 U+FE0F), stored and escaped as a sequence rather than a single codepoint.

## Install

```sh
npm install @kud/glyphs
```

## Usage
