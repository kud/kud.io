import { listEditionDates, loadEdition } from "@/lib/newsletter/content"
import {
  COPY,
  formatEditionDate,
  LANGS,
  parseLang,
} from "@/lib/newsletter/language"
import { clip, renderCard } from "@/lib/og/card"

// Share card for one edition in one language: the date as the kicker, the
// lead story as the name, the next two subjects under it. Type only, never a
// photo, on the paper ground the newsletter shares with Writing. A route
// handler under /newsletter/og/ rather than an opengraph-image.tsx beside the
// page: the English page is an internal twin the proxy redirects away from, so
// a file-based image there would never be reachable in English.
export const dynamic = "force-static"
export const dynamicParams = false

type Params = { date: string; lang: string }

export const generateStaticParams = async () =>
  (await listEditionDates()).flatMap((date) =>
    LANGS.map((lang) => ({ date, lang })),
  )

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const GET = async (
  _request: Request,
  { params }: { params: Promise<Params> },
) => {
  const { date, lang: raw } = await params
  const lang = parseLang(raw)
  const edition = lang ? await loadEdition(date) : null
  if (!lang || !edition) return new Response("Not found", { status: 404 })

  const [lead, ...rest] = edition.items
  return renderCard({
    ground: "paper",
    kicker: `${COPY[lang].name} · ${capitalise(formatEditionDate(date, lang))}`,
    name: clip(lead?.title[lang] ?? COPY[lang].tagline, 110) ?? "",
    description: clip(
      rest
        .slice(0, 2)
        .map((item) => item.title[lang])
        .join(" · "),
      150,
    ),
    path: "/newsletter",
  })
}
