import { type CSSProperties } from "react"
import type { Metadata } from "next"
import { Link } from "next-view-transitions"
import { MorphLink } from "@/components/morph-link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { DocsBody } from "fumadocs-ui/layouts/docs/page"
import { getProject, getProjects, type Project } from "@/lib/projects"
import { getApp, appDisplayName } from "@/lib/app"
import { getLandingMdx } from "@/lib/landings"
import { getProjectReadme, projectHasExtraDocs } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { landingComponents } from "@/components/landing-kit"
import { getMDXComponents } from "@/components/mdx"
import { Reveal } from "@/components/reveal"
import styles from "./page.module.css"

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
  const name =
    project.category === "app"
      ? appDisplayName(project.slug, getApp(project.slug))
      : project.name
  return {
    title: `${name} — Erwann Mest`,
    description: project.description ?? undefined,
  }
}

// App landing — for `kud-site-app` web apps. Icon-first hero (the squircle morphs
// in from the launcher tile), a prominent Launch button to the live deployment,
// and the why/how story plus features pulled from app.json.
const AppLanding = ({ project }: { project: Project }) => {
  const app = getApp(project.slug)
  const name = appDisplayName(project.slug, app)
  const launchUrl = app.launchUrl ?? project.homepage
  const launchLabel = app.launchLabel ?? "Launch app"
  const tagline = app.tagline ?? project.description
  // SVG icons are glyphs — contain them on the tinted glass; raster icons are
  // full app-icon art, so they fill the squircle edge to edge.
  const bleed = Boolean(app.icon && !app.icon.endsWith(".svg"))
  const accentStyle = app.accent
    ? ({ "--app-accent": app.accent } as CSSProperties)
    : undefined

  return (
    <div className={styles.appLanding} style={accentStyle}>
      <section className={styles.appHero}>
        <div className={styles.heroGrid} />
        {/* Anchor back to the Apps row so the icon morphs into its visible tile,
            rather than landing on the hero with the tile off-screen. */}
        <MorphLink href="/projects#apps" className={styles.back}>
          ← Projects
        </MorphLink>
        <div className={styles.appHeroContent}>
          {app.icon ? (
            <span
              className={styles.appIconLarge}
              style={{ viewTransitionName: `app-icon-${project.slug}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.appIconImg}
                src={app.icon}
                alt=""
                data-bleed={bleed}
              />
            </span>
          ) : null}
          <h1
            className={styles.appTitle}
            style={{ viewTransitionName: `project-${project.slug}` }}
          >
            {name}
          </h1>
          {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
          <div className={styles.actions}>
            {launchUrl ? (
              <a
                href={launchUrl}
                className={styles.launch}
                target="_blank"
                rel="noreferrer"
              >
                {launchLabel} →
              </a>
            ) : null}
            <a
              href={project.repoUrl}
              className={styles.secondary}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
          {app.stack.length > 0 ? (
            <ul className={styles.stack}>
              {app.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {app.screenshots.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.shots} data-count={app.screenshots.length}>
            {app.screenshots.map((src, index) => (
              <Reveal key={src} delay={index * 80} className={styles.shot}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${project.name} screenshot ${index + 1}`}
                  loading="lazy"
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {app.why ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Why I built it</span>
          </Reveal>
          <Reveal className={styles.prose}>
            <p>{app.why}</p>
          </Reveal>
        </section>
      ) : null}

      {app.how ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>How it&apos;s built</span>
          </Reveal>
          <Reveal className={styles.prose}>
            <p>{app.how}</p>
          </Reveal>
        </section>
      ) : null}

      {app.features.length > 0 ? (
        <section className={styles.section}>
          <Reveal className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Features</span>
            <h2 className={styles.sectionTitle}>What&apos;s inside</h2>
          </Reveal>
          <div className={styles.features}>
            {app.features.map((feature, index) => (
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

      {launchUrl ? (
        <section className={styles.ctaSection}>
          <Reveal>
            <h2 className={styles.ctaTitle}>Try {name}</h2>
            <p className={styles.ctaSub}>
              Free, and runs right in your browser.
            </p>
            <a
              href={launchUrl}
              className={styles.launch}
              target="_blank"
              rel="noreferrer"
            >
              {launchLabel} →
            </a>
          </Reveal>
          {project.topics.length > 0 ? (
            <ul className={styles.topics}>
              {project.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

// README-as-landing — the default. The project page is a nicer rendering of the
// repo README (the source of truth), under a compact site hero. A "Documentation"
// link appears only when the repo ships real docs beyond the README, so we never
// link to the docs from a page that would just show the same README again.
const ReadmeLanding = ({
  project,
  icon,
}: {
  project: Project
  icon: string | null
}) => {
  const readme = getProjectReadme(project.slug)
  const Body = readme?.data.body
  // Section headings (depth 2) drive a simple right-rail TOC.
  const toc = (readme?.data.toc ?? []).filter((item) => item.depth === 2)
  const isList = project.readmeLanding
  const hasDocs = !isList && projectHasExtraDocs(project.slug)

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <MorphLink href="/projects" className={styles.back}>
          ← Projects
        </MorphLink>
        <div className={styles.heroContent}>
          {icon ? (
            <span className={styles.readmeIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt={`${project.name} icon`} />
            </span>
          ) : null}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {project.license ? `${project.license} · ` : ""}
            {isList ? "Curated list" : "Open source"}
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
            {hasDocs ? (
              <Link
                href={`/projects/${project.slug}/docs`}
                className={styles.primary}
              >
                Documentation →
              </Link>
            ) : null}
            <a
              href={project.repoUrl}
              className={hasDocs ? styles.secondary : styles.primary}
              target="_blank"
              rel="noreferrer"
            >
              {hasDocs ? "GitHub ↗" : "View on GitHub ↗"}
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
  const icon =
    project.category === "app" ? null : ((await getIcons())[slug] ?? null)

  return (
    <main className={styles.page}>
      {project.category === "app" ? (
        <AppLanding project={project} />
      ) : authored ? (
        <MDXRemote
          source={authored}
          components={landingComponents}
          options={{ parseFrontmatter: true }}
        />
      ) : (
        <ReadmeLanding project={project} icon={icon} />
      )}
    </main>
  )
}

export default ProjectLanding
