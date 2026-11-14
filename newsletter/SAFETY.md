# Publication safety

The newsletter is public and indexed. Every edition passes two gates: the
editor's judgement before it is marked `Ready`, and the deterministic checks
the publication workflow runs before anything is committed. This file states
both. Its URL and pattern rules mirror the validator; change them together.

## The rule

**Every published claim has public provenance, and anything whose public
status is uncertain is left out.** Material that is not public may help notice
that a subject exists; the item is then rebuilt from public sources only, or
dropped.

## Never published

- Information that is internal, confidential or not clearly public, about any
  organisation, its people or its projects.
- Content from private correspondence or subscriber-only mail that cannot be
  sourced from a public page.
- Personal data: addresses, phone numbers, email addresses, account
  identifiers, private documents, and health, financial or other sensitive
  information about anyone who is not a public figure acting publicly.
- Private annotations, notes, tags, highlights, collection or folder names, or
  any other metadata from a reading tool or bookmark manager.
- Secrets of any kind: credentials, tokens, keys, internal hostnames.
- A URL that is authenticated, signed, tokenised or otherwise private.

When in doubt, leave it out. A missing item costs nothing; a leaked one cannot
be taken back.

## Source URLs

Every source URL must:

- use `https://`;
- carry no credentials (`user:password@host`);
- carry no access or signature parameters: `token`, `sig`, `signature`,
  `key`, `apikey`, `access_token`, `auth`, `session`, `expires`, and
  any `X-Amz-*` or `X-Goog-*` parameter;
- point at a public host: no `localhost`, IP literals, or hosts ending in
  `.local`, `.internal` or `.corp`;
- not point at a host that only serves private or signed-in content: bookmark
  managers' app pages, webmail, document and file-sharing services (Google
  Docs and Drive, Dropbox shared links, cloud-storage share links), Notion,
  task managers, chat tools, issue trackers on private instances, design
  files, and preview deployments.

Tracking parameters (`utm_*`, `fbclid`, `gclid`) are stripped before
comparison; leave them out in the first place.

Paywalled publications are fine to cite when the article is publicly
reachable and its key facts are stated in the item; prefer an open source for
the same fact when one exists.

## Text

The validator also rejects an edition whose text contains:

- email addresses or phone numbers;
- IBAN-like account numbers;
- strings shaped like API keys or tokens (`sk-…`, `ghp_…`, `xoxb-…`,
  `AKIA…`, long hexadecimal or base64 runs);
- Notion mentions of pages or people.

## Paths

The publication workflow may only write under `content/newsletter/`. A sync
that would touch any other path fails without committing.

## When a check fails

The edition is not published. Its Notion row is set to `Failed` with a short
error that names the rule, never the offending secret. Fix the edition in
Notion and set it back to `Ready`.
