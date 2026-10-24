"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"

// A cover image that marks itself data-loaded once its pixels are in, so the
// CSS can keep it transparent over the blurred preview until then and fade it
// in whole, never painting top to bottom as the bytes arrive. Without
// scripting the CSS never hides it (see `@media (scripting: enabled)`), so a
// no-JS reader gets the plain image.
export const CoverImage = (props: ComponentProps<"img">) => {
  const imageRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Hydration can find the image already decoded (cached, or simply quick), in
  // which case onLoad has fired before React was listening.
  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    // Derived sizes are baked at sync (scripts/cover-images.js); next/image
    // would only re-encode files that are already the right size.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      alt=""
      {...props}
      data-loaded={loaded || undefined}
      onLoad={() => setLoaded(true)}
    />
  )
}
