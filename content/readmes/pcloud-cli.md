---
title: "pcloud-cli"
description: "☁️ Restore deleted pCloud files and rewind versions from the terminal — list trash, recover"
---

## Features

- **OAuth login** — authenticate once via browser; credentials are stored securely and reused across sessions.
- **File & folder management** — list, stat, copy, move, rename, and delete files and folders from the terminal.
- **Revision history** — inspect every saved revision of a file and revert to any earlier version in one command.
- **Trash recovery** — list deleted files and restore them by file ID.
- **Rewind restore** — browse rewind events for any path and recover a file to an arbitrary destination.
- **Public links** — create, list, and delete public download links for files and folders, with optional expiry and download caps.
- **Interactive browser** — a full-screen terminal file browser for exploring your pCloud drive without memorising IDs.

## Install

```sh
npm install -g @kud/pcloud-cli
```

## Usage

```console
$ pcloud login
$ pcloud whoami
Email:  you@example.com
Plan:   500
Quota:  12.4 GB / 500 GB (2.5% used)

$ pcloud ls /Photos
Type  Name                                    Size        Modified
----------------------------------------------------------------------
dir   2024                                    -           Mon, 01 Jan 2024 ...
file  cover.jpg                               3.2 MB      Tue, 14 May 2024 ...

$ pcloud list-revisions 123456
Revision ID   Size          Modified
----------------------------------------------
98765         3.2 MB        Tue, 14 May 2024 ...
91234         3.1 MB        Mon, 06 May 2024 ...

$ pcloud revert-revision 123456 91234
✓ Done

$ pcloud list-trash
File ID     Name                                    Size        Deleted
----------------------------------------------------------------------
555001      old-report.pdf                          820 KB      2024-11-03 14:22

$ pcloud restore-trash 555001
✓ File 555001 restored successfully.

$ pcloud browse
```

## Development

```sh
git clone https://github.com/kud/pcloud-cli.git
cd pcloud-cli
npm install
npm run dev -- ls /
```

Build compiled output to `dist/`:

```sh
npm run build
```
