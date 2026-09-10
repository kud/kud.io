---
title: "gandi"
description: "Typed Gandi v5 REST API client — the headless core shared by @kud/gandi-cli and future Gandi surfaces"
---

Typed Gandi v5 REST API client — the headless core shared by `@kud/gandi-cli`, a future `@kud/gandi-ink` browser UI, and potentially an MCP server.

It talks to Gandi's domain, LiveDNS, and token-introspection endpoints and returns plain typed data. It has no CLI, no UI, and no opinion about how you present the result — that's every consumer's own job.

## Features

- **Domains** — list, fetch, availability check, renew, toggle autorenew.
- **LiveDNS records** — list, get, set (replace), add a value to an existing rrset, delete, export the whole zone as a BIND master file.
- **Web redirects** — list (auto-paginated, so a domain with more redirects than a single page never gets silently truncated), add, update, delete.
- **Token introspection** — check what a token can do and when it expires, before you find out the hard way.
- **API key resolution** — `GANDI_API_KEY` env var first, `~/.config/gandi/config.toml` as a fallback.
- **Injectable client** — the same functions wrapped as a `GandiAPI` object, so a consumer can accept `api?: GandiAPI` as a prop and swap in a mock for tests.
- **ESM-only**, fully typed, zero runtime dependencies beyond a TOML parser.

## Install

```sh
npm install @kud/gandi
```

Requires Node >=20.

## Usage

### API key

```ts
import { getApiKey } from "@kud/gandi"

const apiKey = getApiKey()
// throws an Error tagged { kind: "no-token" } if nothing is configured
```

Resolution order: `GANDI_API_KEY` env var, then `~/.config/gandi/config.toml`:

```toml
api_key = "..."
```

### Calling functions directly

Every function takes the API key as its first argument — there's no client to construct.

```ts
import { getApiKey, listDomains, listDnsRecords, addRedirect } from "@kud/gandi"

const apiKey = getApiKey()

const domains = await listDomains(apiKey)

const records = await listDnsRecords(apiKey, "example.com")

await addRedirect(apiKey, "example.com", "www", "https://example.com", "301")
```

### Using the injectable client

`gandiAPI` bundles the same functions into a single object implementing `GandiAPI`. Reach for this shape when a consumer needs to accept the client as a prop — an Ink component, for instance — and substitute a mock in tests.

```ts
import { gandiAPI, type GandiAPI } from "@kud/gandi"

const run = async (api: GandiAPI, apiKey: string) => {
  const domain = await api.getDomain(apiKey, "example.com")
  return domain.status
}

await run(gandiAPI, apiKey)
```

```ts
// in a test
const fakeApi: GandiAPI = {
  ...gandiAPI,
  listDomains: vi.fn().mockResolvedValue([]),
}
```

### Handling auth errors

Errors from expired/invalid tokens and a missing token are both tagged so callers can branch without string-matching messages.

```ts
import { authErrorKind } from "@kud/gandi"

try {
  await listDomains(apiKey)
} catch (error) {
  const kind = authErrorKind(error) // "no-token" | "unauthorized" | null
  if (kind === "unauthorized") {
    // token exists but Gandi rejected it — prompt for a new one
  }
}
```

## API reference

### `src/api.ts` — request functions

Every function's first parameter is `apiKey: string`, omitted below for brevity.

