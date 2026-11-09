import type { ReactNode } from "react"
import { Link } from "next-view-transitions"
import type { Project } from "@/lib/projects"
import type { AppMeta } from "@/lib/app"
import { ART } from "@/lib/art"
import { IllustrationSlot } from "@/components/illustration-slot"
import { type AppProto, monthYear, shortDate } from "@/lib/app-proto"
import styles from "./app-record-proto.module.css"

type Post = { slug: string; title: string; description: string; href: string }

type Props = {
  project: Project
  app: AppMeta
  proto: AppProto
  name: string
  url: string | null
  host: string | null
  hasDocs: boolean
  writing: Post[]
  current: ReactNode
}

// ?p=n picks the candidate before first paint; no ?p shows today's record.
const PICK = `(function(){try{var p=new URLSearchParams(location.search).get("p");if(p&&/^[1-3]$/.test(p))document.documentElement.setAttribute("data-proto-p",p)}catch(e){}})()`

const Placeholder = ({ need, tall }: { need: string; tall?: boolean }) => (
  <div
    className={`${styles.placeholder} ${tall ? styles.placeholderTall : ""}`}
  >
    <span className={styles.placeholderTag}>Placeholder</span>
    <p>{need}</p>
  </div>
)

const Shot = ({ proto, name }: { proto: AppProto; name: string }) =>
  proto.shot ? (
    <figure className={styles.shot}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proto.shot} alt={`${name}, as it looks today`} />
    </figure>
  ) : (
    <Placeholder need={`Needed: ${proto.shotNeeded}`} tall />
  )

const Flow = ({ proto }: { proto: AppProto }) => (
  <div className={styles.flowWrap}>
    <ol className={styles.flow}>
      {proto.flow.map((step) => (
        <li key={step.label}>
          <strong>{step.label}</strong>
          {step.note ? <span>{step.note}</span> : null}
        </li>
      ))}
    </ol>
    {proto.flowNote ? (
      <p className={styles.flowNote}>{proto.flowNote}</p>
    ) : null}
  </div>
)

const Changes = ({ proto }: { proto: AppProto }) => (
  <ul className={styles.changes}>
    {proto.changes.map((change) => (
      <li key={change.date + change.text}>
        <time dateTime={change.date}>{shortDate(change.date)}</time>
        <span>{change.text}</span>
      </li>
    ))}
  </ul>
)

const Decisions = ({ app }: { app: AppMeta }) => (
  <ul className={styles.decisions}>
    {app.decisions.map((decision) => (
      <li key={decision}>{decision}</li>
    ))}
  </ul>
)

const Stack = ({ app }: { app: AppMeta }) => (
  <ul className={styles.stack}>
    {app.stack.map((tech) => (
      <li key={tech}>{tech}</li>
    ))}
  </ul>
)

const Story = ({ proto, writing }: { proto: AppProto; writing: Post[] }) =>
  writing.length > 0 ? (
    <ul className={styles.writing}>
      {writing.map((post) => (
        <li key={post.slug}>
          <Link href={post.href}>{post.title}</Link>
          <span>{post.description}</span>
        </li>
      ))}
    </ul>
  ) : (
    <Placeholder need={`Needed: ${proto.storyNeeded ?? "a story"}`} />
  )

const Actions = ({ project, url, host, hasDocs }: Props) => (
  <div className={`${styles.actions} warm-hero-actions`}>
    {url ? (
      <a href={url} className={styles.primary} target="_blank" rel="noreferrer">
        Open {host} ↗
      </a>
    ) : null}
    <a
      href={project.repoUrl}
      className={styles.secondary}
      target="_blank"
      rel="noreferrer"
    >
      Source ↗
    </a>
    {hasDocs ? (
      <Link
        href={`/projects/${project.slug}/docs`}
        className={styles.secondary}
      >
        Documentation →
      </Link>
    ) : null}
  </div>
)

