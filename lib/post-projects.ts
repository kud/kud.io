// Which projects a post is about, read from the links it already carries: a
// link to a project's page on kud.io (/projects/<slug>, docs included) or to
// its repository (github.com/kud/<slug>, releases and files included). The
// post body is synced from Notion, so the association is derived here rather
// than kept as frontmatter a sync would overwrite. Only slugs that name a real
// project count; a link to anything else (a dotfiles path, say) is ignored.
const PROJECT_LINK =
  /\]\((?:https?:\/\/(?:www\.)?kud\.io)?\/projects\/([a-z0-9][a-z0-9-]*)|\]\(https?:\/\/github\.com\/kud\/([a-z0-9][a-z0-9.-]*?)(?=[/#?)])/gi

// The project a post is mainly about leads: one its own slug names (the post
// "your-move-a-github-inbox…" is about your-move), then the most-linked; a tie
// keeps the order of first appearance. Each slug once.
export const linkedProjectSlugs = (
  markdown: string,
  known: ReadonlySet<string>,
  postSlug = "",
): string[] => {
  const counts = new Map<string, number>()
  for (const match of markdown.matchAll(PROJECT_LINK)) {
    const slug = (match[1] ?? match[2]).toLowerCase()
    if (known.has(slug)) counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }
  const named = (slug: string) =>
    postSlug === slug || postSlug.startsWith(`${slug}-`) ? 1 : 0
  return [...counts.keys()].sort(
    (a, b) => named(b) - named(a) || counts.get(b)! - counts.get(a)!,
  )
}
