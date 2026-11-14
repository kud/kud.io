// Double opt-in links. The confirm URL carries the address and the language,
// signed with NEWSLETTER_SIGNING_SECRET and dated, so the subscribe route keeps
// no state between "please confirm" and the click: a forged or edited token
// fails the signature, an old one fails the expiry, and only someone who can
// read the inbox ever holds a valid one.
//
// Format: base64url(JSON payload) "." base64url(HMAC-SHA256 of that string).
// The payload is not secret (it is the reader's own address, in their own
// mailbox); the signature is what matters.

import { createHmac, timingSafeEqual } from "node:crypto"
import type { Lang } from "../sections.ts"

export const TOKEN_TTL_SECONDS = 72 * 3600

export type ConfirmPayload = { email: string; lang: Lang; exp: number }

export type VerifyResult =
  | { ok: true; payload: ConfirmPayload }
  | { ok: false; reason: "malformed" | "signature" | "expired" }

const b64 = (input: string | Buffer) => Buffer.from(input).toString("base64url")

const mac = (body: string, secret: string) =>
  createHmac("sha256", secret).update(body).digest()

export const signConfirmToken = (
  email: string,
  lang: Lang,
  secret: string,
  now = Date.now(),
  ttlSeconds = TOKEN_TTL_SECONDS,
) => {
  const payload: ConfirmPayload = {
    email,
    lang,
    exp: Math.floor(now / 1000) + ttlSeconds,
  }
  const body = b64(JSON.stringify(payload))
  return `${body}.${b64(mac(body, secret))}`
}

export const verifyConfirmToken = (
  token: string,
  secret: string,
  now = Date.now(),
): VerifyResult => {
  const parts = token.split(".")
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" }
  const [body, signature] = parts
  const given = Buffer.from(signature, "base64url")
  const expected = mac(body, secret)
  // Compare before parsing: nothing about an unsigned payload is trusted,
  // not even whether it is JSON.
  if (given.length !== expected.length || !timingSafeEqual(given, expected))
    return { ok: false, reason: "signature" }
  let payload: ConfirmPayload
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
  } catch {
    return { ok: false, reason: "malformed" }
  }
  if (
    typeof payload?.email !== "string" ||
    (payload.lang !== "fr" && payload.lang !== "en") ||
    typeof payload.exp !== "number"
  )
    return { ok: false, reason: "malformed" }
  if (payload.exp * 1000 < now) return { ok: false, reason: "expired" }
  return { ok: true, payload }
}

// Deliberately plain: one @, something on both sides, a dot in the domain, no
// spaces, at most 254 characters. The provider and the confirm click are the
// real check; this only turns away what is obviously not an address.
export const normaliseEmail = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null
  const email = raw.trim().toLowerCase()
  if (email.length > 254) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export const langOf = (raw: unknown): Lang => (raw === "en" ? "en" : "fr")
