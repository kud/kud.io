import { getAllPosts, type Post } from "@/lib/blog"
import { getProjects, type Project } from "@/lib/projects"
import { linkedProjectSlugs } from "@/lib/post-projects"

// Both directions of the post ↔ project link, built once per render from the
// links each post already carries (lib/post-projects.ts).
const links = async () => {
  const [posts, projects] = await Promise.all([getAllPosts(), getProjects()])
  const bySlug = new Map(projects.map((project) => [project.slug, project]))
  const known = new Set(bySlug.keys())
  return { posts, bySlug, known }
}

export const projectsOfPost = async (post: Post): Promise<Project[]> => {
  const { bySlug, known } = await links()
  return linkedProjectSlugs(post.body, known, post.slug).map(
    (slug) => bySlug.get(slug)!,
  )
}

// Newest first, as the blog lists them.
export const postsAboutProject = async (slug: string): Promise<Post[]> => {
  const { posts, known } = await links()
  return posts.filter((post) =>
    linkedProjectSlugs(post.body, known, post.slug).includes(slug),
  )
}
