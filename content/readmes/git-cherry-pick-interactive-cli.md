---
title: "git-cherry-pick-interactive-cli"
description: "A CLI tool that provides an interactive way to cherry-pick commits from a specified branch."
hasDocs: true
---

A CLI tool that provides an interactive way to cherry-pick commits from a specified branch.

[![asciicast](https://asciinema.org/a/lSFWbYVyDRzQLFillzlAX6uX1.svg)](https://asciinema.org/a/lSFWbYVyDRzQLFillzlAX6uX1)

## Installation

1. Ensure you have Node.js installed on your machine. If not, download and install it from [here](https://nodejs.org/).

2. Install the CLI globally using npm:

```bash
npm install -g @kud/git-cherry-pick-interactive-cli
```

## Usage

```bash
git cherry-pick-interactive <branch-name>
```

- Replace `<branch-name>` with the name of the branch you want to cherry-pick commits from.

After executing the command, you will be presented with a list of commits from the specified branch. Select the commits you'd like to cherry-pick using the arrow keys and spacebar. Once your selections are made, press the Enter key to proceed with the cherry-picking process.

## Features

- **Interactive UI**: Easily view and select commits with an intuitive interface.
- **Clear Output**: Each cherry-picked commit is displayed with its hash and message, providing clarity and transparency.
- **Error Handling**: Clear error messages and instructions for better usability.
