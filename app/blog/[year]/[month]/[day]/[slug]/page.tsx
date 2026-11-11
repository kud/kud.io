import type { Metadata } from "next"
import {
  Children,
  isValidElement,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from "react"
import { notFound } from "next/navigation"
// The same Link the index uses — next/link here would drop the view
// transition on every in-blog hop.
import { InkLink as Link } from "@/components/ink-link"
import type { Components } from "hast-util-to-jsx-runtime"
import type { Post } from "@/lib/blog"
import {
  coverImages,
  getAllPosts,
  getPost,
  postPath,
  readingMinutes,
  renderMarkdown,
  shareImage,
} from "@/lib/blog"
import { BlogCodeBlock } from "@/components/blog-code-block"
import { BlogImage } from "@/components/blog-image"
import { CoverImage } from "@/components/blog-cover"
import { imageDimensions } from "@/lib/image-dimensions"
import { BlogMermaid } from "@/components/blog-mermaid"
import { BlogContents } from "@/components/blog-contents"
import { BlogMorePicks } from "@/components/blog-more-picks"
import { pickMore } from "@/lib/blog-more"
import styles from "./page.module.css"

const FEED_TITLE = "Writing — kud.io"

type Params = {
  params: Promise<{ year: string; month: string; day: string; slug: string }>
}

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

// Only the date/slug combinations generateStaticParams emits are real. The
// post is looked up by slug alone, so without this /blog/1999/01/01/<slug>
// would render it at any date anyone typed.
export const dynamicParams = false

export const generateStaticParams = async () =>
  (await getAllPosts()).map(({ date, slug }) => {
    const [year, month, day] = date.split("-")
    return { year, month, day, slug }
  })

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const post = await getPost((await params).slug)
  if (!post) return {}

  const url = `https://kud.io${postPath(post)}`
  // The cover is the page's hero; its share image is a light 1200×630 JPEG
  // derived from it, since WhatsApp shows no picture at all for one much
  // over 300 KB. Without a share image on disk, the generated title card at
  // /blog/og/<slug> stands in — never the full-size cover, and never the
  // site's own portrait card. Listed under twitter as well: the root
  // twitter-image.tsx is inherited by every route and only an explicit list
  // here displaces it.
  const share = shareImage(post)
  const images = share ? [share] : [`/blog/og/${post.slug}`]
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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || undefined,
      images,
    },
  }
}

// A link leaves the site when it is absolute and not to kud.io itself.
const isOutbound = (href?: string) =>
  /^https?:\/\//i.test(href ?? "") &&
  !/^https?:\/\/(www\.)?kud\.io(\/|$)/i.test(href ?? "")

// The arrow belongs after words, not after an image or a figure someone linked.
const isTextual = (children: ReactNode) =>
  Children.toArray(children).every(
    (child) =>
      typeof child === "string" ||
      typeof child === "number" ||
      (isValidElement(child) &&
        typeof child.type === "string" &&
        child.type !== "img"),
  )

// Every heading is its own permalink: the words link to their #id, and a
// faint # answers a hover, so the address bar can be copied from any section.
const anchored = (Tag: "h2" | "h3" | "h4") => {
  const Heading = ({ id, children, ...rest }: ComponentProps<"h2">) => (
    <Tag id={id} {...rest}>
      {id ? (
        <a href={`#${id}`} className={styles.anchor}>
          {children}
        </a>
      ) : (
        children
      )}
    </Tag>
  )
  Heading.displayName = `Anchored(${Tag})`
  return Heading
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
  h1: anchored("h2"),
  h2: anchored("h2"),
  h3: anchored("h3"),
  h4: anchored("h4"),
  div: ({ children, ...rest }) => {
    const source =
      (
        rest as {
          "data-mermaid-source"?: string
          dataMermaidSource?: string
        }
      )["data-mermaid-source"] ??
      (rest as { dataMermaidSource?: string }).dataMermaidSource

    return source === undefined ? (
      <div {...rest}>{children}</div>
    ) : (
      <BlogMermaid source={source} styles={styles} />
    )
  },
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
      {isOutbound(href) && isTextual(children) ? (
        <span className={styles.outbound} aria-hidden>
          ↗
        </span>
      ) : null}
    </a>
  ),
  // A scroll box around the table, so a wide one scrolls inside the column
  // rather than widening the page.
  table: (props) => (
    <div className={styles.tableScroll}>
      <table {...props} />
    </div>
  ),
  img: (props) => (
    <BlogImage
      {...props}
      dimensions={
        typeof props.src === "string" ? imageDimensions(props.src) : null
      }
      styles={styles}
    />
  ),
} satisfies Partial<Components>

