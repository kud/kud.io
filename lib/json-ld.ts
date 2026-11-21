// The site's schema.org entities, shared by the home page and every post so
// they all name the same person by the same @id.
export const SITE_URL = "https://kud.io"

export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Erwann Mest",
  alternateName: "kud",
  url: SITE_URL,
  jobTitle: "Systems Designer & Lead Software Engineer",
  sameAs: [
    "https://github.com/kud",
    "https://linkedin.kud.io/",
    "https://bsky.kud.io/",
    "https://instagram.kud.io/",
  ],
}

export const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: "kud.io",
  inLanguage: "en-GB",
  publisher: { "@id": PERSON_ID },
}
