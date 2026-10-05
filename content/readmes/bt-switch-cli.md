---
title: "bt-switch-cli"
description: "🖱️ Bluetooth device handoff CLI — switch Magic peripherals between Macs by name"
hasDocs: true
---

> [!NOTE]
> **Prototype — not on npm yet.** The commands work and are covered by tests, but
> nothing has been released, so the npm badge above reads _not found_ and `npm i -g`
> will not resolve it. Install from source for now, and expect the interfaces to move.

## Features

- **Named devices** — connect peripherals by a friendly name, never a MAC address
- **Smart connect** — instantly reconnects already-bonded devices; only prompts pairing mode when genuinely needed
- **Handoff between Macs** — release a device on one Mac so another can claim it, working with Apple's single-host Bluetooth limit rather than against it
- **Interactive onboarding** — `bt-switch add` scans paired devices and saves them with one keystroke, names pre-filled from the Bluetooth name
- **Multi-device** — manage trackpad, keyboard, mouse and more from one config file

## Install

macOS only. Requires [blueutil](https://github.com/toy/blueutil).

```sh
brew install blueutil
npm install -g @kud/bt-switch-cli
```

> Apple Magic peripherals are single-host by design — only one Mac can hold the connection at a time. Switching to another Mac requires a brief press of the peripheral's pairing button to release it from the previous host. `bt-switch switch` handles the unpair, guides you through the pairing-mode prompt, and reconnects — streamlining everything around that hardware constraint.

## Usage

```console
$ bt-switch add
? Select a device to register: Magic Trackpad
? Save as: trackpad
✓ Saved "trackpad" → aa:bb:cc:dd:ee:ff

$ bt-switch list
NAME      MAC                PAIRED  CONNECTED
──────────────────────────────────────────────
trackpad  aa:bb:cc:dd:ee:ff  yes     yes
keyboard  aa:bb:cc:dd:ee:00  yes     no

$ bt-switch connect trackpad
✓ trackpad connected.

$ bt-switch switch keyboard
Hold the power button on keyboard until the LED blinks rapidly.
Press Enter when ready...
✓ keyboard connected.

$ bt-switch forget trackpad
✓ Unpaired trackpad.
```
