import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { Components } from "hast-util-to-jsx-runtime"
import { getAllPosts, getPost, readingMinutes, renderMarkdown } from "@/lib/blog"
import { BlogCodeBlock } from "@/components/blog-code-block"
import styles from "./page.module.css"

type Params = { params: Promise<{ slug: string }> }

export const generateStaticParams = async () =>
  (await getAllPosts()).map(({ slug }) => ({ slug }))

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const post = await getPost((await params).slug)
  if (!post) return {}

  const url = `https://kud.io/blog/${post.slug}`
  return {
    title: `${post.title} — kud.io`,
    description: post.description || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
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
  const post = await getPost((await params).slug)
  if (!post) notFound()

  const body = await renderMarkdown(post.body, components)

  return (
    <article>
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.meta}>
        {[post.date, `${readingMinutes(post.body)} min`, ...post.tags]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className={styles.body}>{body}</div>
    </article>
  )
}

export default BlogPostPage
