---
title: "planning-poker"
description: "Estimate user stories together in real time — free, no account required. 🃏"
---

## 🌟 Features

- 🔗 **Real-time rooms** — a tiny [PartyKit](https://www.partykit.io/) room server on Cloudflare's edge keeps everyone in sync over WebSockets; rooms survive host refreshes and reconnects
- 🎟 **Friendly room codes** — six-character codes (e.g. `PKD8QC`) that are easy to read out loud or paste in chat
- 🃏 **Multiple deck presets** — Fibonacci (0–21 + ? + ☕), Numeric, T-shirt (XS–XXL), or a fully custom deck; your favourite is remembered for next time
- 🎰 **Casino-style reveal** — votes stay face-down on the felt until the host flips them all at once
- 🎤 **Speaker ritual** — after the reveal, pass the mic: highest vote explains first, lowest second, then the rest; <kbd>space</kbd> drives the whole flow
- ⌨️ **Hotkeys** — <kbd>1–9</kbd> to vote, <kbd>space</kbd> to reveal / next speaker / new round
- 🤵 **A table with a soul** — a pixel croupier announces rounds and commentates results, a waiter delivers coffee when someone plays ☕, and a cat wanders by (it purrs if you're lucky)
- 🔊 **Subtle sound design** — synthesized card swishes, reveal flips, consensus chimes; one-click mute, persisted
- 🎭 **Pixel-art avatars** — DiceBear-generated, selectable on join and changeable mid-session
- 🎉 **Consensus confetti** — fires automatically when everyone votes the same value
- 📱 **Mobile-friendly & installable** — a roster layout on phones and a PWA manifest for Add-to-Home-Screen
- 🌗 **Dark & light theme** — toggled with a single click, preference persisted across sessions

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/kud/planning-poker.git
cd planning-poker
npm install

# Start the PartyKit room server and the Next.js dev server
npm run party:dev   # terminal 1 — ws://127.0.0.1:1999
npm run dev         # terminal 2 — http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

1. Click **Create room** — a six-character room code and shareable link are generated instantly.
2. Share the link (or code) with your team.
3. Each guest opens the link, picks a name and avatar, and joins.
4. Everyone votes; the host clicks **Reveal** to flip all cards simultaneously.
5. Celebrate consensus with confetti, or discuss and re-vote.

---

## 🧩 How It Works

```
Host    ◄──────────────┐
                       │ WebSockets
Guest 1 ◄──────────────┤
Guest 2 ◄──────────────┼──► PartyKit room server (Cloudflare edge)
Guest 3 ◄──────────────┘    └── authoritative room state
```

Each room is a stateful [PartyKit](https://www.partykit.io/) server running on Cloudflare's edge (free tier). Every participant — host included — connects over a WebSocket; the server holds the authoritative room state and broadcasts every change to all connections. The deck and host identity are persisted in room storage, so the room survives refreshes and reconnects.

Hosting is a capability, not a page: creating a room generates a secret kept in `localStorage`, and whoever presents it to the room server gets the host controls. No accounts, no database.

### Routes

| Route        | Purpose                              |
| ------------ | ------------------------------------ |
| `/`          | Landing page — create or join a room |
| `/room/[id]` | The room — vote and watch results    |

### Deck Presets

| Preset    | Cards                                          |
| --------- | ---------------------------------------------- |
| Fibonacci | 0, ½, 1, 2, 3, 5, 8, 13, 21, ?, ☕             |
| Numeric   | 1 (XS), 2 (S), 4 (M), 8 (L), 16 (XL), 32 (XXL) |
| T-shirt   | XS, S, M, L, XL, XXL                           |
| Custom    | Comma-separated values of your choice          |

---

## 🔧 Development

### Project structure

```
party/
└── index.ts              # PartyKit room server — authoritative state
src/
├── app/
│   ├── page.tsx          # Landing — create or join
│   └── room/[id]/        # The room view
├── components/
│   ├── room-view.tsx     # Core voting UI
│   ├── participant-card.tsx
│   ├── playing-card.tsx
│   ├── avatar-picker.tsx
│   ├── deck-selector.tsx
│   ├── settings-dialog.tsx
│   ├── vote-summary.tsx
│   └── ui/               # Base UI primitives
├── hooks/
│   ├── use-party-room.ts # WebSocket connection & room actions
│   └── use-share-room.ts # Copy room code / link
└── lib/
    ├── decks.ts          # Deck presets & parser
    ├── room-code.ts      # Room code generation
    ├── types.ts          # Shared TypeScript types
    ├── settings.ts       # localStorage persistence
    ├── avatar.ts         # DiceBear helpers
    └── utils.ts          # Shared utilities
```

### Scripts

| Script                 | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start Next.js dev server with HMR                                 |
| `npm run party:dev`    | Start the PartyKit room server locally                            |
| `npm run party:deploy` | Deploy the room server to PartyKit                                |
| `npm run crew -- CODE` | Inject auto-voting fake users for testing (`--count N`, `--prod`) |
| `npm run build`        | Production build                                                  |
| `npm run start`        | Serve the production build                                        |
| `npm run lint`         | Run ESLint                                                        |

### Configuration

The client connects to `NEXT_PUBLIC_PARTYKIT_HOST` when set, and falls back to
`127.0.0.1:1999` in development and `planning-poker.kud.partykit.dev` in
production builds.

---

## 🏗 Tech Stack

| Package                                                      | Purpose                            |
| ------------------------------------------------------------ | ---------------------------------- |
| [Next.js 16](https://nextjs.org/)                            | React framework & routing          |
| [React 19](https://react.dev/)                               | UI rendering                       |
| [PartyKit](https://www.partykit.io/)                         | Real-time room server (WebSockets) |
| [Framer Motion 12](https://www.framer.com/motion/)           | Card flip & flying-card animations |
| [Base UI](https://base-ui.com/)                              | Unstyled accessible primitives     |
| [Tailwind CSS v4](https://tailwindcss.com/)                  | Utility-first styling              |
| [DiceBear](https://www.dicebear.com/)                        | Pixel-art avatar generation        |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Consensus celebration effect       |
| [Lucide React](https://lucide.dev/)                          | Icon set                           |

---

<div align="center">

MIT © [kud](https://github.com/kud) — Made with ❤️

</div>
