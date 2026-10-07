"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

const MIN_SCALE = 0.6
const MAX_SCALE = 4
const SCALE_STEP = 0.25
// A press that travels less than this is a click, not a drag.
const CLICK_SLOP = 4

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

type Point = { x: number; y: number }

const pointerPoint = ({
  clientX,
  clientY,
}: {
  clientX: number
  clientY: number
}): Point => ({ x: clientX, y: clientY })

const distanceBetween = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

const midpointBetween = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

export const ZoomIcon = () => (
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

const FOCUSABLE = "button, [href], [tabindex]:not([tabindex='-1'])"

// The full-screen pan and zoom surface shared by diagrams and images. It mounts
// only while open, so every open starts from a fresh view and closing needs no
// reset. Focus goes in on mount and back to whatever opened it on unmount.
export const BlogZoomViewer = ({
  children,
  styles,
  label,
  closeLabel,
  closeOnBackdrop = false,
  onClose,
}: {
  children: ReactNode
  styles: Record<string, string>
  label: string
  closeLabel: string
  closeOnBackdrop?: boolean
  onClose: () => void
}) => {
  const viewerRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    originX: number
    originY: number
  } | null>(null)
  const pointersRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<{
    distance: number
    scale: number
    midpoint: Point
    offset: Point
    lastOffset: Point
  } | null>(null)
  const pressRef = useRef<{ onBackdrop: boolean; moved: boolean } | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  const resetView = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const { overflow, paddingRight } = document.body.style
    // Hiding the scrollbar widens the page; the same width goes back as
    // padding so the content behind the viewer does not move.
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (gutter > 0)
      document.body.style.paddingRight = `calc(${
        parseFloat(getComputedStyle(document.body).paddingRight) || 0
      }px + ${gutter}px)`
    viewerRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
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

      if (event.key === "Tab") {
        const items = Array.from(
          viewerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
        )
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (
          event.shiftKey &&
          (active === first || active === viewerRef.current)
        ) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      window.removeEventListener("keydown", onKeyDown)
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div
      ref={viewerRef}
      className={styles.diagramViewer}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
    >
      <div className={styles.diagramViewerToolbar}>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setScale((value) => clampScale(value - SCALE_STEP))}
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
          onClick={() => setScale((value) => clampScale(value + SCALE_STEP))}
        >
          +
        </button>
      </div>
      <button
        className={styles.diagramViewerClose}
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
      >
        <CloseIcon />
      </button>
      <div
        className={styles.diagramViewerStage}
        data-dragging={dragging || undefined}
        onWheel={(event) => {
          event.preventDefault()
          setScale((value) =>
            clampScale(value + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP)),
          )
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return

          pressRef.current = {
            // Capture below retargets later events to the stage, so what was
            // under the pointer has to be read now.
            onBackdrop: event.target === event.currentTarget,
            moved: false,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
          pointersRef.current.set(event.pointerId, pointerPoint(event))

          if (pointersRef.current.size >= 2) {
            const [first, second] = Array.from(pointersRef.current.values())
            const midpoint = midpointBetween(first, second)

            pinchRef.current = {
              distance: Math.max(distanceBetween(first, second), 1),
              scale,
              midpoint,
              offset,
              lastOffset: offset,
            }
            dragRef.current = null
            pressRef.current.moved = true
            setDragging(false)
            return
          }

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
          if (!pointersRef.current.has(event.pointerId)) return

          pointersRef.current.set(event.pointerId, pointerPoint(event))

          if (pointersRef.current.size >= 2) {
            const [first, second] = Array.from(pointersRef.current.values())
            const pinch =
              pinchRef.current ??
              (() => {
                const midpoint = midpointBetween(first, second)
                return {
                  distance: Math.max(distanceBetween(first, second), 1),
                  scale,
                  midpoint,
                  offset,
                  lastOffset: offset,
                }
              })()

            pinchRef.current = pinch

            const midpoint = midpointBetween(first, second)
            const nextScale = clampScale(
              pinch.scale *
                (Math.max(distanceBetween(first, second), 1) / pinch.distance),
            )
            const stage = event.currentTarget.getBoundingClientRect()
            const centre = {
              x: stage.left + stage.width / 2,
              y: stage.top + stage.height / 2,
            }
            const anchor = {
              x: (pinch.midpoint.x - centre.x - pinch.offset.x) / pinch.scale,
              y: (pinch.midpoint.y - centre.y - pinch.offset.y) / pinch.scale,
            }
            const nextOffset = {
              x: midpoint.x - centre.x - anchor.x * nextScale,
              y: midpoint.y - centre.y - anchor.y * nextScale,
            }

            pinchRef.current = { ...pinch, lastOffset: nextOffset }
            if (pressRef.current) pressRef.current.moved = true
            setScale(nextScale)
            setOffset(nextOffset)
            return
          }

          const drag = dragRef.current
          if (!drag || drag.pointerId !== event.pointerId) return
          if (
            pressRef.current &&
            Math.hypot(event.clientX - drag.x, event.clientY - drag.y) >
              CLICK_SLOP
          )
            pressRef.current.moved = true
          setOffset({
            x: drag.originX + event.clientX - drag.x,
            y: drag.originY + event.clientY - drag.y,
          })
        }}
        onPointerUp={(event) => {
          const pinch = pinchRef.current
          const press = pressRef.current
          pointersRef.current.delete(event.pointerId)

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }

          if (pointersRef.current.size === 1) {
            const [pointerId, point] = pointersRef.current
              .entries()
              .next().value!
            const origin = pinch?.lastOffset ?? offset

            pinchRef.current = null
            dragRef.current = {
              pointerId,
              x: point.x,
              y: point.y,
              originX: origin.x,
              originY: origin.y,
            }
            setDragging(true)
            return
          }

          if (pointersRef.current.size >= 2) {
            pinchRef.current = null
            dragRef.current = null
            setDragging(false)
            return
          }

          pinchRef.current = null
          dragRef.current = null
          pressRef.current = null
          setDragging(false)

          if (closeOnBackdrop && press?.onBackdrop && !press.moved) onClose()
        }}
        onPointerCancel={(event) => {
          const pinch = pinchRef.current
          pointersRef.current.delete(event.pointerId)

          if (pointersRef.current.size === 1) {
            const [pointerId, point] = pointersRef.current
              .entries()
              .next().value!
            const origin = pinch?.lastOffset ?? offset

            pinchRef.current = null
            dragRef.current = {
              pointerId,
              x: point.x,
              y: point.y,
              originX: origin.x,
              originY: origin.y,
            }
            setDragging(true)
            return
          }

          pinchRef.current = null
          dragRef.current = null
          pressRef.current = null
          setDragging(false)
        }}
      >
        <div
          className={styles.diagramViewerCanvas}
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
      <p className={styles.diagramViewerHint}>
        Drag to move · pinch, scroll or +/− to zoom · 0 to reset · Esc to close
      </p>
    </div>
  )
}
