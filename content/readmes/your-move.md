---
title: "your-move"
description: "A phone-sized inbox for GitHub: what moved, and whose move it is."
hasDocs: true
---

Your Move is a single authenticated page that answers one question: **what changed, and is it my turn?** It reads GitHub live — pull requests, reviews, checks, issues — and lays it out as a matrix: one row per repository, one column per status, so a project's whole situation is a single line you read across. Every row is marked `your move` or `their move`. Tap a card and it opens on GitHub. There is nothing else to configure.

It is built to be genuinely good on a phone, since that is the hardest case and the one that usually goes unserved. Desktop and tablet are first-class too — one responsive surface, installable everywhere as a PWA.

## 🌟 Features

- **📱 One board, every width** — the same matrix on a phone and on a desk, scroll-snapping in both axes, with a status rail on narrow and sticky lane names on wide. Not a mobile app and a desktop app.
- **🎛 Filters that combine** — whose move, repository, status and label; AND across facets, OR within one, and the whole selection lives in the URL, so a view is a bookmark.
- **🗂 Foldable projects** — collapse a noisy repository and its row keeps its columns and its counts, hatched.
- **🔀 Whose move, at a glance** — every card carries a short reason in one of four tones: review requested, CI failing, changes requested, a conflict, approved.
- **🔎 A row in enough detail to decide** — verdict, checks, reviews and the description, as a side panel, a modal or full screen. No diff and no comment box: that is what GitHub is for.
- **🔗 Opens where the truth lives** — tapping or clicking a row takes you straight to the issue or PR on GitHub. No parallel comment thread, no second place to check.
- **🔑 GitHub OAuth, per user** — sign in with GitHub and every request runs under your own token, scoped to whatever you can already see. No shared token, no passphrase.
- **🕰 Honest about its own age** — the board polls rather than mirrors, and says visibly how old what you're looking at is: live, refreshing, stale, or offline.
- **📲 Installable everywhere** — a proper PWA with a manifest, a service worker, and an offline page, so it behaves like an app on the home screen rather than a bookmarked tab.

## 🚀 Quick Start

```sh
git clone https://github.com/kud/your-move.git
cd your-move
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see [Self-hosting](#-self-hosting) below for what each variable needs), then:

```console
$ npm run dev
▲ Next.js 16.3.1
- Local:        http://localhost:3000

✓ Ready in 890ms
```

Open `http://localhost:3000`, sign in with GitHub, and the board loads.
