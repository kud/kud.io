"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { preloadLauncherIndex } from "./launcher"
import styles from "./launcher.module.css"

const noop = () => () => {}
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform)

// The visible way in, bottom right where a thumb reaches it. It sits inside
// the page's themed wrapper so it wears the page's palette. The docs carry
// fumadocs' own search field in the sidebar, which opens the same launcher,
// so a second button there would only repeat it.
export const LauncherTrigger = () => {
  const { setOpenSearch } = useSearchContext()
  const pathname = usePathname()
  const apple = useSyncExternalStore(noop, isApple, () => true)
  const [scope, setScope] = useState<Element | null>(null)

  // Fetch the index once the page has gone quiet, so the first ⌘K usually
  // opens on a warm cache and the skeletons are only a fallback.
  useEffect(() => {
    const warm = () => void preloadLauncherIndex().catch(() => {})
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(warm, { timeout: 4000 })
      return () => window.cancelIdleCallback(handle)
    }
    const timer = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  // Read after the new page has committed, or a client navigation would hand
  // back the wrapper of the page just left.
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setScope(document.querySelector("[data-theme-scope]") ?? document.body),
    )
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  if (!scope || /^\/projects\/[^/]+\/docs/.test(pathname)) return null

  return createPortal(
    <button
      type="button"
      data-launcher-trigger
      className={styles.trigger}
      aria-label="Search kud.io"
      aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
      onPointerEnter={() => void preloadLauncherIndex().catch(() => {})}
      onFocus={() => void preloadLauncherIndex().catch(() => {})}
      onClick={() => setOpenSearch(true)}
    >
      <Search className={styles.triggerIcon} aria-hidden />
      <span className={styles.triggerWord}>Search</span>
      <kbd className={styles.triggerKey}>{apple ? "⌘K" : "Ctrl K"}</kbd>
    </button>,
    scope,
  )
}
