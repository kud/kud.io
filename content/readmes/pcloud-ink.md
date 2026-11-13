---
title: "pcloud-ink"
description: "☁️ Ink components for rendering pCloud domain objects — file lists, change history, account panels"
hasDocs: true
---

## Features

The presentation layer of the pCloud toolchain: [`@kud/pcloud`](https://github.com/kud/pcloud) provides the types, formatters and rewind engine, this package renders them — file listings, change history, shares, sync health, and the assembled browser — and [`@kud/pcloud-cli`](https://github.com/kud/pcloud-cli) consumes them.

- **Presentation-only lists** — files, changes, shares, trash, public links, revisions and sync health; props in, no fetching, no input handling
- **Controlled selection** — pass `selected` and `rows`, own the key handling yourself
- **Assembled browser** — `PCloudBrowser` mounts the lists into six tabs as a full interactive client
- **Host-provided extras** — the **Sync** and **Settings** tabs appear only when the host supplies a provider
- **Never colour alone** — glyphs, labels and positional `rwcd` carry every state

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
import { render } from "ink";
import { FileList, sortItems } from "@kud/pcloud-ink";

const { unmount } = render(
  <FileList items={sortItems(contents)} rows={contents.length} />,
);
unmount();
```
