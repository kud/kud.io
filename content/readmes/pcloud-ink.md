---
title: "pcloud-ink"
description: "☁️ Ink components for rendering pCloud domain objects — file lists, change history, account panels"
hasDocs: true
---

☁️ Ink components for rendering pCloud domain objects — file listings, change
history, shares, sync health, and the assembled browser.

The presentation layer of the pCloud toolchain:
[`@kud/pcloud`](https://github.com/kud/pcloud) provides the types, formatters and
rewind engine, this package renders them, and
[`@kud/pcloud-cli`](https://github.com/kud/pcloud-cli) consumes them.

## Install

```sh
npm install @kud/pcloud-ink
```

`ink` (>=7) and `react` (>=19) are peer dependencies.

## Usage

Every list component is presentation-only — props in, no data fetching, no input
handling. The consuming surface owns selection, navigation and loading, so the
same component composes into a one-shot CLI command or a pane in a larger
dashboard.

```tsx
import { render } from "ink"
import { FileList, sortItems } from "@kud/pcloud-ink"

const { unmount } = render(
  <FileList items={sortItems(contents)} rows={contents.length} />,
)
unmount()
```
