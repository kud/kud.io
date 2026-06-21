---
title: "modern-cobalt2-vscode"
description: "🎨 A modern take on Cobalt2 for VS Code — deep navy with Palenight syntax colours"
---

## Features

- **Deep Navy Palette** — rich `#062335` background tones that reduce eye strain during long sessions
- **Golden Accents** — warm highlights on keywords and UI chrome that stay vivid without being harsh
- **Palenight-derived Syntax** — softer, desaturated token colours borrowed from Palenight for comfortable extended reading
- **Full UI Coverage** — activity bar, sidebar, status bar, panels, and terminal all share a coherent dark theme
- **Single Focused Variant** — one well-tuned `vs-dark` theme rather than a sprawling palette of half-finished alternatives
- **Drop-in Replacement** — named _Modern Cobalt2_ for straightforward discovery by existing Cobalt2 users

![Modern Cobalt2 screenshot](https://raw.githubusercontent.com/kud/modern-cobalt2-vscode/HEAD/images/screenshot.png)

## Install

**Marketplace** — open VS Code, press `Cmd+Shift+X`, search **Modern Cobalt2**, and click Install.

**CLI**

```sh
code --install-extension kud.modern-cobalt2-vscode
```

## Usage

After installing, open the Command Palette (`Cmd+Shift+P`) and run **Preferences: Color Theme**, then select **Modern Cobalt2**.

## Development

```sh
git clone https://github.com/kud/modern-cobalt2-vscode.git
cd modern-cobalt2-vscode
npm install
```

Press `F5` in VS Code to open an Extension Development Host with the theme loaded. Edit `themes/cobalt2.json` and the preview updates on save.

```sh
npm run package      # build .vsix into build/
npm run install-ext  # package and install locally
```
