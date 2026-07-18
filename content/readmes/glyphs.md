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

### zsh — via `renderZsh()` for a custom prefix

A consumer that wants its own variable namespace — rather than the default
`ICON_*` — calls `renderZsh()` from the npm package and evaluates the result:

```ts
import { renderZsh } from "@kud/glyphs"

renderZsh({ prefix: "SHUI_ICON", variant: "nerd" })
// SHUI_ICON_CHECK=$'\U0000F00C'
// SHUI_ICON_CROSS=$'\U0000F00D'
// ...
```

```zsh
eval "$(node -e 'import("@kud/glyphs").then(({renderZsh}) => console.log(renderZsh({ prefix: "SHUI_ICON" })))')"
```

`renderZsh({ prefix?, variant?, names? })` is the key primitive: `prefix`
defaults to `ICON`, `variant` defaults to `nerd`, and `names` restricts and
orders the output to a subset of glyphs. A glyph lacking the requested variant
still emits its variable, empty (`NAME=''`), so cross-set parity holds.
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
