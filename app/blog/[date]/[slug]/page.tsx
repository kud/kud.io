import type { Metadata } from "next"
import { notFound } from "next/navigation"
// The same Link the index uses — next/link here would drop the view
// transition on every in-blog hop.
import { Link } from "next-view-transitions"
import type { Components } from "hast-util-to-jsx-runtime"
import type { Post } from "@/lib/blog"
import {
  getAllPosts,
  getPost,
  postPath,
  readingMinutes,
  renderMarkdown,
} from "@/lib/blog"
import { BlogCodeBlock } from "@/components/blog-code-block"
import styles from "./page.module.css"

const FEED_TITLE = "Writing — kud.io"

type Params = { params: Promise<{ date: string; slug: string }> }

// Two rows: the post either side by date, newest first, off the one sorted
// list getAllPosts already returns — a second sort here could tie-break
// differently and put the index and this block in disagreement.
//
// A three-wide window around the post, clamped to the ends, then the post
// itself removed. The clamp is what handles the edges: the newest post has no
// newer neighbour, so its window slides down to the two below it, and the
// oldest slides up to the two above. One post total leaves an empty window.
const NEIGHBOURS = 2

const neighboursOf = (posts: Post[], index: number) => {
  const start = Math.min(
    Math.max(index - 1, 0),
    Math.max(posts.length - NEIGHBOURS - 1, 0),
  )
  return posts
    .slice(start, start + NEIGHBOURS + 1)
    .filter((_, offset) => start + offset !== index)
}

// Only the date+slug pairs generateStaticParams emits are real. Without this,
// /blog/1999-01-01/bck-i-search would render the same post at any date anyone
// typed -- the post is looked up by slug alone.
export const dynamicParams = false

export const generateStaticParams = async () =>
  (await getAllPosts()).map(({ date, slug }) => ({ date, slug }))

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const post = await getPost((await params).slug)
  if (!post) return {}

  const url = `https://kud.io${postPath(post)}`
  return {
    title: `${post.title} — kud.io`,
    description: post.description || undefined,
    alternates: {
      canonical: postPath(post),
      // Per-page, not in the blog layout — see app/blog/page.tsx.
      types: {
        "application/rss+xml": [{ url: "/blog/feed.xml", title: FEED_TITLE }],
      },
    },
    openGraph: {
      type: "article",
      url,
      siteName: "kud.io",
      locale: "en_GB",
      title: post.title,
      description: post.description || undefined,
      publishedTime: post.date || undefined,
      modifiedTime: post.updated || undefined,
      tags: post.tags,
      // The cover is the post's share image and nothing else: the page itself
      // opens on the title, so a hero would be the same picture twice.
      images: post.cover ? [post.cover] : undefined,
    },
  }
}

// Only the elements whose STRUCTURE changes get a component. Everything else —
// paragraphs, lists, links, quotes, rules, inline code — is styled by
// descendant rules in page.module.css, which produce identical markup. A
// pass-through component that only attaches a class is indirection with
// nothing on the other side of it.
const components = {
  // Notion's heading_1 becomes `#`, which would be a second <h1> under the
  // post title. Demoted rather than dropped: the outline stays valid and the
  // author's own heading level still reads as the top of their document.
  h1: (props) => <h2 {...props} />,
  pre: ({ children, ...rest }) => (
    <BlogCodeBlock
      styles={styles}
      language={(rest as { "data-lang"?: string })["data-lang"]}
    >
      {children}
    </BlogCodeBlock>
  ),
  a: ({ href, children, ...rest }) => (
    <a
      href={href}
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      {...rest}
    >
      {children}
    </a>
  ),
  img: (props) => <img {...props} loading="lazy" decoding="async" alt={props.alt ?? ""} />,
} satisfies Partial<Components>

const BlogPostPage = async ({ params }: Params) => {
  const { slug } = await params
  const posts = await getAllPosts()
  const index = posts.findIndex((entry) => entry.slug === slug)
  if (index === -1) notFound()

  const post = posts[index]
  const neighbours = neighboursOf(posts, index)
  const body = await renderMarkdown(post.body, components)

  return (
    <>
      <article>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.meta}>
          {[post.date, `${readingMinutes(post.body)} min`, ...post.tags]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className={styles.body}>{body}</div>
      </article>

      {neighbours.length > 0 && (
        <nav className={styles.more} aria-label="More posts">
          <p className={styles.moreLabel}>More</p>
          <ul className={styles.moreList}>
            {neighbours.map((entry) => (
              <li key={entry.slug}>
                <time dateTime={entry.date}>{entry.date}</time>
                <h2>
                  <Link href={postPath(entry)}>{entry.title}</Link>
                </h2>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}

export default BlogPostPage
