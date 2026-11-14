// Step two of the double opt-in: the link from the confirm mail. A valid,
// unexpired token adds the reader to their language's list, then sends them
// to /newsletter with the outcome in the query, which the page turns into a
// message.
//
// A GET that changes state, because that is what a link in an email can do.
// Some mail scanners open links before the reader does; for a confirm link
// that only ever subscribes the address it was sent to, that is tolerable,
// and adding the same reader twice is a no-op.

import { SITE_URL, emailConfig, providerFromEnv, verifyConfirmToken } from "@/lib/newsletter/notify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const back = (query: string) => Response.redirect(`${SITE_URL}/newsletter?${query}`, 303)

export async function GET(request: Request) {
  const config = emailConfig()
  const provider = providerFromEnv()
  if (!config || !provider) return back("subscribed=0&reason=unavailable")

  const token = new URL(request.url).searchParams.get("token") ?? ""
  const result = verifyConfirmToken(token, config.NEWSLETTER_SIGNING_SECRET)
  if (!result.ok)
    return back(`subscribed=0&reason=${result.reason === "expired" ? "expired" : "invalid"}`)

  const { email, lang } = result.payload
  try {
    await provider.addSubscriber(email, lang)
  } catch (error) {
    console.error(`newsletter confirm: ${(error as Error).message}`)
    return back(`subscribed=0&reason=failed&lang=${lang}`)
  }
  return back(`subscribed=1&lang=${lang}`)
}
