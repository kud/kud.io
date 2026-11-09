import { Link } from "next-view-transitions"
import { ART } from "@/lib/art"
import { IllustrationSlot } from "@/components/illustration-slot"
import styles from "./projects-top.module.css"

export type TopProject = {
  slug: string
  name: string
  description: string | null
  icon?: string | null
}

export type TopRelease = {
  version: string
  publishedAt: string
  age: string | null
  fresh: boolean
}

// PROTOTYPE: which top-of-page layout /projects shows (`?t=`).
// 1 shelf: pinned cards, then a grid of recent rows · 2 split: pinned beside a
// dated release list · 3 one shelf: pins and recents as one row of cards.
export type TopLayout = 1 | 2 | 3

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(iso),
  )

// No view-transition-name anywhere here: the list rows below own
// project-<slug>, and a name used twice cancels the morph.
const Icon = ({ project, size }: { project: TopProject; size: number }) =>
  project.icon ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.icon}
      src={project.icon}
      alt=""
      width={size}
      height={size}
      loading="lazy"
    />
  ) : (
    <span
      className={styles.monogram}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {project.name.charAt(0).toUpperCase()}
    </span>
  )

const PinGlyph = () => (
  <svg
    className={styles.pin}
    viewBox="0 0 16 16"
    width="12"
    height="12"
    aria-hidden
  >
    <path
      d="M9.8 1.5 14.5 6.2l-1.4 1.4-1-.4-2.6 2.6.3 2.8-1.4 1.4-2.7-2.7L2.5 14.5l-1-1 3.2-3.2L2 7.6l1.4-1.4 2.8.3 2.6-2.6-.4-1z"
      fill="currentColor"
    />
  </svg>
)

const ReleaseLine = ({ release }: { release: TopRelease }) => (
  <span className={styles.release}>
    {release.fresh ? <span className={styles.freshDot} aria-hidden /> : null}
    <span className={styles.version}>v{release.version}</span>
    {release.age ? <span className={styles.age}>{release.age}</span> : null}
  </span>
)

// A pinned card: the drawing when the project has one, else its icon on the
// card's own ground. Both share one height so the row stays level.
const PinnedCard = ({ project }: { project: TopProject }) => (
  <li>
    <Link href={`/projects/${project.slug}`} className={styles.pinCard}>
      {ART[project.slug] ? (
        <IllustrationSlot ratio="4/3" slug={project.slug} />
      ) : (
        <span className={styles.pinPlate}>
          <Icon project={project} size={72} />
        </span>
      )}
      <strong className={styles.pinName}>{project.name}</strong>
      {project.description ? (
        <span className={styles.pinDesc}>{project.description}</span>
      ) : null}
    </Link>
  </li>
)

const Shelf = ({
  pinned,
  recent,
}: {
  pinned: TopProject[]
  recent: (TopProject & { release: TopRelease })[]
}) => (
  <>
    {pinned.length > 0 ? (
      <section className={styles.block} aria-labelledby="top-pinned">
        <h2 id="top-pinned" className={styles.heading}>
          <PinGlyph />
          Pinned
        </h2>
        <ul className={styles.pinGrid}>
          {pinned.map((p) => (
            <PinnedCard key={p.slug} project={p} />
          ))}
        </ul>
      </section>
    ) : null}
    {recent.length > 0 ? (
      <section className={styles.block} aria-labelledby="top-recent">
        <h2 id="top-recent" className={styles.heading}>
          Recently released
        </h2>
        <ul className={styles.recentGrid}>
          {recent.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className={styles.recentRow}>
                <Icon project={p} size={36} />
                <span className={styles.recentBody}>
                  <strong className={styles.recentName}>{p.name}</strong>
                  <ReleaseLine release={p.release} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null}
  </>
)

const Split = ({
  pinned,
  recent,
}: {
  pinned: TopProject[]
  recent: (TopProject & { release: TopRelease })[]
}) => (
  <div className={styles.split}>
    {pinned.length > 0 ? (
      <section aria-labelledby="top-pinned">
        <h2 id="top-pinned" className={styles.heading}>
          <PinGlyph />
          Pinned
        </h2>
        <ul className={styles.splitPins}>
          {pinned.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className={styles.splitPin}>
                {ART[p.slug] ? (
                  <IllustrationSlot
                    ratio="16/9"
                    slug={p.slug}
                    className={styles.splitArt}
                  />
                ) : (
                  <span className={styles.splitPlate}>
                    <Icon project={p} size={48} />
                  </span>
                )}
                <strong className={styles.pinName}>{p.name}</strong>
                {p.description ? (
                  <span className={styles.pinDesc}>{p.description}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null}
    {recent.length > 0 ? (
      <section aria-labelledby="top-recent">
        <h2 id="top-recent" className={styles.heading}>
          Recently released
        </h2>
        <ol className={styles.timeline}>
          {recent.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className={styles.tick}>
                <time
                  className={styles.tickDate}
                  dateTime={p.release.publishedAt}
                >
                  {shortDate(p.release.publishedAt)}
                </time>
                <Icon project={p} size={28} />
                <strong className={styles.tickName}>{p.name}</strong>
                <span className={styles.version}>v{p.release.version}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    ) : null}
  </div>
)

const OneShelf = ({
  pinned,
  recent,
}: {
  pinned: TopProject[]
  recent: (TopProject & { release: TopRelease })[]
}) => (
  <section className={styles.block} aria-labelledby="top-now">
    <h2 id="top-now" className={styles.heading}>
      Start here
    </h2>
    <ul className={styles.oneGrid}>
      {pinned.map((p) => (
        <li key={p.slug}>
          <Link href={`/projects/${p.slug}`} className={styles.oneCard}>
            <span className={styles.oneHead}>
              <Icon project={p} size={40} />
              <span className={styles.oneTag}>
                <PinGlyph />
                Pinned
              </span>
            </span>
            <strong className={styles.oneName}>{p.name}</strong>
            {p.description ? (
              <span className={styles.oneDesc}>{p.description}</span>
            ) : null}
          </Link>
        </li>
      ))}
      {/* One shelf holds nine: the pins, then the newest releases. */}
      {recent.slice(0, Math.max(2, 9 - pinned.length)).map((p) => (
        <li key={p.slug}>
          <Link href={`/projects/${p.slug}`} className={styles.oneCard}>
            <span className={styles.oneHead}>
              <Icon project={p} size={40} />
              <ReleaseLine release={p.release} />
            </span>
            <strong className={styles.oneName}>{p.name}</strong>
            {p.description ? (
              <span className={styles.oneDesc}>{p.description}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  </section>
)

export const ProjectsTop = ({
  layout,
  pinned,
  recent,
}: {
  layout: TopLayout
  pinned: TopProject[]
  recent: (TopProject & { release: TopRelease })[]
}) => {
  if (pinned.length === 0 && recent.length === 0) return null
  const Layout = layout === 1 ? Shelf : layout === 2 ? Split : OneShelf
  return (
    <div className={styles.top} data-layout={layout}>
      <Layout pinned={pinned} recent={recent} />
    </div>
  )
}
