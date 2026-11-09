import { InkLink as Link } from "@/components/ink-link"
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
}

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

// The top of /projects: pinned cards on the left, a dated list of the latest
// releases on the right. A pinned card shows the project's drawing when it has
// one, else its icon on the card's own ground, at the same ratio.
export const ProjectsTop = ({
  pinned,
  recent,
}: {
  pinned: TopProject[]
  recent: (TopProject & { release: TopRelease })[]
}) => {
  if (pinned.length === 0 && recent.length === 0) return null
  return (
    <div className={styles.top}>
      <div className={styles.split}>
        {pinned.length > 0 ? (
          <section aria-labelledby="top-pinned">
            <h2 id="top-pinned" className={styles.heading}>
              <PinGlyph />
              Pinned
            </h2>
            <ul className={styles.pins}>
              {pinned.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className={styles.pinCard}>
                    {ART[p.slug] ? (
                      <IllustrationSlot
                        ratio="16/9"
                        slug={p.slug}
                        className={styles.pinArt}
                      />
                    ) : (
                      <span className={styles.pinPlate}>
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
    </div>
  )
}
