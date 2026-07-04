import { type CSSProperties } from "react"
import type { Metadata } from "next"
import { Link } from "next-view-transitions"
import { MorphLink } from "@/components/morph-link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { DocsBody } from "fumadocs-ui/layouts/docs/page"
import { getProject, getProjects, type Project } from "@/lib/projects"
import { getApp, appDisplayName, type AppMeta } from "@/lib/app"
import { isAppCategory } from "@/lib/categories"
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
  const name = isAppCategory(project.category)
    ? appDisplayName(project.slug, getApp(project.slug))
    : project.name
  const title = `${name} — Erwann Mest`
  const description = project.description ?? undefined
  // The opengraph-image.tsx / twitter-image.tsx in this segment are attached by
  // Next automatically; here we just override the canonical URL so the share card
  // points at the project, not the site root inherited from the root metadata.
  return {
    title,
    description,
    openGraph: {
      type: "article",
      url: `https://kud.io/projects/${slug}`,
      title,
      description,
    },
    twitter: { title, description },
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
            <h2 className={styles.ctaTitle}>{app.ctaTitle ?? `Try ${name}`}</h2>
            <p className={styles.ctaSub}>
              {app.ctaSubtitle ?? "Free, and runs right in your browser."}
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
  // Raycast extensions live in the raycast/extensions monorepo, so the hero links
  // to the Raycast Store + the monorepo source rather than a docs route.
  const isRaycast = project.category === "raycast"
  // Firefox add-ons link out to AMO for the install, so — like Raycast — they
  // skip the docs route and show a store CTA in the hero instead.
  const isWebext = project.category === "webext"
  const hasDocs =
    !isList && !isRaycast && !isWebext && projectHasExtraDocs(project.slug)
  const badgeLabel = isRaycast
    ? project.downloads
      ? `${project.downloads.toLocaleString()} installs`
      : "Raycast extension"
    : isWebext
      ? project.users
        ? `${project.users.toLocaleString()} user${project.users === 1 ? "" : "s"}`
        : "Firefox add-on"
      : isList
        ? "Curated list"
        : "Open source"

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
            {badgeLabel}
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
            {isRaycast ? (
              <>
                {project.installUrl ? (
                  // raycast:// protocol link — opens the extension in the Raycast
                  // app; no target=_blank so it doesn't leave a blank tab behind.
                  <a href={project.installUrl} className={styles.primary}>
                    Install Extension ↓
                  </a>
                ) : null}
                <a
                  href={project.storeUrl ?? project.homepage ?? project.repoUrl}
                  className={styles.secondary}
                  target="_blank"
                  rel="noreferrer"
                >
                  Raycast Store ↗
                </a>
                <a
                  href={project.repoUrl}
                  className={styles.secondary}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source ↗
                </a>
              </>
            ) : isWebext ? (
              <>
                {project.storeUrl ? (
                  <a
                    href={project.storeUrl}
                    className={styles.primary}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Add to Firefox ↗
                  </a>
                ) : null}
                <a
                  href={project.repoUrl}
                  className={
                    project.storeUrl ? styles.secondary : styles.primary
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View source ↗
                </a>
              </>
            ) : (
              <>
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
              </>
            )}
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

// An app.json with a launch URL or any why/how/features content is worth the rich
// AppLanding hero. An app-like project with an empty (or missing) app.json — e.g. a
// desktop app still in its RFC/vote stage — falls back to its README instead of a
// sparse app shell, so it can be tagged kud-site-desktop from day one.
const appHasContent = (app: AppMeta): boolean =>
  Boolean(app.launchUrl || app.why || app.how || app.features.length > 0)

const ProjectLanding = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const authored = getLandingMdx(slug)
  const app = isAppCategory(project.category) ? getApp(slug) : null
  const showAppLanding = app !== null && appHasContent(app)
  // The AppLanding hero shows the app icon itself, so the README icon is hidden
  // there; an app-like project that falls back to the README still gets its icon.
  const icon = showAppLanding
    ? null
    : ((await getIcons())[slug] ?? project.icon ?? null)

  return (
    <main className={styles.page}>
      {showAppLanding ? (
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
