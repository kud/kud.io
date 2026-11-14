---
title: "segment"
description: "Segment Public API tooling — a surface-agnostic core and a fast CLI for sources, destinations, and the catalog."
hasDocs: true
---

## 🌟 Features

- 🔍 **Source inspection** — list every source in a workspace, or drill into one for its write keys and connected type
- 🔌 **Destination management** — list, get, create, update, and delete destinations, scriptable end to end
- 📚 **Catalog browsing** — search destination types and read a type's full settings schema before you wire anything up
- 🌐 **Region-aware** — talks to either the `us` or `eu` Segment Public API host, per call or per config
- 🧩 **Zero-dependency core** — `@kud/segment` ships no runtime dependencies at all, built on the global `fetch`
- 🖇 **Instant workspace linking** — the CLI consumes the core straight from source in development, no publish step in the loop
- 🤖 **Scriptable output** — `--json` on every command for piping into `jq` or another tool

## 🚀 Quick Start

Install the CLI globally:

```sh
npm install -g @kud/segment-cli
```

Set your token (see [Authentication](#-authentication) for how to get one):

```sh
export SEGMENT_API_TOKEN="<your Public API token>"
```

List the sources in your workspace:

```sh
segment sources list
```

```console
$ segment sources list
ID           NAME              SLUG              ENABLED  WRITE KEY
─────────    ──────────────    ──────────────    ───────  ────────────
src_9f2k1a   Marketing Site    marketing-site    yes      k3f8s2…9d1a
src_7c4m2b   Mobile App        mobile-app        yes      p9x1q7…2m3b
```
