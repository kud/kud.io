import { InkLink } from "@/components/ink-link"
import type { Project } from "@/lib/projects"
import type { AppMeta } from "@/lib/app"
import type { Release } from "@/lib/release"
import styles from "./product-record.module.css"

type Post = { slug: string; title: string; description: string; href: string }

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const formatDate = (iso: string | null, format: Intl.DateTimeFormat) => {
  const at = iso ? Date.parse(iso) : NaN
  return Number.isNaN(at) ? null : format.format(at)
}

// The project's life in one line, right under the buttons: when it began, when
// it last moved, and the terms it ships under. Only what GitHub says; a date it
// does not give is left out rather than guessed.
export const RecordTimeline = ({ project }: { project: Project }) => {
  const started = formatDate(project.createdAt, monthYear)
  const changed = formatDate(project.pushedAt, dayMonthYear)
  const items = [
    started
      ? { label: "Started", value: started, at: project.createdAt }
      : null,
    changed
      ? { label: "Last change", value: changed, at: project.pushedAt }
      : null,
    project.license
      ? { label: "Licence", value: project.license, at: null }
      : null,
  ].filter((item) => item !== null)
  if (items.length === 0) return null
  return (
    <dl className={styles.timeline}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.at ? (
              <time dateTime={item.at}>{item.value}</time>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type SheetProps = {
  project: Project
  app: AppMeta
  name: string
  url: string | null
  host: string | null
  hasDocs: boolean
  release: Release | null
  writing: Post[]
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className={styles.infoSection}>
    <h2 className={styles.infoLabel}>{title}</h2>
    {children}
  </section>
)

// The infobox: an encyclopaedia's summary panel, dressed for Dusk. A title
// band with the name and the live status as a pill (the icon stays in the hero),
// then three sections under soft rounded headers: what the product is, what it
// is built with, and where the project lives, as label and value rows.
const Infobox = ({
  project,
  app,
  name,
  url,
  host,
  hasDocs,
  release,
}: SheetProps) => {
  const released = release
    ? formatDate(release.publishedAt, dayMonthYear)
    : null
  const repo = project.repoUrl.replace(/^https:\/\/github\.com\//, "")
  const projectRows = [
    {
      label: "Source",
      value: (
        <a href={project.repoUrl} target="_blank" rel="noreferrer">
          {repo}
        </a>
      ),
    },
    release
      ? {
          label: "Latest release",
          value: (
            <>
              <a href={release.url} target="_blank" rel="noreferrer">
                v{release.version}
              </a>
              {released ? (
                <span className={styles.infoMuted}>
                  {" · "}
                  <time dateTime={release.publishedAt ?? undefined}>
                    {released}
                  </time>
                </span>
              ) : null}
            </>
          ),
        }
      : null,
    hasDocs
      ? {
          label: "Documentation",
          value: (
            <InkLink href={`/projects/${project.slug}/docs`}>
              Read the docs
            </InkLink>
          ),
        }
      : null,
  ].filter((row) => row !== null)
  return (
    <aside className={styles.infobox} aria-label={`${name} at a glance`}>
      <header className={styles.infoHead}>
        <p className={styles.infoName}>{name}</p>
        {url && host ? (
          <a
            className={styles.livePill}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.liveDot} aria-hidden="true" />
            Live at {host}
          </a>
        ) : null}
      </header>
      {app.facts.length > 0 ? (
        <Section title="Product">
          <dl className={styles.infoRows}>
            {app.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}
      {app.stack.length > 0 ? (
        <Section title="Built with">
          <ul className={styles.chips} aria-label="Stack">
            {app.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      <Section title="Project">
        <dl className={styles.infoRows}>
          {projectRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </aside>
  )
}

// The body of a product record: the story in a reading column, every fact in
// the infobox beside it (above it on a phone).
export const RecordSheet = (props: SheetProps) => {
  const { app, name, writing } = props
  const shot = app.screenshots[0]
  return (
    <div className={styles.sheet}>
      <Infobox {...props} />
      <div className={styles.main}>
        {shot ? (
          <figure className={styles.shot}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot} alt={`${name}, as it looks today`} />
          </figure>
        ) : null}
        {app.what ? (
          <section className={styles.chapter}>
            <h2>What it is</h2>
            <p className={styles.lead}>{app.what}</p>
            {app.who ? (
              <p className={styles.who}>
                <strong>For</strong> {app.who}
              </p>
            ) : null}
          </section>
        ) : null}
        {app.flow.length > 0 ? (
          <section className={styles.chapter}>
            <h2>How it works</h2>
            <ol className={styles.flow}>
              {app.flow.map((step) => (
                <li key={step.label}>
                  <strong>{step.label}</strong>
                  {step.note ? <span>{step.note}</span> : null}
                </li>
              ))}
            </ol>
            {app.flowNote ? (
              <p className={styles.flowNote}>{app.flowNote}</p>
            ) : null}
          </section>
        ) : null}
        {app.decisions.length > 0 ? (
          <section className={styles.chapter}>
            <h2>Decisions</h2>
            <ul className={styles.decisions}>
              {app.decisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {writing.length > 0 ? (
          <section className={styles.chapter}>
            <h2>Writing</h2>
            <ul className={styles.writing}>
              {writing.map((post) => (
                <li key={post.slug}>
                  <InkLink href={post.href}>{post.title}</InkLink>
                  <span>{post.description}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
