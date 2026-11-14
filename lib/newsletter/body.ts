// Splits a derived fr.md / en.md into the lede and one Markdown body per item,
// keyed by its two-digit id. The page renders structure (sections, titles,
// sources) from edition.json and only the prose from here, so the sources
// block at the end of each item is cut: edition.json carries the same list as
// data, and rendering both would show every source twice.

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/
const SECTION = /^##\s+\S/
// "### 01 · Title", with " - " accepted, and an optional {#item-01} anchor.
const ITEM = /^###\s+(\d{2})\s*(?:·|-)\s*.+$/
// "Sources:" (EN) or "Sources :" (FR), bare or in bold.
const SOURCES = /^\s*(?:\*\*|__)?Sources\s?:\s*(?:\*\*|__)?\s*$/i

export type ParsedEditionMarkdown = {
  lede: string
  items: Record<string, string>
}

export const parseEditionMarkdown = (
  markdown: string,
): ParsedEditionMarkdown => {
  const lines = markdown.replace(FRONTMATTER, "").split(/\r?\n/)
  const lede: string[] = []
  const items: Record<string, string[]> = {}
  let current: string[] | null = null
  let inSources = false
  let beforeFirstSection = true

  for (const line of lines) {
    if (/^#\s+\S/.test(line)) continue
    if (SECTION.test(line)) {
      beforeFirstSection = false
      current = null
      continue
    }
    const item = ITEM.exec(line)
    if (item) {
      beforeFirstSection = false
      current = items[item[1]] = []
      inSources = false
      continue
    }
    if (current) {
      if (SOURCES.test(line)) inSources = true
      if (!inSources) current.push(line)
    } else if (beforeFirstSection) lede.push(line)
  }

  return {
    lede: lede.join("\n").trim(),
    items: Object.fromEntries(
      Object.entries(items).map(([id, body]) => [id, body.join("\n").trim()]),
    ),
  }
}
