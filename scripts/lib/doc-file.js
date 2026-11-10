// Every synced doc must build: fumadocs-mdx rejects a page whose frontmatter has
// no string `title`, and one bad page in one repo used to fail the whole site
// build. Each doc file passes through prepareDoc before it is written: a missing
// title is derived (first `# ` heading, else the filename), and anything that
// still cannot build is skipped with a reason, never written.
import { compile } from "@mdx-js/mdx"
import { parse, stringify } from "yaml"

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/
const H1 = /^#[ \t]+(.+?)[ \t#]*$/
const FENCE = /^\s*(```|~~~)/

// The first `# ` heading outside a code fence (a shell comment is not a title).
const firstHeading = (body) => {
  let fenced = false
  for (const line of body.split("\n")) {
    if (FENCE.test(line)) fenced = !fenced
    else if (!fenced) {
      const match = line.match(H1)
      if (match) return { line, title: match[1] }
    }
  }
  return null
}

const titleFromFilename = (relPath) => {
  const stem = relPath
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
  return stem.charAt(0).toUpperCase() + stem.slice(1)
}

const splitFrontmatter = (text) => {
  const match = text.match(FRONTMATTER)
  if (!match) return { data: {}, body: text }
  const data = parse(match[1]) ?? {}
  if (typeof data !== "object" || Array.isArray(data))
    throw new Error("frontmatter is not a mapping")
  return { data, body: text.slice(match[0].length) }
}

// Returns { text, note } to write (note set when the title was derived), or
// { skip } with the reason the file cannot be published.
const prepareDoc = async (relPath, text) => {
  if (relPath.endsWith(".json")) {
    try {
      JSON.parse(text)
      return { text }
    } catch (error) {
      return { skip: `invalid JSON: ${error.message}` }
    }
  }

  let data
  let body
  try {
    ;({ data, body } = splitFrontmatter(text))
  } catch (error) {
    return { skip: `invalid frontmatter: ${error.message}` }
  }

  let note
  if (typeof data.title !== "string" || data.title.trim() === "") {
    // The page renders its title as the H1, so a heading promoted to the
    // title leaves the body; otherwise it would show twice.
    const heading = firstHeading(body)
    const title = heading ? heading.title : titleFromFilename(relPath)
    if (heading)
      body = body.replace(heading.line, "").replace(/^\s*\n/, "")
    data = { ...data, title }
    note = `no frontmatter title, used "${title}"`
    text = `---\n${stringify(data)}---\n\n${body}`
  }

  try {
    await compile(body, { format: relPath.endsWith(".mdx") ? "mdx" : "md" })
  } catch (error) {
    return { skip: `does not compile: ${error.message}` }
  }

  return { text, note }
}

export { prepareDoc, titleFromFilename }
