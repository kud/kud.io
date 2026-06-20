import { defineDocs, defineConfig } from "fumadocs-mdx/config"
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"
import rehypeRaw from "rehype-raw"

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
    // Docs are synced from 30+ community repos, so a fence may carry a language
    // Shiki has no grammar for (e.g. ```sudoers). Without a fallback that's a
    // hard build error; fall back to plain text so one stray tag can't fail the
    // whole static build.
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      fallbackLanguage: "text",
    },
    rehypePlugins: (plugins) => [
      [rehypeRaw, { passThrough: MDX_NODES }],
      ...plugins,
    ],
  },
})
