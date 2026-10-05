// Pitch filter for project landings with docs: the landing keeps the README
// intro plus one H2 section per bucket (features / install / usage) and drops
// the rest, so detail lives in /docs. Applied by scripts/sync-content.js only
// when the repo ships docs; kept dependency-free so node --test can run it.
export const LANDING_WORD_BUDGET = 350

const BUCKETS = [
  ["features", "highlights", "why"],
  [
    "install",
    "installation",
    "quick start",
    "quickstart",
    "getting started",
    "setup",
  ],
  ["usage", "example", "examples"],
]
const USAGE_BUCKET = 2
const MIN_BUCKETS = 2

// Sections that stay on the landing whatever else is cut, without counting
// towards MIN_BUCKETS: notices a reader must see before using the project (a
// reverse-engineered API, an unofficial client) and the demo, which is pitch.
const ALWAYS_KEPT = [
  "disclaimer",
  "legal",
  "warning",
  "notice",
  "demo",
  "live demo",
  "screenshots",
]

export const normaliseHeading = (text) =>
  text
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()

const bucketOf = (heading) => {
  const name = normaliseHeading(heading)
  return BUCKETS.findIndex((names) => names.includes(name))
}

const isH2 = (line) => /^##(?!#)\s*\S/.test(line)
const headingText = (line) =>
  line.replace(/^##(?!#)\s*/, "").replace(/\s+$/, "")

const fenceMarker = (line) => {
  const match = line.match(/^\s*(`{3,}|~{3,})/)
  return match ? match[1][0] : null
}

// Split the markdown into the intro (before the first H2) plus one entry per
// H2 section. Fenced code blocks are opaque: a `#` line inside a fence is
// sample output, never a heading.
const splitSections = (markdown) => {
  const lines = markdown.split("\n")
  const starts = []
  let fence = null
  lines.forEach((line, index) => {
    const marker = fenceMarker(line)
    if (marker) {
      if (!fence) fence = marker
      else if (marker === fence) fence = null
      return
    }
    if (!fence && isH2(line)) starts.push(index)
  })
  const intro = lines.slice(0, starts[0] ?? lines.length).join("\n")
  const sections = starts.map((start, i) => ({
    heading: headingText(lines[start]),
    body: lines.slice(start, starts[i + 1] ?? lines.length).join("\n"),
  }))
  return { intro, sections }
}

// A usage section keeps its heading and lead text up to the first H3; the H3
// subsections are the reference detail /docs already covers.
const trimUsageSubsections = (body) => {
  const lines = body.split("\n")
  let fence = null
  for (let i = 1; i < lines.length; i += 1) {
    const marker = fenceMarker(lines[i])
    if (marker) {
      if (!fence) fence = marker
      else if (marker === fence) fence = null
      continue
    }
    if (!fence && /^###(?!#)/.test(lines[i])) {
      return lines.slice(0, i).join("\n").replace(/\s+$/, "")
    }
  }
  return body
}

// Keep the intro, the always-kept sections and the first matching section per
// bucket, in original order. When fewer than two buckets match, the README is returned unchanged:
// a landing reduced to one section reads as half a page, not a pitch.
export const filterLanding = (markdown) => {
  const { intro, sections } = splitSections(markdown)
  const taken = new Set()
  const kept = []
  let bucketsMatched = 0
  for (const section of sections) {
    if (ALWAYS_KEPT.includes(normaliseHeading(section.heading))) {
      kept.push(section.body)
      continue
    }
    const bucket = bucketOf(section.heading)
    if (bucket === -1 || taken.has(bucket)) continue
    taken.add(bucket)
    bucketsMatched += 1
    kept.push(
      bucket === USAGE_BUCKET
        ? trimUsageSubsections(section.body)
        : section.body,
    )
  }
  if (bucketsMatched < MIN_BUCKETS) return markdown
  const body = kept.map((part) => part.replace(/\s+$/, ""))
  return (
    `${intro.replace(/\s+$/, "")}\n\n${body.join("\n\n")}`
      .replace(/^\n+/, "")
      .replace(/\s+$/, "") + "\n"
  )
}

export const countWords = (markdown) =>
  markdown.split(/\s+/).filter(Boolean).length
