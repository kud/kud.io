---
title: "amo-cli"
description: "Sync an add-on's listing, icon and screenshots with addons.mozilla.org, and check its review status, from the terminal."
---

## Features

- **Listing as a file** — keep your add-on's name, summary, description, categories and tags in a JSON file, and push only what differs from the live listing.
- **Dry run by default** — `push` and `screenshots sync` print the planned requests, with the `Authorization` header redacted, and send nothing until you pass `--apply`.
- **Icon and screenshots** — upload the icon and make AMO's previews match a directory of images, with optional captions. A small state file of preview ids and image hashes means a replaced image is noticed even when its caption is unchanged.
- **Markdown descriptions** — write descriptions in Markdown, which AMO renders to HTML. The diff compares them as plain text, so an unchanged description reports no difference.
- **Review status** — see the listing status and whether the latest version has been approved, as text or JSON.
- **CI friendly** — credentials come from environment variables, and every input has an environment fallback.

## Install

```sh
npm install -g @kud/amo-cli
```

Create an API key and secret on the [AMO API key page](https://addons.mozilla.org/developers/addon/api/key/), then export them:

```sh
export WEB_EXT_API_KEY="user:12345:67"
export WEB_EXT_API_SECRET="<your-secret>"
```

## Usage

```console
$ amo status my-addon@example.com
My Add-on (my-addon@example.com)
listing:  public
version:  1.4.0 (listed)
review:   approved (file public)

$ amo listing pull my-addon@example.com --out listing.json
wrote listing.json

$ amo listing push --guid my-addon@example.com --listing listing.json
$ amo listing push --guid my-addon@example.com --listing listing.json --apply

$ amo listing push --listing listing.json --icon icon.png --screenshots screenshots --only=icon,previews
$ amo screenshots sync --guid my-addon@example.com --screenshots screenshots --apply
```

### Commands

| Command                | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `amo status <guid>`    | Show the listing and latest version review status (`--json` for JSON)          |
| `amo listing pull`     | Download the live listing as a listing file (`--out <file>`, else stdout)      |
| `amo listing push`     | Compare a listing file, icon and screenshots with AMO and send the differences |
| `amo screenshots sync` | Make AMO's screenshots match a directory                                       |

### Options and environment

| Flag            | Environment variable | Used by                    | Description                                                 |
| --------------- | -------------------- | -------------------------- | ----------------------------------------------------------- |
| `--guid`        | `AMO_GUID`           | `push`, `screenshots sync` | Add-on GUID                                                 |
| `--listing`     | `AMO_LISTING`        | `push`                     | Listing JSON file, required unless `--only` omits `listing` |
| `--icon`        | `AMO_ICON`           | `push`                     | 128x128 icon PNG                                            |
| `--screenshots` | `AMO_SCREENSHOTS`    | `push`, `screenshots sync` | Screenshots directory                                       |
| `--only`        |                      | `push`                     | Comma-separated subset of `listing`, `icon`, `previews`     |
| `--apply`       |                      | `push`, `screenshots sync` | Send the changes to AMO                                     |
| `--force`       |                      | `push`, `screenshots sync` | Replace every preview, even when they look in sync          |
| `--out`         |                      | `listing pull`             | Write the listing to a file instead of stdout               |
| `--json`        |                      | `status`                   | Print JSON                                                  |

`WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` are the same variables `web-ext` uses. `status` always needs them.

### Dry runs and applying

`push` and `screenshots sync` never change anything unless you pass `--apply`. A dry run prints each request it would make, with the `Authorization` header redacted.

Dry runs read the live listing with a JWT when the keys are set, because anonymous reads can be served stale from AMO's cache. Without keys they fall back to an anonymous read. `listing pull` follows the same rule.

### Listing file

A listing file holds localised text fields plus categories and tags. `listing pull` writes this shape for you.

```json
{
  "name": { "en-US": "My Add-on" },
  "summary": { "en-US": "One line about what it does." },
  "description": { "en-US": "Longer **Markdown** description." },
  "categories": ["tabs"],
  "tags": ["productivity"]
}
```

Descriptions are written in Markdown and AMO renders them to HTML. The diff compares them as plain text, so a description that has not changed reports no difference even though AMO stores HTML. `listing pull` converts AMO's HTML back to Markdown on a best-effort basis, so expect to tidy the result the first time.

### Icon

The icon is re-uploaded whenever `--icon` (or `AMO_ICON`) is passed, because AMO exposes no icon hash to compare against. Leave it out, or use `--only=listing,previews`, when the icon has not changed.

### Screenshots

Point `--screenshots` at a directory. Every `.png` and `.jpg` file in it is a screenshot, ordered by sorted file name. An optional `<name>.txt` beside an image holds its caption.

```text
screenshots/
  01-overview.png
  01-overview.txt
  02-settings.png
  03-dark.jpg
```

AMO cannot tell you which image sits behind a preview, so after a successful `--apply` the CLI writes `.amo-previews.json` into the screenshots directory. It records, for each preview it uploaded, the AMO preview id, the SHA-256 of the local file and its caption:

```json
{
  "version": 1,
  "previews": [
    {
      "id": 418930,
      "file": "01-overview.png",
      "sha256": "9f2c…",
      "caption": "Overview"
    }
  ]
}
```

Previews count as in sync only when AMO's preview ids, in display order, match the recorded ids, and every local file's hash and caption match its record. Anything else, including a missing or unreadable state file, replaces all previews: the live ones are deleted and the local files uploaded in file-name order, each with its `position` set so that order is the order shown on AMO. A dry run never writes the file. Pass `--force` to replace the previews regardless.

Commit `.amo-previews.json` alongside the screenshots. It holds only ids, hashes and captions, and without it the next run cannot know the previews are current, so it uploads them all again.

### Continuous integration

Add the two secrets to your repository, then push the listing whenever it changes.

```yaml
name: Sync AMO listing

on:
  push:
    branches: [main]
    paths:
      - listing.json
      - screenshots/**
      - "!screenshots/.amo-previews.json"
      - icon.png

jobs:
  listing:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx @kud/amo-cli listing push --guid my-addon@example.com --listing listing.json --icon icon.png --screenshots screenshots --apply
        env:
          WEB_EXT_API_KEY: ${{ secrets.WEB_EXT_API_KEY }}
          WEB_EXT_API_SECRET: ${{ secrets.WEB_EXT_API_SECRET }}
      - name: Commit the preview state
        run: |
          git add screenshots/.amo-previews.json
          git diff --cached --quiet && exit 0
          git -c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" commit --message "chore: record AMO preview state"
          git push
```

Drop `--apply` to run the same job as a dry run on pull requests. Keep the commit step: a state file written on a CI runner and then thrown away leaves the next run with nothing to compare against, so it uploads every screenshot again.

## Development

```sh
git clone https://github.com/kud/amo-cli.git
cd amo-cli
npm install
npm run dev -- status my-addon@example.com
```
