export { postPath } from "./blog-path"

import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import type { ReactNode } from "react"
import rehypeReact from "rehype-react"
import rehypeShiki from "@shikijs/rehype"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import type { Components } from "hast-util-to-jsx-runtime"

// Posts are plain Markdown, not MDX: Notion cannot emit JSX, so an MDX compiler
// would only add the stray-brace failure mode without buying anything. This file
// is the blog's entire content layer — it deliberately shares nothing with
// source.config.ts, which belongs to /projects and its fumadocs docs pipeline.
const CONTENT_DIR = "content/blog"

export type Post = {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  cover?: string
  updated?: string
  body: string
}

// scripts/sync-notion.js writes each frontmatter value with JSON.stringify, so
// every value round-trips through JSON.parse — no parser library, and a
// malformed line fails loudly here rather than silently yielding a wrong type.
const parseFrontmatter = (raw: string) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n*/)
  if (!match) return { data: {} as Record<string, unknown>, body: raw }

  const data = Object.fromEntries(
    match[1]
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(": ")
        return [
          line.slice(0, separator),
          JSON.parse(line.slice(separator + 2)),
        ] as const
      }),
  )
  return { data, body: raw.slice(match[0].length) }
}

const toPost = (slug: string, raw: string): Post => {
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    cover: data.cover as string | undefined,
    updated: data.updated as string | undefined,
    body,
  }
}

export const getAllPosts = async (): Promise<Post[]> => {
  const files = await readdir(CONTENT_DIR).catch(() => [] as string[])
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) =>
        toPost(
          file.replace(/\.md$/, ""),
          await readFile(join(CONTENT_DIR, file), "utf8"),
        ),
      ),
  )
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export const getPost = async (slug: string): Promise<Post | null> => {
  const raw = await readFile(join(CONTENT_DIR, `${slug}.md`), "utf8").catch(
    () => null,
  )
  return raw ? toPost(slug, raw) : null
}

// ---------------------------------------------------------------------------
// Code highlighting
// ---------------------------------------------------------------------------

// ONE theme, never a light/dark pair. The code card is dark in both page
// themes, by design — so a dual-theme Shiki config has nothing to switch
// between and everything to get wrong: it emits both palettes as custom
// properties and lets whichever selector wins paint light tokens onto the dark
// card. The card palette is a design decision (Iris), reproduced here as a
// TextMate theme so the highlighter and the CSS cannot disagree about it.
const CARD = {
  bg: "#062335",
  txt: "#d6dadd",
  mut: "#7e8fa0",
  cm: "#7e88ac",
  str: "#c3e88d",
  num: "#f78c6c",
  kw: "#c792ea",
  fn: "#82aaff",
  tag: "#ff5572",
  att: "#c49a3c",
  // --c-txt at 62% over --c-bg, resolved to an opaque hex: a TextMate theme has
  // no opacity channel, and punctuation must recede without going transparent.
  pn: "#89949d",
} as const

export const SHIKI_THEME = {
  name: "kud-blog-card",
  type: "dark",
  colors: {
    "editor.background": CARD.bg,
    "editor.foreground": CARD.txt,
  },
  settings: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: CARD.cm, fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "constant.other.symbol", "meta.embedded.assembly"], settings: { foreground: CARD.str } },
    { scope: ["constant.numeric", "constant.language", "constant.character.escape", "keyword.other.unit"], settings: { foreground: CARD.num } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.expression", "variable.language.this", "variable.language.super"], settings: { foreground: CARD.kw } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic", "entity.name.class", "entity.name.type", "support.class"], settings: { foreground: CARD.fn } },
    { scope: ["entity.name.tag", "keyword.other.important", "punctuation.definition.tag"], settings: { foreground: CARD.tag } },
    { scope: ["entity.other.attribute-name", "variable.other.property", "meta.object-literal.key", "support.type.property-name", "variable.other.readwrite.alias"], settings: { foreground: CARD.att } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: CARD.pn } },
    { scope: ["variable", "support.variable", "meta.definition.variable"], settings: { foreground: CARD.txt } },
    // A diff line is carried by its ground, its edge bar and its gutter sign —
    // three signals, none of them colour alone. Tinting the text as well would
    // be a fourth saying the same thing, and the least legible of the four.
    { scope: ["markup.inserted", "markup.deleted", "markup.changed", "meta.diff"], settings: { foreground: CARD.txt } },
  ],
} as const

const DIFF_SIGNS: Record<string, "add" | "del" | "ctx"> = {
  "+": "add",
  "-": "del",
  " ": "ctx",
}

// Shiki marks each line with class="line". The blog selects on data-line
// instead: a CSS module hashes every class it sees, so matching Shiki's own
// class would need a :global() escape hatch and a standing bet that Shiki never
// renames it. An attribute this file stamps costs neither.
//
// Shiki wraps each line but leaves the leading +/-/space inside the first token,
// where it inherits that token's colour and sits in the text flow. Lifting it
// into its own element is what lets CSS give it a fixed 1ch column and a colour
// of its own — so the sign reads as a gutter rather than as punctuation.
const stripLeadingCharacter = (node: {
  type?: string
  value?: string
  children?: unknown[]
}): boolean => {
  if (node.type === "text" && typeof node.value === "string") {
    node.value = node.value.slice(1)
    return true
  }
  for (const child of node.children ?? [])
    if (stripLeadingCharacter(child as typeof node)) return true
  return false
}

// Notion emits a diff as a ```diff fence and nothing more, so the sign column
// is the only structure available — there is no second language to highlight
// the line's own syntax against.
const diffTransformer = {
  name: "kud-blog-diff",
  pre(this: { options: { lang: string } }, node: { properties: Record<string, unknown> }) {
    node.properties["data-lang"] = this.options.lang
  },
  line(
    this: { options: { lang: string }; source: string },
    node: { properties: Record<string, unknown>; children: unknown[] },
    lineNumber: number,
  ) {
    node.properties["data-line"] = ""
    if (this.options.lang !== "diff") return
    const raw = this.source.split("\n")[lineNumber - 1] ?? ""
    const kind = DIFF_SIGNS[raw[0] ?? ""]
    if (!kind) return

    stripLeadingCharacter(node as never)
    node.properties["data-diff"] = kind
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: { "data-sign": "" },
      children: [{ type: "text", value: raw[0] }],
    })
  },
}

// Element overrides live with the route, not here: this is the pipeline, and
// how a blockquote looks is a design decision. Callers pass their own map.
export const renderMarkdown = async (
  markdown: string,
  components: Partial<Components> = {},
): Promise<ReactNode> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeShiki, {
      theme: SHIKI_THEME,
      transformers: [diffTransformer],
    })
    .use(rehypeReact, { Fragment, jsx, jsxs, components })
    .process(markdown)

  return file.result as ReactNode
}

// Reading time, at 220 words a minute — the honest end of the usual 200-250
// range. Rounded up, so nothing ever reads "0 min".
export const readingMinutes = (body: string) =>
  Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 220))
