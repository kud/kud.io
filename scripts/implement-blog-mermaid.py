from pathlib import Path


def replace(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"expected text not found in {path}: {old[:80]!r}")
    file.write_text(text.replace(old, new, 1))


replace(
    "scripts/sync-notion.js",
    '  markdown: "markdown",\n  diff: "diff",',
    '  markdown: "markdown",\n  mermaid: "mermaid",\n  diff: "diff",',
)

mermaid_plugin = r'''
// Mermaid is content, not code highlighting. Pull it out of the normal
// <pre><code> path before Shiki sees the tree, keeping the original source on a data
// attribute so the React layer can render it client-side and still offer a
// readable source fallback when JavaScript or Mermaid itself fails.
type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const hastText = (node: HastNode): string =>
  node.type === "text"
    ? node.value ?? ""
    : (node.children ?? []).map(hastText).join("")

const rehypeBlogMermaid = () => (tree: HastNode) => {
  const walk = (node: HastNode) => {
    for (const child of node.children ?? []) {
      if (child.type === "element" && child.tagName === "pre") {
        const code = child.children?.find(
          (candidate) =>
            candidate.type === "element" && candidate.tagName === "code",
        )
        const classes = code?.properties?.className
        if (
          code &&
          Array.isArray(classes) &&
          classes.includes("language-mermaid")
        ) {
          child.tagName = "div"
          child.properties = { "data-mermaid-source": hastText(code) }
          child.children = []
          continue
        }
      }
      walk(child)
    }
  }
  walk(tree)
}

'''

replace(
    "lib/blog.ts",
    "// Element overrides live with the route, not here: this is the pipeline, and\n",
    mermaid_plugin
    + "// Element overrides live with the route, not here: this is the pipeline, and\n",
)
replace(
    "lib/blog.ts",
    "    .use(rehypeSlug)\n    .use(rehypeShiki, {",
    "    .use(rehypeSlug)\n    .use(rehypeBlogMermaid)\n    .use(rehypeShiki, {",
)

replace(
    "app/blog/[year]/[month]/[day]/[slug]/page.tsx",
    'import { BlogCodeBlock } from "@/components/blog-code-block"\n',
    'import { BlogCodeBlock } from "@/components/blog-code-block"\n'
    'import { BlogMermaid } from "@/components/blog-mermaid"\n',
)
replace(
    "app/blog/[year]/[month]/[day]/[slug]/page.tsx",
    "  pre: ({ children, ...rest }) => (\n",
    '''  div: ({ children, ...rest }) => {
    const source = (
      rest as {
        "data-mermaid-source"?: string
        dataMermaidSource?: string
      }
    )["data-mermaid-source"] ??
      (rest as { dataMermaidSource?: string }).dataMermaidSource

    return source === undefined ? (
      <div {...rest}>{children}</div>
    ) : (
      <BlogMermaid source={source} styles={styles} />
    )
  },
  pre: ({ children, ...rest }) => (
''',
)

