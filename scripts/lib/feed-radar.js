// The newsletter editor's radar: what the feeds published since the last
// edition, minus anything an edition already linked. Past editions are the
// memory, so nothing has to be written anywhere to avoid repeating a story.

const decodeEntities = (text) =>
  text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")

const stripTags = (html) =>
  decodeEntities(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const firstTag = (block, names) => {
  for (const name of names) {
    const match = block.match(
      new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
    )
    if (match) return match[1]
  }
  return ""
}

const atomLink = (block) => {
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1])
  const pick =
    links.find((attrs) => /rel=["']alternate["']/i.test(attrs)) ??
    links.find((attrs) => !/rel=/i.test(attrs)) ??
    links[0]
  return pick?.match(/href=["']([^"']+)["']/i)?.[1] ?? ""
}

export const parseFeed = (xml) => {
  const isAtom =
    /<feed\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom["']/i.test(xml)
  const blocks = [
    ...xml.matchAll(
      isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi,
    ),
  ].map((m) => m[0])
  return blocks
    .map((block) => {
      const link = isAtom
        ? atomLink(block)
        : stripTags(firstTag(block, ["link", "guid"]))
      const date = stripTags(
        firstTag(
          block,
          isAtom
            ? ["published", "updated"]
            : ["pubDate", "dc:date", "published"],
        ),
      )
      const published = date ? new Date(date) : null
      return {
        title: stripTags(firstTag(block, ["title"])),
        link: link.trim(),
        published:
          published && !Number.isNaN(published.getTime())
            ? published.toISOString()
            : null,
        summary: stripTags(
          firstTag(block, [
            "description",
            "summary",
            "content:encoded",
            "content",
          ]),
        ).slice(0, 400),
      }
    })
    .filter((item) => item.title && item.link)
}

// Tracking parameters and fragments differ between a feed's link and the one
// an edition cites, so both sides are compared in this form.
export const canonicalUrl = (url) => {
  try {
    const parsed = new URL(url)
    parsed.hash = ""
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|xtor|at_|ns_|fbclid|gclid|mc_)/i.test(key))
        parsed.searchParams.delete(key)
    }
    parsed.hostname = parsed.hostname.replace(/^www\./, "")
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return url.trim()
  }
}

// An item without a date is kept: dropping it would hide a feed that simply
// does not date its entries.
export const selectFresh = (items, { since, seen }) =>
  items.filter((item) => {
    if (seen.has(canonicalUrl(item.link))) return false
    if (!since || !item.published) return true
    return new Date(item.published) > new Date(since)
  })

export const editionLinks = (edition) => {
  const links = []
  const visit = (value) => {
    if (typeof value === "string") {
      if (/^https?:\/\//.test(value)) links.push(canonicalUrl(value))
    } else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === "object")
      Object.values(value).forEach(visit)
  }
  visit(edition)
  return links
}
