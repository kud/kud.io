// Prototype switchboard for the warm restyle candidates. Each preview branch
// sets these few values; everything else is shared. "current" is today's look.
export type Ground = "current" | "night" | "day" | "palette"

export type Skin = {
  // The ground for /projects and the project landings.
  projects: Ground
  // The ground for /projects/<slug>/docs.
  docs: Ground
  // Illustration slots in project heroes and the featured cards.
  illustration: boolean
}

export const SKIN: Skin = {
  projects: "day",
  docs: "day",
  illustration: true,
}

// Projects that would carry a commissioned illustration. Until the art exists
// each slot renders a labelled placeholder at the real ratio.
export const ILLUSTRATED = ["jenkins-cli", "planning-poker", "duux"]

// Delivered art, one 16:9 drawing per project; the 4:3 card is its centred
// crop. A project in ILLUSTRATED without an entry keeps the placeholder.
export const ART: Partial<Record<string, string>> = {
  "planning-poker": "/projects/art/planning-poker.webp",
  duux: "/projects/art/duux.webp",
}

// The ink cover for home → /projects is the destination's own ground. null
// means the ground barely changes, so the link navigates without ink.
const COVERS: Record<Ground, string | null> = {
  current: "#08080f",
  palette: "#08080f",
  night: "#16201b",
  day: null,
}

export const projectsCover = COVERS[SKIN.projects]
