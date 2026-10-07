"use client"

import { Link } from "next-view-transitions"
import { usePreviewSwitch } from "@/components/blog-preview-switches"

const formatHuman = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))

const ClockIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.75V8l2.25 1.5" />
  </svg>
)

// The post's date, reading time and tags, in whichever variant ?meta= picks.
// Variant 0 is the original joined line. A tag is a link into the index
// filtered to it, so a pill that looks pressable is pressable.
export const PostMeta = ({
  slot,
  date,
  minutes,
  tags,
  styles,
}: {
  slot: "above" | "below"
  date: string
  minutes: number
  tags: string[]
  styles: Record<string, string>
}) => {
  const variant = usePreviewSwitch("meta")
  const human = formatHuman(date)

  const pills = tags.map((tag) => (
    <Link
      key={tag}
      href={`/blog?tag=${encodeURIComponent(tag)}`}
      className={styles.metaPill}
    >
      {tag}
    </Link>
  ))

  if (slot === "above")
    return variant === 4 && tags.length > 0 ? (
      <div className={styles.eyebrow}>{pills}</div>
    ) : null

  switch (variant) {
    case 1:
      return (
        <div className={styles.meta1}>
          <span>
            <time dateTime={date}>{date}</time> · {minutes} min
          </span>
          <span className={styles.metaTags}>{pills}</span>
        </div>
      )
    case 2:
      return (
        <div className={styles.meta2}>
          <span className={styles.metaWhen}>
            <time dateTime={date}>{human}</time>
            <span aria-hidden="true">·</span>
            {minutes} min read
          </span>
          <span className={styles.metaTags}>{pills}</span>
        </div>
      )
    case 3:
      return (
        <div className={styles.meta3}>
          <time dateTime={date}>{human}</time>
          <span className={styles.metaRead}>
            <ClockIcon className={styles.metaIcon} />
            {minutes} min
          </span>
          {tags.length > 0 && (
            <span className={styles.metaSep} aria-hidden="true" />
          )}
          {pills}
        </div>
      )
    case 4:
      return (
        <p className={styles.meta4}>
          <time dateTime={date}>{human}</time> · {minutes} min read
        </p>
      )
    default:
      return (
        <p className={styles.meta}>
          {[date, `${minutes} min`, ...tags].filter(Boolean).join(" · ")}
        </p>
      )
  }
}
