// The two messages the newsletter sends: the double opt-in "please confirm",
// and the evening teaser for a published edition. The teaser is the edition's
// intro and its first three stories, then a link to read the rest on the site:
// the edition lives at kud.io, the email only says it is there.
//
// Built from edition.json, never from Notion, so what is mailed is exactly
// what was deployed. Plain HTML, inline styles, no images, no tracking.

import type { EditionJson } from "../derive.ts"
import { longDate, type Lang } from "../sections.ts"
import { SITE_URL } from "./config.ts"
import type { Message } from "./provider.ts"

const TEASER_STORIES = 3

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

// The intro is Markdown with optional inline links. An email teaser reads
// better as plain sentences, and stripping links keeps every URL in the mail
// one we built.
export const plainMarkdown = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\(.)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()

export const editionUrl = (date: string, lang: Lang) =>
  `${SITE_URL}/newsletter/${date}?lang=${lang}`

export const campaignName = (date: string, lang: Lang) => `newsletter-${date}-${lang}`

const COPY = {
  fr: {
    subject: (date: string) => `Ce soir sur kud.io · ${longDate(date, "fr")}`,
    stories: "Au sommaire",
    read: "Lire l’édition complète",
    unsubscribe: "Se désabonner",
    why: "Vous recevez ce message parce que vous vous êtes inscrit·e à la newsletter de kud.io.",
    confirmSubject: "Confirmez votre inscription à la newsletter de kud.io",
    confirmBody:
      "Pour recevoir la newsletter de kud.io chaque soir, confirmez votre adresse en suivant ce lien. Il reste valable trois jours.",
    confirmButton: "Confirmer mon inscription",
    confirmIgnore: "Si vous n’avez rien demandé, ignorez ce message : sans clic, rien ne se passe.",
  },
  en: {
    subject: (date: string) => `Tonight on kud.io · ${longDate(date, "en")}`,
    stories: "In this edition",
    read: "Read the full edition",
    unsubscribe: "Unsubscribe",
    why: "You are receiving this because you signed up to the kud.io newsletter.",
    confirmSubject: "Confirm your kud.io newsletter subscription",
    confirmBody:
      "To get the kud.io newsletter every evening, confirm your address with this link. It stays valid for three days.",
    confirmButton: "Confirm my subscription",
    confirmIgnore: "If you didn’t ask for this, ignore this message: nothing happens without the click.",
  },
} as const

const storyLine = (item: EditionJson["items"][number], lang: Lang) => {
  const kicker = item.kicker?.[lang]?.trim()
  const title = item.title[lang].trim()
  return kicker && kicker !== title ? { kicker, title } : { kicker: null, title }
}

const shell = (lang: Lang, inner: string) =>
  `<!doctype html><html lang="${lang}"><body style="margin:0;padding:24px;background:#ffffff;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.55"><div style="max-width:560px;margin:0 auto">${inner}</div></body></html>`

export const buildTeaser = (
  edition: EditionJson,
  lang: Lang,
  unsubscribeUrl: string,
): Message => {
  const copy = COPY[lang]
  const intro = plainMarkdown(edition.lede[lang] ?? edition.narrative.overview[lang] ?? "")
  const stories = edition.items.slice(0, TEASER_STORIES).map((item) => storyLine(item, lang))
  const url = editionUrl(edition.date, lang)
  const subject = copy.subject(edition.date)

  const text = [
    subject,
    "",
    intro,
    "",
    `${copy.stories}:`,
    ...stories.map((s) => `- ${s.kicker ? `${s.kicker} · ` : ""}${s.title}`),
    "",
    `${copy.read}: ${url}`,
    "",
    "--",
    copy.why,
    `${copy.unsubscribe}: ${unsubscribeUrl}`,
  ].join("\n")

  const html = shell(
    lang,
    [
      `<p style="margin:0 0 4px;font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#666">${escapeHtml(longDate(edition.date, lang))}</p>`,
      intro ? `<p style="margin:0 0 20px">${escapeHtml(intro)}</p>` : "",
      `<p style="margin:0 0 8px;font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#666">${copy.stories}</p>`,
      `<ul style="margin:0 0 24px;padding-left:20px">${stories
        .map(
          (s) =>
            `<li style="margin:0 0 6px">${s.kicker ? `<strong style="font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;letter-spacing:.04em">${escapeHtml(s.kicker)}</strong> · ` : ""}${escapeHtml(s.title)}</li>`,
        )
        .join("")}</ul>`,
      `<p style="margin:0 0 32px"><a href="${escapeHtml(url)}" style="color:#1a1a1a;font-weight:bold">${copy.read} →</a></p>`,
      `<p style="margin:0;font-family:-apple-system,'Segoe UI',sans-serif;font-size:12px;color:#777">${escapeHtml(copy.why)} <a href="${unsubscribeUrl}" style="color:#777">${copy.unsubscribe}</a></p>`,
    ].join(""),
  )

  return { subject, html, text }
}

export const buildConfirmEmail = (lang: Lang, confirmUrl: string): Message => {
  const copy = COPY[lang]
  const text = [copy.confirmBody, "", confirmUrl, "", copy.confirmIgnore].join("\n")
  const html = shell(
    lang,
    [
      `<p style="margin:0 0 20px">${escapeHtml(copy.confirmBody)}</p>`,
      `<p style="margin:0 0 24px"><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:10px 16px;border:2px solid #1a1a1a;color:#1a1a1a;text-decoration:none;font-weight:bold">${copy.confirmButton}</a></p>`,
      `<p style="margin:0;font-size:14px;color:#666">${escapeHtml(copy.confirmIgnore)}</p>`,
    ].join(""),
  )
  return { subject: copy.confirmSubject, html, text }
}
