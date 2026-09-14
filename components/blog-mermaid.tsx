"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { BLOG_ROOT_ID } from "@/components/blog-theme"

let mermaidModule: Promise<typeof import("mermaid")> | undefined
let renderQueue: Promise<unknown> = Promise.resolve()

const MIN_SCALE = 0.6
const MAX_SCALE = 4
const SCALE_STEP = 0.25

const loadMermaid = () => (mermaidModule ??= import("mermaid"))

const token = (style: CSSStyleDeclaration, name: string, fallback: string) =>
  style.getPropertyValue(name).trim() || fallback

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

// With useMaxWidth, mermaid sizes the SVG to 100% and writes its natural width
// as an inline max-width; that number is the only record of how wide the
// diagram actually is, and the frame in page.module.css sizes itself from it.
const naturalWidth = (svg: string) =>
  Number(/max-width:\s*([\d.]+)px/.exec(svg)?.[1]) || undefined

const renderMermaid = (id: string, source: string, root: HTMLElement) => {
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

const ZoomIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="8.25" cy="8.25" r="4.75" />
    <path d="m11.7 11.7 4.3 4.3M8.25 6v4.5M6 8.25h4.5" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" />
  </svg>
)

export const BlogMermaid = ({
  source,
  styles,
}: {
  source: string
  styles: Record<string, string>
}) => {
  const stableId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const viewerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    originX: number
    originY: number
  } | null>(null)
  const [svg, setSvg] = useState<string>()
  const [natural, setNatural] = useState<number>()
  const [failed, setFailed] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const resetView = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  const closeViewer = () => {
    setViewerOpen(false)
    setDragging(false)
    resetView()
  }

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
        setNatural(naturalWidth(result.svg))
        setFailed(false)
      } catch (error) {
        if (disposed || current != revision) return
        console.error("Could not render Mermaid diagram", error)
        setSvg(undefined)
        setNatural(undefined)
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

  useEffect(() => {
    if (!viewerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    viewerRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer()
      if (event.key === "+" || event.key === "=")
        setScale((value) => clampScale(value + SCALE_STEP))
      if (event.key === "-") setScale((value) => clampScale(value - SCALE_STEP))
      if (event.key === "0") resetView()
      if (event.key === "ArrowLeft")
        setOffset((value) => ({ ...value, x: value.x - 32 }))
      if (event.key === "ArrowRight")
        setOffset((value) => ({ ...value, x: value.x + 32 }))
      if (event.key === "ArrowUp")
        setOffset((value) => ({ ...value, y: value.y - 32 }))
      if (event.key === "ArrowDown")
        setOffset((value) => ({ ...value, y: value.y + 32 }))
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [viewerOpen])

  return (
    <div className={styles.diagram}>
      <div
        className={styles.diagramFrame}
        style={
          natural
            ? ({ "--natural": `${natural}px` } as CSSProperties)
            : undefined
        }
      >
        {svg ? (
          <>
            <button
              className={styles.diagramZoom}
              type="button"
              aria-label="Open diagram viewer"
              title="Zoom diagram"
              onClick={() => setViewerOpen(true)}
            >
              <ZoomIcon />
            </button>
            <div
              className={styles.diagramSvg}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {viewerOpen && (
              <div
                ref={viewerRef}
                className={styles.diagramViewer}
                role="dialog"
                aria-modal="true"
                aria-label="Diagram viewer"
                tabIndex={-1}
              >
                <div className={styles.diagramViewerToolbar}>
                  <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() =>
                      setScale((value) => clampScale(value - SCALE_STEP))
                    }
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={resetView}
                    title="Reset zoom and position"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() =>
                      setScale((value) => clampScale(value + SCALE_STEP))
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className={styles.diagramViewerClose}
                  type="button"
                  aria-label="Close diagram viewer"
                  onClick={closeViewer}
                >
                  <CloseIcon />
                </button>
                <div
                  className={styles.diagramViewerStage}
                  data-dragging={dragging || undefined}
                  onWheel={(event) => {
                    event.preventDefault()
                    setScale((value) =>
                      clampScale(
                        value + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP),
                      ),
                    )
                  }}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return
                    event.currentTarget.setPointerCapture(event.pointerId)
                    dragRef.current = {
                      pointerId: event.pointerId,
                      x: event.clientX,
                      y: event.clientY,
                      originX: offset.x,
                      originY: offset.y,
                    }
                    setDragging(true)
                  }}
                  onPointerMove={(event) => {
                    const drag = dragRef.current
                    if (!drag || drag.pointerId !== event.pointerId) return
                    setOffset({
                      x: drag.originX + event.clientX - drag.x,
                      y: drag.originY + event.clientY - drag.y,
                    })
                  }}
                  onPointerUp={(event) => {
                    if (dragRef.current?.pointerId !== event.pointerId) return
                    dragRef.current = null
                    setDragging(false)
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null
                    setDragging(false)
                  }}
                >
                  <div
                    className={styles.diagramViewerCanvas}
                    style={{
                      transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </div>
                <p className={styles.diagramViewerHint}>
                  Drag to move · scroll or +/− to zoom · 0 to reset · Esc to
                  close
                </p>
              </div>
            )}
          </>
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
    </div>
  )
}
