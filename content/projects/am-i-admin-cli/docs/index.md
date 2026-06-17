---
title: "am-i-admin-cli"
description: "👑 Check whether you're a macOS admin from the terminal — human-readable or raw boolean output"
---

`am-i-admin` is a simple CLI tool that helps you quickly determine whether or not you're an admin on your macOS computer.

## Installation

To install the CLI tool globally:

```
npm install -g @kud/am-i-admin-cli
```

## Usage

After installing the package, you can use the command:

```
am-i-admin
```

This command will then inform you if you are an admin on your computer or not.

Example:

```shell
✓ xxx, you are an admin on this computer. 👑
```

For a simplified output that returns `true` if you're an admin and `false` otherwise, you can use the `--raw` parameter:

```
am-i-admin --raw
```

## License

This software is licensed under the MIT license. See the package details for more information.
