import { Link } from "next-view-transitions"
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

// Two infobox treatments for review: ?i=1 (or none) heads the box with the
// icon as its picture, the live link as caption; ?i=2 drops the picture, which
// the hero already shows, for a plain status row under the title bar. Picked
// before first paint.
const PICK = `(function(){try{if(new URLSearchParams(location.search).get("i")==="2")document.documentElement.setAttribute("data-infobox","2")}catch(e){}})()`

const Live = ({ url, host }: { url: string | null; host: string | null }) =>
  url && host ? (
    <a
      className={styles.infoCaption}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <span className={styles.liveDot} aria-hidden="true" />
      Live at {host}
    </a>
  ) : null

const Group = ({ title }: { title: string }) => (
  <tr className={styles.group}>
    <th colSpan={2} scope="colgroup">
      {title}
    </th>
  </tr>
)

const Row = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <tr>
    <th scope="row">{label}</th>
    <td>{children}</td>
  </tr>
)

// The infobox: an encyclopaedia's summary panel in Dusk terms. Title bar, the
// icon as its picture with the live status as caption, then label and value
// rows in three groups: what the product is, what it is built with, and where
// the project lives.
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
  return (
    <aside className={styles.infobox} aria-label={`${name} at a glance`}>
      <script dangerouslySetInnerHTML={{ __html: PICK }} />
      <table>
        <thead>
          <tr>
            <th colSpan={2} className={styles.infoTitle}>
              {name}
            </th>
          </tr>
        </thead>
        <tbody>
          {app.icon ? (
            <tr className={styles.infoPicture}>
              <td colSpan={2} className={styles.infoImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.icon} alt={`${name} icon`} />
                <Live url={url} host={host} />
              </td>
            </tr>
          ) : null}
          {url ? (
            <tr className={app.icon ? styles.infoStatus : undefined}>
              <td colSpan={2} className={styles.infoStatusCell}>
                <Live url={url} host={host} />
              </td>
            </tr>
          ) : null}
          {app.facts.length > 0 ? (
            <>
              <Group title="Product" />
              {app.facts.map((fact) => (
                <Row key={fact.label} label={fact.label}>
                  {fact.value}
                </Row>
              ))}
            </>
          ) : null}
          {app.stack.length > 0 ? (
            <>
              <Group title="Built with" />
              <Row label="Stack">
                <ul className={styles.inlineList}>
                  {app.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </Row>
            </>
          ) : null}
          <Group title="Project" />
          <Row label="Source">
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              {repo}
            </a>
          </Row>
          {release ? (
            <Row label="Latest release">
              <a href={release.url} target="_blank" rel="noreferrer">
                v{release.version}
              </a>
              {released ? (
                <span className={styles.infoMuted}>
                  {" "}
                  ·{" "}
                  <time dateTime={release.publishedAt ?? undefined}>
                    {released}
                  </time>
                </span>
              ) : null}
            </Row>
          ) : null}
          {hasDocs ? (
            <Row label="Documentation">
              <Link href={`/projects/${project.slug}/docs`}>Read the docs</Link>
            </Row>
          ) : null}
        </tbody>
      </table>
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
                  <Link href={post.href}>{post.title}</Link>
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
