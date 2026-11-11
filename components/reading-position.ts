// The section being read is the last heading above the top third of the
// viewport: reading position, not whichever heading happens to be visible.
// Shared by the blog's rail and a project's "On this page".
export const currentSection = (headings: Iterable<Element>): string | null => {
  const line = window.innerHeight * 0.33
  let current: string | null = null
  for (const node of headings) {
    if (node.getBoundingClientRect().top <= line) current = node.id
  }
  return current
}
