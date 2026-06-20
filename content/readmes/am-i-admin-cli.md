---
title: "am-i-admin-cli"
description: "👑 Check whether you're a macOS admin from the terminal — human-readable or raw boolean output"
---

## Features

- **Instant verdict** — tells you in plain English whether your account holds admin privileges on the current Mac.
- **Raw mode** — pass `--raw` to get a bare `true` or `false`, ideal for scripting and conditional logic.
- **Coloured output** — green tick for admins, red cross for non-admins, so the result is obvious at a glance.
- **Zero config** — reads your username from the environment and queries the macOS directory service directly.
- **Lightweight** — single-file tool with minimal dependencies (`zx`, `chalk`).

## Install

```sh
npm install -g @kud/am-i-admin-cli
```

## Usage

```console
$ am-i-admin
✓ alice, you are an admin on this computer. 👑

$ am-i-admin --raw
true
```

## Development

```sh
git clone https://github.com/kud/am-i-admin-cli.git
cd am-i-admin-cli
npm install
node index.js
```
