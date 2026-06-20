---
title: "brit-ready"
description: "Brit Ready — a gamified, non-official PWA for the Life in the UK Test. Learn every fact, practise the exam format, and know when you're ready to book."
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

## 📖 Scripts

| Command             | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Development server with Turbopack                                    |
| `npm run build`     | Production build (**`next build --webpack`** — required for Serwist) |
| `npm run start`     | Serve the production build                                           |
| `npm run lint`      | ESLint                                                               |
| `npm run typecheck` | TypeScript type-check (no emit)                                      |
| `npm run format`    | Prettier (write)                                                     |
| `npm run icons`     | Generate icons from source                                           |

---

## 🗂 Project Structure

```
src/
├── app/                   # App Router
│   ├── page.tsx           # Landing page
│   ├── about/             # Disclaimer / about
│   └── app/               # App shell
│       ├── dashboard/     # Readiness score overview
│       ├── practice/      # Question-by-question practice
│       ├── mock/          # Timed mock exam
│       ├── revise/        # Spaced revision queue
│       ├── learn/         # Browse knowledge items
│       ├── progress/      # Mastery charts
│       ├── onboarding/    # First-run flow
│       ├── settings/      # Data export/import, preferences
│       └── category/      # Per-topic drill
├── components/            # UI components (mascot, quiz-runner, drawer, date picker…)
├── content/               # Question bank, KnowledgeItems, categories (~150+ questions, 10 topics)
└── lib/                   # zustand store, session logic, coach lines, sounds, data transfer
```

---

## 🏗 Tech Stack

| Library                                                                                                  | Role                                                    |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Next.js 16](https://nextjs.org)                                                                         | App Router, React Server Components, image optimisation |
| [React 19](https://react.dev)                                                                            | UI runtime                                              |
| [TypeScript](https://www.typescriptlang.org)                                                             | Strict types throughout                                 |
| [Tailwind CSS v4](https://tailwindcss.com)                                                               | Utility-first styling                                   |
| [zustand](https://github.com/pmndrs/zustand) + [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Local-first state with IndexedDB persistence            |
| [Framer Motion (`motion`)](https://motion.dev)                                                           | Animations and transitions                              |
| [Serwist / `@serwist/next`](https://serwist.pages.dev)                                                   | Service worker, offline caching, PWA                    |
| [vaul](https://github.com/emilkowalski/vaul)                                                             | Mobile bottom-sheet drawer                              |
| [next-themes](https://github.com/pacocoursey/next-themes)                                                | Light / dark theme                                      |
| [lucide-react](https://lucide.dev)                                                                       | Icon set                                                |
| [canvas-confetti](https://github.com/catdad/canvas-confetti)                                             | Pass celebration effect                                 |

---

## 🚢 Deploy

The project is deployed on Vercel. One critical detail: the build command is pinned to **`next build --webpack`** in `vercel.json`. This is intentional — Serwist's service worker generation is webpack-only, and Next.js 16 now defaults to Turbopack. Using the default `next build` (Turbopack) would silently omit the service worker, breaking offline support and the PWA install prompt.

If you fork and deploy your own instance, ensure your Vercel project's build command matches:

```
next build --webpack
```

---

## ⚠️ Disclaimer

Brit Ready is an **independent, non-official** preparation tool created to help people study for the Life in the UK Test.

It is **not affiliated with, endorsed by, or produced by** GOV.UK, the Home Office, TSO (The Stationery Office), or any official Life in the UK Test provider. All practice questions are original works and do not reproduce real exam questions. Passing this app's mock exams does not guarantee passing the official test.

---

<div align="center">

MIT © [kud](https://github.com/kud) — Made with ❤️

</div>
