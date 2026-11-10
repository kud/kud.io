// "More" picks at the foot of a post. The page is static, so a pick that
// changes per visit has to be made in the browser; to land before first paint
// pickMore is serialised into an inline <script> that runs while the list is
// still being parsed (see the post page). It must therefore stay
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
