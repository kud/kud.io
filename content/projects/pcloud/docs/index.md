---
title: "pcloud"
description: "☁️ Typed pCloud API client with OAuth and session auth — shared core for CLI, MCP and TUI surfaces"
---

Typed pCloud API client — shared SDK for CLI, MCP, and extensions.

## Install

```sh
npm install @kud/pcloud
```

Requires Node.js 20 or later.

## Quick start

### Username / password

```typescript
import { PCloudAPI } from "@kud/pcloud"

const api = new PCloudAPI()
await api.authenticate("user@example.com", "password")

const info = await api.userInfo()
```

### OAuth access token

```typescript
import { PCloudAPI } from "@kud/pcloud"

const api = new PCloudAPI()
api.setAccessToken("your-access-token")

const folder = await api.listFolder("/")
```

The default API server is `https://eapi.pcloud.com` (EU endpoint). Pass a second argument to `setAccessToken` to override it.

## API reference

All methods return a typed promise. `result: 0` indicates success; a non-zero `result` with an `error` string indicates failure.

### Authentication

| Method                              | Description                                     |
| ----------------------------------- | ----------------------------------------------- |
| `authenticate(username, password)`  | Password auth — stores session token internally |
| `setAccessToken(token, apiServer?)` | OAuth auth — optionally override the API server |

### Account

| Method       | Description                           |
| ------------ | ------------------------------------- |
| `userInfo()` | Returns account info, quota, and plan |

### Files & folders

| Method                       | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `listFolder(path?)`          | List folder contents (default `"/"`)           |
| `stat(path)`                 | File or folder metadata                        |
| `createFolder(path)`         | Create folder if it does not already exist     |
| `deleteFolder(folderid)`     | Delete folder and all its contents recursively |
| `copyFile(fileid, topath)`   | Copy file to a destination path                |
| `moveFile(fileid, topath)`   | Move file to a destination path                |
| `renameFile(fileid, toname)` | Rename file in place                           |
| `deleteFile(fileid)`         | Permanently delete a file                      |
| `getFileLink(fileid)`        | Get a temporary download link                  |
| `checksumFile(fileid)`       | Returns SHA-256, SHA-1, and MD5 checksums      |

### Revisions

| Method                               | Description                          |
| ------------------------------------ | ------------------------------------ |
| `listRevisions(fileid)`              | List available revisions for a file  |
| `revertRevision(fileid, revisionid)` | Revert a file to a previous revision |

### Sharing

| Method                                     | Description                      |
| ------------------------------------------ | -------------------------------- |
| `listShares()`                             | List active shares               |
| `shareFolder(folderid, mail, permissions)` | Share a folder with another user |
| `acceptShare(sharerequestid)`              | Accept an incoming **request**   |
| `declineShare(sharerequestid)`             | Decline an incoming **request**  |
| `removeShare(shareid)`                     | End an **accepted** share        |

`listShares()` answers with two objects split by direction —
`{ shares: { outgoing, incoming }, requests: { outgoing, incoming } }` — never a
flat array.

Note the ids. An accepted share carries a `shareid` and reports its permissions
as four booleans; a pending request carries a `sharerequestid` and the
permissions bitmask. Both are numbers, so nothing in the type system catches
sending the wrong one — pCloud answers `Please provide 'shareid'.` and the
operation silently does not happen.

### Public links

| Method                                           | Description                       |
| ------------------------------------------------ | --------------------------------- |
| `getFilePublink(fileid, expire?, maxdownloads?)` | Create a public link for a file   |
| `getFolderPublink(folderid, expire?)`            | Create a public link for a folder |
| `listPublinks()`                                 | List all active public links      |
| `deletePublink(code)`                            | Delete a public link by code      |

### Zip

| Method                                         | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| `getZipLink(fileids[], folderids?, filename?)` | Get a download link for a zip archive |

### Trash

| Method                     | Description                   |
| -------------------------- | ----------------------------- |
| `listTrash()`              | List items in the trash       |
| `restoreFromTrash(fileid)` | Restore a file from the trash |

### Rewind

pCloud's web app has a Rewind feature, but **no public API behind it** —
`listrewindevents` returns a 404 under every spelling. `listRewindFiles` and
`restoreFromRewind` exist on the client and will fail; they are kept only so a
caller gets a clear error rather than a missing method.

What the API does expose are the three pieces Rewind is built from: the change
log says what happened and when, the trash holds deletions not yet purged, and
revisions hold prior versions. Replaying the change log backwards over those two
recovery paths reaches the same outcome, and that is what this package ships:

```ts
import { planRewind, applyRewind } from "@kud/pcloud"

const plan = await planRewind(api, new Date("2026-07-30T20:30:00Z"))
// → { actions, since, scanned }  — nothing has happened yet

const outcomes = await applyRewind(api, plan)
// → [{ action, ok, detail }, …]
```

| Function                              | Description                                             |
| ------------------------------------- | ------------------------------------------------------- |
| `planRewind(api, since, pathPrefix?)` | Work out what undoing everything since `since` requires |
| `applyRewind(api, plan)`              | Execute a plan, reporting each action's outcome         |
| `pathResolver(api, entries?)`         | Turn diff metadata into readable paths                  |

Planning is separate from applying so a caller can show the cost first. A
deletion is undone by restoring from trash and a modification by reverting to
the newest revision predating the cutoff; **a creation is reported and never
acted on**, since the only way to undo one is to delete real data — which is
indistinguishable from the accident being repaired.

`pathResolver` seeds itself from the diff stream before falling back to
`listFolderById`, because a deleted folder can no longer be listed — and its
children are exactly the files someone is trying to recover.

### Authentication helpers

| Export                        | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| `sessionLogin(options)`       | Email and password login, including two-factor                |
| `OAuthFlow`                   | Browser OAuth flow, for callers with a registered application |
| `TokenStore`                  | Reads and writes the stored credential                        |
| `resolveAuth(options?)`       | An authenticated client from whatever credential is available |
| `resolveStoredAuth(options?)` | The same, but never starts an interactive flow                |

`resolveStoredAuth` exists because `resolveAuth` will fall through to an OAuth
browser round-trip when the environment carries client credentials — which is
the wrong thing to trigger from a precondition check that only wants to know
whether a credential is already on hand.

### Low-level

| Method                       | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `request<T>(method, params)` | Generic request — maps directly to a pCloud API endpoint |

## Types

All types are exported from the package root.

| Type                     | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `PCloudFile`             | File metadata: `fileid`, `name`, `path`, `size`, `modified` |
| `PCloudFolderItem`       | Item within a folder listing — file or subfolder            |
| `PCloudFolderMetadata`   | Folder metadata including its `contents` array              |
| `PCloudFolderResponse`   | Response wrapper for folder operations                      |
| `PCloudUserInfo`         | Account info: email, quota, usedquota, plan                 |
| `PCloudFileLinkResponse` | Download link: `hosts[]` and `path`                         |
| `PCloudChecksumResponse` | Checksums: `sha256`, `sha1`, `md5`                          |
| `PCloudRevision`         | Single revision entry                                       |
| `PCloudShareItem`        | Share record with permissions and status                    |
| `PCloudPublink`          | Public link with code, expiry, and download count           |
| `PCloudTrashItem`        | Trash entry extending `PCloudFile` with `deletetime`        |
| `PCloudRewindItem`       | Rewind entry with `fileid`, `path`, and `time`              |
| `PCloudResponse<T>`      | Generic response wrapper                                    |
| `PCloudAuthResponse`     | Raw authentication response                                 |

## Licence

MIT
