---
title: "amo"
description: "Typed client for the addons.mozilla.org (AMO) API v5: listing, icon, previews and version status."
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

### Client options

| Option         | Default                             | Description                                 |
| -------------- | ----------------------------------- | ------------------------------------------- |
| `issuer`       | required                            | AMO API key (JWT issuer)                    |
| `secret`       | required                            | AMO API secret                              |
| `baseUrl`      | `https://addons.mozilla.org/api/v5` | Override the API root                       |
| `maxRetries`   | `3`                                 | Retries for network errors, 429 and 5xx     |
| `retryDelayMs` | `500`                               | Base backoff delay, doubled on each attempt |

### Client methods

| Method                                 | Description                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `getAddon(guid)`                       | Fetch the add-on                                                                                             |
| `updateListing(guid, fields)`          | Patch listing fields                                                                                         |
| `uploadIcon(guid, file)`               | Upload an icon from a path, `Uint8Array` or `Blob`                                                           |
| `listPreviews(guid)`                   | List previews ordered by position                                                                            |
| `addPreview(guid, file, options?)`     | Add a preview at an optional `position`; a `caption` is set in a follow-up call, as AMO ignores it on upload |
| `removePreview(guid, id)`              | Delete a preview                                                                                             |
| `updatePreviewCaption(guid, id, text)` | Change a preview caption                                                                                     |
| `getVersions(guid, options?)`          | List all versions, following pagination                                                                      |
| `getVersionStatus(guid, version?)`     | Status of a version, or the latest; `approved` when public                                                   |

### Pure helpers

| Helper                                               | Description                                                                                                                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `readListingFile(path)`                              | Read and validate a listing JSON file                                                                                                                                                                                          |
| `diffListing(local, live)`                           | List the fields that differ; descriptions compare as Markdown against AMO's rendered HTML                                                                                                                                      |
| `sameDescription(local, live)`                       | Compare a Markdown description with the HTML AMO returns                                                                                                                                                                       |
| `getPublicAddon(guid)`                               | Anonymous read (may be cached; `getAddon` is authenticated and live)                                                                                                                                                           |
| `buildListingPatch(changes)`                         | Turn a diff into a patch body for `updateListing`                                                                                                                                                                              |
| `planPreviewSync(shots, previews, { state, force })` | Decide which previews to delete and upload. In sync only when the live ids, each local file's `sha256` and caption match the recorded `state`; otherwise every live preview is replaced, uploaded in order with `position` set |
| `parsePreviewState(json)`                            | Validate a recorded preview state (`{ version: 1, previews: [{ id, file, sha256, caption }] }`)                                                                                                                                |
| `createJwt({ issuer, secret })`                      | Sign an AMO-compatible JWT                                                                                                                                                                                                     |
| `redactSecrets(text, secrets)`                       | Strip secrets from a string                                                                                                                                                                                                    |

### Error handling

Failures throw an `AmoError`. Use `isAmoError` to narrow it and branch on `kind`.

```ts
import { isAmoError } from "@kud/amo"

try {
  await amo.getAddon("my-addon@example.com")
} catch (error) {
  if (isAmoError(error) && error.kind === "not-found") {
    console.error("No such add-on")
  } else {
    throw error
  }
}
```

`kind` is one of `bad-request`, `unauthorized`, `forbidden`, `not-found`, `rate-limited`, `server`, `network` or `unexpected`. The error also carries `status`, `detail` and `retryAfterMs`.

## Development

```sh
git clone https://github.com/kud/amo.git
cd amo
npm install
npm test
npm run build
```