component = r'''"use client"

import { useEffect, useId, useState } from "react"
import { BLOG_ROOT_ID } from "@/components/blog-theme"

let mermaidModule: Promise<typeof import("mermaid")> | undefined
let renderQueue: Promise<unknown> = Promise.resolve()

const loadMermaid = () => (mermaidModule ??= import("mermaid"))

const token = (
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
) => style.getPropertyValue(name).trim() || fallback

const renderMermaid = (
  id: string,
  source: string,
  root: HTMLElement,
) => {
  const style = getComputedStyle(root)
  const config = {
    startOnLoad: false,
    securityLevel: "strict" as const,
    theme: "base" as const,
    themeVariables: {
      background: token(style, "--bg-2", "#eef0f2"),
      primaryColor: token(style, "--bg", "#f7f8f9"),
      primaryTextColor: token(style, "--fg", "#1b2126"),
      primaryBorderColor: token(style, "--line-2", "#c3cad0"),
      secondaryColor: token(style, "--bg-2", "#eef0f2"),
      secondaryTextColor: token(style, "--fg", "#1b2126"),
      secondaryBorderColor: token(style, "--c-gold", "#ffc600"),
      tertiaryColor: token(style, "--bg", "#f7f8f9"),
      tertiaryTextColor: token(style, "--fg-2", "#48535b"),
      tertiaryBorderColor: token(style, "--line", "#e0e4e8"),
      lineColor: token(style, "--fg-3", "#6b7780"),
      edgeLabelBackground: token(style, "--bg-2", "#eef0f2"),
      clusterBkg: token(style, "--bg", "#f7f8f9"),
      clusterBorder: token(style, "--line", "#e0e4e8"),
      noteBkgColor: token(style, "--bg", "#f7f8f9"),
      noteTextColor: token(style, "--fg", "#1b2126"),
      noteBorderColor: token(style, "--line-2", "#c3cad0"),
      fontFamily: style.fontFamily,
      fontSize: "14px",
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: false,
      curve: "linear" as const,
    },
  }

  const current = renderQueue.then(async () => {
    const { default: mermaid } = await loadMermaid()
    mermaid.initialize(config)
    return mermaid.render(id, source)
  })
  renderQueue = current.then(
    () => undefined,
    () => undefined,
  )
  return current
}

export const BlogMermaid = ({
  source,
  styles,
}: {
  source: string
  styles: Record<string, string>
}) => {
  const stableId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const [svg, setSvg] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const root = document.getElementById(BLOG_ROOT_ID)
    if (!root) return

    let revision = 0
    let disposed = false

    const draw = async () => {
      const current = ++revision
      try {
        const result = await renderMermaid(
          `blog-mermaid-${stableId}-${current}`,
          source,
          root,
        )
        if (disposed || current != revision) return
        setSvg(result.svg)
        setFailed(false)
      } catch (error) {
        if (disposed || current != revision) return
        console.error("Could not render Mermaid diagram", error)
        setSvg(undefined)
        setFailed(true)
      }
    }

    void draw()

    const observer = new MutationObserver(() => void draw())
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    const colourScheme = matchMedia("(prefers-color-scheme: dark)")
    const onColourScheme = () => {
      if (root.dataset.theme === "system") void draw()
    }
    colourScheme.addEventListener("change", onColourScheme)

    return () => {
      disposed = true
      observer.disconnect()
      colourScheme.removeEventListener("change", onColourScheme)
    }
  }, [source, stableId])

  return (
    <div className={styles.diagram}>
      {svg ? (
        <div
          className={styles.diagramSvg}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre
          className={styles.diagramSource}
          data-error={failed || undefined}
          aria-label={
            failed
              ? "Mermaid diagram source (render failed)"
              : "Mermaid diagram source"
          }
        >
          <code>{source}</code>
        </pre>
      )}
    </div>
  )
}
'''
Path("components/blog-mermaid.tsx").write_text(component)

diagram_css = r'''
/* Diagram card ------------------------------------------------------------- */
/* Mermaid is explanatory content rather than code, so it gets the page's
 * quiet surface instead of the dark terminal card. Colours inside the SVG are
 * derived from the same blog tokens by BlogMermaid and therefore move with the
 * blog's independent light/dark theme. */
.diagram {
  margin: 1.75em 0;
  padding: 24px 20px;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg-2);
}

.diagramSvg {
  display: grid;
  min-width: 0;
  place-items: center;
}

.diagramSvg svg {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
}

/* This is both the no-JS fallback and the error state. It deliberately looks
 * quieter than a normal code card: the reader should still get the model, even
 * if only as Mermaid source, without mistaking it for a command to run. */
.diagramSource {
  margin: 0;
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.55;
  color: var(--fg-3);
  white-space: pre;
}

.diagramSource code {
  padding: 0;
  background: none;
  color: inherit;
  font-size: inherit;
}

.diagramSource[data-error] {
  color: var(--fg-2);
}

@media (max-width: 580px) {
  .diagram {
    padding: 18px 14px;
  }
}

'''
replace(
    "app/blog/[year]/[month]/[day]/[slug]/page.module.css",
    "/* More ---------------------------------------------------------------------",
    diagram_css + "/* More ---------------------------------------------------------------------",
)

replace(
    ".github/workflows/refresh-project-content.yml",
    "          node-version: 20\n",
    "          node-version: 22.12.0\n",
)
