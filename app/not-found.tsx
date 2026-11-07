import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import { getProjects } from "@/lib/projects"
import { getAllPosts } from "@/lib/blog"
import { postPath } from "@/lib/blog-path"
import { Lost, type Place } from "@/components/lost"

// The root not-found renders for every unmatched URL and for every notFound()
// thrown below it (an unknown project slug, a blog post that isn't there).
// Next answers both with a 404 and injects <meta name="robots" content="noindex">
// itself; a robots field here would only print a second, conflicting tag.
export const metadata: Metadata = {
  title: "Nothing lives here · Erwann Mest",
  description: "There is no page at this address on kud.io.",
}

// The places a lost visitor most plausibly meant. Each carries the words it
// might be typed as, so /writing finds the blog and /project finds /projects.
const PAGES: Place[] = [
  { href: "/", label: "Home", kind: "Page", keys: ["home", "about", "index"] },
  {
    href: "/projects",
    label: "Projects",
    kind: "Page",
    keys: ["projects", "project", "work", "apps"],
  },
  {
    href: "/blog",
    label: "Writing",
    kind: "Page",
    keys: ["blog", "writing", "posts", "articles"],
  },
  { href: "/cv.pdf", label: "CV", kind: "Page", keys: ["cv", "resume"] },
]

// The illustration's slot. The page stands on its own until the file lands in
// public/; once it does, it appears at a fixed 4:3 with no layout shift.
const ILLUSTRATION = "/404/empty-wall.webp"
const hasIllustration = existsSync(join(process.cwd(), "public", ILLUSTRATION))

const NotFound = async () => {
  // Either source failing must not cost the visitor the page: it simply has
  // fewer places to suggest.
  const [projects, posts] = await Promise.all([
    getProjects().catch(() => []),
    getAllPosts().catch(() => []),
  ])

  const seen = new Set<string>()
  const projectPlaces: Place[] = projects
    .filter(({ slug }) => !seen.has(slug) && seen.add(slug))
    .map(({ slug, name, description }) => ({
      href: `/projects/${slug}`,
      label: name,
      kind: "Project",
      keys: [slug],
      detail: description ?? undefined,
    }))

  const postPlaces: Place[] = posts.map((post) => ({
    href: postPath(post),
    label: post.title,
    kind: "Writing",
    keys: [post.slug],
    detail: post.description,
  }))

  return (
    <Lost
      places={[...PAGES, ...postPlaces, ...projectPlaces]}
      illustration={hasIllustration ? ILLUSTRATION : undefined}
    />
  )
}

export default NotFound
