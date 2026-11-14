// Notion rich text → Markdown, shared by the blog sync (sync-notion.js) and the
// newsletter sync (sync-newsletter.js). Lifted out of sync-notion.js unchanged so
// both pipelines escape prose the same way; the comments below are the blog's.

// Escaped so a literal asterisk, bracket or angle in prose can't become syntax.
// Backslash goes first or it would double-escape everything after it.
//
// `<` and `>` stay in the set even though the output is plain Markdown, not
// MDX. They are not an MDX leftover: remark parses a bare `<Layout/>` in prose
// as raw HTML and remark-rehype drops it, so an unescaped one deletes the text
// silently. Escaped, it round-trips — `\<` is a valid CommonMark escape and
// renders as `<`. Verified against the real pipeline, both ways.
export const escapeMarkdown = (text) =>
  text.replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\n/g, "  \n")

// A code span is a literal: nothing inside it is Markdown, so nothing inside it
// CAN be escaped. A backslash there renders as a backslash — which is precisely
// what put `\<Layout/\>` on three published posts. A backtick in the content is
// therefore handled by lengthening the fence, the only mechanism CommonMark
// offers, and the space padding is what stops a leading or trailing backtick
// closing the fence early.
export const codeSpan = (content) => {
  const runs = [...content.matchAll(/`+/g)].map((match) => match[0].length)
  const fence = "`".repeat(Math.max(0, ...runs) + 1)
  const pad =
    content.startsWith("`") || content.endsWith("`") || /^\s|\s$/.test(content)
      ? " "
      : ""
  return `${fence}${pad}${content}${pad}${fence}`
}

export const decorate = (content, annotations) => {
  if (!content.trim()) return content
  let out = content
  if (annotations.code) return codeSpan(content)
  if (annotations.bold) out = `**${out}**`
  if (annotations.italic) out = `_${out}_`
  if (annotations.strikethrough) out = `~~${out}~~`
  return out
}

export const richText = (nodes = []) =>
  nodes
    .map((node) => {
      if (node.type === "equation") return codeSpan(node.equation.expression)
      const raw = node.plain_text ?? ""
      const annotations = node.annotations ?? {}
      const text = decorate(
        annotations.code ? raw : escapeMarkdown(raw),
        annotations,
      )
      const href = node.href ?? node.text?.link?.url
      return href ? `[${text}](${href})` : text
    })
    .join("")

// Plain text of a rich-text array, no Markdown: titles, labels and the safety
// scan read this, never the escaped form.
export const plainText = (nodes = []) =>
  nodes.map((node) => node.plain_text ?? "").join("")

// Every href a rich-text array carries, whether set as a link annotation or as
// the text's own link.
export const hrefsOf = (nodes = []) =>
  nodes.map((node) => node.href ?? node.text?.link?.url).filter(Boolean)
