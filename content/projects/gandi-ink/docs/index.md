---
title: "gandi-ink"
description: "Ink components for browsing Gandi domains, DNS records, and web redirects"
---

Ink components for browsing Gandi domains, DNS records, and web redirects.

The presentation layer of the Gandi toolchain:
[`@kud/gandi`](https://github.com/kud/gandi) provides the typed API client, this
package renders it, and
[`@kud/gandi-cli`](https://github.com/kud/gandi-cli) consumes them.

## Install

```sh
npm install @kud/gandi-ink
```

`ink` (>=7) and `react` (>=19) are peer dependencies.

## Usage

Presentation-only: it never calls `render()` and never owns the terminal. A
host mounts the assembled body as a single React component and owns the
terminal lifecycle itself.

```tsx
import { render } from "ink"
import { GandiBody } from "@kud/gandi-ink"

const { unmount } = render(<GandiBody onExit={() => unmount()} />)
```

This is a scaffold — components for domains, DNS records, and web redirects
are still to come.

## Licence

MIT © kud
