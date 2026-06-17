---
title: "revu-cli"
description: "🔍 Review code diffs in your terminal — annotate lines, export to Markdown for humans & AI"
---

<p align="center">
  <img src="https://raw.githubusercontent.com/kud/revu-cli/HEAD/assets/revu-logo.png" width="200" alt="revu logo" />
</p>

# revu

Interactive terminal diff reviewer — annotate diffs, export reviews to Markdown.

<p align="center">
  <a href="https://asciinema.org/a/SitNPy6fQpidFCcH">
    <img src="https://raw.githubusercontent.com/kud/revu-cli/HEAD/assets/demo.gif" alt="revu demo" />
  </a>
</p>

## Install

```sh
npm install -g @kud/revu-cli
```

## Usage

```sh
revu                  # review changes in the current repo
revu src/foo.ts       # review a specific file
revu --against main   # review commits between a branch and HEAD (PR mode)
```

## Development

```sh
mise run dev          # run in hot-reload mode
mise run start        # run once
mise run build        # compile a standalone binary
```

📚 **Full documentation → https://kud.io/projects/revu-cli/docs**
