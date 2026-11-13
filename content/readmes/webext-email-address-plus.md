---
title: "webext-email-address-plus"
description: "Get a shiny email address with a ✌️ label ✌️ depending on the hostname"
hasDocs: true
---

## Features

**Automatically generate labeled email addresses for better organization and spam protection.** Email Address Plus adds website-specific labels to your email address when filling forms, making it easy to track where emails come from and organize your inbox.

- **Smart email labeling** — automatically adds "+website" labels to your email (e.g., `user+amazon@example.com`)
- **Multiple fill methods** — a floating 📧 icon next to email inputs, a right-click context menu, or a keyboard shortcut (Ctrl+Shift+Y / Cmd+Shift+Y)
- **Visual feedback** — elegant blue glow animations confirm when fields are filled
- **Theme support** — works seamlessly across light and dark browser themes
- **Privacy focused** — all processing happens locally, no data sent to external servers
- **Smart guidance** — helpful tooltips when the extension needs configuration
- **Easy setup** — simple one-time configuration in extension settings

## Install

### From Firefox Add-ons (remote)

[Email Address Plus on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/email-address-plus/)

Chrome Web Store: coming soon.

### From source (local)

```sh
git clone https://github.com/kud/webext-email-address-plus.git
cd webext-email-address-plus
npm ci
npm run build
```

Load it in Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `.output/firefox-mv2/manifest.json`. Temporary add-ons are dropped on restart and must be reloaded after every change.

## Usage
