---
title: "modern-cobalt2-vscode"
description: "🎨 A modern take on Cobalt2 for VS Code — deep navy with Palenight syntax colours"
---

<img src="https://raw.githubusercontent.com/kud/modern-cobalt2-vscode/HEAD/images/icon.png" alt="Modern Cobalt2 icon" width="128" />

> A modern take on the Cobalt2 colour scheme for VS Code — flat deep navy with muted accents and Palenight syntax colours.

![Screenshot](https://raw.githubusercontent.com/kud/modern-cobalt2-vscode/HEAD/images/screenshot.png)

---

## Palette

| Role           | Hex       |
| -------------- | --------- |
| Background     | `#062335` |
| Widget / Input | `#0d2a38` |
| Border         | `#324858` |
| Highlight      | `#1d3546` |
| Main text      | `#d6dadd` |
| Secondary text | `#abb5c7` |

---

## Installation

**Via Marketplace**

1. Open VS Code
2. `Cmd+Shift+X` → search **Modern Cobalt2**
3. Install → `Cmd+Shift+P` → **Preferences: Color Theme** → **Modern Cobalt2**

**Via CLI**

```sh
code --install-extension kud.modern-cobalt2-vscode
```

---

## Recommended Settings

```json
{
  "workbench.colorTheme": "Modern Cobalt2",
  "editor.fontFamily": "'JetBrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.cursorBlinking": "smooth"
}
```

---

## Development

```sh
npm install
npm run install-ext   # package + install locally, then reload VS Code window
npm run marketplace   # package + open marketplace upload page
npm run release:patch # bump version, commit, tag, push
```

---

## License

MIT © [kud](https://github.com/kud)
