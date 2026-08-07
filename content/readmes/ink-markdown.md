---
title: "ink-markdown"
description: "A high-performance Markdown / code / diff rendering engine for Ink 7."
---

> **Alpha.** The rendering path works today: parse a document, lay it out for a width, and scroll a virtualised viewport over it. `MarkdownViewport`, `useMarkdownScroll` and the whole `core` surface are real and covered by tests. Still ahead: syntax highlighting for fenced code (M4), the `useMarkdownStream` hook, overridable per-block renderers, and performance instrumentation — each is called out where it appears below. The API may still move before 1.0.

## Features

Ink apps that display large, code-heavy, streaming documents (AI responses, code review, diffs, source files) hit a wall with naïve Markdown renderers: parse the whole document into a React tree, run Yoga layout over all of it, re-diff the entire output every frame. `ink-markdown` is designed to keep that cost bounded to the viewport instead:

- **Viewport virtualisation** ✅ — only the visible slice is ever composed, so React/Yoga work scales with viewport size, not document size. `MarkdownViewport` mounts exactly one `<Text>` whatever the document length.
- **Block-based incremental parsing** ✅ — Markdown is segmented into top-level blocks with stable IDs and source hashes, so an edit in one block leaves the others untouched (`updateMarkdownDocument`).
- **Cached, width-aware layout** ✅ — wrapping, Unicode width and styling are computed once per `(block, width, theme)` and reused until one of those changes, so a terminal resize doesn't force a full relayout.
- **Unified-diff rendering** ✅ — hunk headers, additions and deletions are styled from the theme rather than treated as flat text.
- **Syntax highlighting for fenced code** ⏳ — planned for M4; code blocks currently render unhighlighted, clipped rather than wrapped.
- **Streaming with a mutable tail** ⏳ — the immutable-completed-blocks design is in place, but the `useMarkdownStream` hook that drives it is not written yet.
- **Overridable block renderers and perf instrumentation** ⏳ — designed in [`prd.md`](https://github.com/kud/ink-markdown/blob/HEAD/prd.md), not yet built.

★ **Where the performance claims come from** — a benchmark spike proved the bet before the package was built: parsing a 10,000-line document took ~6.9ms (against a 100ms target), the pre-composed-string render path stayed at a constant ~1.6µs per frame regardless of document size, virtualisation mounted 1 Ink node against 9,167 for a naïve full-tree baseline, and CPU per scroll frame measured ~7.7ms — under Ink's ~26ms repaint throttle, so scroll latency is throttle-bound rather than compute-bound. The shipped engine implements that architecture; the numbers above are the spike's, not a benchmark of the current code.

## Install

```sh
npm install @kud/ink-markdown
```

`ink-markdown` targets **Ink 7.x** and **React 19.x** as peer dependencies, and requires **Node.js 20+**.

## Usage

`height` is a prop, not something the component measures for itself — the caller owns the viewport, so there is no measurement round-trip to get wrong.

```tsx
import {
  createMarkdownDocument,
  createMarkdownLayout,
  MarkdownViewport,
  useMarkdownScroll,
} from "@kud/ink-markdown"

const Reader = ({ source, width, height }) => {
  const [offset, setOffset] = useState(0)

  // Laying out once and passing `layout` skips the parse on every scroll frame.
  const layout = useMemo(
    () =>
      createMarkdownLayout(createMarkdownDocument(source), source, { width }),
    [source, width],
  )

  useMarkdownScroll({
    totalLines: layout.totalLines,
    height,
    offset,
    onChange: setOffset,
  })

  return (
    <MarkdownViewport
      layout={layout}
      width={width}
      height={height}
      scrollOffset={offset}
    />
  )
}
```

Pass `source` instead of `layout` and the viewport parses and lays out for you — fine for short, static documents, and one prop less to thread.

`useMarkdownScroll` is optional — it binds `j`/`k`, arrows, space, `b`, `g` and `G`. The core owns scrolling _primitives_ (an offset in, lines out), not keybindings, so an app with its own bindings drives `scrollOffset` directly and ignores the hook.

`createMarkdownLayout` also takes a `theme` and a `cache` — a `Map` you own and reuse across renders, so a resize re-lays out only the blocks whose width actually changed. `layout.reused` and `layout.computed` report how that went.

Streaming (`useMarkdownStream`), overridable per-block renderers and performance instrumentation are designed but not yet built — see [`prd.md`](https://github.com/kud/ink-markdown/blob/HEAD/prd.md) for the full specification and [`plan.md`](https://github.com/kud/ink-markdown/blob/HEAD/plan.md) for the decisions and spike results behind it.

## Development

```sh
git clone https://github.com/kud/ink-markdown.git
cd ink-markdown
npm install
npm run build
npm test
```

Other scripts: `npm run build:watch` (rebuild on change), `npm run typecheck`, `npm run test:watch`.
