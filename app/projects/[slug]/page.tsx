import { Fragment } from "react"
import type { Metadata } from "next"
import { Link } from "next-view-transitions"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { DocsBody } from "fumadocs-ui/layouts/docs/page"
import { getProject, getProjects, type Project } from "@/lib/projects"
import { getLanding } from "@/lib/landing"
import { getLandingMdx } from "@/lib/landings"
import { getProjectReadme } from "@/lib/source"
import { landingComponents } from "@/components/landing-kit"
import { getMDXComponents } from "@/components/mdx"
import { Reveal } from "@/components/reveal"
import { CopyButton } from "@/components/copy-button"
import styles from "./page.module.css"

// A repo opts into README-as-landing with the `kud-site-readme` topic — e.g.
// awesome lists, where the README IS the product. We render it whole on the
// landing and skip the docs route.
const isReadmeLanding = (project: Project) => project.readmeLanding

export const generateStaticParams = async () =>
  (await getProjects()).map((project) => ({ slug: project.slug }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: slug }
  return {
    title: `${project.name} — Erwann Mest`,
    description: project.description ?? undefined,
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

// Auto landing — built from README extraction when a repo has no landing.mdx.
const AutoLanding = ({ project }: { project: Project }) => {
  const { intro, features, install, examples } = getLanding(project.slug)
  const stats = [
    project.language ? { value: project.language, label: "Language" } : null,
    project.stars > 0 ? { value: `★ ${project.stars}`, label: "Stars" } : null,
    project.license ? { value: project.license, label: "License" } : null,
    { value: formatDate(project.pushedAt), label: "Updated" },
  ].filter((stat): stat is { value: string; label: string } => stat !== null)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <Link href="/projects" className={styles.back}>
          ← Projects
        </Link>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {project.license ? `${project.license} · ` : ""}Open source
          </div>
          <h1
            className={styles.title}
            style={{ viewTransitionName: `project-${project.slug}` }}
          >
            {project.name}
          </h1>
          {project.description ? (
            <p className={styles.tagline}>{project.description}</p>
          ) : null}
          <div className={styles.actions}>
            <Link
              href={`/projects/${project.slug}/docs`}
              className={styles.primary}
            >
              Documentation →
            </Link>
            <a
              href={project.repoUrl}
              className={styles.secondary}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 ? <span className={styles.statDivider} /> : null}
                <div className={styles.stat}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {intro ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <p className={styles.lede}>{intro}</p>
          </Reveal>
        </section>
      ) : null}

      {install ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Quick start</span>
            <h2 className={styles.sectionTitle}>Up and running in seconds</h2>
            <p className={styles.sectionLead}>
              Install {project.name} with the command below.
            </p>
          </Reveal>
          <Reveal className={styles.terminalWrap}>
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <span className={styles.tdot} />
                <span className={styles.tdot} />
                <span className={styles.tdot} />
                <span className={styles.terminalLabel}>terminal</span>
                <CopyButton text={install} className={styles.copy} />
              </div>
              <pre className={styles.terminalBody}>
                <code>{install}</code>
              </pre>
            </div>
          </Reveal>
        </section>
      ) : null}

      {features.length > 0 ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Features</span>
            <h2 className={styles.sectionTitle}>Everything you need</h2>
          </Reveal>
          <div className={styles.features}>
            {features.map((feature, index) => (
              <Reveal
                key={feature.title}
                delay={index * 60}
                className={styles.feature}
              >
                <span className={styles.featureMark} />
                <h3>{feature.title}</h3>
                {feature.description ? <p>{feature.description}</p> : null}
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {examples.length > 0 ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Examples</span>
            <h2 className={styles.sectionTitle}>See it in action</h2>
          </Reveal>
          {examples.map((example, index) => (
            <Reveal key={index} className={styles.terminalWrap}>
              <div className={styles.terminal}>
                <div className={styles.terminalBar}>
                  <span className={styles.tdot} />
                  <span className={styles.tdot} />
                  <span className={styles.tdot} />
                  <span className={styles.terminalLabel}>example</span>
                  <CopyButton text={example} className={styles.copy} />
                </div>
                <pre className={styles.terminalBody}>
                  <code>{example}</code>
                </pre>
              </div>
            </Reveal>
          ))}
        </section>
      ) : null}

      <section className={styles.ctaSection}>
        <Reveal>
          <h2 className={styles.ctaTitle}>Dive into the docs</h2>
          <p className={styles.ctaSub}>
            Full reference, examples, and configuration.
          </p>
          <Link href={`/projects/${project.slug}/docs`} className={styles.cta}>
            Open documentation →
          </Link>
        </Reveal>
        {project.topics.length > 0 ? (
          <ul className={styles.topics}>
            {project.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  )
}

// README-as-landing — for curated lists, the README is the whole product, so we
// render it in full under a compact header with no docs link.
const ReadmeLanding = ({ project }: { project: Project }) => {
  const readme = getProjectReadme(project.slug)
  const Body = readme?.data.body
  // Section headings (depth 2) drive a simple right-rail TOC.
  const toc = (readme?.data.toc ?? []).filter((item) => item.depth === 2)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <Link href="/projects" className={styles.back}>
          ← Projects
        </Link>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {project.license ? `${project.license} · ` : ""}Curated list
          </div>
          <h1
            className={`${styles.title} ${styles.titleReadme}`}
            style={{ viewTransitionName: `project-${project.slug}` }}
          >
            {project.name}
          </h1>
          {project.description ? (
            <p className={styles.tagline}>{project.description}</p>
          ) : null}
          <div className={styles.actions}>
            <a
              href={project.repoUrl}
              className={styles.primary}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>
      </section>

      {Body ? (
        <div className={styles.readmeLayout}>
          <article className={styles.readme}>
            <DocsBody>
              <Body components={getMDXComponents()} />
            </DocsBody>
          </article>
          {toc.length > 0 ? (
            <aside className={styles.toc}>
              <p className={styles.tocTitle}>On this page</p>
              <ul>
                {toc.map((item) => (
                  <li key={item.url}>
                    <a href={item.url}>{item.title}</a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

const ProjectLanding = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const authored = getLandingMdx(slug)

  return (
    <main className={styles.page}>
      {isReadmeLanding(project) ? (
        <ReadmeLanding project={project} />
      ) : authored ? (
        <MDXRemote
          source={authored}
          components={landingComponents}
          options={{ parseFrontmatter: true }}
        />
      ) : (
        <AutoLanding project={project} />
      )}
    </main>
  )
}

export default ProjectLanding
