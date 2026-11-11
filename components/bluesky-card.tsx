import type { ReactNode } from "react"
import { BlueskyIcon } from "@/components/social-icons"
import { RelativeDate } from "@/components/relative-date"
import {
  getLatestBlueskyPost,
  getRecentBlueskyPosts,
  PROFILE_URL,
} from "@/lib/bluesky"
import type { BlueskyPost } from "@/lib/bluesky"
import { Peek } from "@/components/bluesky-peek"
import styles from "./bluesky-card.module.css"

// Erwann's Bluesky on home. The latest post peeks over the Bluesky icon in the
// hero socials (components/bluesky-peek.tsx) as a teaser: clamped text, its
// picture, the counts. The whole card opens the feed behind it
// (components/bluesky-feed.tsx), his recent posts in full, through a stretched
// button on the heading, so the links inside the text stay real links. No
// post, or a latest post older than about six weeks (lib/bluesky.ts), and
// nothing peeks.
const LABEL = "Lately on Bluesky"
const FEED_SIZE = 8

const shortDate = (iso: string) => {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

const icon = {
  viewBox: "0 0 24 24",
  width: 14,
  height: 14,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const

const ReplyIcon = () => (
  <svg {...icon}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
  </svg>
)

const RepostIcon = () => (
  <svg {...icon}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
  </svg>
)

const LikeIcon = () => (
  <svg {...icon}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
)

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const When = ({ iso }: { iso: string }) => (
  <time className={styles.when} dateTime={iso}>
    <RelativeDate iso={iso} className={styles.relative} />
    <span className={styles.absolute}>{shortDate(iso)}</span>
  </time>
)

const Text = ({
  post,
  className,
}: {
  post: BlueskyPost
  className: string
}) => (
  <p className={className}>
    {post.segments.map(({ text, href }, index) =>
      href ? (
        <a
          key={index}
          href={href}
          className={styles.inline}
          target="_blank"
          rel="noreferrer"
        >
          {text}
        </a>
      ) : (
        <span key={index}>{text}</span>
      ),
    )}
  </p>
)

// Zero counts say nothing, so only the ones with something in them show.
const Counts = ({ post }: { post: BlueskyPost }) => {
  const counts = [
    { n: post.replies, word: "reply", Icon: ReplyIcon },
    { n: post.reposts, word: "repost", Icon: RepostIcon },
    { n: post.likes, word: "like", Icon: LikeIcon },
  ].filter(({ n }) => n > 0)
  if (counts.length === 0) return null
  return (
    <ul className={styles.counts}>
      {counts.map(({ n, word, Icon }) => (
        <li key={word}>
          <Icon />
          <span aria-hidden>{n}</span>
          <span className={styles.sr}>{plural(n, word)}</span>
        </li>
      ))}
    </ul>
  )
}

// The teaser in the peek.
const Card = ({ post }: { post: BlueskyPost }) => {
  const preview = post.segments
    .map(({ text }) => text)
    .join("")
    .slice(0, 80)

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <header className={styles.head}>
          <BlueskyIcon className={styles.mark} />
          <button
            type="button"
            className={styles.cover}
            data-bsky-feed
            aria-haspopup="dialog"
            aria-label={`${LABEL}: ${preview}. Show recent posts`}
          >
            {LABEL}
          </button>
          <span className={styles.sep} aria-hidden>
            ·
          </span>
          <When iso={post.createdAt} />
          <span className={styles.more} aria-hidden>
            More posts
          </span>
        </header>
        <Text post={post} className={styles.text} />
        <Counts post={post} />
      </div>

      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.image}
          src={post.image.src}
          alt={post.image.alt}
          loading="lazy"
          decoding="async"
        />
      )}
    </article>
  )
}

// One post in the feed, in full. Its date opens it on Bluesky, through a link
// stretched over the post; the links in the text and the link card sit above.
const FeedPost = ({ post }: { post: BlueskyPost }) => {
  const { images, link } = post
  return (
    <article className={styles.post}>
      <a
        href={post.url}
        className={styles.postLink}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open the post of ${shortDate(post.createdAt)} on Bluesky`}
      >
        <When iso={post.createdAt} />
      </a>
      <Text post={post} className={styles.full} />

      {images.length > 0 ? (
        <div className={styles.gallery} data-count={Math.min(images.length, 4)}>
          {images.slice(0, 4).map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              style={
                images.length === 1 && image.ratio
                  ? { aspectRatio: String(image.ratio) }
                  : undefined
              }
            />
          ))}
        </div>
      ) : link ? (
        <a
          href={link.href}
          className={styles.linkCard}
          target="_blank"
          rel="noreferrer"
        >
          {link.thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumb} alt="" loading="lazy" decoding="async" />
          )}
          <span className={styles.linkText}>
            <span className={styles.linkTitle}>{link.title}</span>
            <span className={styles.linkHost}>{link.host}</span>
          </span>
        </a>
      ) : null}

      <Counts post={post} />
    </article>
  )
}

const Feed = ({ posts }: { posts: BlueskyPost[] }) => (
  <ol className={styles.feed}>
    {posts.map((post) => (
      <li key={post.url}>
        <FeedPost post={post} />
      </li>
    ))}
  </ol>
)

// The Bluesky item of the hero socials. Without a fresh post it is the plain
// icon link it always was.
export const BlueskyPeek = async ({ children }: { children: ReactNode }) => {
  const [post, posts] = await Promise.all([
    getLatestBlueskyPost(),
    getRecentBlueskyPosts(FEED_SIZE),
  ])
  if (!post) return <li>{children}</li>
  return (
    <Peek
      card={<Card post={post} />}
      feed={<Feed posts={posts} />}
      profile={PROFILE_URL}
    >
      {children}
    </Peek>
  )
}
