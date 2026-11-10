import { type CSSProperties } from "react"
import { SiteFooter } from "@/components/site-footer"
import { ButtonIcon } from "@/components/button-icon"
import type { Metadata } from "next"
import { InkLink as Link } from "@/components/ink-link"
import { MorphLink } from "@/components/morph-link"
import { IllustrationSlot } from "@/components/illustration-slot"
import { ART } from "@/lib/art"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { DocsBody } from "fumadocs-ui/layouts/docs/page"
import { getProject, getProjects, type Project } from "@/lib/projects"
import {
  getApp,
  appDisplayName,
  isProduct,
  productHost,
  productUrl,
  type AppMeta,
} from "@/lib/app"
import { getAllPosts } from "@/lib/blog"
import { postPath } from "@/lib/blog-path"
import { isAppCategory, typeFor } from "@/lib/categories"
import { ecosystemName } from "@/lib/ecosystems"
import { frameworksOf, getPackageFacts } from "@/lib/package-facts"
import { getLandingMdx } from "@/lib/landings"
import { getProjectReadme, projectHasDocs } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { landingComponents } from "@/components/landing-kit"
import { getMDXComponents } from "@/components/mdx"
import { Reveal } from "@/components/reveal"
import { getRelease, releaseAge, type Release } from "@/lib/release"
import { ThemePicker } from "@/components/theme-picker"
import { ThemeScopeScript } from "@/components/scoped-theme"
import {
  ReadmeInfobox,
  RecordSheet,
  RecordTimeline,
} from "@/components/product-record"
import styles from "./page.module.css"

// The release pill says how old the latest version is, so rebuild hourly.
export const revalidate = 3600

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
  const app = isAppCategory(project.category) ? getApp(project.slug) : null
  const name = app ? appDisplayName(project.slug, app) : project.name
  const title = `${name} — Erwann Mest`
  const description =
    (app && isProduct(app) ? app.summary : null) ??
    project.description ??
    undefined
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
        <MorphLink
          href="/projects#apps"
          slug={project.slug}
          className={styles.back}
        >
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
          <div className={`${styles.actions} warm-hero-actions`}>
            {launchUrl ? (
              <a
                href={launchUrl}
                className={styles.launch}
                target="_blank"
                rel="noreferrer"
              >
                <ButtonIcon name="web" />
                {launchLabel} →
              </a>
            ) : null}
            <a
              href={project.repoUrl}
              className={styles.secondary}
              target="_blank"
              rel="noreferrer"
            >
              <ButtonIcon name="github" />
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
              <ButtonIcon name="web" />
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

