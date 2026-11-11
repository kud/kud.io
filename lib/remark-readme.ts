// Two passes over repo markdown as kud.io renders it. GitHub keeps both
// things these remove; the site does not want them.

type MdNode = {
  type: string
  value?: string
  url?: string
  alt?: string | null
  children?: MdNode[]
}

// A heading's leading emoji ("🌟 Features") is GitHub decoration; the site's
// headings carry their own mark. Runs before fumadocs reads the headings, so
// the table of contents loses it too.
const LEADING_EMOJI =
  /^(?:[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}️‍⃣])+\s*/u

export const remarkStripHeadingEmoji = () => (tree: MdNode) => {
  const walk = (node: MdNode) => {
    if (node.type === "heading") {
      const first = node.children?.[0]
      if (first?.type === "text" && first.value)
        first.value = first.value.replace(LEADING_EMOJI, "")
      return
    }
    node.children?.forEach(walk)
  }
  walk(tree)
}

const isLogo = (text: string) => /\b(?:icon|logo)\b/i.test(text)

// The banner image a README opens on is the project's cover on kud.io
// (lib/cover.ts), or gives way to the project's own drawing: either way the
// page shows one hero, so the README's copy of it is dropped. Landing READMEs
// only (content/readmes); docs keep every image they have.
export const remarkStripReadmeHero =
  () => (tree: MdNode, file: { path?: string }) => {
    if (!file.path?.includes("/content/readmes/")) return
    const index = (tree.children ?? []).findIndex(
      (node) => node.type !== "yaml" && node.type !== "mdxjsEsm",
    )
    const lead = tree.children?.[index]
    if (!lead) return
    const html =
      lead.type === "html" && /^<img\b[^>]*\/?>\s*$/i.test(lead.value ?? "")
        ? (lead.value ?? "")
        : null
    const only =
      lead.type === "paragraph" && lead.children?.length === 1
        ? lead.children[0]
        : null
    const image =
      only?.type === "image" ? `${only.url ?? ""} ${only.alt ?? ""}` : null
    const text = html ?? image
    if (text === null || isLogo(text)) return
    tree.children?.splice(index, 1)
  }
