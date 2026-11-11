import { BlueskyIcon } from "@/components/social-icons"
import { RelativeDate } from "@/components/relative-date"
import { getLatestBlueskyPost } from "@/lib/bluesky"
import styles from "./bluesky-card.module.css"

// Erwann's latest Bluesky post as the closing band of home, under the
// experience timeline. The whole card opens the post, through a stretched link
// on the heading, so the links inside the text stay real links. No post, or a
// post older than about six weeks (lib/bluesky.ts), and nothing renders.
const LABEL = "Lately on Bluesky"

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

export const BlueskyBand = async () => {
  const post = await getLatestBlueskyPost()
  if (!post) return null

  // Zero counts say nothing, so only the ones with something in them show.
  const counts = [
    { n: post.replies, word: "reply", Icon: ReplyIcon },
    { n: post.reposts, word: "repost", Icon: RepostIcon },
    { n: post.likes, word: "like", Icon: LikeIcon },
  ].filter(({ n }) => n > 0)

  const preview = post.segments
    .map(({ text }) => text)
    .join("")
    .slice(0, 80)

  const card = (
    <article className={styles.card}>
      <header className={styles.head}>
        <BlueskyIcon className={styles.mark} />
        <a
          href={post.url}
          className={styles.cover}
          target="_blank"
          rel="noreferrer"
          aria-label={`${LABEL}: ${preview}`}
        >
          {LABEL}
        </a>
        <span className={styles.sep} aria-hidden>
          ·
        </span>
        <time className={styles.when} dateTime={post.createdAt}>
          <RelativeDate iso={post.createdAt} className={styles.relative} />
          <span className={styles.absolute}>{shortDate(post.createdAt)}</span>
        </time>
      </header>

      <p className={styles.text}>
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

      {counts.length > 0 && (
        <ul className={styles.counts}>
          {counts.map(({ n, word, Icon }) => (
            <li key={word}>
              <Icon />
              <span aria-hidden>{n}</span>
              <span className={styles.sr}>{plural(n, word)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )

  return (
    <section className={styles.band} aria-label="Latest Bluesky post">
      <div className={styles.bandInner}>{card}</div>
    </section>
  )
}
