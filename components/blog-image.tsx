"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import { BLOG_ROOT_ID } from "@/components/blog-theme"
import { BlogZoomViewer, ZoomIcon } from "@/components/blog-zoom-viewer"
import type { ImageDimensions } from "@/lib/image-dimensions"

// A few pixels of slack: sub-pixel rounding must not make a 1:1 image zoomable.
const ZOOM_SLACK = 4

// A body image. It sits in a stage as wide as a diagram's (see .imageStage in
// the post's page.module.css) and is never drawn past its own width. When it is
// drawn smaller than it is, it opens in the same viewer diagrams use; one at
// its natural size has nothing more to show and stays a plain image.
//
// With its dimensions known, the frame reserves the image's box before it
// loads and paints a placeholder ground there, cleared once the image arrives
// so a transparent image never keeps it.
export const BlogImage = ({
  styles,
  alt,
  dimensions,
  ...props
}: ComponentProps<"img"> & {
  styles: Record<string, string>
  dimensions?: ImageDimensions | null
}) => {
  const imageRef = useRef<HTMLImageElement>(null)
  const [zoomable, setZoomable] = useState(false)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const measure = useCallback(() => {
    const image = imageRef.current
    if (!image?.complete || image.naturalWidth === 0) return
    setLoaded(true)
    setZoomable(image.naturalWidth > image.clientWidth + ZOOM_SLACK)
  }, [])

  // Hydration can find the image already loaded, in which case onLoad never
  // fires; the observer covers the viewport changing under it afterwards.
  useEffect(() => {
    const image = imageRef.current
    if (!image) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(image)
    return () => observer.disconnect()
  }, [measure])

  const label = alt ? `Enlarge image: ${alt}` : "Enlarge image"
  const root = open ? document.getElementById(BLOG_ROOT_ID) : null

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    setOpen(true)
  }

  return (
    <span className={styles.imageStage}>
      <span
        className={styles.imageFrame}
        data-zoomable={zoomable || undefined}
        data-sized={dimensions ? true : undefined}
        data-loaded={loaded || undefined}
        style={
          dimensions
            ? ({
                "--w": dimensions.width,
                "--h": dimensions.height,
              } as CSSProperties)
            : undefined
        }
      >
        <img
          ref={imageRef}
          {...props}
          width={dimensions?.width}
          height={dimensions?.height}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          onLoad={measure}
          {...(zoomable && {
            role: "button",
            tabIndex: 0,
            "aria-label": label,
            "aria-haspopup": "dialog",
            onClick: () => setOpen(true),
            onKeyDown,
          })}
        />
        {zoomable && (
          <span
            className={`${styles.diagramZoom} ${styles.imageZoom}`}
            aria-hidden="true"
          >
            <ZoomIcon />
          </span>
        )}
      </span>
      {root &&
        createPortal(
          <BlogZoomViewer
            styles={styles}
            label={alt || "Image viewer"}
            closeLabel="Close image viewer"
            closeOnBackdrop
            onClose={() => setOpen(false)}
          >
            <img src={props.src} alt={alt ?? ""} draggable={false} />
          </BlogZoomViewer>,
          root,
        )}
    </span>
  )
}
