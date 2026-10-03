---
title: "mcp-opencode"
description: "🔮 Query any model configured in opencode from Claude — zero API keys, auto-starts the server"
---

## Features

- **Zero API key** — routes prompts through a locally running opencode server, so no provider credentials are needed in your AI client.
- **Multi-model support** — any model configured in opencode is available; query GPT-4.1, Claude, Gemini, or any other supported provider.
- **Model filtering** — restrict or block models via `MCP_OPENCODE_MODEL_ALLOW` and `MCP_OPENCODE_MODEL_BLOCK` environment variables using glob-style patterns.
- **Talk to a live session** — `list_sessions`, `send` and `read` let your assistant hold a conversation with a running opencode session, such as the one open in your TUI, and the exchange shows up there live.
- **Headless jobs** — `start_instance`, `task`, `wait`, `list_instances` and `stop_instance` run work on a private opencode server per job, with guard rails (no git push, no credentials, no permission prompts) and an `opencode attach` command to watch it live.
- **Auto-start** — if opencode is not already listening on the configured port (default 4096), the server spawns `opencode serve` on that port in the background.
- **Session isolation** — each `query` call creates and destroys its own opencode session, so one-off questions leave nothing behind.
- **Works everywhere** — compatible with Claude Desktop, Claude Code, Cursor, Windsurf, VSCode, and any MCP-capable client.

## Install

```sh
npm install -g @kud/mcp-opencode
```

