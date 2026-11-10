import { InkLink } from "@/components/ink-link"
import type { Project } from "@/lib/projects"
import type { AppMeta } from "@/lib/app"
import type { Release } from "@/lib/release"
import { formatNode, type PackageFacts } from "@/lib/package-facts"
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

type Link = { slug: string; name: string; type: string }

type ReadmeBoxProps = {
  project: Project
  facts: PackageFacts | null
  release: Release | null
  language: string | null
  frameworks: string[]
  // Other kud projects this one depends on, outside its own family.
  builtOn: Link[]
  // The other members of its `kud-site-eco-*` family, with that family's name.
  family: { name: string; members: Link[] } | null
}

const Rows = ({
  rows,
}: {
  rows: ({ label: string; value: React.ReactNode; release?: boolean } | null)[]
}) => (
  <dl className={styles.infoRows}>
    {rows
      .filter((row) => row !== null)
      .map((row) => (
        <div
          key={row.label}
          className={row.release ? styles.releaseRow : undefined}
        >
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
  </dl>
)

const projectLinks = (links: Link[]) =>
  links.map((link, index) => (
    <span key={link.slug}>
      {index > 0 ? ", " : null}
      <InkLink href={`/projects/${link.slug}`}>{link.name}</InkLink>
    </span>
  ))

// The README landing's infobox: the same card as a product record, filled only
// from what the repo already states (package.json, the registry, the topics,
// GitHub's own fields). Time and terms sit in the hero's timeline and the
// story is the README, so neither is repeated here.
export const ReadmeInfobox = ({
  project,
  facts,
  release,
  language,
  frameworks,
  builtOn,
  family,
}: ReadmeBoxProps) => {
  const released = release
    ? formatDate(release.publishedAt, dayMonthYear)
    : null
  const onNpm = Boolean(release?.url.startsWith("https://www.npmjs.com/"))
  const releaseRow = release
    ? {
        label: "Latest release",
        release: true,
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
    : null
  const isStore =
    project.category === "raycast" || project.category === "webext"
  const storeRows = isStore
    ? [
        project.downloads
          ? {
              label: "Installs",
              value: project.downloads.toLocaleString("en-GB"),
            }
          : null,
        project.users
          ? {
              label: "Daily users",
              value: project.users.toLocaleString("en-GB"),
            }
          : null,
        releaseRow,
      ]
    : []
  const packageRows = facts
    ? [
        {
          label: "Package",
          value: onNpm ? (
            <a href={release?.url} target="_blank" rel="noreferrer">
              <code>{facts.name}</code>
            </a>
          ) : (
            <code>{facts.name}</code>
          ),
        },
        facts.commands.length > 0
          ? {
              label: facts.commands.length > 1 ? "Commands" : "Command",
              value: facts.commands.map((command, index) => (
                <span key={command}>
                  {index > 0 ? " " : null}
                  <code>{command}</code>
                </span>
              )),
            }
          : null,
        facts.node ? { label: "Node", value: formatNode(facts.node) } : null,
        facts.peers.length > 0
          ? { label: "Works with", value: facts.peers.join(", ") }
          : null,
        builtOn.length > 0
          ? { label: "Built on", value: projectLinks(builtOn) }
          : null,
        releaseRow,
      ]
    : []
  const chips = [language, ...frameworks].filter((chip): chip is string =>
    Boolean(chip),
  )
  const repo = project.repoUrl.replace(/^https:\/\/github\.com\//, "")
  const firstRows = isStore ? storeRows : packageRows
  return (
    <aside
      className={`${styles.infobox} ${styles.readmeBox}`}
      aria-label={`${project.name} at a glance`}
    >
      <header className={styles.infoHead}>
        <p className={styles.infoName}>{project.name}</p>
      </header>
      {firstRows.some((row) => row !== null) ? (
        <Section title={isStore ? "Store" : "Package"}>
          <Rows rows={firstRows} />
        </Section>
      ) : null}
      {chips.length > 0 ? (
        <Section title="Built with">
          <ul className={styles.chips} aria-label="Stack">
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {family ? (
        <Section title={`${family.name} family`}>
          <Rows
            rows={family.members.map((member) => ({
              label: member.type,
              value: (
                <InkLink href={`/projects/${member.slug}`}>
                  {member.name}
                </InkLink>
              ),
            }))}
          />
        </Section>
      ) : null}
      <Section title="Project">
        <Rows
          rows={[
            {
              label: "Source",
              value: (
                <a href={project.repoUrl} target="_blank" rel="noreferrer">
                  {repo}
                </a>
              ),
            },
            // No package and no store (a theme, a tagged Swift app): the
            // release, read from tags, lands here instead.
            !isStore && !facts ? releaseRow : null,
          ]}
        />
      </Section>
    </aside>
  )
}
