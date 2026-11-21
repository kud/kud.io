"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./avatar-image.module.css"

type AvatarImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  placeholderIcon?: boolean
  srcSet?: string
  sizes?: string
  // The page's largest paint: fetched first, and shown as soon as it decodes
  // rather than after hydration, so the fade-in never holds back the LCP.
  priority?: boolean
}

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ")

export const AvatarImage = ({
  src,
  alt,
  width,
  height,
  className,
  placeholderIcon = true,
  srcSet,
  sizes,
  priority = false,
}: AvatarImageProps) => {
  const [loaded, setLoaded] = useState(priority)
  const imageRef = useRef<HTMLImageElement>(null)
  const markLoaded = () => setLoaded(true)

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) markLoaded()
  }, [])

  return (
    <span
      className={cx(styles.avatar, loaded && styles.loaded, className)}
      role="img"
      aria-label={alt}
    >
      <span className={styles.placeholder} aria-hidden="true">
        {placeholderIcon ? <span className={styles.placeholderIcon} /> : null}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className={styles.image}
        ref={imageRef}
        onLoad={markLoaded}
      />
    </span>
  )
}
