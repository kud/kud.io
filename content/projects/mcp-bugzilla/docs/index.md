---
title: "mcp-bugzilla"
description: "🐞 Search, triage and comment on Firefox/Mozilla bugs from Claude via the Bugzilla REST API"
---

## Features

- **Bug lookup** — fetch any bug by ID or alias, including its full field-change history.
- **Powerful search** — filter by product, component, status, severity, assignee, keywords, or free-text `quicksearch`.
- **Comment threads** — read all comments on a bug, post new ones, and tag comments (e.g. spam, needinfo).
- **Attachment management** — list, upload, and update patches and files; set review flags inline.
- **Write support** — create and update bugs, change status, add CC members, and mark duplicates — all gated behind an API key so read-only use needs no credentials.
- **Product and user discovery** — enumerate products, components, versions, flag types, field definitions, and look up users by email.

## Install

Register the server with your MCP client. For Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-bugzilla": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-bugzilla"],
      "env": {
        "MCP_BUGZILLA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

`MCP_BUGZILLA_API_KEY` is optional — omit it for read-only access. To obtain a key, visit your [Bugzilla API Keys](https://bugzilla.mozilla.org/userprefs.cgi?tab=apikey) preferences page.

The `MCP_BUGZILLA_BASE_URL` environment variable overrides the default endpoint (`https://bugzilla.mozilla.org/rest`) for self-hosted instances.

## Usage

The server exposes 17 tools across six areas. Tools marked with 🔑 require `MCP_BUGZILLA_API_KEY`.

| Tool                  | Area        | Auth | Description                                                |
| --------------------- | ----------- | ---- | ---------------------------------------------------------- |
| `get_bug`             | Bugs        | —    | Fetch a single bug by ID or alias                          |
| `search_bugs`         | Bugs        | —    | Search with filters or full-text `quicksearch`             |
| `create_bug`          | Bugs        | 🔑   | File a new bug                                             |
| `update_bug`          | Bugs        | 🔑   | Update fields, status, keywords, CC, or close as duplicate |
| `get_bug_history`     | Bugs        | —    | Get the field-change history for a bug                     |
| `get_comments`        | Comments    | —    | Get all comments, optionally filtered by date              |
| `create_comment`      | Comments    | 🔑   | Post a comment, optionally with work-time logging          |
| `search_comment_tags` | Comments    | —    | Search available comment tag names                         |
| `update_comment_tags` | Comments    | 🔑   | Add or remove tags on a comment                            |
| `get_attachments`     | Attachments | —    | List attachments for a bug                                 |
| `create_attachment`   | Attachments | 🔑   | Upload a patch or file (base64-encoded)                    |
| `update_attachment`   | Attachments | 🔑   | Rename, mark obsolete, or change flags on an attachment    |
| `get_products`        | Products    | —    | List accessible products                                   |
| `get_product`         | Products    | —    | Get product details including components and versions      |
| `get_user`            | Users       | —    | Look up a user by email or login name                      |
| `get_bug_fields`      | Fields      | —    | List bug fields and their legal values                     |
| `get_flag_types`      | Flags       | —    | List flag types for a product/component                    |

## Development

```sh
git clone https://github.com/kud/mcp-bugzilla.git
cd mcp-bugzilla
npm install
npm run dev
```

| Script                | Description                       |
| --------------------- | --------------------------------- |
| `npm run build`       | Compile TypeScript to `dist/`     |
| `npm run dev`         | Run source directly via `tsx`     |
| `npm test`            | Run the Vitest test suite         |
| `npm run typecheck`   | Type-check without emitting       |
| `npm run inspect:dev` | Open MCP Inspector against source |
