---
title: "amo"
description: "Typed client for the addons.mozilla.org (AMO) API v5: listing, icon, previews and version status."
hasDocs: true
---

## Features

- **Typed end to end** — every call, option and response shape is exported as a TypeScript type.
- **Listing sync** — diff a local listing file against the live add-on and patch only what changed.
- **Previews and icon** — upload an icon, add, caption and remove screenshots, or plan a full preview sync.
- **Version status** — check whether the latest (or a specific) version has been approved.
- **Resilient** — retries 429 and 5xx responses with exponential backoff, honouring `Retry-After`.
- **Safe by design** — the secret and signed tokens are redacted from every error and never logged. Zero runtime dependencies, Node 20 or later.

## Install

```sh
npm install @kud/amo
```

Create an API key and secret at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/developers/addon/api/key/). The key is the JWT issuer; the secret signs each request.

## Usage

```ts
import {
  createAmoClient,
  diffListing,
  buildListingPatch,
  readListingFile,
} from "@kud/amo"

const amo = createAmoClient({
  issuer: process.env.AMO_JWT_ISSUER!,
  secret: process.env.AMO_JWT_SECRET!,
})

const guid = "my-addon@example.com"

const live = await amo.getAddon(guid)
const local = await readListingFile("listing.json")

const changes = diffListing(local, live)
if (changes.length > 0) {
  await amo.updateListing(guid, buildListingPatch(changes))
}

const status = await amo.getVersionStatus(guid)
console.log(status?.version, status?.approved)
```
