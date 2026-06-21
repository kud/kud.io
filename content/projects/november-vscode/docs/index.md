---
title: "november-vscode"
description: "🌙 Dark VS Code theme with warm amber accents — calm, focused and easy on the eyes"
---

## Features

- **Warm amber accents** — a signature amber palette that keeps highlights visible without eye strain
- **Deep slate background** — a rich, near-neutral dark base that reduces glare during long sessions
- **Single focused variant** — one well-tuned `vs-dark` theme rather than a sprawling set of half-finished alternatives
- **Consistent syntax** — carefully mapped token colours across JavaScript, TypeScript, HTML, CSS, and more
- **Soft UI chrome** — activity bar, sidebar, and panel tones chosen to recede and let code take centre stage

![November theme screenshot](https://raw.githubusercontent.com/kud/november-vscode/HEAD/images/screenshot.png)

## Install

**Via Marketplace** — open the Extensions view (`Cmd+Shift+X`), search **November**, and click Install.

**Via CLI**

```sh
code --install-extension kud.november-vscode
```

## Usage

After installing, open the Command Palette (`Cmd+Shift+P`), run **Preferences: Color Theme**, and select **November**.

## Development

```sh
git clone https://github.com/kud/november-vscode.git
cd november-vscode
npm install
```

Edit `themes/november.json` to adjust colours. Press `F5` in VS Code to open an Extension Development Host and preview changes live.

| Script                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run package`       | Build a `.vsix` package into `build/`       |
| `npm run install-ext`   | Package and install locally                 |
| `npm run release:patch` | Bump patch version, tag, and push           |
| `npm run marketplace`   | Open the VS Code Marketplace publisher page |
