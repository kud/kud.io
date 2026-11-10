"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"
import { clear, spill } from "@kud/inkblot"
import {
  HOME_GROUND,
  INK_OVERLAY_ID,
  type InkNavigateDetail,
} from "@/components/ink"

type CoveredWait = InkNavigateDetail & { run: number }

// Numeric match for the previous local overlay's 0.32s fade-out. The shape
// differs (the library lifts the ink with a reverse spread rather than an
// opacity fade), but the time under cover after the route commits is the same.
const REVEAL_DURATION = 320
// Slightly quicker than the library's 500ms: the push waits for full cover.
const COVER_DURATION = 420
// If the route hasn't committed by then (slow network, an error page under the
// same path), lift the cover anyway: ink must never strand a visitor.
const COMMIT_TIMEOUT = 2500
const ARRIVE_DURATION = 760
// An ink-morph holds the cover while the view transition glides the icon.
const MORPH_DURATION = 550

// The ink overlay, rendered once in the root layout. Two jobs (a theme switch
// merges instead, components/theme-merge.ts):
// - page moves: listens for `ink:reveal` (components/ink.ts → inkNavigate),
//   spills cover ink in the destination's ground out of the pressed control,
//   navigates under the full cover, holds it until the pathname confirms the
//   destination committed, then lifts it;
// - the first-load reveal on home: ArriveScript paints a plain cover before
//   first paint, and this lifts it as ink once hydrated.
export const InkTransition = () => {
  const router = useRouter()
  const vtRouter = useTransitionRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const runRef = useRef(0)
  const [covered, setCovered] = useState<CoveredWait | null>(null)

  useEffect(() => {
    const onReveal = (event: Event) => {
      const detail = (event as CustomEvent<InkNavigateDetail>).detail
      const el = overlayRef.current
      if (!el) {
        router.push(detail.href)
        return
      }
      runRef.current += 1
      const run = runRef.current
      setCovered(null)
      const coverPage = async () => {
        // The point is raw viewport coordinates; the library shifts it onto its
        // oversized overlay itself, so pre-offsetting here would move the
        // origin twice.
        await spill(el, {
          mode: "cover",
          from: { x: detail.x, y: detail.y },
          colour: detail.color,
          duration: COVER_DURATION,
        })
        if (runRef.current !== run) return
        if (detail.morph) {
          document.documentElement.dataset.vt = "ink-morph"
          vtRouter.push(detail.href)
        } else router.push(detail.href)
        setCovered({ ...detail, run })
      }
      void coverPage()
    }
    window.addEventListener("ink:reveal", onReveal)
    return () => window.removeEventListener("ink:reveal", onReveal)
  }, [router, vtRouter])

  useEffect(() => {
    if (!covered) return
    const arrival = covered
    const lift = () => {
      if (runRef.current !== arrival.run) return
      setCovered(null)
      // The flag outlives the view transition, so the root never falls back
      // to the cross-fade mid-glide.
      window.setTimeout(() => {
        if (document.documentElement.dataset.vt === "ink-morph")
          delete document.documentElement.dataset.vt
      }, 400)
      const el = overlayRef.current
      if (!el) return
      // After an icon glide the ink opens outward from where the icon landed.
      const landed = arrival.morph
        ? document
            .querySelector<HTMLElement>(`[style*=""]`)
            ?.getBoundingClientRect()
        : undefined
      void spill(el, {
        mode: "reveal",
        from: landed
          ? {
              x: landed.left + landed.width / 2,
              y: landed.top + landed.height / 2,
            }
          : { x: arrival.x, y: arrival.y },
        colour: arrival.color,
        duration: REVEAL_DURATION,
      })
    }
    if (pathname !== arrival.pathname) {
      const timer = window.setTimeout(lift, COMMIT_TIMEOUT)
      return () => window.clearTimeout(timer)
    }
    if (arrival.morph) {
      // Start opening just before the glide ends, so the landing icon is never
      // left under the ink for a frame.
      const timer = window.setTimeout(lift, MORPH_DURATION - 70)
      return () => window.clearTimeout(timer)
    }
    const frame = requestAnimationFrame(() => requestAnimationFrame(lift))
    return () => cancelAnimationFrame(frame)
  }, [pathname, covered])

  useEffect(() => {
    const root = document.documentElement
    const el = overlayRef.current
    if (root.dataset.arrive !== "ink" || !el) return
    // The library's reveal starts fully covered, in the same task as the plain
    // cover is dropped, so there is no frame between the two.
    void spill(el, {
      mode: "reveal",
      from: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      colour: HOME_GROUND,
      duration: ARRIVE_DURATION,
    })
    delete root.dataset.arrive
  }, [])

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && overlayRef.current) clear(overlayRef.current)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  return <div id={INK_OVERLAY_ID} ref={overlayRef} aria-hidden />
}

// First arrival on home: a cover in the home ground is held from before first
// paint and InkTransition lifts it as ink once hydrated. Decided in the
// browser, never from searchParams, so the page stays static. Reduced motion
// never gets the cover, nor does Ink, whose paper never spills. global.css
// paints it and drops it after 3s whatever happens, so a script failure can't
// leave the page hidden.
const ARRIVE_SCRIPT = `try{if(location.pathname==="/"&&localStorage.getItem("kud.theme")!=="ink"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.arrive="ink"}catch(e){}`

export const ArriveScript = () => (
  <script dangerouslySetInnerHTML={{ __html: ARRIVE_SCRIPT }} />
)
