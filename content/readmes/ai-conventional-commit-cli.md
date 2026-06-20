---
title: "ai-conventional-commit-cli"
description: "🤖 AI Conventional Commits that learn your repo's style — generate, split and refine messages"
---

Reads your staged diff, learns your repo's commit style, and produces Conventional Commits-compliant messages — one polished commit, or a cleanly split series. Provider-agnostic: OpenCode-routed models, the Claude CLI, or the Anthropic API.

- 🤖 **AI-generated conventional commits** from your staged diff
- ✂️ **Smart commit splitting** into atomic, selectively-staged commits
- 🎨 **Gitmoji styles** — `standard`, `gitmoji`, and `gitmoji-pure`
- 🔒 **Privacy-aware diff filtering** — three tiers control what's sent to the model

## Install

```bash
npm install -g @kud/ai-conventional-commit-cli
```

## Development

```bash
git clone https://github.com/kud/ai-conventional-commit-cli.git
cd ai-conventional-commit-cli
npm install

# Run without building
npm run dev -- generate

# Or build and link globally
npm run build
npm link
ai-conventional-commit --help
```

## License

MIT © [kud](https://github.com/kud) — Made with ❤️
