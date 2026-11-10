import { MorphLink } from "@/components/morph-link"
import styles from "./project-family.module.css"

export type FamilyMember = {
  slug: string
  name: string
  type: string
  summary: string | null
  icon: string | null
  // The sibling's own page shows this icon under the same transition name, so
  // it can glide across; on a page without one it would only fade, so it is
  // left unnamed.
  morphIcon: boolean
}

// The other members of a project's `kud-site-eco-*` family, as quiet tiles at
// the foot of its page. Hidden when the project stands alone.
export const ProjectFamily = ({
  name,
  members,
}: {
  name: string
  members: FamilyMember[]
}) =>
  members.length === 0 ? null : (
    <section className={styles.family} aria-labelledby="family-heading">
      <h2 id="family-heading" className={styles.heading}>
        Also in the {name} family
      </h2>
      <ul className={styles.grid}>
        {members.map((member) => (
          <li key={member.slug}>
            <MorphLink
              href={`/projects/${member.slug}`}
              className={styles.tile}
            >
              {member.icon ? (
                <span
                  className={styles.icon}
                  data-glyph={member.icon.endsWith(".svg") ? "" : undefined}
                  style={
                    member.morphIcon
                      ? { viewTransitionName: `app-icon-${member.slug}` }
                      : undefined
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.icon} alt="" loading="lazy" />
                </span>
              ) : (
                <span className={styles.monogram} aria-hidden>
                  {member.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className={styles.body}>
                <span className={styles.head}>
                  <span
                    className={styles.name}
                    style={{ viewTransitionName: `project-${member.slug}` }}
                  >
                    {member.name}
                  </span>
                  <span className={styles.type}>{member.type}</span>
                </span>
                {member.summary ? (
                  <span className={styles.summary}>{member.summary}</span>
                ) : null}
              </span>
            </MorphLink>
          </li>
        ))}
      </ul>
    </section>
  )
