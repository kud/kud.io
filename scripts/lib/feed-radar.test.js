import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  parseFeed,
  canonicalUrl,
  selectFresh,
  editionLinks,
} from "./feed-radar.js"

const rss = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Grève à la SNCF]]></title><link>https://www.example.fr/greve?utm_source=rss</link>
<pubDate>Sun, 15 Nov 2026 09:00:00 +0100</pubDate><description>&lt;p&gt;Le trafic est perturbé &amp; incertain.&lt;/p&gt;</description></item>
<item><title>Old story</title><link>https://example.fr/old</link><pubDate>Fri, 13 Nov 2026 09:00:00 GMT</pubDate></item>
<item><title>Undated</title><link>https://example.fr/undated</link></item>
</channel></rss>`

const atom = `<feed xmlns="http://www.w3.org/2005/Atom">
<entry><title>Atom entry</title><link rel="alternate" href="https://example.org/a"/><link rel="self" href="https://example.org/a.xml"/>
<published>2026-11-15T07:00:00Z</published><summary>Short.</summary></entry>
</feed>`

describe("parseFeed", () => {
  it("reads RSS items, decoding CDATA, entities and markup", () => {
    const [first] = parseFeed(rss)
    assert.equal(first.title, "Grève à la SNCF")
    assert.equal(first.summary, "Le trafic est perturbé & incertain.")
    assert.equal(first.published, "2026-11-15T08:00:00.000Z")
  })

  it("reads Atom entries and takes the alternate link, not self", () => {
    const [entry] = parseFeed(atom)
    assert.equal(entry.link, "https://example.org/a")
    assert.equal(entry.published, "2026-11-15T07:00:00.000Z")
  })
})

describe("canonicalUrl", () => {
  it("drops tracking parameters, the fragment, www and a trailing slash", () => {
    assert.equal(
      canonicalUrl("https://www.example.fr/greve/?utm_source=rss&id=3#top"),
      "https://example.fr/greve/?id=3",
    )
    assert.equal(
      canonicalUrl("https://www.example.fr/greve/"),
      "https://example.fr/greve",
    )
  })
})

describe("selectFresh", () => {
  const items = parseFeed(rss)

  it("keeps what was published since the last edition, and undated items", () => {
    const fresh = selectFresh(items, {
      since: "2026-11-14T18:00:00Z",
      seen: new Set(),
    })
    assert.deepEqual(
      fresh.map((i) => i.title),
      ["Grève à la SNCF", "Undated"],
    )
  })

  it("drops a link an earlier edition already cited, whatever its tracking parameters", () => {
    const seen = new Set([canonicalUrl("https://example.fr/greve")])
    const fresh = selectFresh(items, { since: "2026-11-14T18:00:00Z", seen })
    assert.deepEqual(
      fresh.map((i) => i.title),
      ["Undated"],
    )
  })
})

describe("editionLinks", () => {
  it("collects every URL an edition holds, at any depth", () => {
    const edition = {
      items: [
        { sources: [{ url: "https://www.example.fr/greve?utm_medium=x" }] },
      ],
      lede: "no link",
    }
    assert.deepEqual(editionLinks(edition), ["https://example.fr/greve"])
  })
})
