"use client"

// The theme switch: the old light merges into the new one in place. Ink is
// kept for changing world (home, projects, blog, CV); a theme is the same
// world in another light, so nothing covers it (Erwann, 2026-11-10: "something
// like merging and not ink").
//
// It rides the View Transitions API: the page is snapshotted, the scope is
// restamped, and the two snapshots crossfade (app/global.css,
// html[data-vt="merge"]), every colour easing into its new value. Reduced
// motion, or a browser without view transitions, swaps instantly.
export const themeMerge = (apply: () => void) => {
  const root = document.documentElement
  if (
    typeof document.startViewTransition !== "function" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    // A page move in flight owns data-vt; a theme press mid-move just swaps.
    root.dataset.vt
  ) {
    apply()
    return
  }
  root.dataset.vt = "merge"
  const transition = document.startViewTransition(apply)
  void transition.finished.finally(() => {
    if (root.dataset.vt === "merge") delete root.dataset.vt
  })
}
