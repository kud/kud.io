"use client"

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
