// Prototype fixture for richer product records (feat/proto-app-pages). Every
// line is taken from the app's own README, app.json or GitHub history; where the
// source says nothing, the field is null and the page shows a marked placeholder
// instead of inventing it. Not wired to the sync: a real build would derive the
// dates and recent changes from the GitHub data sync-content already fetches.

export type FlowStep = { label: string; note?: string }
export type Change = { date: string; text: string }
export type Fact = { label: string; value: string }

export type AppProto = {
  what: string
  who: string
  facts: Fact[]
  flow: FlowStep[]
  flowNote: string | null
  changes: Change[]
  started: string
  lastChange: string
  release: string | null
  shot: string | null
  shotNeeded: string | null
  storyNeeded: string | null
}

export const APP_PROTO: Record<string, AppProto> = {
  "planning-poker": {
    what: "Planning poker for estimating user stories together. Open the link, pick a name and an avatar, vote, and the host flips every card at once. Then the highest and lowest votes explain themselves, and the table votes again or moves on.",
    who: "A team estimating together, round a table or on a call, with nobody signing up for anything.",
    facts: [
      { label: "Runs in", value: "Any browser, installable as a PWA" },
      { label: "Account", value: "None: a shared link or a six-letter code" },
      { label: "Data", value: "Room state on Cloudflare, no database" },
      { label: "Decks", value: "Fibonacci, numeric, T-shirt or custom" },
    ],
    flow: [
      { label: "Every browser, host included", note: "one WebSocket each" },
      {
        label: "Room server",
        note: "a PartyServer Durable Object on Cloudflare Workers",
      },
      {
        label: "Authoritative room state",
        note: "broadcast to every connection on each change",
      },
    ],
    flowNote:
      "Hosting is a capability, not a page: creating a room stores a secret in the browser, and whoever presents it gets the host controls.",
    changes: [
      { date: "2026-11-05", text: "Room server moved to PartyServer" },
      {
        date: "2026-11-05",
        text: "Other players' votes stay hidden until the reveal",
      },
      { date: "2026-10-03", text: "Moved to planning-poker.beansontoast.app" },
    ],
    started: "2026-05-06",
    lastChange: "2026-11-05",
    release: null,
    shot: "/apps/planning-poker-shot.png",
    shotNeeded: null,
    storyNeeded:
      "Why it exists: a short blog post, or two sentences in Erwann's words.",
  },
  globetrotter: {
    what: "A personal atlas. Mark each country visited, wished for or ruled out, keep a journal per country with ratings and visit dates, and watch the tally climb against the world's 195 countries, on a flat map or a 3D globe.",
    who: "Anyone keeping track of where they have been and where they want to go next.",
    facts: [
      { label: "Runs in", value: "Any browser, installable, works offline" },
      { label: "Account", value: "None" },
      { label: "Data", value: "Your browser only, exportable as JSON" },
      { label: "Languages", value: "English, French, Spanish, German" },
    ],
    flow: [
      {
        label: "Your countries, journal and progress",
        note: "a Zustand store, persisted to localStorage",
      },
      {
        label: "Two renderers over the same data",
        note: "a D3 SVG Mercator map and a WebGL globe (react-globe.gl, Three.js)",
      },
      {
        label: "Live layers",
        note: "US and Canadian travel advisories, and a live aircraft from adsb.lol, through the app's own API routes",
      },
    ],
    flowNote: null,
    changes: [
      { date: "2026-11-06", text: "Every app icon is now a full-bleed square" },
      {
        date: "2026-09-04",
        text: "Live-flight search narrowed to a 50 nm radius",
      },
      {
        date: "2026-09-03",
        text: "Runtime cache writes capped with a 10-minute regional TTL",
      },
    ],
    started: "2026-06-16",
    lastChange: "2026-11-06",
    release: null,
    shot: "/apps/globetrotter-shot.png",
    shotNeeded: null,
    storyNeeded:
      "Why it exists: a short blog post, or two sentences in Erwann's words.",
  },
  "your-move": {
    what: "One page that answers one question: what changed on GitHub, and is it my turn? Pull requests, reviews, checks and issues, laid out one row per repository and one column per status, every row marked your move or their move.",
    who: "Someone working across several repositories who wants to know, from a phone as much as a desk, what is waiting on them.",
    facts: [
      { label: "Runs in", value: "Any width, phone first, installable" },
      { label: "Account", value: "Sign in with GitHub, under your own token" },
      { label: "Data", value: "Read live from GitHub, nothing stored" },
      { label: "Refresh", value: "Every 10 minutes, only while you look" },
    ],
    flow: [
      {
        label: "The board",
        note: "polls one endpoint, shows how old its data is",
      },
      {
        label: "@kud/gh",
        note: "builds the GraphQL queries and merges the results",
      },
      {
        label: "@kud/gh-workflow",
        note: "decides what a row is and whose move it is",
      },
      {
        label: "GitHub GraphQL",
        note: "about 74 of the 5,000 hourly points per full read",
      },
    ],
    flowNote:
      "Derive, never mirror: GitHub owns the facts, the app owns only the interpretation, worked out fresh on every load.",
    changes: [
      {
        date: "2026-10-06",
        text: "New identity, intro hop and a dark blue palette",
      },
      {
        date: "2026-09-27",
        text: "Snap toggle removed: columns scroll into place directly",
      },
      { date: "2026-09-07", text: "v1.1.0" },
    ],
    started: "2026-09-05",
    lastChange: "2026-10-06",
    release: "v1.1.0",
    shot: null,
    shotNeeded:
      "A board screenshot, phone and desktop. The app's demo mode serves invented sample data, so it can be generated without a real account.",
    storyNeeded: null,
  },
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export const shortDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export const monthYear = (iso: string): string => {
  const [y, m] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
