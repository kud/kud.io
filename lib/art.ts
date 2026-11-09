// Delivered project art, one 16:9 drawing per project; the 4:3 featured card
// is its centred crop. A project without an entry gets no art slot at all:
// its hero stays the plain one, and it is left out of the featured row.
export const ART: Partial<Record<string, string>> = {
  "planning-poker": "/projects/art/planning-poker.webp",
  duux: "/projects/art/duux.webp",
}

export const FEATURED = Object.keys(ART)
