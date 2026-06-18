"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import styles from "./ink-transition.module.css"

// The overlay is inset by -60px, so a viewport point maps to element-local
// coordinates by adding this offset (keeps the ink origin on the pressed button).
const OVERSIZE = 60

type RevealDetail = { x: number; y: number; href: string; color: string }

// Desktop home → /projects "ink" transition. Listens for the `ink:reveal` event
// RevealLink dispatches: it spreads a dark, turbulence-edged overlay out of the
// click point, navigates under the cover, then fades the overlay to reveal the
// freshly-loaded /projects page. Rendered once in the root layout.
export const InkTransition = () => {
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const hrefRef = useRef<string | null>(null)
  const [phase, setPhase] = useState<"idle" | "inking" | "covered" | "fading">(
    "idle",
  )

  useEffect(() => {
    const onReveal = (event: Event) => {
      const { x, y, href, color } = (event as CustomEvent<RevealDetail>).detail
      const el = overlayRef.current
      if (!el) return
      // The cover matches the destination's background, so fading it out reveals
      // only the new page's content — no colour seam between the two themes.
      el.style.backgroundColor = color
      el.style.setProperty("--x", `${x + OVERSIZE}px`)
      el.style.setProperty("--y", `${y + OVERSIZE}px`)
      hrefRef.current = href
      setPhase("inking")
    }
    window.addEventListener("ink:reveal", onReveal)
    return () => window.removeEventListener("ink:reveal", onReveal)
  }, [])

  const handleAnimationEnd = () => {
    if (phase !== "inking" || !hrefRef.current) return
    // The screen is fully covered now — swap the route under it, but keep the
    // cover visible until the pathname confirms the destination has committed.
    router.push(hrefRef.current)
    setPhase("covered")
  }

  useEffect(() => {
    if (phase !== "covered" || pathname !== hrefRef.current) return
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("fading")))
  }, [pathname, phase])

  const handleTransitionEnd = () => {
    if (phase === "fading") setPhase("idle")
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className={[
        styles.overlay,
        phase === "inking" ? styles.inking : "",
        phase === "covered" ? styles.covered : "",
        phase === "fading" ? styles.fading : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onAnimationEnd={handleAnimationEnd}
      onTransitionEnd={handleTransitionEnd}
    />
  )
}
