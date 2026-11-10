"use client"

// The theme switch: the old light merges into the new one in place. Ink is
// kept for changing world (home, projects, blog, CV); a theme is the same
// world in another light, so nothing covers it (Erwann, 2026-11-10: "something
// like merging and not ink").
//
// It rides the View Transitions API: the page is snapshotted, the scope is
// restamped, and the two snapshots blend (app/global.css, html[data-vt^=
// "merge"]). Three takes, chosen on <html> as data-theme-merge by the preview
// banner (components/ink-preview.tsx); "fade" when nothing is set:
//   fade   — a straight crossfade, every colour easing into its new value;
//   radial — the new light soaks outward from the pressed control, soft-edged;
//   blur   — a dissolve, both lights softening through each other.
// Reduced motion, or a browser without view transitions, swaps instantly.

const TAKES = ["fade", "radial", "blur"] as const
type MergeTake = (typeof TAKES)[number]

const takeOf = (): MergeTake => {
  const take = document.documentElement.dataset.themeMerge
  return (TAKES as readonly string[]).includes(take ?? "")
    ? (take as MergeTake)
    : "fade"
}

export const themeMerge = (
  origin: Element | null | undefined,
  apply: () => void,
) => {
  const root = document.documentElement
  if (
    typeof document.startViewTransition !== "function" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply()
    return
  }

  const take = takeOf()
  if (take === "radial") {
    const rect = origin?.getBoundingClientRect()
    root.style.setProperty(
      "--merge-x",
      `${rect ? rect.left + rect.width / 2 : window.innerWidth / 2}px`,
    )
    root.style.setProperty(
      "--merge-y",
      `${rect ? rect.top + rect.height / 2 : window.innerHeight / 2}px`,
    )
  }

  // A page move in flight owns data-vt; a theme press mid-move just swaps.
  if (root.dataset.vt) {
    apply()
    return
  }
  root.dataset.vt = `merge-${take}`
  const transition = document.startViewTransition(apply)
  void transition.finished.finally(() => {
    if (root.dataset.vt === `merge-${take}`) delete root.dataset.vt
  })
}
