// The decisions the publication script makes, kept pure so they are tested:
// what a run reports per edition, whether an edition may be mailed, whether a
// status may change, and whether the sync wrote anywhere it shouldn't.
// scripts/sync-newsletter.js does the I/O around them.

import type { Issue } from "./parse.ts"
import type { Lang } from "./sections.ts"

export type NotionStatus = "Draft" | "Ready" | "Published" | "Failed"

export const CONTENT_ROOT = "content/newsletter/"

// --- Report -----------------------------------------------------------------

export type SyncState = "synced" | "unchanged" | "invalid"

export type ReportEntry = {
  state: SyncState
  previousStatus: NotionStatus | null
  issues: Issue[]
}

export type Report = Record<string, ReportEntry>

export const reportEntry = (input: {
  previousStatus: NotionStatus | null
  issues: Issue[]
  changed: boolean
}): ReportEntry => ({
  state: input.issues.some((i) => i.severity === "error")
    ? "invalid"
    : input.changed
      ? "synced"
      : "unchanged",
  previousStatus: input.previousStatus,
  issues: input.issues,
})

// Dates the workflow should carry through to Published: valid editions that
// were Ready. A valid edition that is already Published and unchanged is done.
export const datesToPublish = (report: Report) =>
  Object.entries(report)
    .filter(([, e]) => e.state !== "invalid" && e.previousStatus !== "Published")
    .map(([date]) => date)
    .sort()

export const invalidDates = (report: Report) =>
  Object.entries(report)
    .filter(([, e]) => e.state === "invalid")
    .map(([date]) => date)
    .sort()

// The short message written to Notion's Error property for an invalid edition:
// the first few errors, one per line. The caller redacts it.
export const issueSummary = (issues: Issue[], max = 4) => {
  const errors = issues.filter((i) => i.severity === "error")
  const lines = errors.slice(0, max).map((i) => i.message)
  if (errors.length > max) lines.push(`… and ${errors.length - max} more`)
  return lines.join("\n")
}

// --- publishedAt ------------------------------------------------------------

// A re-sync must be byte-stable: once an edition has a publication time it
// keeps it, whatever Notion says now. First publication takes the time the
// files are written, which is the commit that goes live.
export const choosePublishedAt = (existing: string | null | undefined, now: Date) =>
  existing ?? now.toISOString().replace(/\.\d{3}Z$/, "Z")

// --- Status changes ---------------------------------------------------------

export type MarkTarget = "published" | "failed"

// Published is final. A failure after publication (the email, say) must not
// make a live edition look unpublished, and re-running for a published date
// must not knock it back.
export const markDecision = (current: NotionStatus | null, target: MarkTarget) => {
  if (current === null) return { apply: false, reason: "no edition for that date" }
  if (target === "failed" && current === "Published")
    return { apply: false, reason: "already Published; failure not recorded on the status" }
  return { apply: true, reason: "" }
}

// --- Email ------------------------------------------------------------------

export const notifyDecision = (input: {
  status: NotionStatus | null
  configured: boolean
  alreadySent: boolean
  lang: Lang
}): { send: boolean; reason: string } => {
  if (!input.configured) return { send: false, reason: "email not configured" }
  if (input.status !== "Published")
    return { send: false, reason: `edition is ${input.status ?? "missing"}, not Published` }
  if (input.alreadySent) return { send: false, reason: `${input.lang} already sent` }
  return { send: true, reason: "" }
}

// --- Path guard -------------------------------------------------------------

// `git status --porcelain` lines → paths. Renames ("R  old -> new") count both
// sides; quoted paths are unquoted.
export const porcelainPaths = (porcelain: string) =>
  porcelain
    .split("\n")
    .filter((line) => line.trim())
    .flatMap((line) => line.slice(3).split(" -> "))
    .map((path) => (path.startsWith('"') ? JSON.parse(path) : path))

// Paths the sync changed outside its own folder: anything dirty after the run
// that was not dirty before it. Comparing against the tree before the run lets
// someone sync locally with unrelated work in progress.
export const strayPaths = (before: string, after: string) => {
  const already = new Set(porcelainPaths(before))
  return porcelainPaths(after).filter(
    (path) => !already.has(path) && !path.startsWith(CONTENT_ROOT),
  )
}
