---
title: "november-vscode"
description: "🌙 Dark VS Code theme with warm amber accents — calm, focused and easy on the eyes"
---

<img src="https://raw.githubusercontent.com/kud/november-vscode/main/images/icon.png" alt="November icon" width="128" />

# November

> A dark VS Code theme with warm amber accents — calm, focused, and easy on the eyes.

![Version](https://img.shields.io/visual-studio-marketplace/v/kud.november-vscode?style=flat-square&color=ed7249&labelColor=21222c)
![Installs](https://img.shields.io/visual-studio-marketplace/i/kud.november-vscode?style=flat-square&color=ed7249&labelColor=21222c)
![Rating](https://img.shields.io/visual-studio-marketplace/r/kud.november-vscode?style=flat-square&color=ed7249&labelColor=21222c)

![November theme screenshot](https://raw.githubusercontent.com/kud/november-vscode/main/images/screenshot.png)

---

## Palette

| Role       | Colour                                                                       | Hex       |
| ---------- | ---------------------------------------------------------------------------- | --------- |
| Background | ![#21222c](https://img.shields.io/badge/-%2321222c-21222c?style=flat-square) | `#21222c` |
| Selection  | ![#30364a](https://img.shields.io/badge/-%2330364a-30364a?style=flat-square) | `#30364a` |
| Borders    | ![#272a38](https://img.shields.io/badge/-%23272a38-272a38?style=flat-square) | `#272a38` |
| Accent     | ![#ed7249](https://img.shields.io/badge/-%23ed7249-ed7249?style=flat-square) | `#ed7249` |
| Foreground | ![#c8d5e0](https://img.shields.io/badge/-%23c8d5e0-c8d5e0?style=flat-square) | `#c8d5e0` |
| Muted      | ![#b8c5d0](https://img.shields.io/badge/-%23b8c5d0-b8c5d0?style=flat-square) | `#b8c5d0` |

---

## Installation

**Via Marketplace**

1. Open VS Code
2. `Cmd+Shift+X` → search **November**
3. Install → `Cmd+Shift+P` → **Preferences: Color Theme** → **November**

**Via CLI**

```sh
code --install-extension kud.november-vscode
```

---

## Recommended Settings

```json
{
  "workbench.colorTheme": "November",
  "editor.fontFamily": "'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.cursorBlinking": "smooth"
}
```

---

## Development

```sh
# Install tooling
npm install

Hello!

# Preview — symlink the repo into your VS Code extensions folder, then reload the window
ln -s "$(pwd)" ~/.vscode/extensions/november-vscode

# Package a .vsix for local testing
npm run package

# Check what will be bundled
npm run ls
```

### Publishing

```sh
# Bump version, commit, tag, and push
npm run release:patch   # bumps patch (x.x.N)
npm run release:minor   # bumps minor (x.N.0)
npm run release:major   # bumps major (N.0.0)

# Package and open the marketplace upload page
npm run marketplace
```

---

## License

MIT © [kud](https://github.com/kud)
