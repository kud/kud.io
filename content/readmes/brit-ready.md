---
title: "brit-ready"
description: "Brit Ready — a gamified, non-official PWA for the Life in the UK Test. Learn every fact, practise the exam format, and know when you're ready to book."
hasDocs: true
---

## 🌟 Features

- 🧠 **Mastery system** — every examinable fact is tracked as a `KnowledgeItem`; questions are interchangeable variants of the same fact, so you can't pass by memorising wording alone
- 📊 **Readiness score** — one honest signal (not ready / almost ready / likely ready) calibrated to the real 75% pass mark, so you book your test with confidence
- 📝 **Realistic mock exams** — 24-question sessions with a 45-minute countdown and the actual pass threshold
- 🔄 **Spaced revision** — weak facts resurface in fresh wording until they stick; the harder you find a topic, the more it comes back
- 🔒 **Local-first & private** — all progress lives in IndexedDB via zustand persist; no account required, no data sent to a server, with export/import for backup
- 📱 **Installable PWA** — service worker via Serwist, full manifest, installable on mobile and desktop; works offline after the first load
- 🎨 **Polished UX** — Union-flag colour palette, light/dark themes, an illustrated pixel mascot coach, subtle sounds, reminders, and a responsive layout (mobile bottom-sheet ↔ desktop modal/sidebar)

> **Non-official** — original practice questions only; not affiliated with GOV.UK, the Home Office, or TSO.

---

## 🔗 Live Demo

**[brit-ready.kud.io](https://brit-ready.kud.io)**

No sign-up. Open it, start practising. Install it to your home screen for offline access.

---

## 🚀 Quick Start

Requires Node.js 20+.

```bash
git clone https://github.com/kud/brit-ready.git
cd brit-ready
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The onboarding flow will walk you through your first session.

---

## ⚠️ Disclaimer

Brit Ready is an **independent, non-official** preparation tool created to help people study for the Life in the UK Test.

It is **not affiliated with, endorsed by, or produced by** GOV.UK, the Home Office, TSO (The Stationery Office), or any official Life in the UK Test provider. All practice questions are original works and do not reproduce real exam questions. Passing this app's mock exams does not guarantee passing the official test.

---

<div align="center">

MIT © [kud](https://github.com/kud) — Made with ❤️

</div>
