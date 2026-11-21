// The "More" picks at the foot of a post, chosen at build time so every reader
// and every crawler sees the same three: the newest other post, then the two
// closest in subject (most tags shared), the nearer in date breaking a tie.
// Posts come newest first, as getAllPosts returns them.
type PickablePost = { slug: string; date: string; tags: string[] }

const COUNT = 3

const dayOf = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`)

export const pickMore = <T extends PickablePost>(
  posts: T[],
  slug: string,
): T[] => {
  const post = posts.find((entry) => entry.slug === slug)
  const others = posts.filter((entry) => entry.slug !== slug)
  if (!post || others.length === 0) return others.slice(0, COUNT)

  const [recent, ...rest] = others
  const tags = new Set(post.tags)
  const shared = (entry: T) => entry.tags.filter((tag) => tags.has(tag)).length
  const distance = (entry: T) => Math.abs(dayOf(entry.date) - dayOf(post.date))
  const ranked = [...rest].sort(
    (a, b) =>
      shared(b) - shared(a) ||
      distance(a) - distance(b) ||
      b.date.localeCompare(a.date) ||
      a.slug.localeCompare(b.slug),
  )
  return [recent, ...ranked].slice(0, COUNT)
}
