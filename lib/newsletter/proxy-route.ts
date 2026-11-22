import type { Lang } from "./language.ts"

// Where proxy.ts sends a newsletter request, as a pure function so it can be
// tested without a request. The English tree under /newsletter/en is an
// implementation detail: a direct visit is redirected to the public address
// (the proxy adds ?lang=en), and an English reader's request is rewritten onto
// it. French is the plain route.
export const EN_PREFIX = "/newsletter/en"

// An edition's Markdown (lib/newsletter/markdown.ts) is public at the
// edition's address plus .md, the language in the query like the page's; it
// is served from one static route per language and date under this prefix,
// which, like the English tree, is not an address of its own.
export const MD_PREFIX = "/newsletter/md"

const MARKDOWN = /^\/newsletter\/(\d{4})\/(\d{2})\/(\d{2})\.md$/
const MARKDOWN_INTERNAL = /^\/newsletter\/md\/(fr|en)\/(\d{4})-(\d{2})-(\d{2})$/

export type ProxyRoute =
  | { redirect: string; lang: Lang }
  | { rewrite: string }
  | { next: true }

export const proxyRoute = (pathname: string, lang: Lang): ProxyRoute => {
  const markdown = MARKDOWN.exec(pathname)
  if (markdown) {
    const [, year, month, day] = markdown
    return { rewrite: `${MD_PREFIX}/${lang}/${year}-${month}-${day}` }
  }
  if (pathname === MD_PREFIX || pathname.startsWith(`${MD_PREFIX}/`)) {
    const internal = MARKDOWN_INTERNAL.exec(pathname)
    return internal
      ? {
          redirect: `/newsletter/${internal[2]}/${internal[3]}/${internal[4]}.md`,
          lang: internal[1] as Lang,
        }
      : { redirect: "/newsletter/editions", lang }
  }
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`))
    return {
      redirect: `/newsletter${pathname.slice(EN_PREFIX.length)}`,
      lang: "en",
    }
  if (lang === "en")
    return { rewrite: `${EN_PREFIX}${pathname.slice("/newsletter".length)}` }
  return { next: true }
}
