// What a source link is allowed to be, and how two spellings of one link are
// recognised as the same source when the French and English renditions are
// compared.
//
// Every rule here fails closed: a URL that cannot be parsed, or whose host only
// MIGHT be private, is rejected. The cost of a false rejection is an edition held
// back for a fix; the cost of a false pass is a private link on a public page.

export type UrlProblem =
  | "URL_INVALID"
  | "URL_NOT_HTTPS"
  | "URL_CREDENTIALS"
  | "URL_IP_HOST"
  | "URL_PRIVATE_HOST"
  | "URL_PRIVATE_SERVICE"
  | "URL_SECRET_PARAM"

// Tracking parameters carry no meaning and differ between two copies of the same
// link, so they are dropped before comparing, and before publishing.
const TRACKING = /^(utm_.*|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid)$/i

// A query parameter with one of these names is how a signed, expiring or
// authenticated URL usually carries its credential.
const SECRET_PARAM =
  /^(token|access_token|id_token|refresh_token|auth|authorization|sig|signature|key|apikey|api_key|session|sessionid|session_id|sid|expires|password|passwd|secret|x-amz-.*|x-goog-.*)$/i
const SECRET_PARAM_SUFFIX = /[_-](token|secret|signature|key)$/i

// Names that only resolve inside a network, never on the public web.
const PRIVATE_SUFFIXES = [
  ".local",
  ".localhost",
  ".localdomain",
  ".internal",
  ".intranet",
  ".corp",
  ".lan",
  ".home",
  ".home.arpa",
  ".private",
]

// Services whose links point at someone's private workspace, mailbox, files or
// bookmarks rather than at a public page. A public mirror of the same material
// (a press release, a published report) is the source to cite instead. Matched
// on the host and every subdomain of it.
const PRIVATE_SERVICES = [
  // mail
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "outlook.office365.com",
  "mail.proton.me",
  "mail.yahoo.com",
  "app.fastmail.com",
  // files and documents
  "docs.google.com",
  "drive.google.com",
  "onedrive.live.com",
  "1drv.ms",
  "sharepoint.com",
  "dropbox.com",
  "dropboxusercontent.com",
  "box.com",
  "icloud.com",
  "pcloud.com",
  "pcloud.link",
  // workspaces and trackers
  "notion.so",
  "notion.site",
  "slack.com",
  "atlassian.net",
  "linear.app",
  "trello.com",
  "asana.com",
  "todoist.com",
  "airtable.com",
  "miro.com",
  "clickup.com",
  // read-later and bookmarks
  "raindrop.io",
  "getpocket.com",
  "instapaper.com",
  "pinboard.in",
  // deployment previews: never the canonical address of anything
  "vercel.app",
]

// Figma's community pages are public; its files, designs and prototypes are not.
const PRIVATE_PATHS: Array<{ host: string; path: RegExp }> = [
  { host: "figma.com", path: /^\/(file|design|proto|board|slides|deck)\// },
]

const matchesHost = (host: string, domain: string) =>
  host === domain || host.endsWith(`.${domain}`)

const isIpLiteral = (host: string) =>
  host.startsWith("[") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^\d+$/.test(host)

const parse = (raw: string): URL | undefined => {
  try {
    return new URL(raw.trim())
  } catch {
    return undefined
  }
}

export const urlProblem = (raw: string): UrlProblem | undefined => {
  const url = parse(raw)
  if (!url) return "URL_INVALID"
  if (url.protocol !== "https:") return "URL_NOT_HTTPS"
  if (url.username || url.password) return "URL_CREDENTIALS"

  const host = url.hostname.toLowerCase().replace(/\.$/, "")
  if (isIpLiteral(host)) return "URL_IP_HOST"
  if (
    !host.includes(".") ||
    host === "localhost" ||
    PRIVATE_SUFFIXES.some((suffix) => host.endsWith(suffix))
  )
    return "URL_PRIVATE_HOST"
  if (PRIVATE_SERVICES.some((domain) => matchesHost(host, domain)))
    return "URL_PRIVATE_SERVICE"
  if (
    PRIVATE_PATHS.some(
      (rule) => matchesHost(host, rule.host) && rule.path.test(url.pathname),
    )
  )
    return "URL_PRIVATE_SERVICE"

  for (const name of url.searchParams.keys())
    if (SECRET_PARAM.test(name) || SECRET_PARAM_SUFFIX.test(name))
      return "URL_SECRET_PARAM"

  return undefined
}

// The host alone: safe to print in an error, unlike a path or query that may be
// the very secret the check caught.
export const hostOf = (raw: string) => {
  const url = parse(raw)
  return url ? url.hostname.toLowerCase() : "unparseable URL"
}

// The published form: tracking parameters gone, everything else as written.
export const cleanUrl = (raw: string) => {
  const url = parse(raw)
  if (!url) return raw.trim()
  for (const name of [...url.searchParams.keys()])
    if (TRACKING.test(name)) url.searchParams.delete(name)
  return url.toString()
}

// The comparison key: clean, lowercase host, no trailing slash on the path.
// Fragments are kept; they can point at different parts of one long document.
export const normaliseUrl = (raw: string) => {
  const url = parse(cleanUrl(raw))
  if (!url) return raw.trim()
  url.hostname = url.hostname.toLowerCase()
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "")
  const text = url.toString()
  return url.pathname === "/" && !url.search && !url.hash ? text.replace(/\/$/, "") : text
}
