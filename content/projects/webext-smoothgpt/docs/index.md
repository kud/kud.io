---
title: "webext-smoothgpt"
description: "🦊 Make long ChatGPT conversations fast on Firefox by virtualising off-screen message turns"
---

## Features

- **Instant speed recovery** — eliminates the jitter and input lag that builds up in long ChatGPT threads, regardless of message count.
- **CSS-containment only** — applies `content-visibility: auto` to off-screen turns; no nodes are removed or detached from the DOM.
- **Nothing breaks** — Ctrl+F, text selection, code-block copy buttons, and ChatGPT's own React reconciliation all keep working normally.
- **Fully local, zero telemetry** — the extension makes no network calls beyond the page itself and collects no data.
- **Live stats popup** — a toolbar popup shows how many turns are virtualised vs. rendered live, with a one-click on/off toggle.
- **Activates only when needed** — containment engages past 30 turns so short conversations are left entirely untouched.
- **Minimal & private** — no account, no telemetry; permissions are limited to ChatGPT content-script access plus `activeTab` and `storage` for the popup toggle.

## How it works

ChatGPT keeps every message turn live in the DOM. In long threads this produces thousands of nodes that the browser must re-layout on each new token. SmoothGPT applies CSS containment (`content-visibility: auto` + `contain-intrinsic-size`) to turns outside the viewport, telling the browser it can skip their rendering until they are scrolled into view. The nodes remain in the DOM — Ctrl+F, text selection, code-block copy buttons, and ChatGPT's own React reconciliation all continue to work normally.

Containment is only engaged once a conversation exceeds 30 turns. The currently-streaming turn and the last turn are always exempted to preserve auto-scroll-to-bottom behaviour. A `MutationObserver` on the conversation container keeps containment applied as new turns arrive and survives SPA chat switches.

## Install

Firefox Add-ons (AMO): _link will appear after first submission_.

To load temporarily for development, see **Development** below.

## Development

```sh
npm install
npm run dev        # launches Firefox Nightly with the extension loaded
```

Content-script and icon changes hot-reload automatically under `web-ext run` — no manual reload needed.

To load without Firefox Nightly: open `about:debugging → This Firefox → Load Temporary Add-on` and point to `manifest.json`. The extension is removed on browser restart.

| Command         | Description                                          |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Launch Firefox Nightly with the extension hot-loaded |
| `npm run lint`  | Validate manifest and source against AMO rules       |
| `npm run build` | Package into `web-ext-artifacts/`                    |

## Publishing

**First submission** — run `bash publish.sh`. This builds the package, opens the AMO Developer Hub in your browser, and reveals the `web-ext-artifacts/` folder. Upload the `.zip` manually and complete the listing (description, screenshots, review queue). The very first submission cannot be automated.

**Subsequent releases** — bump, tag, and push:

```sh
npm version patch   # or minor / major
git push --follow-tags
```

`npm version` syncs the new version into `manifest.json` automatically (via the `version` lifecycle hook). CI picks up the `v*` tag, signs the package, and uploads it to AMO.

**CI setup (one time)** — before the first CI-driven release, add two secrets to the GitHub repo:

```sh
gh secret set MOZILLA_ADDONS_JWT_ISSUER
gh secret set MOZILLA_ADDONS_JWT_SECRET
```

Retrieve both values from [addons.mozilla.org/en-US/developers/addon/api/key/](https://addons.mozilla.org/en-US/developers/addon/api/key/).

## Permissions

- `https://chatgpt.com/*` and `https://chat.openai.com/*` — content-script injection; required to read and modify the conversation DOM.
- `activeTab` — lets the toolbar popup read live stats from the ChatGPT tab you have open, only when you click it.
- `storage` — persists the popup's on/off toggle locally.

No data leaves the browser.

## Licence

MIT — see [LICENSE](https://github.com/kud/webext-smoothgpt/blob/HEAD/LICENSE).
