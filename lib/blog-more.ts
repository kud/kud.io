// "More" picks at the foot of a post. The page is static, so a pick that
// changes per visit has to be made in the browser; to land before first paint
// these functions are serialised into an inline <script> that runs while the
// list is still being parsed (see the post page). Each one must therefore stay
// self-contained: no imports, no closure, nothing a bundler might hoist.
//
// The list holds every other post. Without scripting only the build-time
// neighbours ([data-default]) show; with it, the newest other post
// ([data-recent]) leads and two others are drawn at random, marked
// data-pick="1".."3" so the CSS can show and order them.

export const pickMore = (nav: Element, slug: string) => {
  const items = Array.from(nav.querySelectorAll("li[data-slug]"))
  for (let i = 0; i < items.length; i++) items[i].removeAttribute("data-pick")

  let recent: Element | null = null
  const rest: Element[] = []
  for (let i = 0; i < items.length; i++) {
    if (!recent && items[i].hasAttribute("data-recent")) recent = items[i]
    else rest.push(items[i])
  }

  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = rest[i]
    rest[i] = rest[j]
    rest[j] = swap
  }

  const chosen = (recent ? [recent] : []).concat(rest).slice(0, 3)
  for (let i = 0; i < chosen.length; i++)
    chosen[i].setAttribute("data-pick", String(i + 1))
  nav.setAttribute("data-for", slug)
}

// Preview only: stamps the stored or requested candidate choice on #blog-root
// before paint, so a preview link never shows today's layout for a frame.
// BlogHierarchyPreview owns the choice from then on.
export const stampPreview = () => {
  const keys = ["h", "s", "toc", "more", "picks", "n"]
  const locked: Record<string, string> = {
    h: "3",
    s: "1",
    toc: "right",
    more: "cards",
    picks: "mixed",
  }
  const root = document.getElementById("blog-root")
  if (!root) return
  const query = new URLSearchParams(window.location.search)
  let choice: Record<string, string> | null = null
  if (keys.some((key) => query.has(key))) {
    choice = {}
    for (let i = 0; i < keys.length; i++) {
      const value = query.get(keys[i])
      if (value) choice[keys[i]] = value
    }
  } else {
    try {
      choice = JSON.parse(
        window.localStorage.getItem("kud.blog-hierarchy-preview") || "null",
      )
    } catch {}
  }
  if (!choice) return
  for (const key in locked) choice[key] = locked[key]
  for (const key in choice) root.setAttribute(`data-${key}`, choice[key])
}
