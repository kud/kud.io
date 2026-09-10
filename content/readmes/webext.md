---
title: "webext"
description: "Typed settings and plumbing for Firefox WebExtensions"
---

Typed settings and plumbing for Firefox WebExtensions.

## Consuming this without a build step

The extensions this library is built for have no bundler — `web-ext build`
just zips the source directory as-is. So there is no `import "@kud/webext"`
resolving through node_modules at runtime; instead you **vendor** the built
file straight into the extension repo:

```sh
cp node_modules/@kud/webext/dist/index.global.js src/vendor/webext.js
```

Commit `src/vendor/webext.js`, and list it in `manifest.json` **before** the
consumer's own script — the IIFE build exposes a `webext` global that the
following script relies on:

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/vendor/webext.js", "src/content.js"]
    }
  ]
}
```

`webext.defineSettings(...)` is then available as a global inside
`src/content.js`.

Do the same for popup and options pages — three plain `<script>` tags rather
than one `<script type="module">`. A module gets its own scope and cannot see
the vendored global, so it needs its own copy of the schema, and a second copy
of the schema is the thing this library exists to delete:

```html
<script src="https://raw.githubusercontent.com/kud/webext/HEAD/vendor/webext.js"></script>
<script src="https://raw.githubusercontent.com/kud/webext/HEAD/settings.js"></script>
<script src="https://raw.githubusercontent.com/kud/webext/HEAD/popup.js"></script>
```

This costs something and it isn't hidden here: you commit a vendored file,
and you re-copy it by hand every time the library changes. That's the price
of a no-build extension. There's no watcher and no registry resolution at
runtime — just a file you copy in and keep in sync yourself.

## Usage

Declare the schema once, in a classic script every context loads:

```js
// src/settings.js
const settings = webext.defineSettings(
  { enabled: true, threshold: 30 },
  { area: "sync" },
)
```

A top-level `const` in a classic script lands in the shared global lexical
scope, so `settings` is in scope for every later script in that context — the
popup, the options page, the background page, and the content script — without
an `import` anywhere.

Read it from a popup:

```js
// src/popup.js
const values = await settings.get()
document.querySelector("#enabled").checked = values.enabled
```

Subscribe to changes from a content script:

```js
// src/content.js
settings.onChange((values, changed) => {
  if ("enabled" in changed) toggleFeature(values.enabled)
})
```

Where a context needs a value _before_ the first `get()` resolves — a content
script rendering on load — read `settings.defaults`:

```js
// src/content.js
let values = settings.defaults
settings.get().then((stored) => (values = stored))
```

It is deep-frozen, so a nested default cannot be mutated into something every
later `get()` silently merges over.

`defineSettings` also throws on `set()` calls with an undeclared key, so a
typo in a plain-JS content script fails loudly instead of silently writing
under a name nothing reads.

### When `get()` rejects

It does not swallow storage failures, and that is deliberate — the failure is
almost never transient. In Firefox the usual cause is `storage.sync` throwing
because the manifest has no `browser_specific_settings.gecko.id`; **check that
first**. Resolving defaults instead would leave the extension running on
defaults forever while the user's saved settings appear to be ignored, with
nothing anywhere to point at the cause.

Where a caller genuinely wants to carry on, the defaults are one expression
away — and reading them from the schema is the point, rather than restating
the literal in a `catch`:

```js
const values = await settings.get().catch(() => settings.defaults)
```

## `invoke` — for APIs this library does not wrap

`invoke(namespace, method, ...args)` is the promise/callback adapter the rest
of the library is built on, exported so an API with no wrapper here does not
need a hand-rolled Chrome-MV2 branch at the call site:

```js
const [tab] = await webext.invoke(webext.api.tabs, "query", {
  active: true,
  currentWindow: true,
})
```

It passes a callback _and_ honours a returned thenable, so it is correct under
Firefox, Chrome MV3 and Chrome MV2 alike, and it checks `runtime.lastError` —
which a hand-rolled `new Promise((resolve) => chrome.tabs.query(q, resolve))`
does not, silently resolving `undefined` on failure.

⚠ It is for **callback-or-promise async** APIs, not a universal wrapper. It
appends a callback argument to every call, so a synchronous API
(`i18n.getMessage`) would receive an argument it does not expect.

## Development

```sh
npm install
npm run build      # emits dist/index.js (ESM) and dist/index.global.js (IIFE)
npm run typecheck
npm test
```