const BlogPostPage = async ({ params }: Params) => {
  const { slug } = await params
  const posts = await getAllPosts()
  const index = posts.findIndex((entry) => entry.slug === slug)
  if (index === -1) notFound()

  const post = posts[index]
  // Every other post, newest first, goes into the list: today's two
  // neighbours are the no-script default, and the inline script draws the
  // mixed picks from the rest (lib/blog-more.ts).
  const defaults = new Set(neighboursOf(posts, index).map((p) => p.slug))
  const others = posts.filter((entry) => entry.slug !== slug)
  const body = await renderMarkdown(post.body, components)
  const cover = coverImages(post.cover)
  const coverSize = cover ? imageDimensions(cover.hero) : null

  return (
    <>
      <div className={styles.progress} aria-hidden="true" />
      <article>
        {cover && (
          <figure
            className={styles.hero}
            style={
              {
                ...(cover.preview && { "--preview": `url(${cover.preview})` }),
                ...(coverSize && {
                  "--ratio": `${coverSize.width} / ${coverSize.height}`,
                }),
              } as CSSProperties
            }
          >
            <CoverImage
              src={cover.hero}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        )}
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <span>
            {[post.date, `${readingMinutes(post.body)} min`]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {post.tags.length > 0 && (
            <ul className={styles.metaTags} aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog?tag=${tag}`}
                    className={styles.tag}
                    data-tag={tag}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.body}>{body}</div>
      </article>
      <BlogContents key={slug} />

      {others.length > 0 && (
        // suppressHydrationWarning on the nav and rows: the inline script
        // below marks them (data-for, data-pick) before React hydrates.
        <nav
          className={styles.more}
          aria-label="More posts"
          data-more
          suppressHydrationWarning
        >
          <p className={styles.moreLabel}>More</p>
          <ul className={styles.moreList}>
            {others.map((entry) => {
              const thumb = coverImages(entry.cover)
              return (
                <li
                  key={entry.slug}
                  data-slug={entry.slug}
                  data-default={defaults.has(entry.slug) || undefined}
                  data-recent={entry.slug === others[0].slug || undefined}
                  suppressHydrationWarning
                >
                  <time dateTime={entry.date}>{entry.date}</time>
                  <Link
                    href={postPath(entry)}
                    className={styles.moreThumb}
                    data-tag={entry.tags[0]}
                    data-cover={thumb ? true : undefined}
                    style={
                      thumb?.preview
                        ? ({
                            "--preview": `url(${thumb.preview})`,
                          } as CSSProperties)
                        : undefined
                    }
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {thumb && (
                      <CoverImage
                        src={thumb.thumb}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </Link>
                  <h2>
                    <Link href={postPath(entry)}>{entry.title}</Link>
                  </h2>
                </li>
              )
            })}
          </ul>
          <script
            dangerouslySetInnerHTML={{
              __html: `(${pickMore.toString()})(document.currentScript.parentElement, ${JSON.stringify(slug)})`,
            }}
          />
          <BlogMorePicks slug={slug} />
        </nav>
      )}
    </>
  )
}

export default BlogPostPage
