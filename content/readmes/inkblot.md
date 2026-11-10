---
title: "inkblot"
description: "A hand-inked page transition: a turbulence-edged circle of colour that spills from a click, in pure CSS and SVG"
hasDocs: true
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
