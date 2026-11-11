import { defineDocs, defineConfig } from "fumadocs-mdx/config"
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"
import rehypeRaw from "rehype-raw"
import { duskDay } from "./lib/code-themes"
// Code is Erwann's own November theme (kud/november-vscode, MIT), as in his
// editor, with comments and parameters lifted to clear 4.5:1 on its ground,
// minus its editor-only italics (lib/themes/november.ts).
import { november } from "./lib/themes/november"

// Per-project documentation is synced from each repo's markdown into
// content/projects/<slug>/... at build time; Fumadocs indexes it for the
// sidebar, table-of-contents, and search.
export const docs = defineDocs({
  dir: "content/projects",
})

// Each repo's README, synced to content/readmes/<slug>.mdx, is rendered as the
// project's landing page (a nicer version of the README — the repo is the source
// of truth). Kept in its own collection so it stays out of the docs sidebar, the
// docs routes, and the docs search index.
export const readmes = defineDocs({
  dir: "content/readmes",
})

// READMEs frequently build their logo/hero with raw HTML (<div align="center">
// <img>); rehype-raw re-parses that embedded HTML so it renders instead of
// being stripped. `passThrough` keeps MDX's own nodes intact (rehype-raw
// otherwise errors on them).
const MDX_NODES = [
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxTextExpression",
]

export default defineConfig({
  mdxOptions: {
    // Remote README images (raw.githubusercontent.com, shields.io) would be
    // fetched at build time just to read their size, and GitHub rate-limits
    // Vercel's build network: one 429 failed the whole build. Our <img> is a
    // plain element (components/mdx.tsx), so it needs no width/height; local
    // images are still sized.
    remarkImageOptions: { external: false },
    // Docs are synced from 30+ community repos, so a fence may carry a language
    // Shiki has no grammar for (e.g. ```sudoers). Without a fallback that's a
    // hard build error; fall back to plain text so one stray tag can't fail the
    // whole static build.
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: { light: duskDay, dark: november },
      fallbackLanguage: "text",
    },
    rehypePlugins: (plugins) => [
      [rehypeRaw, { passThrough: MDX_NODES }],
      ...plugins,
    ],
  },
})