// Product record — for a beansontoast product. The product's own page, at its
// beansontoast.app subdomain, sells it; this one is the record of what Erwann
// built: the hero with the project's timeline beside the buttons, then the
// story (screenshot, what it is, how it works, decisions, writing) next to an
// infobox holding every other fact. Each fact lives in one place: time and
// terms in the hero, the rest in the infobox.
const ProductRecord = async ({ project }: { project: Project }) => {
  const app = getApp(project.slug)
  const name = appDisplayName(project.slug, app)
  const url = productUrl(app)
  const host = productHost(app)
  const hasDocs = projectHasDocs(project.slug)
  const [posts, release] = await Promise.all([
    getAllPosts(),
    getRelease(project.slug),
  ])
  const writing = app.writing
    .map((slug) => posts.find((post) => post.slug === slug))
    .filter((post) => post !== undefined)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      href: postPath(post),
    }))
  // The record sits on the Dusk ground like a README landing, so it takes the
  // ground's tokens rather than the product's own accent.
  const art = Boolean(ART[project.slug])

  return (
    <div className={styles.appLanding}>
      <section className={`${styles.hero} ${art ? "warm-hero" : ""}`}>
        <div className={styles.heroGrid} />
        <MorphLink
          href="/projects#products"
          slug={project.slug}
          className={styles.back}
        >
          ← Projects
        </MorphLink>
        {art ? <IllustrationSlot ratio="16/9" slug={project.slug} /> : null}
        <div className={`${styles.heroContent} ${art ? "warm-hero-copy" : ""}`}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />A beansontoast product
          </div>
          <div className={styles.recordTitleRow}>
            {app.icon ? (
              <span
                className={styles.recordTitleIcon}
                style={{ viewTransitionName: `app-icon-${project.slug}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.icon} alt="" />
              </span>
            ) : null}
            <h1
              className={`${styles.title} ${styles.titleReadme}`}
              style={{ viewTransitionName: `project-${project.slug}` }}
            >
              {name}
            </h1>
          </div>
          {app.summary ? <p className={styles.tagline}>{app.summary}</p> : null}
          <div
            className={`${styles.actions} ${styles.actionsRecord} warm-hero-actions`}
          >
            {url ? (
              <a
                href={url}
                className={styles.lead}
                target="_blank"
                rel="noreferrer"
              >
                <ButtonIcon name="web" />
                Open {host} ↗
              </a>
            ) : null}
            <a
              href={project.repoUrl}
              className={styles.secondary}
              target="_blank"
              rel="noreferrer"
            >
              <ButtonIcon name="github" />
              Source ↗
            </a>
            {hasDocs ? (
              <Link
                href={`/projects/${project.slug}/docs`}
                className={styles.secondary}
              >
                <ButtonIcon name="docs" />
                Documentation →
              </Link>
            ) : null}
          </div>
          <RecordTimeline project={project} />
        </div>
      </section>

      <RecordSheet
        project={project}
        app={app}
        name={name}
        url={url}
        host={host}
        hasDocs={hasDocs}
        release={release}
        writing={writing}
      />
    </div>
  )
}

// README-as-landing — the default. The project page is a nicer rendering of the
// repo README (the source of truth), under a compact site hero. A "Documentation"
// link appears only when the repo ships real docs beyond the README, so we never
// link to the docs from a page that would just show the same README again.
const ReadmeLanding = async ({
  project,
  icon,
  release,
}: {
  project: Project
  icon: string | null
  release: Release | null
}) => {
  const [facts, projects] = await Promise.all([
    getPackageFacts(project.slug),
    getProjects(),
  ])
  const linkTo = (other: Project) => ({
    slug: other.slug,
    name: other.name,
    type: typeFor(other.category),
  })
  const siblings = project.ecosystem
    ? projects.filter(
        (other) =>
          other.ecosystem === project.ecosystem && other.slug !== project.slug,
      )
    : []
  const family =
    project.ecosystem && siblings.length > 0
      ? {
          name: ecosystemName(project.ecosystem),
          members: siblings.map(linkTo),
        }
      : null
  // Other kud projects this package depends on, by their npm name; a sibling
  // already listed under the family is not named twice.
  const builtOn = (facts?.dependencies ?? [])
    .filter((dep) => dep.startsWith("@kud/"))
    .map((dep) => projects.find((other) => other.slug === dep.slice(5)))
    .filter(
      (other): other is Project =>
        other !== undefined &&
        other.slug !== project.slug &&
        !siblings.includes(other),
    )
    .map(linkTo)
  const readme = getProjectReadme(project.readmeSlug ?? project.slug)
  const art = Boolean(ART[project.slug])
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
    !isList && !isRaycast && !isWebext && projectHasDocs(project.slug)
  // A pitch landing (distilled from the README because the repo ships docs) is
  // short enough to need no TOC; curated lists keep theirs.
  const showToc = toc.length > 0 && (isList || !hasDocs)
  const age = release ? releaseAge(release.publishedAt) : null
  // The badge says what the project is; the licence moved to the timeline and
  // install or user counts to the infobox.
  const badgeLabel = isList ? "Curated list" : typeFor(project.category)

  return (
    <>
      <section className={`${styles.hero} ${art ? "warm-hero" : ""}`}>
        <div className={styles.heroGrid} />
        <MorphLink
          href="/projects"
          slug={project.slug}
          className={styles.back}
        >
          ← Projects
        </MorphLink>
        {art ? <IllustrationSlot ratio="16/9" slug={project.slug} /> : null}
        <div className={`${styles.heroContent} ${art ? "warm-hero-copy" : ""}`}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {badgeLabel}
          </div>
          <div className={styles.recordTitleRow}>
            {icon ? (
              <span
                className={`${styles.recordTitleIcon} ${icon.endsWith(".svg") ? styles.recordTitleGlyph : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" />
              </span>
            ) : null}
            <h1
              className={`${styles.title} ${styles.titleReadme}`}
              style={{ viewTransitionName: `project-${project.slug}` }}
            >
              {project.name}
            </h1>
          </div>
          {project.description ? (
            <p
              className={`${styles.tagline} ${release ? styles.taglineTight : ""}`}
            >
              {project.description}
            </p>
          ) : null}
          {release ? (
            <a
              href={release.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.releasePill}
              data-fresh={age?.fresh ? "" : undefined}
            >
              <span className={styles.releasePillDot} aria-hidden />
              <span className={styles.releasePillLabel}>
                {age?.fresh ? "New release" : "Latest"}
              </span>
              <span className={styles.releasePillVersion}>
                v{release.version}
              </span>
              {age ? (
                <span className={styles.releasePillAge}>{age.label}</span>
              ) : null}
              <span className={styles.releasePillArrow} aria-hidden>
                →
              </span>
            </a>
          ) : null}
          <div
            className={`${styles.actions} ${styles.actionsRecord} warm-hero-actions`}
          >
            {isRaycast ? (
              <>
                {project.installUrl ? (
                  // raycast:// protocol link — opens the extension in the Raycast
                  // app; no target=_blank so it doesn't leave a blank tab behind.
                  <a href={project.installUrl} className={styles.lead}>
                    <ButtonIcon name="raycast" />
                    Install Extension ↓
                  </a>
                ) : null}
                <a
                  href={project.storeUrl ?? project.homepage ?? project.repoUrl}
                  className={styles.secondary}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ButtonIcon name="raycast" />
                  Raycast Store ↗
                </a>
                <a
                  href={project.repoUrl}
                  className={styles.secondary}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ButtonIcon name="github" />
                  View source ↗
                </a>
              </>
            ) : isWebext ? (
              <>
                {project.storeUrl ? (
                  <a
                    href={project.storeUrl}
                    className={styles.lead}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ButtonIcon name="firefox" />
                    Add to Firefox ↗
                  </a>
                ) : null}
                <a
                  href={project.repoUrl}
                  className={
                    project.storeUrl ? styles.secondary : styles.lead
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <ButtonIcon name="github" />
                  View source ↗
                </a>
              </>
            ) : (
              <>
                {hasDocs ? (
                  <Link
                    href={`/projects/${project.slug}/docs`}
                    className={styles.lead}
                  >
                    <ButtonIcon name="docs" />
                    Documentation →
                  </Link>
                ) : null}
                <a
                  href={project.repoUrl}
                  className={hasDocs ? styles.secondary : styles.lead}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ButtonIcon name="github" />
                  {hasDocs ? "GitHub ↗" : "View on GitHub ↗"}
                </a>
              </>
            )}
          </div>
          <RecordTimeline project={project} />
        </div>
      </section>

      {Body ? (
        <div className={`${styles.readmeLayout} ${styles.readmeRecord}`}>
          <article className={styles.readme}>
            <DocsBody>
              <Body components={getMDXComponents()} />
            </DocsBody>
            {hasDocs && !isList ? (
              <div className={styles.landingCta}>
                <Link
                  href={`/projects/${project.slug}/docs`}
                  className={styles.lead}
                >
                  Read the documentation →
                </Link>
              </div>
            ) : null}
          </article>
          <div className={styles.recordRail}>
            <ReadmeInfobox
              project={project}
              facts={facts}
              release={release}
              language={project.language}
              frameworks={facts ? frameworksOf(facts) : []}
              builtOn={builtOn}
              family={family}
            />
            {showToc ? (
              <nav className={styles.toc} aria-label="On this page">
                <p className={styles.tocTitle}>On this page</p>
                <ul>
                  {toc.map((item) => (
                    <li key={item.url}>
                      <a href={item.url}>{item.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
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
  const showRecord = app !== null && isProduct(app)
  const showAppLanding = app !== null && !showRecord && appHasContent(app)
  // The AppLanding hero shows the app icon itself, so the README icon is hidden
  // there; an app-like project that falls back to the README still gets its icon.
  const icon =
    showAppLanding || showRecord
      ? null
      : ((await getIcons())[slug] ?? project.icon ?? null)

  return (
    <main
      className={styles.page}
      data-ground="dusk"
      data-theme="system"
      data-theme-scope
      suppressHydrationWarning
    >
      <ThemeScopeScript />
      <ThemePicker className="dusk-picker-top" />
      {showRecord ? (
        <ProductRecord project={project} />
      ) : showAppLanding ? (
        <AppLanding project={project} />
      ) : authored ? (
        <MDXRemote
          source={authored}
          components={landingComponents}
          options={{ parseFrontmatter: true }}
        />
      ) : (
        <ReadmeLanding
          project={project}
          icon={icon}
          release={await getRelease(project.slug)}
        />
      )}
      <SiteFooter />
    </main>
  )
}

export default ProjectLanding
