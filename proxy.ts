import { NextResponse, type NextRequest } from "next/server"
import { LANG_COOKIE, parseLang, resolveLang } from "@/lib/newsletter/language"
import { proxyRoute } from "@/lib/newsletter/proxy-route"

// The newsletter's language lives in the query (?lang=en) and in the reader's
// remembered choice, else in the browser's language or the country, yet
// every edition is a static page. This keeps both true:
// an English request is rewritten onto the prerendered English twin under
// /newsletter/en/, so the page, its lang, its metadata and its share card are
// all English before anything paints. French is the plain route, served when
// the reader resolves to French. An explicit
// ?lang is remembered in a cookie. Scoped to the newsletter by the matcher.
export const proxy = (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl

  const query = parseLang(searchParams.get("lang"))
  const cookie = request.cookies.get(LANG_COOKIE)?.value ?? null
  const lang = resolveLang({
    query,
    cookie,
    acceptLanguage: request.headers.get("accept-language"),
    country: request.headers.get("x-vercel-ip-country"),
  })
  const route = proxyRoute(pathname, lang)

  // The English tree and the Markdown routes are implementation details: send
  // direct visits to the public address, so one edition has one URL per
  // language (and one .md URL per language).
  if ("redirect" in route) {
    const url = request.nextUrl.clone()
    url.pathname = route.redirect
    url.searchParams.set("lang", route.lang)
    return NextResponse.redirect(url, 308)
  }

  let response = NextResponse.next()
  if ("rewrite" in route) {
    const url = request.nextUrl.clone()
    url.pathname = route.rewrite
    response = NextResponse.rewrite(url)
  }
  if (query && query !== cookie)
    response.cookies.set(LANG_COOKIE, query, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    })
  return response
}

export const config = {
  matcher: [
    "/newsletter",
    "/newsletter/editions",
    "/newsletter/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})",
    "/newsletter/:year(\\d{4})/:month(\\d{2})/:markdown(\\d{2}\\.md)",
    "/newsletter/md/:path*",
    "/newsletter/en",
    "/newsletter/en/:path*",
  ],
}
