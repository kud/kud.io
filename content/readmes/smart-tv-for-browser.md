---
title: "smart-tv-for-browser"
description: "An immersive, intelligent, and intuitive interface for watching television right from your computer"
hasDocs: true
---

## Features

A **smart-TV home screen that runs in your browser**. It behaves like a real TV: an animated power-on boot, a 10-foot interface you drive with a remote-style **D-pad**, glassy app tiles that glow and scale on focus, an idle screensaver, and an installable **PWA** so you can run it full-screen on any device.

- **Remote-control navigation** — arrow keys or the on-screen D-pad, no mouse required
- **Apps that launch like a TV OS** — a launch splash, then the channel's website full-screen
- **Your line-up** — show or hide each app and change the tile size, remembered between visits
- **Ambient screensaver** — a clock fades in after about 45 seconds idle
- **Installable** — a PWA with an offline-capable app shell
- **Companion extension** — a Home button and hotkey on every channel site to get back

## Install

Open it in any browser at [smart-tv-for-browser.vercel.app](https://smart-tv-for-browser.vercel.app), then use your browser's _Install_ / _Add to Home Screen_ to run it full-screen like a native TV launcher. To get back to smartTV from a channel, add the companion extension in [`extension/`](https://github.com/kud/smart-tv-for-browser/blob/HEAD/extension/).

## Usage

It's built around remote-control navigation — no mouse required.

| Action        | Keys                 | On-screen remote |
| ------------- | -------------------- | ---------------- |
| Move focus    | Arrow keys (← ↑ → ↓) | D-pad            |
| Open the app  | `Enter`              | **OK**           |
| Back / close  | `Esc` or `Backspace` | **Back**         |
| Open settings | `m` or the ⚙ button | **Menu**         |

- **Opening an app** plays a launch splash, then hands off to the channel's
  website directly — like a real TV OS launching an app full-screen. To get
  _back_ to smartTV from any channel, install the **companion extension** (see
  [`extension/`](https://github.com/kud/smart-tv-for-browser/blob/HEAD/extension/)), which adds a Home button + an `Alt+Shift+H`
  Home hotkey to every channel site.
- **Settings** (⚙ bottom-left, `Menu`, or the remote) lets you show/hide each
  app and change the tile size. Choices are saved to `localStorage` and restored
  on your next visit.
- **On-screen remote** (bottom-right) mirrors every hotkey for mouse/touch use.
- **Screensaver**: after ~45s idle, an ambient clock fades in; any key dismisses it.
- **Install as an app**: use your browser's _Install_ / _Add to Home Screen_ to
  run smartTV full-screen, offline-capable, like a native TV launcher.