| Function          | Signature                                                                                                                    | Description                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `listDomains`     | `() => Promise<Domain[]>`                                                                                                    | List all domains on the account.                                                                                          |
| `getDomain`       | `(domain: string) => Promise<Domain>`                                                                                        | Fetch a single domain.                                                                                                    |
| `checkDomain`     | `(name: string) => Promise<DomainCheck>`                                                                                     | Check availability and pricing for a domain name.                                                                         |
| `renewDomain`     | `(domain: string, duration: number) => Promise<void>`                                                                        | Renew a domain for `duration` years.                                                                                      |
| `setAutorenew`    | `(domain: string, enabled: boolean) => Promise<void>`                                                                        | Toggle autorenew.                                                                                                         |
| `listRedirects`   | `(domain: string) => Promise<WebRedir[]>`                                                                                    | List all web redirects, paginating until a short page confirms the list is complete.                                      |
| `addRedirect`     | `(domain: string, host: string, url: string, type: string) => Promise<void>`                                                 | Create a web redirect.                                                                                                    |
| `updateRedirect`  | `(domain: string, host: string, patch: RedirectPatch) => Promise<void>`                                                      | Patch an existing redirect.                                                                                               |
| `deleteRedirect`  | `(domain: string, host: string) => Promise<void>`                                                                            | Delete a redirect.                                                                                                        |
| `toRedirectHost`  | `(domain: string, host: string) => string`                                                                                   | Normalise a bare label or FQDN to the host form Gandi's redirect endpoints require. Pure, no network call.                |
| `listDnsRecords`  | `(domain: string) => Promise<DnsRecord[]>`                                                                                   | List all LiveDNS records for a domain.                                                                                    |
| `getDnsRecord`    | `(domain: string, type: string, name: string) => Promise<DnsRecord \| null>`                                                 | Fetch one record, or `null` if it doesn't exist.                                                                          |
| `setDnsRecord`    | `(domain: string, type: string, name: string, values: string[], ttl?: number) => Promise<void>`                              | Replace an rrset's values (and optionally TTL). Default TTL `10800`.                                                      |
| `addDnsValue`     | `(domain: string, type: string, name: string, value: string, ttl?: number) => Promise<{ added: boolean; values: string[] }>` | Append a value to an existing rrset instead of replacing it; no-ops if the value is already present.                      |
| `deleteDnsRecord` | `(domain: string, type: string, name: string) => Promise<void>`                                                              | Delete an rrset.                                                                                                          |
| `exportZone`      | `(domain: string) => Promise<string>`                                                                                        | Export the whole zone as a BIND-format master file (RFC 1035).                                                            |
| `getTokenInfo`    | `() => Promise<TokenInfo>`                                                                                                   | Introspect the API key itself — name, scopes, expiry. Hits `id.gandi.net`, not `api.gandi.net`, and needs no extra scope. |

### `src/config.ts`

| Export      | Signature      | Description                                                                                                                                     |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `getApiKey` | `() => string` | Resolves the API key from `GANDI_API_KEY`, falling back to `~/.config/gandi/config.toml`. Throws a `no-token` auth error if neither is present. |

### `src/errors.ts`

| Export          | Signature                                         | Description                                                                                             |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `authError`     | `(kind: AuthErrorKind, message: string) => Error` | Builds an `Error` tagged with `{ kind }` so callers can branch on failure type without string-matching. |
| `authErrorKind` | `(error: unknown) => AuthErrorKind \| null`       | Extracts the `kind` tag from an unknown thrown value, if present.                                       |
| `AuthErrorKind` | `"no-token" \| "unauthorized"`                    | The two auth failure kinds.                                                                             |

### `src/types.ts`

| Type            | Description                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Domain`        | A domain resource — FQDN, nameservers, autorenew state, status, dates, TLD.                                                                                                                                                                    |
| `DomainCheck`   | Result of an availability check — products, prices, currency.                                                                                                                                                                                  |
| `DnsRecord`     | A LiveDNS rrset — name, type, TTL, values.                                                                                                                                                                                                     |
| `WebRedir`      | A web redirect — host, target URL, type, protocol, override flag.                                                                                                                                                                              |
| `RedirectPatch` | The PATCH body for updating a redirect. Every field optional; an omitted key is left untouched, so `override` absent differs from `override: false`. `host` is deliberately not patchable — Gandi can't move a redirect to a different source. |
| `GandiError`    | Shape of an error response from the Gandi API.                                                                                                                                                                                                 |
| `TokenInfo`     | Result of token introspection — name, scopes, entities, expiry.                                                                                                                                                                                |

### `src/client.ts`

| Export     | Description                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GandiAPI` | Interface with one method per `api.ts` export, typed via `typeof`.                                                                                                                                                                                            |
| `gandiAPI` | An object implementing `GandiAPI` by delegating straight to the `api.ts` functions. Exists so a consumer can accept the client as an injectable `api?: GandiAPI` prop and hand tests a `{ listDomains: vi.fn(), ... }` façade instead of hitting the network. |

## Development

```sh
npm install
npm test          # vitest run
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # tsup → dist/
```

`npm run test:watch`, `npm run lint:fix`, and `npm run build:watch` are also available. CI runs typecheck, lint, test, and build on every push and pull request against `main`.

## Licence

MIT © kud
