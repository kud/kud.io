"use client"

import { useLayoutEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Link2,
  PenLine,
  Store,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { GitHubIcon } from "@/components/social-icons"
import type { LauncherPost, LauncherProject } from "@/lib/launcher-index"
import styles from "./launcher.module.css"

export type Detail =
  | { kind: "project"; project: LauncherProject }
  | { kind: "post"; post: LauncherPost }

export const formatDate = (date: string) =>
  date
    ? new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : ""

type Target = { href: string; external: boolean }

type Action = Target & {
  id: string
  label: string
  Icon: LucideIcon | typeof GitHubIcon
}

type Props = {
  detail: Detail
  onBack: () => void
  onOpen: (target: Target, newTab: boolean) => void
  copy: (text: string, id: string) => void
  copied: string | null
}

const LINK_ID = "detail:link"
const INSTALL_ID = "detail:install"

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}

// The launcher's detail view, pushed over the list like the message form: what
// a project or a post is, before going to it. Enter opens, Esc steps back.
export const DetailView = ({ detail, onBack, onOpen, copy, copied }: Props) => {
  const openRef = useRef<HTMLButtonElement>(null)
  const [mod] = useState(() =>
    /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl",
  )

  useLayoutEffect(() => {
    openRef.current?.focus()
  }, [])

  const project = detail.kind === "project" ? detail.project : null
  const post = detail.kind === "post" ? detail.post : null

  const primary: Target = project
    ? {
        href: project.href ?? `/projects/${project.slug}`,
        external: Boolean(project.href),
      }
    : { href: post!.href, external: false }
  const name = project ? project.name : post!.title
  const link = primary.external
    ? primary.href
    : `${window.location.origin}${primary.href}`

  // Beside Open, the two places a visitor most often goes next; the rest of a
  // project's links sit in the facts column.
  const actions: Action[] = []
  if (project?.hasDocs)
    actions.push({
      id: "docs",
      label: "Docs",
      Icon: BookOpen,
      href: `/projects/${project.slug}/docs`,
      external: false,
    })
  if (project?.repoUrl)
    actions.push({
      id: "github",
      label: "GitHub",
      Icon: GitHubIcon,
      href: project.repoUrl,
      external: true,
    })
  else if (project?.storeUrl)
    actions.push({
      id: "store",
      label: "Store",
      Icon: Store,
      href: project.storeUrl,
      external: true,
    })

  const links = project
    ? [
        project.homepage && !project.href
          ? { label: hostOf(project.homepage), href: project.homepage }
          : null,
        project.storeUrl && project.repoUrl
          ? { label: "Store listing", href: project.storeUrl }
          : null,
        project.npm
          ? {
              label: "npm",
              href: `https://www.npmjs.com/package/${project.npm.name}`,
            }
          : null,
      ].filter((each): each is { label: string; href: string } => Boolean(each))
    : []

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const held = event.metaKey || event.ctrlKey
    if (event.key === "Enter" && held) {
      event.preventDefault()
      onOpen(primary, true)
    } else if (event.key === "Backspace") {
      event.preventDefault()
      onBack()
    } else if (
      held &&
      event.key.toLowerCase() === "c" &&
      !window.getSelection()?.toString()
    ) {
      event.preventDefault()
      copy(link, LINK_ID)
    }
  }

  const image = project ? project.art : (post!.cover ?? post!.thumb)

  return (
    <section
      className={styles.panel}
      aria-labelledby="launcher-detail-title"
      onKeyDown={onKeyDown}
    >
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to search"
        >
          <ArrowLeft aria-hidden className={styles.backIcon} />
        </button>
        {project ? (
          <span className={styles.mark} aria-hidden>
            {project.icon ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote repo icons, 30px, no optimiser needed
              <img src={project.icon} alt="" width={30} height={30} />
            ) : (
              <span className={styles.letter}>
                {project.name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
        ) : (
          <span className={styles.mark} aria-hidden>
            <PenLine className={styles.glyph} />
          </span>
        )}
        <h2 id="launcher-detail-title" className={styles.formTitle}>
          {name}
        </h2>
        <span className={styles.formHint} aria-hidden>
          <kbd>esc</kbd> back
        </span>
      </div>

      <div className={styles.detail}>
        <div className={styles.detailMain}>
          {image ? (
            <span
              className={styles.detailArt}
              style={
                post?.thumb
                  ? { backgroundImage: `url(${post.thumb})` }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- one image, shown on demand */}
              <img src={image} alt="" width={640} height={360} />
            </span>
          ) : null}
          <p className={styles.detailLede}>
            {(project ? project.description : post!.description) ||
              "No summary yet."}
          </p>
        </div>

        <dl className={styles.facts}>
          {project ? (
            <>
              <div>
                <dt>Kind</dt>
                <dd>{project.type}</dd>
              </div>
              {project.npm ? (
                <div>
                  <dt>Install</dt>
                  <dd>
                    <button
                      type="button"
                      className={styles.factCode}
                      onClick={() => copy(project.npm!.install, INSTALL_ID)}
                      aria-label={`Copy ${project.npm.install}`}
                    >
                      <code>{project.npm.install}</code>
                      {copied === INSTALL_ID ? (
                        <Check aria-hidden className={styles.factIcon} />
                      ) : (
                        <Copy aria-hidden className={styles.factIcon} />
                      )}
                    </button>
                  </dd>
                </div>
              ) : null}
              {links.length > 0 ? (
                <div>
                  <dt>Links</dt>
                  {links.map(({ label, href }) => (
                    <dd key={href}>
                      <a
                        className={styles.factLink}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                        <ArrowUpRight aria-hidden className={styles.factIcon} />
                      </a>
                    </dd>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <dt>Published</dt>
                <dd>{formatDate(post!.date)}</dd>
              </div>
              <div>
                <dt>Reading time</dt>
                <dd>{post!.minutes} min</dd>
              </div>
              {post!.tags.length > 0 ? (
                <div>
                  <dt>Tags</dt>
                  <dd>{post!.tags.join(", ")}</dd>
                </div>
              ) : null}
            </>
          )}
        </dl>
      </div>

      <div className={styles.formFoot}>
        <div className={styles.detailActions}>
          {actions.map(({ id, label, Icon, ...target }) => (
            <button
              key={id}
              type="button"
              className={styles.ghost}
              onClick={(event) =>
                onOpen(target, event.metaKey || event.ctrlKey)
              }
            >
              <Icon aria-hidden className={styles.ghostIcon} />
              {label}
            </button>
          ))}
          <button
            type="button"
            className={styles.ghost}
            onClick={() => copy(link, LINK_ID)}
          >
            {copied === LINK_ID ? (
              <Check aria-hidden className={styles.ghostIcon} />
            ) : (
              <Link2 aria-hidden className={styles.ghostIcon} />
            )}
            {copied === LINK_ID ? "Copied" : "Copy link"}
          </button>
        </div>
        <button
          ref={openRef}
          type="button"
          className={styles.open}
          onClick={(event) => onOpen(primary, event.metaKey || event.ctrlKey)}
          title={`${mod}↵ opens in a new tab`}
        >
          {project
            ? primary.external
              ? "Open app"
              : "Open project"
            : "Read post"}
          {primary.external ? (
            <ArrowUpRight aria-hidden className={styles.ghostIcon} />
          ) : null}
          <span className={styles.primaryKeys} aria-hidden>
            <kbd>↵</kbd>
          </span>
        </button>
      </div>
    </section>
  )
}
