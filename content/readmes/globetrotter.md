---
title: "globetrotter"
description: "Interactive 3D globe visualization built with Next.js, React, Three.js, and D3. Explore geographic data with smooth animations and real-time interactivity."
hasDocs: true
---

## 🌟 Features

- 🗺 **Two complementary views** — a pannable, zoomable Mercator SVG map (default) and an interactive WebGL 3D globe; switch between them from the header toolbar; the globe centres on your location via the Geolocation API on first open
- 🏳 **Country status tracking** — cycle any country through Visited / Wishlist / Blocked with a single click; wishlist countries show a dashed border, blocked a dotted one; a neon progress bar counts your tally against the 195 sovereign countries of the world
- 🛡 **Live travel advisories** — blended US State Department and Canada advisory feeds behind a shared API route, combined into a 4-step risk meter shown on the hover tooltip on both views; territories inherit their parent country's advisory automatically
- ✈ **Live flight tracking** — a random real aircraft from adsb.lol rotates every minute; a destination arc, aircraft photo from Planespotters, and clickable Wikipedia links for origin and destination airports appear in a slide-in panel
- ⭐ **Capital city markers** — a five-pointed star inside a ring marks the capital of the selected country on both the flat map and the globe
- 📝 **Travel journal** — per-country free-text notes, 5-star ratings, a "would return?" toggle, best-time-to-visit, and a month-picker for logging multiple visit dates; all stored alongside status data
- 🐋 **Breaching whale easter egg** — a whale surfaces at a random ocean location roughly every two minutes (first breach within 25 seconds so it's actually discoverable); it works on both views
- 💾 **Privacy-first, offline-capable** — all data persists to `localStorage` and is never sent anywhere; export/import via file download or paste-in-field JSON flow; full PWA with service worker; four-language UI (EN / FR / ES / DE) with automatic locale detection; light, dark, and system themes; north/south-up compass toggle

## 🔗 Live Demo

**[globetrotter.kud.io](https://globetrotter.kud.io)**

## 🚀 Quick Start

```bash
git clone https://github.com/kud/globetrotter.git
cd globetrotter
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click any country on the flat map or globe to see facts, set a status, write journal notes, and start building your personal atlas.
