---
title: "gandi-ink"
description: "Ink components for browsing Gandi domains, DNS records, and web redirects"
hasDocs: true
---

## Features

- **Full-screen browser** — `GandiBody` lists your domains, opens one, and shows its DNS records, web redirects and details across three tabs
- **Edit in place** — change DNS values and TTLs, redirect targets and types, or toggle autorenew, with a confirmation before anything destructive
- **Composable lists** — `DomainList`, `DnsList` and `RedirectList` are presentation-only, so you can build your own layout or drop one into a dashboard pane
- **Host-friendly** — never calls `render()` and never owns the terminal; quitting is reported through `onExit`
- **Scrolling helpers** — `windowSlice` and `fit` are exported so your own lists scroll and pad exactly like the built-in ones
- **Typed end to end** — built on the typed API client from [`@kud/gandi`](https://github.com/kud/gandi) and consumed by [`@kud/gandi-cli`](https://github.com/kud/gandi-cli)

## Install

```sh
npm install @kud/gandi-ink
```

`ink` (>=7) and `react` (>=19) are peer dependencies.

## Usage

Mount the assembled browser as a single React component. The host owns the terminal lifecycle.

```tsx
import { render } from "ink"
import { GandiBody } from "@kud/gandi-ink"

const { unmount } = render(<GandiBody onExit={() => unmount()} />)
```

Pass `domain` to open straight onto a domain's DNS tab, or `api` and `apiKey` to reuse an existing session.

To compose your own screen, use the lists directly:

```tsx
import { DomainList, DnsList, RedirectList } from "@kud/gandi-ink"

<DomainList domains={domains} selected={2} rows={10} />
<DnsList records={records} rows={10} />
<RedirectList redirects={redirects} rows={10} />
```