Requires [opencode](https://opencode.ai) installed with at least one provider configured, and Node.js ≥ 20.

## Usage

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "opencode": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-opencode"]
    }
  }
}
```

To restrict which models are available, pass environment variables:

```json
{
  "mcpServers": {
    "opencode": {
      "command": "npx",
      "args": ["-y", "@kud/mcp-opencode"],
      "env": {
        "MCP_OPENCODE_MODEL_ALLOW": "github-copilot/*",
        "MCP_OPENCODE_MODEL_BLOCK": "github-copilot/gpt-4o-mini"
      }
    }
  }
}
```

### Talking to a live opencode session

A plain `opencode` opens no port, so the MCP can't see it. Give each window a port and the MCP finds it on its own (it looks for listening opencode processes with `lsof`), so several windows work at once.

**1. Start opencode with a port.** Any free one from 4097 up; 4096 is kept for the MCP's own background server, which `query` uses, so its throwaway sessions never land in your windows.

```sh
opencode --port 4097
```

To stop thinking about ports, add this to your `~/.zshrc` or `~/.bashrc`. `oc` then picks the next free port for every window, and an explicit `--port` still wins:

```sh
oc() {
  case " $* " in *" --port "*|*" --port="*) opencode "$@"; return ;; esac
  local port
  for port in $(seq 4097 4196); do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 || {
      opencode --port "$port" --hostname 127.0.0.1 "$@"
      return
    }
  done
  opencode "$@"
}
```

**2. Say something in the window.** opencode only creates a session once you send the first message.

**3. Ask your assistant to talk to it.** For example: _"list my opencode sessions and ask the one in my-project what it thinks of this plan"_. It calls `list_sessions` to find the session, `send` to talk to it, and `read` to catch up on its history. Messages appear live in that window, and you can reply there yourself.

If the same project is open in two windows, `send` goes to the lowest port and says so. Pass `port` to choose.

### Running headless jobs

For work you want done in the background rather than in a window you are watching, ask your assistant to start an instance and hand it a task. For example: _"start an opencode instance in ~/Projects/my-app, have it add a health-check endpoint, and tell me what changed"_. It calls:

1. `start_instance({ directory })` → `{ port, url }`: a private `opencode serve` on a free port, separate from your windows and from 4096.
2. `task({ port, prompt })` → `{ session_id, port, attach }`: returns at once while the job runs.
3. `wait({ port, session_id })` → status, the last assistant text and the files changed. Call it again if it comes back `busy`.
4. `stop_instance({ port })` when done. Idle instances are reaped after `MCP_OPENCODE_INSTANCE_TTL`, and the MCP stops its own instances when it exits.

**Guard rails.** Nobody is there to answer a permission prompt, so a task's session never gets one: reading, editing and shell commands are allowed, while `git push`, `git remote`, `gh`, `npm publish`, `git reset --hard`, web fetches, questions and anything outside the directory are denied. The server itself runs with no git credentials (`GIT_TERMINAL_PROMPT=0`, `GIT_SSH_COMMAND=false`, an empty `credential.helper`), without `GH_TOKEN`/`GITHUB_TOKEN`, and with its model pinned to `MCP_OPENCODE_MODEL`.

**Sandboxing (opt-in OS sandbox).** Set `MCP_OPENCODE_SANDBOX=srt` to wrap each instance's `opencode serve` in [srt](https://www.npmjs.com/package/@anthropic-ai/sandbox-runtime) (`npm i -g @anthropic-ai/sandbox-runtime`), enforced by the OS (macOS `sandbox-exec`, Linux `bubblewrap`) rather than by opencode's own permissions. Off by default; when the variable is unset everything behaves exactly as before. Any other non-empty value is refused with an error listing the supported values, and if `srt` is not on `PATH` the instance fails to start rather than running unsandboxed.

The server generates an srt settings file per instance (kept in a temp dir under the state dir, removed on `stop_instance`) and passes it as `srt --settings <file> opencode serve …` — always explicit, so a stray `~/.srt-settings.json` can never decide the policy. The generated file allows writes only to the instance directory (realpath), its git dir(s) (both `--git-common-dir` and `--git-dir`, so worktrees work), opencode's own data/config/cache/state dirs (XDG-aware, so provider auth keeps working) and the temp dir; denies reads of credential paths (`~/.ssh`, `~/.aws`, `~/.config/gh`, `~/.gnupg`, `~/.netrc`, `~/.npmrc`, `**/.env`, `**/.env.*`, `~/Library/Keychains`, `~/.config/gcloud`, `~/.kube`, `~/.docker/config.json`); and allows only these network destinations plus local binding for the server's own port: `opencode.ai`, `*.opencode.ai`, `models.dev`, `api.githubcopilot.com`, `github.com`, `*.github.com`, `api.github.com`, `registry.npmjs.org`, `localhost`, `127.0.0.1`.

Sandboxed instances also get extra `bash` denies merged into their opencode permission config (session ruleset and `OPENCODE_CONFIG_CONTENT` alike): `rm -rf*`, `sudo *`, `curl *|*` and `wget *|*`. These are `deny`, never `ask` — a headless session cannot answer and would hang — and they are heuristic glob matches, a second layer behind the OS sandbox, not a guarantee. The `opencode.ai` / `*.opencode.ai` / `models.dev` / `api.githubcopilot.com` entries were verified against the installed opencode 1.18.34 binary's strings (Zen API, model registry, Copilot provider); the rest are assumed useful for public clones and npm installs. Non-existent `allowWrite` entries are dropped when the file is written, so a missing opencode dir cannot break the wrap on any platform.

This is defence in depth, not a guarantee: it raises the cost of escape and of credential or network misuse, but a determined agent inside the sandbox still has the instance directory, git, and whatever the allowlist permits. Combine it with the guard rails above and review what jobs do.

**Model fallback.** A job tries `[its model, ...MCP_OPENCODE_MODEL_FALLBACK]` once each, in order. When the session stays in `retry` for `MCP_OPENCODE_RETRY_TIMEOUT_SECONDS` (default 90) or its reply ends in a provider error (`APIError`, `ProviderAuthError`, model not found), the watchdog aborts it and re-prompts the same session on the next model, so history and worktree edits carry over. When the list is exhausted the job settles as `error`. `wait` and `list_instances` report the current `model` and the `fallbacks` taken (`{ from, to, reason, at }`), and `wait` reports `retry` as its own status.

**Watching or stepping in.** Paste the `attach` command from `task` into a terminal:

```sh
opencode attach http://127.0.0.1:53817 --session ses_…
```

#### Instance registry

Instances are recorded in `~/.local/state/mcp-opencode/instances.json` (or `$MCP_OPENCODE_STATE_DIR/instances.json`). Other tools may read it directly; this shape is a stable contract:

```jsonc
[
  {
    "runtime": "opencode", // always "opencode" for now
    "sandbox": "srt", // "srt" when OS-sandboxed, else null
    "port": 53817, // where the server listens, on 127.0.0.1
    "pid": 41234, // the opencode serve process (or the srt wrapper, when sandboxed)
    "mcpPid": 41200, // the mcp-opencode process that started it
    "directory": "/Users/me/Projects/my-app",
    "startedAt": "2026-10-02T12:04:34.453Z",
    // one entry per task, appended when task starts it
    "sessions": [
      {
        "id": "ses_…",
        "title": "add health check",
        "model": "github-copilot/gpt-4.1",
        "startedAt": "2026-10-02T12:04:35.021Z",
        // model switches so far, oldest first; empty until one happens
        "fallbacks": [
          {
            "from": "github-copilot/gpt-4.1",
            "to": "github-copilot/gpt-5",
            "reason": "retry timeout after 90s (attempt 3: rate limited)",
            "at": "2026-10-02T12:06:05.111Z",
          },
        ],
      },
    ],
  },
]
```

Live state (busy or idle, last activity) is deliberately not in the file: read it from the server at `http://127.0.0.1:<port>`. A sandboxed row also carries an internal `sandboxSettingsDir` with the generated srt settings file; it is cleaned up on stop and is not part of the contract.

