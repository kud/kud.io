---
title: "planning-poker"
description: "Estimate user stories together in real time — free, no account required. 🃏"
hasDocs: true
---

## 🌟 Features

- 🔗 **Real-time rooms** — a tiny [PartyServer](https://github.com/cloudflare/partykit/tree/main/packages/partyserver) room server on Cloudflare Workers keeps everyone in sync over WebSockets; rooms survive host refreshes and reconnects
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

# Start the room server and the Next.js dev server
npm run party:dev   # terminal 1 — ws://127.0.0.1:8787
npm run dev         # terminal 2 — http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

1. Click **Create room** — a six-character room code and shareable link are generated instantly.
2. Share the link (or code) with your team.
3. Each guest opens the link, picks a name and avatar, and joins.
4. Everyone votes; the host clicks **Reveal** to flip all cards simultaneously.
5. Celebrate consensus with confetti, or discuss and re-vote.

---
