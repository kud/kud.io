import type { Lang } from "./language.ts"

// Where proxy.ts sends a newsletter request, as a pure function so it can be
// tested without a request. The English tree under /newsletter/en is an
// implementation detail: a direct visit is redirected to the public address
// (the proxy adds ?lang=en), and an English reader's request is rewritten onto
// it. French is the plain route.
export const EN_PREFIX = "/newsletter/en"

export type ProxyRoute =
  { redirect: string } | { rewrite: string } | { next: true }

export const proxyRoute = (pathname: string, lang: Lang): ProxyRoute => {
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`))
    return { redirect: `/newsletter${pathname.slice(EN_PREFIX.length)}` }
  if (lang === "en")
    return { rewrite: `${EN_PREFIX}${pathname.slice("/newsletter".length)}` }
  return { next: true }
}
