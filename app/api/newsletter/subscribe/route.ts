// Step one of the double opt-in: take an address and a language, mail a signed
// confirm link, store nothing. Nobody is subscribed until the link is clicked
// (../confirm), so a typo or someone else's address costs one email, not a
// subscription.
//
// Accepts JSON (the page's script) or a plain form post (no JS), and answers
// each in kind: JSON gets JSON, a form gets a 303 back to /newsletter. The
// answer is the same whether or not the address is already subscribed; the
// route cannot tell, and would not say.

import {
  SITE_URL,
  buildConfirmEmail,
  emailConfig,
  langOf,
  normaliseEmail,
  providerFromEnv,
  signConfirmToken,
} from "@/lib/newsletter/notify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// A field real readers never see. Bots that fill every input fill this one.
const HONEYPOT = "website"

type Outcome = "pending" | "invalid" | "unavailable" | "failed"

const STATUS: Record<Outcome, number> = { pending: 202, invalid: 400, unavailable: 503, failed: 502 }

const readBody = async (request: Request) => {
  const type = request.headers.get("content-type") ?? ""
  if (type.includes("application/json")) {
    const json = await request.json().catch(() => ({}))
    return { form: false, fields: (json ?? {}) as Record<string, unknown> }
  }
  const data = await request.formData().catch(() => null)
  return { form: true, fields: data ? Object.fromEntries(data.entries()) : {} }
}

const answer = (form: boolean, outcome: Outcome, lang: string) => {
  if (!form) return Response.json({ status: outcome }, { status: STATUS[outcome] })
  const query = outcome === "pending" ? "subscribed=check" : `subscribed=0&reason=${outcome}`
  return Response.redirect(`${SITE_URL}/newsletter?${query}&lang=${lang}`, 303)
}

export async function POST(request: Request) {
  const { form, fields } = await readBody(request)
  const lang = langOf(fields.lang)

  // Pretend it worked: telling a bot it was caught only teaches it.
  if (typeof fields[HONEYPOT] === "string" && fields[HONEYPOT].trim())
    return answer(form, "pending", lang)

  const config = emailConfig()
  const provider = providerFromEnv()
  if (!config || !provider) return answer(form, "unavailable", lang)

  const email = normaliseEmail(fields.email)
  if (!email) return answer(form, "invalid", lang)

  const token = signConfirmToken(email, lang, config.NEWSLETTER_SIGNING_SECRET)
  // Always the production origin, never the request's Host: a forged Host
  // header must not be able to put its own link in our mail.
  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`
  try {
    await provider.sendTransactional(email, buildConfirmEmail(lang, confirmUrl))
  } catch (error) {
    console.error(`newsletter subscribe: ${(error as Error).message}`)
    return answer(form, "failed", lang)
  }
  return answer(form, "pending", lang)
}
