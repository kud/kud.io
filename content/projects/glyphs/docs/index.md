---
title: "glyphs"
description: "Multi-language source of truth for terminal glyphs — Nerd Font codepoints and unicode fallbacks, typed and escape-safe"
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

### TypeScript

```ts
import { glyphs, glyph, renderZsh } from "@kud/glyphs"

glyphs.check.nerd // ""
glyph("check") // "" — defaults to the nerd variant
glyph("check", "emoji") // "✅"
glyph("plArrowRight", "unicode") // "" — absent variants resolve to ""
```

### zsh — via the published plugin

Load the repo as a plugin — no npm involved. `glyphs.plugin.zsh` sources
`ICON_*` variables (nerd variant) directly:

```zsh
# antidote — add to ~/.zsh_plugins.txt
kud/glyphs

# zinit
zinit light kud/glyphs

# oh-my-zsh — clone into $ZSH_CUSTOM/plugins/glyphs, then add `glyphs` to plugins=()
```

```zsh
print -P "$ICON_CHECK done"
echo "$ICON_ARROW_RIGHT next"
```

### zsh — custom prefix (no node)

Want your own namespace instead of `ICON_*`? Each variant is published as a
plain, escape-safe zsh file under `zsh/`. Substitute the prefix with `sed` — no
node, no runtime dependency, values untouched (the swap is anchored to the
variable name, never the `$'\U…'` payload):

```zsh
# nerd glyphs under a SHUI_ICON_ prefix
curl -fsSL https://raw.githubusercontent.com/kud/glyphs/v0.3.0/zsh/nerd.zsh \
  | sed 's/^ICON_/SHUI_ICON_/' > icons.zsh

source icons.zsh
# icons.zsh contains:
#   SHUI_ICON_CHECK=$'\U0000F00C'
#   SHUI_ICON_CROSS=$'\U0000F00D'
```

Variants live at `zsh/{nerd,emoji,unicode}.zsh`. This is exactly how
[shui](https://github.com/kud/shui) builds its icon sets — a `sed` re-prefix run
only when it bumps this package, sourcing plain literal files at runtime.

For JavaScript/TypeScript consumers, `renderZsh({ prefix?, variant?, names? })`
does the same in code: `prefix` defaults to `ICON`, `variant` to `nerd`, and
`names` restricts and orders the output. A glyph lacking the requested variant
emits an empty value (`NAME=''`), so cross-set parity holds.
Escapes are produced by construction — never raw PUA bytes.

> Nerd Font glyphs need a [Nerd Font](https://www.nerdfonts.com/) installed in
> your terminal; without one they render as a `□` box.

## Adding a glyph

Edit `glyphs.json`, then regenerate:

```sh
npm run generate   # glyphs.json -> src/generated.ts + glyphs.plugin.zsh
```

## Development

```sh
git clone https://github.com/kud/glyphs.git
cd glyphs
npm install
npm run generate
npm run build      # tsup -> dist
npm run typecheck
npm test
```
