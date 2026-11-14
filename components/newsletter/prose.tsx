import { Fragment, type ReactNode } from "react"
import { jsx, jsxs } from "react/jsx-runtime"
import rehypeReact from "rehype-react"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

// An item's prose: paragraphs, lists, quotes, emphasis and links. No raw HTML
// (remark-rehype drops it unless rehype-raw is added, and it must not be), no
// code highlighting, no slugs: an item is a few paragraphs, not a post, and its
// anchor is the item's own id.
const External = ({
  href,
  children,
}: {
  href?: string
  children?: ReactNode
}) => (
  <a href={href} rel="noreferrer">
    {children}
  </a>
)

// In the narrative sections a link is a citation on the source's name, shown
// as "Source ↗": the arrow says "this leaves for the evidence" without a
// footnote apparatus the reader has to scroll for. It follows the name, as an
// external-link mark does everywhere else (Erwann, 2026-11-14).
const citationLink = (className?: string) => {
  const Citation = ({
    href,
    children,
  }: {
    href?: string
    children?: ReactNode
  }) => (
    <a href={href} rel="noreferrer" className={className}>
      {children}
      <span aria-hidden> ↗</span>
    </a>
  )
  return Citation
}

// A bullet (a timeline entry, an in-brief fact) is one sentence inside a list
// item, so inline drops the paragraph and the block wrapper.
const Bare = ({ children }: { children?: ReactNode }) => <>{children}</>

export const Prose = async ({
  markdown,
  className,
  citationClassName,
  citations = false,
  inline = false,
}: {
  markdown: string
  className?: string
  citationClassName?: string
  citations?: boolean
  inline?: boolean
}) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      components: {
        a: citations ? citationLink(citationClassName) : External,
        ...(inline ? { p: Bare } : {}),
      },
    })
    .process(markdown)
  const result = file.result as ReactNode
  return inline ? (
    <span className={className}>{result}</span>
  ) : (
    <div className={className}>{result}</div>
  )
}
