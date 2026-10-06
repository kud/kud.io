---
title: "inkblot"
description: "A hand-inked page transition: a turbulence-edged circle of colour that spills from a click, in pure CSS and SVG"
---

## Features

- **Organic edge** — a circle of colour spreads from the point you click, its rim wobbled by `feTurbulence` and `feDisplacementMap`, so it reads as ink rather than a geometric wipe.
- **Pure CSS and SVG** — no canvas, no animation library, zero runtime dependencies. ESM, tiny.
- **Framework-agnostic** — one function and an empty element. It works the same in a React app, a Vite site or plain HTML.
- **Three modes** — `cover` to leave a page, `reveal` to arrive on one, `veil` to hold a quiet wash while something loads.
- **Promise-based** — `spill()` resolves when the ink has landed, so navigating is just the next line.
- **Respects reduced motion** — under `prefers-reduced-motion` it becomes a plain fade, with no spreading edge.

## Install

```sh
npm install @kud/inkblot
```

## Usage

Give the page one empty element to act as the overlay. Inkblot does the rest.

```html
<div id="overlay" aria-hidden="true"></div>
```

Cover the page from a click, then navigate under it:

```ts
import { spill } from "@kud/inkblot"

const overlay = document.querySelector<HTMLElement>("#overlay")!

document.addEventListener("click", async (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]")
  if (!link) return

  event.preventDefault()
  await spill(overlay, { mode: "cover", from: link, colour: "#2b1d14" })
  window.location.href = link.href
})
```

Arrive on the new page and lift the ink. Call this before first paint if the page should start covered:

```ts
import { clear, spill } from "@kud/inkblot"

const overlay = document.querySelector<HTMLElement>("#overlay")!

await spill(overlay, { mode: "reveal", colour: "#2b1d14" })

window.addEventListener("pageshow", (event) => {
  if (event.persisted) clear(overlay)
})
```

### API

```ts
spill(el: HTMLElement, options: SpillOptions): Promise<void>
clear(el: HTMLElement): void
```

```ts
type Mode = "cover" | "reveal" | "veil"
type Origin = { x: number; y: number } | Element

type SpillOptions = {
  mode: Mode
  from?: Origin
  colour?: string
  duration?: number
  inject?: boolean
}
```

| Option     | Description                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `mode`     | `cover`, `reveal` or `veil`, described below.                                                                                |
| `from`     | Where the ink starts: a viewport `{ x, y }` point, or an element (its centre is used). Defaults to the centre of the screen. |
| `colour`   | Any CSS colour, set as `--inkblot-colour` on the overlay.                                                                    |
| `duration` | Milliseconds. Overrides the mode's default.                                                                                  |
| `inject`   | `false` skips the injected style tag, for a strict CSP; load `@kud/inkblot/style.css` yourself. Default `true`.              |

| Mode     | Default                 | Behaviour                                                                              |
| -------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `cover`  | 500 ms                  | Spreads until the screen is covered, then stays covered, so you can navigate under it. |
| `reveal` | 600 ms                  | Plays in reverse, for arriving on a new page. Clears itself when done.                 |
| `veil`   | 500 ms, at 0.88 opacity | Washes the page and holds until you call `clear()`.                                    |

`spill()` resolves when the overlay is fully covered (`cover`), fully uncovered (`reveal`) or veiled (`veil`). Spilling again on the same element settles the first promise and takes over.

`clear(el)` resets the overlay and settles any pending promise. Use it on bfcache restores via `pageshow`, and to lift a veil.

**Reduced motion.** With `prefers-reduced-motion: reduce`, every mode becomes a plain fade: 280 ms in, 400 ms out, 280 ms for the veil. No spreading edge.

**The overlay.** It is an empty element your page provides. Inkblot fixes it to the viewport, oversized by 60 px on every side (`inset: -60px`) so the displacement never bares a screen edge, and adjusts the origin for that offset for you. Its `z-index` is overridable with `--inkblot-z`.

### Styles

No CSS framework, no dependency. Every class is namespaced `inkblot-*` and tuned through custom properties (`--inkblot-colour`, `--inkblot-duration`, `--inkblot-z`), so a Tailwind site and a plain one behave identically and neither stylesheet leaks into the other.

By default the stylesheet is injected once from JS, along with the SVG filter, on the first `spill()`. A bundler-specific stylesheet import (CSS modules, `?inline`, side-effect CSS imports) is not portable between a Next.js app and a plain Vite or no-bundler site; a `<style>` tag injected from the module works the same in both, with no config. The stylesheet is about 2 KB.

Under a strict CSP that forbids inline `<style>`, load the stylesheet yourself and skip the injection:

```ts
import "@kud/inkblot/style.css"
import { spill } from "@kud/inkblot"

await spill(overlay, { mode: "cover", inject: false })
```

The filter is still added to the page as an inline SVG element, which a `style-src` policy does not restrict.

## Environments

**Vanilla.** The two examples above are all there is.

**React.** No adapter: call it from a handler, under your router.

```tsx
const overlay = useRef<HTMLDivElement>(null)

const go = async (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault()
  await spill(overlay.current!, { mode: "cover", from: event.currentTarget })
  router.push(event.currentTarget.href)
}

return <div ref={overlay} aria-hidden />
```

**Next.js.** Use it in a client component. Importing the package on the server is safe: it touches neither `window` nor `document` at import time, and `spill()` and `clear()` do nothing outside a browser (`spill()` resolves at once).

```tsx
"use client"

import { spill } from "@kud/inkblot"
```

**CDN, no bundler.** The build is a single dependency-free ES module.

```html
<div id="overlay" aria-hidden="true"></div>
<script type="module">
  import { spill } from "https://cdn.jsdelivr.net/npm/@kud/inkblot/dist/index.js"

  document.querySelector("button").addEventListener("click", (event) => {
    spill(document.querySelector("#overlay"), {
      mode: "veil",
      from: event.currentTarget,
      colour: "#2b1d14",
    })
  })
</script>
```

### Out of scope

Colour tokens, themes, typography, routing, sounds, deciding when ink is appropriate, and framework adapters. Inkblot spills the ink; the rest is yours.

## Development

```sh
git clone https://github.com/kud/inkblot.git
cd inkblot
npm install
npm test
```

Run the demo with `npm run demo` (or `npx vite`). It opens `/demo/`.
