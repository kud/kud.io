import { listEditionDates, loadEditionMarkdown } from "@/lib/newsletter/content"
import { LANGS, newsletterHref, parseLang } from "@/lib/newsletter/language"
import { editionMarkdown } from "@/lib/newsletter/markdown"

// An edition as Markdown, one static file per language and date, generated at
// build time from the committed <lang>.md. Public at the edition's address
// plus .md (proxy.ts rewrites /newsletter/2026/11/21.md?lang=en here); this
// path itself is internal and redirected.

type Params = { params: Promise<{ lang: string; date: string }> }

export const dynamicParams = false

export const generateStaticParams = async () =>
  (await listEditionDates()).flatMap((date) =>
    LANGS.map((lang) => ({ lang, date })),
  )

export const GET = async (_request: Request, { params }: Params) => {
  const { lang: raw, date } = await params
  const lang = parseLang(raw)
  const markdown = lang ? await loadEditionMarkdown(date, lang) : null
  if (!lang || markdown === null)
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  return new Response(editionMarkdown({ date, lang, markdown }), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Language": lang === "fr" ? "fr" : "en-GB",
      // The page is the canonical; this is its plain-text twin.
      Link: `<https://kud.io${newsletterHref({ date }, lang)}>; rel="canonical"`,
    },
  })
}
