---
title: "sim-crafter-cli"
description: "📱 Minimal simctl wrapper — list, create, boot and screenshot iOS simulators from your terminal"
---

> A CLI tool to manage iOS simulators on macOS — list, create, delete, boot, and screenshot, all from the terminal.

## Install

```bash
npm install -g @kud/sim-crafter-cli
```

This installs the `sim-crafter` command globally. Requires macOS with Xcode (the tool wraps `xcrun simctl`) and Node.js.

## Development

```bash
git clone https://github.com/kud/sim-crafter-cli.git
cd sim-crafter-cli
npm install
./index.js list
```
