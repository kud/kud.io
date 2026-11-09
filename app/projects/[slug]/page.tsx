import { type CSSProperties, type ReactNode } from "react"
import type { Metadata } from "next"
import { Link } from "next-view-transitions"
import { MorphLink } from "@/components/morph-link"
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
import { isAppCategory } from "@/lib/categories"
import { getLandingMdx } from "@/lib/landings"
import { getProjectReadme, projectHasDocs } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { landingComponents } from "@/components/landing-kit"
import { getMDXComponents } from "@/components/mdx"
import { Reveal } from "@/components/reveal"
import { getRelease, releaseAge, type Release } from "@/lib/release"
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

// Product record — for a beansontoast product. The product's own page, at its
// beansontoast.app subdomain, answers "what can this do for me?"; this one answers
// "what did Erwann build here?": a one-line summary, the stack, the decisions
// behind it, and links to the product, the source, the docs and related writing.
// No tagline, feature list or screenshots: that would be a second landing.
const ProductRecord = async ({ project }: { project: Project }) => {
  const app = getApp(project.slug)
  const name = appDisplayName(project.slug, app)
  const url = productUrl(app)
  const host = productHost(app)
  const hasDocs = projectHasDocs(project.slug)
  const posts = await getAllPosts()
  const writing = app.writing
    .map((slug) => posts.find((post) => post.slug === slug))
    .filter((post) => post !== undefined)
  const accentStyle = app.accent
    ? ({ "--app-accent": app.accent } as CSSProperties)
    : undefined

  return (
    <div className={styles.appLanding} style={accentStyle}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <MorphLink href="/projects#products" className={styles.back}>
          ← Projects
        </MorphLink>
        <div className={styles.heroContent}>
          {app.icon ? (
            <span
              className={styles.recordIcon}
              style={{ viewTransitionName: `app-icon-${project.slug}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.icon} alt="" />
            </span>
          ) : null}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {project.license ? `${project.license} · ` : ""}A beansontoast
            product
          </div>
          <h1
            className={`${styles.title} ${styles.titleReadme}`}
            style={{ viewTransitionName: `project-${project.slug}` }}
          >
            {name}
          </h1>
          {app.summary ? <p className={styles.tagline}>{app.summary}</p> : null}
          <div className={styles.actions}>
            {url ? (
              <a
                href={url}
                className={styles.primary}
                target="_blank"
                rel="noreferrer"
              >
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
        </div>
      </section>

      <div className={styles.record}>
        {app.stack.length > 0 ? (
          <section className={styles.recordBlock}>
            <h2 className={styles.recordLabel}>Stack</h2>
            <ul className={`${styles.stack} ${styles.recordStack}`}>
              {app.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {app.decisions.length > 0 ? (
          <section className={styles.recordBlock}>
            <h2 className={styles.recordLabel}>Decisions</h2>
            <ul className={styles.decisions}>
              {app.decisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {writing.length > 0 ? (
          <section className={styles.recordBlock}>
            <h2 className={styles.recordLabel}>Writing</h2>
            <ul className={styles.writing}>
              {writing.map((post) => (
                <li key={post.slug}>
                  <Link href={postPath(post)}>{post.title}</Link>
                  <span>{post.description}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className={styles.recordFoot}>
          What it does, and how to use it, lives on the product&apos;s own page
          {url ? (
            <>
              {" "}
              at{" "}
              <a href={url} target="_blank" rel="noreferrer">
                {host}
              </a>
            </>
          ) : null}
          .
        </p>
      </div>
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
  release,
  variant,
}: {
  project: Project
  icon: string | null
  release: Release | null
  variant: VersionVariant
}) => {
  const readme = getProjectReadme(project.readmeSlug ?? project.slug)
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
  // Variant 3 hangs the version off the source button as a joined tail.
  const withVersion = (button: ReactNode, filled: boolean) =>
    variant === 3 && release ? (
      <span className={`${styles.split} ${filled ? styles.splitFilled : ""}`}>
        {button}
        <a
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.splitTail}
          data-fresh={age?.fresh ? "" : undefined}
          title={age ? `Released ${age.label}` : undefined}
        >
          <span className={styles.splitTailLabel}>
            {age?.fresh ? "New" : "Latest"}
          </span>
          <span className={styles.splitTailVersion}>v{release.version}</span>
        </a>
      </span>
    ) : (
      button
    )
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
            {variant === 1 && release ? ` · v${release.version}` : ""}
          </div>
          <div className={styles.titleRow}>
            <h1
              className={`${styles.title} ${styles.titleReadme}`}
              style={{ viewTransitionName: `project-${project.slug}` }}
            >
              {project.name}
            </h1>
            {variant === 4 && release ? (
              <a
                href={release.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.versionSup}
                title={age ? `Released ${age.label}` : undefined}
              >
                v{release.version}
              </a>
            ) : null}
          </div>
          {project.description ? (
            <p
              className={`${styles.tagline} ${variant === 2 && release ? styles.taglineTight : ""}`}
            >
              {project.description}
            </p>
          ) : null}
          {variant === 2 && release ? (
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
                {withVersion(
                  <a
                    href={project.repoUrl}
                    className={styles.secondary}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source ↗
                  </a>,
                  false,
                )}
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
                {withVersion(
                  <a
                    href={project.repoUrl}
                    className={
                      project.storeUrl ? styles.secondary : styles.primary
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source ↗
                  </a>,
                  !project.storeUrl,
                )}
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
                {withVersion(
                  <a
                    href={project.repoUrl}
                    className={hasDocs ? styles.secondary : styles.primary}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {hasDocs ? "GitHub ↗" : "View on GitHub ↗"}
                  </a>,
                  !hasDocs,
                )}
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
            {hasDocs && !isList ? (
              <div className={styles.landingCta}>
                <Link
                  href={`/projects/${project.slug}/docs`}
                  className={styles.primary}
                >
                  Read the documentation →
                </Link>
              </div>
            ) : null}
          </article>
          {showToc ? (
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

// Prototype: `?v=1..4` picks the hero version treatment so one preview shows
// them all. 1 in the badge, 2 a release pill, 3 a tail on the source button, 4 a
// superscript on the title.
const VERSION_VARIANTS = [1, 2, 3, 4] as const
type VersionVariant = (typeof VERSION_VARIANTS)[number]
const DEFAULT_VERSION_VARIANT: VersionVariant = 2

const toVersionVariant = (raw: string | string[] | undefined): VersionVariant =>
  VERSION_VARIANTS.find((n) => String(n) === raw) ?? DEFAULT_VERSION_VARIANT

const ProjectLanding = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ v?: string | string[] }>
}) => {
  const { slug } = await params
  const variant = toVersionVariant((await searchParams).v)
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
    <main className={styles.page}>
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
          variant={variant}
        />
      )}
    </main>
  )
}

export default ProjectLanding
