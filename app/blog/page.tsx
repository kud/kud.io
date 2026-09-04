import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import { BlogIndex } from "@/components/blog-index"
import styles from "./page.module.css"

const TITLE = "Writing"
const DESCRIPTION =
  "Notes on systems, tooling, and the trade-offs behind them — by Erwann Mest."

export const metadata: Metadata = {
  title: `${TITLE} — kud.io`,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "https://kud.io/blog",
    siteName: "kud.io",
    locale: "en_GB",
    title: `${TITLE} — kud.io`,
    description: DESCRIPTION,
  },
}

// The index needs the whole list in the browser to filter it, and the list is
// four small fields per post — so the bodies stay on the server and only what
// a row renders crosses the boundary.
const BlogIndexPage = async () => {
  const posts = await getAllPosts()

  if (posts.length === 0)
    return (
      <p className={styles.empty}>
        Nothing published yet. The first post is on its way.
      </p>
    )

  return (
    <BlogIndex
      styles={styles}
      entries={posts.map(({ slug, title, date, tags }) => ({
        slug,
        title,
        date,
        tags,
      }))}
    />
  )
}

export default BlogIndexPage