// With delivered art, a candidate's header joins the same hero as today's
// record: the drawing as a framed figure, the copy under it or beside it.
const ArtHero = ({ slug, children }: { slug: string; children: ReactNode }) =>
  ART[slug] ? (
    <section className={`warm-hero ${styles.artHero}`}>
      <IllustrationSlot ratio="16/9" slug={slug} />
      <div className="warm-hero-copy">{children}</div>
    </section>
  ) : (
    children
  )

const Icon = ({ app, size }: { app: AppMeta; size: "lg" | "sm" }) =>
  app.icon ? (
    <span className={size === "lg" ? styles.iconLg : styles.iconSm}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={app.icon} alt="" />
    </span>
  ) : null

const Status = ({ props }: { props: Props }) => (
  <span className={styles.status}>
    <span className={styles.statusDot} aria-hidden="true" />
    Live{props.host ? ` at ${props.host}` : ""}
  </span>
)

// 1 · Case file: today's single column, with every question a visitor asks
// answered in order, each under the record's left-hand label.
const CaseFile = (props: Props) => {
  const { app, proto, name, project, writing } = props
  return (
    <>
      <ArtHero slug={project.slug}>
        <header className={styles.heroCentre}>
          <Icon app={app} size="lg" />
          <Status props={props} />
          <h1 className={styles.title}>{name}</h1>
          {app.summary ? <p className={styles.summary}>{app.summary}</p> : null}
          <Actions {...props} />
          <dl className={styles.strip}>
            <div>
              <dt>Started</dt>
              <dd>{monthYear(proto.started)}</dd>
            </div>
            <div>
              <dt>Last change</dt>
              <dd>{shortDate(proto.lastChange)}</dd>
            </div>
            {proto.release ? (
              <div>
                <dt>Release</dt>
                <dd>{proto.release}</dd>
              </div>
            ) : null}
            {project.license ? (
              <div>
                <dt>Licence</dt>
                <dd>{project.license}</dd>
              </div>
            ) : null}
          </dl>
        </header>
      </ArtHero>
      <div className={styles.wideShot}>
        <Shot proto={proto} name={name} />
      </div>
      <div className={styles.record}>
        <section className={styles.block}>
          <h2 className={styles.label}>What it is</h2>
          <div className={styles.prose}>
            <p>{proto.what}</p>
            <p className={styles.who}>
              <strong>For</strong> {proto.who}
            </p>
          </div>
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>At a glance</h2>
          <dl className={styles.factGrid}>
            {proto.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>How it works</h2>
          <Flow proto={proto} />
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>Decisions</h2>
          <Decisions app={app} />
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>Stack</h2>
          <Stack app={app} />
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>Recently</h2>
          <Changes proto={proto} />
        </section>
        <section className={styles.block}>
          <h2 className={styles.label}>Writing</h2>
          <Story proto={proto} writing={writing} />
        </section>
      </div>
    </>
  )
}

// 2 · Spec sheet: the story on the left, every fact in a sticky panel on the
// right, the way a product spec or a store listing's sidebar reads.
const SpecSheet = (props: Props) => {
  const { app, proto, name, project, writing } = props
  return (
    <>
      <ArtHero slug={project.slug}>
        <header className={styles.heroLeft}>
          <Icon app={app} size="sm" />
          <div>
            <h1 className={styles.titleLeft}>{name}</h1>
            {app.summary ? (
              <p className={styles.summaryLeft}>{app.summary}</p>
            ) : null}
            <Actions {...props} />
          </div>
        </header>
      </ArtHero>
      <div className={styles.sheet}>
        <div className={styles.sheetMain}>
          <Shot proto={proto} name={name} />
          <section className={styles.chapter}>
            <h2 className={styles.chapterTitle}>What it is</h2>
            <p className={styles.lead}>{proto.what}</p>
            <p className={styles.who}>
              <strong>For</strong> {proto.who}
            </p>
          </section>
          <section className={styles.chapter}>
            <h2 className={styles.chapterTitle}>How it works</h2>
            <Flow proto={proto} />
          </section>
          <section className={styles.chapter}>
            <h2 className={styles.chapterTitle}>Decisions</h2>
            <Decisions app={app} />
          </section>
          <section className={styles.chapter}>
            <h2 className={styles.chapterTitle}>Writing</h2>
            <Story proto={proto} writing={writing} />
          </section>
        </div>
        <aside className={styles.sheetAside} aria-label="Facts">
          <Status props={props} />
          <dl className={styles.spec}>
            {proto.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            <div>
              <dt>Started</dt>
              <dd>{monthYear(proto.started)}</dd>
            </div>
            {proto.release ? (
              <div>
                <dt>Release</dt>
                <dd>{proto.release}</dd>
              </div>
            ) : null}
            {project.license ? (
              <div>
                <dt>Licence</dt>
                <dd>{project.license}</dd>
              </div>
            ) : null}
          </dl>
          <h2 className={styles.asideLabel}>Stack</h2>
          <Stack app={app} />
          <h2 className={styles.asideLabel}>Recently</h2>
          <Changes proto={proto} />
        </aside>
      </div>
    </>
  )
}

// 3 · Build story: the screenshot is the hero's object, and the record reads as
// four numbered chapters, ending on where the project stands today.
const BuildStory = (props: Props) => {
  const { app, proto, name, project, writing } = props
  return (
    <>
      <ArtHero slug={project.slug}>
        <header className={styles.heroStory}>
          <Icon app={app} size="lg" />
          <h1 className={styles.title}>{name}</h1>
          {app.summary ? <p className={styles.summary}>{app.summary}</p> : null}
          <Actions {...props} />
        </header>
      </ArtHero>
      <div className={styles.storyShot}>
        <Shot proto={proto} name={name} />
      </div>
      <div className={styles.story}>
        <section className={styles.numbered}>
          <span className={styles.num}>01</span>
          <h2>What it is</h2>
          <p className={styles.lead}>{proto.what}</p>
          <p className={styles.who}>
            <strong>For</strong> {proto.who}
          </p>
          <dl className={styles.factGrid}>
            {proto.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className={styles.numbered}>
          <span className={styles.num}>02</span>
          <h2>How it works</h2>
          <Flow proto={proto} />
          <Stack app={app} />
        </section>
        <section className={styles.numbered}>
          <span className={styles.num}>03</span>
          <h2>Decisions</h2>
          <Decisions app={app} />
        </section>
        <section className={styles.numbered}>
          <span className={styles.num}>04</span>
          <h2>Where it stands</h2>
          <ol className={styles.timeline}>
            <li>
              <time dateTime={proto.started}>{shortDate(proto.started)}</time>
              <span>First commit</span>
            </li>
            {[...proto.changes].reverse().map((change) => (
              <li key={change.date + change.text}>
                <time dateTime={change.date}>{shortDate(change.date)}</time>
                <span>{change.text}</span>
              </li>
            ))}
            <li className={styles.timelineNow}>
              <time>Now</time>
              <span>
                Live{props.host ? ` at ${props.host}` : ""}
                {project.license ? `, ${project.license} licence` : ""}
              </span>
            </li>
          </ol>
          <Story proto={proto} writing={writing} />
        </section>
      </div>
    </>
  )
}

const CANDIDATES = [
  { n: "1", name: "Case file", View: CaseFile },
  { n: "2", name: "Spec sheet", View: SpecSheet },
  { n: "3", name: "Build story", View: BuildStory },
]

export const AppRecordProto = (props: Props) => (
  <>
    <script dangerouslySetInnerHTML={{ __html: PICK }} />
    <div data-proto-v="0" className={styles.v}>
      {props.current}
    </div>
    {CANDIDATES.map(({ n, View }) => (
      <div
        key={n}
        data-proto-v={n}
        className={`${styles.v} ${styles.candidate}`}
      >
        <View {...props} />
      </div>
    ))}
    <nav className={styles.switcher} aria-label="Prototype candidates">
      <span>Prototype</span>
      <a href="?" data-proto-link="0">
        Now
      </a>
      {CANDIDATES.map(({ n, name }) => (
        <a key={n} href={`?p=${n}`} data-proto-link={n} title={name}>
          {n}
        </a>
      ))}
    </nav>
  </>
)
