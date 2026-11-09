// The projects that open /projects, in this order. An editorial choice, kept
// apart from ART: a pin should not wait on a commissioned drawing, and a
// drawing should not pin a project by itself. Pinned projects with art show it.
export const PINNED: string[] = [
  "smart-tv-for-browser",
  "planning-poker",
  "mcp-jenkins",
  "soap-cli",
]

// How many recently released projects follow the pins.
export const RECENT_COUNT = 6
