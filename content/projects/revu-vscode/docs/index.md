---
title: "revu-vscode"
description: "📝 Annotate any line in VS Code, export your review to Claude, Copilot, ChatGPT or opencode"
---

## Features

- **Inline annotations** — select any line or range in the editor and attach a named comment thread directly in the gutter, without leaving VS Code.
- **Persistent storage** — annotations are saved to `.revu.json` in your workspace root and restored automatically on next open.
- **Configurable review prompt** — choose from built-in templates (Code Review, Refactor, Explain) or write a custom prompt that is prepended to every export.
- **Send to Copilot or Claude Code** — export the full annotated review to GitHub Copilot Chat or Claude Code with a single command; the extension opens the chat and pre-fills the prompt.
- **Copy or preview as Markdown** — copy the review to the clipboard, or open a live Markdown preview inside VS Code for a formatted read before sending.
- **Sidebar panel** — browse all annotations grouped by file or in a flat list, with a badge showing the current annotation count.

## Install

Search **revu** in the VS Code Extensions panel, or install from the command line:

```sh
code --install-extension kud.revu-vscode
```

[Open in VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=kud.revu-vscode)

## Usage

1. Select one or more lines in the editor.
2. Press `Cmd+Shift+N` (macOS) / `Ctrl+Shift+N` (Windows/Linux), or right-click and choose **revu: Add Annotation**.
3. Type your annotation in the comment thread that appears, then click **Add Annotation** to confirm.
4. Repeat for as many lines as needed — each annotation is listed in the **revu** sidebar panel.
5. When ready to export, open the sidebar and choose an action from the toolbar:
   - **Send to Chat** (`$(send)`) — pick Copilot or Claude Code; the review is sent directly to the chat input.
   - **Copy to Clipboard** (`$(clippy)`) — copies the full prompt-led Markdown review.
   - **Export as Markdown** (`$(markdown)`) — opens a live Markdown preview inside VS Code.
6. Optionally, click **Edit Review Prompt** (`$(sparkle)`) to switch between Code Review, Refactor, Explain, or a custom prompt.

Annotations persist across sessions via `.revu.json` in your workspace root.

## Development

```sh
git clone https://github.com/kud/revu-vscode.git
cd revu-vscode
npm install
npm run watch
```

Press `F5` in VS Code to open an Extension Development Host with revu loaded.

To build and install locally:

```sh
npm run install-ext
```
