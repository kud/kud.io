import { NextResponse, type NextRequest } from "next/server"
import { LANG_COOKIE, parseLang, resolveLang } from "@/lib/newsletter/language"

// The newsletter's language lives in the query (?lang=en) and in the reader's
// remembered choice, yet every edition is a static page. This keeps both true:
// an English request is rewritten onto the prerendered English twin under
// /newsletter/en/, so the page, its lang, its metadata and its share card are
// all English before anything paints. French is the plain route. An explicit
// ?lang is remembered in a cookie. Scoped to the newsletter by the matcher.
const EN_PREFIX = "/newsletter/en"

export const proxy = (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl

  // The English tree is an implementation detail: send direct visits to the
  // public address, so one edition has one URL per language.
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = `/newsletter${pathname.slice(EN_PREFIX.length)}`
    url.searchParams.set("lang", "en")
    return NextResponse.redirect(url, 308)
  }

  const query = parseLang(searchParams.get("lang"))
  const cookie = request.cookies.get(LANG_COOKIE)?.value ?? null
  const lang = resolveLang({ query, cookie })

  let response = NextResponse.next()
  if (lang === "en") {
    const url = request.nextUrl.clone()
    url.pathname = `${EN_PREFIX}${pathname.slice("/newsletter".length)}`
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
    "/newsletter/archive",
    "/newsletter/:date(\\d{4}-\\d{2}-\\d{2})",
    "/newsletter/en",
    "/newsletter/en/:path*",
  ],
}
