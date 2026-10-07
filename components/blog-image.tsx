"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import { BLOG_ROOT_ID } from "@/components/blog-theme"
import { BlogZoomViewer, ZoomIcon } from "@/components/blog-zoom-viewer"

// A few pixels of slack: sub-pixel rounding must not make a 1:1 image zoomable.
const ZOOM_SLACK = 4

// A body image. It sits in a stage as wide as a diagram's (see .imageStage in
// the post's page.module.css) and is never drawn past its own width. When it is
// drawn smaller than it is, it opens in the same viewer diagrams use; one at
// its natural size has nothing more to show and stays a plain image.
export const BlogImage = ({
  styles,
  alt,
  ...props
}: ComponentProps<"img"> & { styles: Record<string, string> }) => {
  const imageRef = useRef<HTMLImageElement>(null)
  const [zoomable, setZoomable] = useState(false)
  const [open, setOpen] = useState(false)

  const measure = useCallback(() => {
    const image = imageRef.current
    if (!image?.complete || image.naturalWidth === 0) return
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
      <span className={styles.imageFrame} data-zoomable={zoomable || undefined}>
        <img
          ref={imageRef}
          {...props}
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
