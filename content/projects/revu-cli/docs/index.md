---
title: "revu-cli"
description: "🔍 Review code diffs in your terminal — annotate lines, export to Markdown for humans & AI"
---

## Features

- **Line and range annotations** — comment on a single line or select a range and annotate the whole block.
- **Hunk and file navigation** — jump between hunks, annotations, and files without leaving the keyboard.
- **PR mode** — review every commit between a branch and `HEAD` with `--against`.
- **Markdown export** — export annotations to `revu-review.md`, with an optional AI context header, by pressing `e`.
- **Persistent reviews** — annotations autosave to `.revu.json` and survive across sessions.
- **Themeable** — switch theme and view mode from an in-app settings panel, saved to your user config.

<div align="center">

<a href="https://asciinema.org/a/SitNPy6fQpidFCcH">
  <img src="https://raw.githubusercontent.com/kud/revu-cli/HEAD/assets/demo.gif" alt="revu demo" />
</a>

</div>

## Install

```sh
npm install -g @kud/revu-cli
```

## Usage

```console
$ revu                  # review staged/unstaged changes in the current repo
$ revu src/foo.ts       # review a specific file
$ revu --against main   # review all commits between a branch and HEAD (PR mode)
```

Inside the reviewer, move with `↑↓` / `j k`, press `↵` to annotate a line, hold `shift` to select a range, and `e` to export to `revu-review.md`.

## Development

```sh
git clone https://github.com/kud/revu-cli.git
cd revu-cli
mise install
mise run dev    # run in hot-reload mode
mise run build  # compile a standalone binary
```
