---
title: "ink-markdown"
description: "A high-performance Markdown / code / diff rendering engine for Ink 7."
---

> **Early development.** `ink-markdown` is scaffolded and its performance thesis is validated by a benchmark spike, but the core engine (PRD Milestone 1 — the renderer-independent document model) is not yet implemented. Nothing below is installable as a working renderer today. The API shown in Usage is the intended, designed shape from the PRD/plan, not a shipped surface — treat it as a preview, not documentation of current behaviour.

## Features

Ink apps that display large, code-heavy, streaming documents (AI responses, code review, diffs, source files) hit a wall with naïve Markdown renderers: parse the whole document into a React tree, run Yoga layout over all of it, re-diff the entire output every frame. `ink-markdown` is designed to keep that cost bounded to the viewport instead:

- **Viewport virtualisation** — only the lines actually visible (plus configurable overscan) are ever mounted as Ink elements, so React node count scales with viewport size, not document size.
- **Block-based incremental parsing** — Markdown is segmented into top-level blocks with stable IDs and source hashes; unrelated edits elsewhere in the document don't invalidate untouched blocks.
- **Cached, width-aware layout** — line wrapping, Unicode width, and ANSI styling are computed once per `(block, width, theme)` and reused until one of those actually changes, so terminal resizes don't force a full relayout.
- **Streaming with a mutable tail** — completed blocks are treated as immutable; only the open, still-arriving block is reparsed on each append, so streaming AI output doesn't reparse or relayout the whole document.
- **First-class code and unified-diff rendering** — fenced code blocks get lazy, cached syntax highlighting, and Git diffs are parsed into a structured model (additions, deletions, hunks, file headers) rather than treated as coloured text.

★ **Validated by spike, not yet shipped** — a throwaway benchmark spike (`spike/step1-bench/`) proved the underlying bet before any of this was built as a real package: parsing a 10,000-line document took ~6.9ms (well under the 100ms target), the pre-composed-string render path stayed at a constant ~1.6µs per frame regardless of document size, virtualisation mounted 1 Ink node against 9,167 for a naïve full-tree baseline, and CPU per scroll frame measured ~7.7ms — comfortably under Ink's ~26ms repaint throttle, meaning scroll latency is throttle-bound rather than compute-bound. Streaming reparsed roughly 1.65 blocks per append versus 219 for a full reparse. These numbers say the architecture works; they don't mean the architecture is built yet.

## Install

Not yet published to npm — the package is still pre-Milestone-1. Once published:

```sh
npm install @kud/ink-markdown
```

`ink-markdown` targets **Ink 7.x** and **React 19.x** as peer dependencies, and requires **Node.js 20+**.

## Usage

The snippet below is the intended, designed API from the project's PRD and plan — it is not yet functional. It's included so consumers can see the shape the engine is heading towards.

```tsx
import { MarkdownViewport } from "@kud/ink-markdown"

const App = () => (
  <MarkdownViewport
    source={content}
    width={width}
    height={height}
    scrollOffset={scrollOffset}
  />
)
```

For streaming content, such as an AI response arriving in fragments:

```tsx
import { useMarkdownStream } from "@kud/ink-markdown"

const App = () => {
  const stream = useMarkdownStream()

  useEffect(() => {
    stream.append(chunk)
  }, [chunk])

  return (
    <MarkdownViewport
      document={stream.document}
      width={width}
      height={height}
    />
  )
}
```

Applications will be able to override individual block renderers (headings, code, diffs, tables, links) without losing virtualisation, and read out performance instrumentation (parse/layout durations, cache-hit ratios, mounted-line counts) for development tooling. See [`prd.md`](https://github.com/kud/ink-markdown/blob/HEAD/prd.md) for the full functional specification and [`plan.md`](https://github.com/kud/ink-markdown/blob/HEAD/plan.md) for the decisions and spike results behind it.

## Development

```sh
git clone https://github.com/kud/ink-markdown.git
cd ink-markdown
npm install
npm run build
npm test
```

Other scripts: `npm run build:watch` (rebuild on change), `npm run typecheck`, `npm run test:watch`.
