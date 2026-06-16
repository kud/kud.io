import type { ReactNode } from "react"
import Link from "next/link"
import { Reveal } from "./reveal"
import { Terminal } from "./terminal"
import styles from "./landing-kit.module.css"

const isExternal = (href: string) => href.startsWith("http")

export const Hero = ({
  title,
  tagline,
  badge,
  children,
}: {
  title: ReactNode
  tagline?: ReactNode
  badge?: ReactNode
  children?: ReactNode
}) => (
  <section className={styles.hero}>
    <div className={styles.heroGrid} />
    <div className={styles.heroContent}>
      <Link href="/projects" className={styles.back}>
        ← Projects
      </Link>
      {badge ? (
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          {badge}
        </div>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
      {children ? <div className={styles.actions}>{children}</div> : null}
    </div>
  </section>
)

export const Action = ({
  href,
  primary,
  children,
}: {
  href: string
  primary?: boolean
  children: ReactNode
}) => (
  <a
    href={href}
    className={primary ? styles.primary : styles.secondary}
    {...(isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {})}
  >
    {children}
  </a>
)

export const Stats = ({ children }: { children: ReactNode }) => (
  <div className={styles.stats}>{children}</div>
)

export const Stat = ({
  value,
  label,
}: {
  value: ReactNode
  label: ReactNode
}) => (
  <div className={styles.stat}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
)

export const Section = ({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: ReactNode
  title?: ReactNode
  sub?: ReactNode
  children: ReactNode
}) => (
  <section className={styles.section}>
    {eyebrow || title || sub ? (
      <Reveal className={styles.sectionHeader}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
        {sub ? <p className={styles.sectionSub}>{sub}</p> : null}
      </Reveal>
    ) : null}
    {children}
  </section>
)

// Code content comes in as a fenced code block (MDX children), not a prop, so
// next-mdx-remote renders it reliably. Install centres a single terminal;
// Terminal can be used directly for examples.
export const Install = ({
  children,
  label = "terminal",
}: {
  children: ReactNode
  label?: string
}) => (
  <Reveal className={styles.installWrap}>
    <Terminal label={label}>{children}</Terminal>
  </Reveal>
)

export const Features = ({ children }: { children: ReactNode }) => (
  <div className={styles.features}>{children}</div>
)

export const Feature = ({
  title,
  children,
}: {
  title: ReactNode
  children?: ReactNode
}) => (
  <Reveal className={styles.feature}>
    <span className={styles.featureMark} />
    <h3>{title}</h3>
    {children ? <div className={styles.featureBody}>{children}</div> : null}
  </Reveal>
)

export const CTA = ({
  href,
  title,
  sub,
  label = "Open documentation →",
}: {
  href: string
  title?: ReactNode
  sub?: ReactNode
  label?: string
}) => (
  <section className={styles.ctaSection}>
    <Reveal>
      {title ? <h2 className={styles.ctaTitle}>{title}</h2> : null}
      {sub ? <p className={styles.ctaSub}>{sub}</p> : null}
      <a
        href={href}
        className={styles.cta}
        {...(isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {label}
      </a>
    </Reveal>
  </section>
)

// The component vocabulary available inside a project's landing.mdx.
export const landingComponents = {
  Hero,
  Action,
  Stats,
  Stat,
  Section,
  Install,
  Terminal,
  Features,
  Feature,
  CTA,
}
