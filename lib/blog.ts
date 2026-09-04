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

// Shiki emits both palettes as CSS custom properties in a single pass, and
// `defaultColor: false` stops either winning inline — so the blog's own
// [data-theme] rules pick one, and code re-themes with the page for free.
// Swapping these two names is the whole of a code-theme change.
export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" }

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
    .use(rehypeShiki, { themes: SHIKI_THEMES, defaultColor: false })
    .use(rehypeReact, { Fragment, jsx, jsxs, components })
    .process(markdown)

  return file.result as ReactNode
}
