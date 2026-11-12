// The section being read is the last heading above the top third of the
// viewport: reading position, not whichever heading happens to be visible.
// Shared by the blog's rail and a project's "On this page".
export const currentSection = (headings: Iterable<Element>): string | null => {
  const line = window.innerHeight * 0.33
  const list = [...headings]
  // A short last section never reaches the line: at the bottom of the page
  // it is the one being read.
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2
  if (atBottom && list.length > 0) return list[list.length - 1].id
  let current: string | null = null
  for (const node of list) {
    if (node.getBoundingClientRect().top <= line) current = node.id
  }
  return current
}
