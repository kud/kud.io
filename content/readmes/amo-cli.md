---
title: "amo-cli"
description: "Sync an add-on's listing, icon and screenshots with addons.mozilla.org, and check its review status, from the terminal."
hasDocs: true
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