### Environment variables

| Variable                             | Default                       | Purpose                                                                                                                                                                                                               |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MCP_OPENCODE_URL`                   | `http://127.0.0.1:4096`       | Pin one opencode server instead of discovering windows (and the server `query` spawns if nothing listens on its port)                                                                                                 |
| `MCP_OPENCODE_SEND_TIMEOUT`          | `600`                         | Seconds `send` waits for a reply before handing back and letting you `read` it later                                                                                                                                  |
| `MCP_OPENCODE_MODEL`                 | `github-copilot/gpt-4.1`      | Model `query` uses when none is passed                                                                                                                                                                                |
| `MCP_OPENCODE_MODEL_ALLOW`           | all                           | Comma-separated models or `provider/*` patterns `query` may use                                                                                                                                                       |
| `MCP_OPENCODE_MODEL_BLOCK`           | none                          | Comma-separated models or patterns to block. Filters apply to `query`, `list_models` and a `model` passed to `send`; without one, `send` uses the session's own model                                                 |
| `MCP_OPENCODE_MODEL_FALLBACK`        | none                          | Ordered, comma-separated fallback models (`provider/model`) a headless job tries in order after its chosen model when that model stalls or fails. Filtered by the allow/block filters; disallowed entries are dropped |
| `MCP_OPENCODE_RETRY_TIMEOUT_SECONDS` | `90`                          | Seconds a job's session may stay continuously in `retry` before the watchdog switches it to the next fallback model                                                                                                   |
| `MCP_OPENCODE_INSTANCE_TTL`          | `1800`                        | Seconds every session on an instance may sit idle before the reaper stops it                                                                                                                                          |
| `MCP_OPENCODE_STATE_DIR`             | `~/.local/state/mcp-opencode` | Where the instance registry (`instances.json`) and instance logs live                                                                                                                                                 |
| `MCP_OPENCODE_SANDBOX`               | unset (off)                   | `srt` wraps headless instances in an OS sandbox via `srt` (`npm i -g @anthropic-ai/sandbox-runtime`); any other non-empty value fails `start_instance`                                                                  |
| `MCP_OPENCODE_SANDBOX_SETTINGS`      | generated                     | Path to an srt settings file used as `--settings` verbatim instead of the generated one (must exist; implies `srt`)                                                                                                    |

### Available tools

| Tool             | Description                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`          | Send a prompt to an opencode model. Accepts `prompt` (required) and `model` (optional, default: `github-copilot/gpt-4.1`).                                                                                                                                                                 |
| `list_models`    | List models available through the running opencode server. Accepts an optional `provider` filter (e.g. `anthropic`).                                                                                                                                                                       |
| `list_sessions`  | List sessions across every discovered opencode window, most recent first, with the port each is on. Accepts an optional `directory` filter.                                                                                                                                                |
| `send`           | Send a message to an existing session and return the reply. Accepts `session_id`, `prompt`, and optional `agent`, `model` (allowlist-checked; defaults to the session's own), `port` and `timeout_seconds`. Routes to the window that owns the session. Never creates or deletes sessions. |
| `read`           | Read a session's recent messages as a condensed transcript. Accepts `session_id` and optional `limit` (default 20) and `port`.                                                                                                                                                             |
| `start_instance` | Start a private headless opencode server in `directory`. Returns `{ port, url }`.                                                                                                                                                                                                          |
| `task`           | Start a job on an instance: `port`, `prompt`, optional `model` (allowlist-checked), `agent` (default `build`) and `title`. Tries `[model, ...fallbacks]` in order when a model stalls or fails. Returns `{ session_id, port, attach }` at once.                                            |
| `wait`           | Wait for a job (`port`, `session_id`, `timeout_seconds` up to 570). Returns status (`idle`, `busy`, `retry` or `error`), the current `model`, the `fallbacks` taken so far, last assistant text and changed files (diffed from the job's first prompt).                                    |
| `list_instances` | Reap, then list registered instances with their task sessions' live status, current `model` and `fallbacks`.                                                                                                                                                                               |
| `stop_instance`  | Abort busy sessions, stop the server on `port` and confirm the port has closed.                                                                                                                                                                                                            |

## Development

```sh
git clone https://github.com/kud/mcp-opencode.git
cd mcp-opencode
npm install
npm run build
npm test
```

Use the local `.mcp.json` to connect Claude Code to your dev build, or `npm run inspect` to open the MCP Inspector against the compiled output.

| Script            | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Run from source via `tsx`                   |
| `npm run build`   | Compile TypeScript to `dist/`               |
| `npm test`        | Run the Vitest test suite                   |
| `npm run inspect` | Open MCP Inspector against the built server |
