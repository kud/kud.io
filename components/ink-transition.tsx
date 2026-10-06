"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { clear, spill } from "@kud/inkblot"

type RevealDetail = { x: number; y: number; href: string; color: string }

type CoveredWait = {
  href: string
  x: number
  y: number
  color: string
  run: number
}

// Numeric match for the previous local overlay's 0.32s fade-out. The shape
// differs (the library lifts the ink with a reverse spread rather than an
// opacity fade), but the time under cover after the route commits is the same.
const REVEAL_DURATION = 320

// Desktop ink transition, now backed by @kud/inkblot. Listens for the
// `ink:reveal` event the link components dispatch: spills cover ink out of the
// pressed control, navigates under the full cover, holds it until the pathname
// confirms the destination has committed, then reveals the new page. Rendered
// once in the root layout. The overlay element starts bare; the library adds
// its own class, injected stylesheet and turbulence filter on first spill.
export const InkTransition = () => {
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const runRef = useRef(0)
  const [covered, setCovered] = useState<CoveredWait | null>(null)

  useEffect(() => {
    const onReveal = (event: Event) => {
      const { x, y, href, color } = (event as CustomEvent<RevealDetail>).detail
      const el = overlayRef.current
      if (!el) return
      runRef.current += 1
      const run = runRef.current
      setCovered(null)
      const coverPage = async () => {
        // The point is raw viewport coordinates; the library shifts it onto its
        // oversized overlay itself, so pre-offsetting here would move the
        // origin twice.
        await spill(el, { mode: "cover", from: { x, y }, colour: color })
        if (runRef.current !== run) return
        router.push(href)
        setCovered({ href, x, y, color, run })
      }
      void coverPage()
    }
    window.addEventListener("ink:reveal", onReveal)
    return () => window.removeEventListener("ink:reveal", onReveal)
  }, [router])

  useEffect(() => {
    if (!covered || pathname !== covered.href) return
    const arrival = covered
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (runRef.current !== arrival.run) return
        setCovered(null)
        const el = overlayRef.current
        if (!el) return
        void spill(el, {
          mode: "reveal",
          from: { x: arrival.x, y: arrival.y },
          colour: arrival.color,
          duration: REVEAL_DURATION,
        })
      }),
    )
    return () => cancelAnimationFrame(frame)
  }, [pathname, covered])

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && overlayRef.current) clear(overlayRef.current)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  return <div ref={overlayRef} aria-hidden />
}
