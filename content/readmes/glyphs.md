---
title: "glyphs"
description: "Multi-language source of truth for terminal glyphs — Nerd Font codepoints and unicode fallbacks, typed and escape-safe"
---

## Features

- **One source, many outputs** — a single `glyphs.json` (`name → codepoint`) generates every language binding, so no project hand-maps codepoints again.
- **Escapes by construction** — codepoints are always emitted as normalised escapes (`\u{XXXX}` in TypeScript, `$'\U0000XXXX'` in zsh), never as raw Private-Use-Area bytes that are invisible in editors and mangle in diffs.
- **Typed TypeScript** — named consts, a `glyph(name)` lookup, and a `GlyphName` union that rejects typos at compile time.
- **zsh plugin** — `GLYPH_*` variables (plus `SHUI_ICON_*` aliases), loadable by any plugin manager.

## Usage

### TypeScript

```sh
npm install @kud/glyphs
```

```ts
import { glyphs, glyph } from "@kud/glyphs"

glyphs.check // "" — named const, autocompletes
glyphs.arrowRight // ""
glyph("cross") // "" — typed lookup; unknown names are a compile error
```

### zsh

Load the repo as a plugin — no npm involved. It auto-loads via `glyphs.plugin.zsh`:

```zsh
# antidote — add to ~/.zsh_plugins.txt
kud/glyphs

# zinit
zinit light kud/glyphs

# oh-my-zsh — clone into $ZSH_CUSTOM/plugins/glyphs, then add `glyphs` to plugins=()
```

```zsh
print -P "$GLYPH_CHECK done"      #
echo "$GLYPH_ARROW_RIGHT next"    #
```

Every glyph is also exposed as `$SHUI_ICON_*` for drop-in shui compatibility.

> Nerd Font glyphs need a [Nerd Font](https://www.nerdfonts.com/) installed in
> your terminal; without one they render as a `□` box.

## Adding a glyph

Edit `glyphs.json`, then regenerate:

```sh
npm run generate   # glyphs.json -> src/generated.ts + glyphs.plugin.zsh
```

## Development

```sh
npm install
npm run generate
npm run build      # tsup -> dist
npm run typecheck
npm test
```

## Licence

MIT
