// Resend, through its REST API with plain fetch: four endpoints don't earn an
// SDK dependency. Checked against Resend's API reference on 2026-11-14, when
// Audiences had become Segments:
//
//   POST /contacts                                  create, with `segments`
//   POST /contacts/{id or email}/segments/{segment} add an existing contact
//   PATCH /contacts/{id or email}                   clear `unsubscribed`
//   POST /emails                                    transactional
//   GET  /broadcasts?limit=100&after=…              list, items carry `name`
//   POST /broadcasts {segment_id, …, send: true}    create and send at once
//
// Not documented there, so handled defensively rather than assumed:
// - what POST /contacts answers for an address that already exists. Any
//   non-2xx falls through to "add to segment, then resubscribe", which is
//   right whether the contact exists or the create failed for another reason
//   (and if it truly failed, the add fails too and that error surfaces).
// - whether broadcasts carry a List-Unsubscribe header. Resend's broadcast
//   guide says it adds one; the API page is silent. Every message also carries
//   the visible {{{RESEND_UNSUBSCRIBE_URL}}} link, which is the part we control.

import type { Lang } from "../sections.ts"
import { redact } from "../safety.ts"
import type { NewsletterProvider } from "./provider.ts"

const API = "https://api.resend.com"

type Fetch = typeof fetch

export type ResendOptions = {
  apiKey: string
  from: string
  segments: Record<Lang, string>
  fetch?: Fetch
}

// Plain fields, not constructor parameter properties: the sync script imports
// this file through Node's type stripping, which refuses those.
export class ResendError extends Error {
  readonly status: number
  readonly operation: string
  constructor(status: number, operation: string, detail: string) {
    // Resend's error bodies echo the request at most; redact() still runs so
    // an address or a key-shaped string never reaches a log or Notion.
    super(`resend ${operation}: ${status} ${redact(detail, 160)}`)
    this.status = status
    this.operation = operation
  }
}

export const createResendProvider = (options: ResendOptions): NewsletterProvider => {
  const doFetch = options.fetch ?? fetch

  const call = async (operation: string, method: string, path: string, body?: unknown) => {
    const response = await doFetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await response.text()
    if (!response.ok) {
      let detail = text
      try {
        detail = JSON.parse(text)?.message ?? text
      } catch {}
      throw new ResendError(response.status, operation, String(detail))
    }
    return text ? JSON.parse(text) : {}
  }

  return {
    unsubscribePlaceholder: "{{{RESEND_UNSUBSCRIBE_URL}}}",

    async addSubscriber(email, lang) {
      const segment = options.segments[lang]
      try {
        await call("create contact", "POST", "/contacts", {
          email,
          unsubscribed: false,
          segments: [{ id: segment }],
        })
        return
      } catch (error) {
        if (!(error instanceof ResendError) || error.status >= 500) throw error
      }
      const contact = encodeURIComponent(email)
      await call("add to segment", "POST", `/contacts/${contact}/segments/${segment}`)
      // A reader who once unsubscribed and now confirms again has asked, twice,
      // to be back.
      await call("resubscribe", "PATCH", `/contacts/${contact}`, { unsubscribed: false })
    },

    async sendTransactional(to, message) {
      await call("send email", "POST", "/emails", {
        from: options.from,
        to: [to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      })
    },

    async hasCampaign(name) {
      let after: string | undefined
      for (let page = 0; page < 50; page++) {
        const query = `?limit=100${after ? `&after=${encodeURIComponent(after)}` : ""}`
        const list = await call("list broadcasts", "GET", `/broadcasts${query}`)
        const data: Array<{ id: string; name?: string | null }> = list.data ?? []
        if (data.some((b) => b.name === name)) return true
        if (!list.has_more || data.length === 0) return false
        after = data[data.length - 1].id
      }
      // Five thousand broadcasts without an answer: refuse to guess "no".
      throw new Error("resend list broadcasts: too many pages to be sure")
    },

    async sendCampaign(name, lang, message) {
      await call("send broadcast", "POST", "/broadcasts", {
        segment_id: options.segments[lang],
        from: options.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        name,
        send: true,
      })
    },
  }
}
