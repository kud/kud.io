// Kept apart from lib/blog.ts so a client component can import it: that module
// reads the filesystem, and pulling it into the browser bundle to build a
// string would be a lot of node:fs for one template literal.
//
// The URL is composed from the Published date rather than stored in the slug,
// so the two halves cannot drift. A date baked into the slug would keep
// claiming 2020 after the date was corrected, silently; composing from the
// real field means a correction moves the URL loudly instead.
//
// Nested segments rather than one 2020-06-08 unit because /blog/<year>/ and
// /blog/<year>/<month>/ are going to be real archive pages. Until they exist
// next.config.mjs redirects them to the index — a URL shape may imply a
// hierarchy only if the hierarchy is coming.
export const postPath = ({ date, slug }: { date: string; slug: string }) => {
  const [year, month, day] = date.split("-")
  return `/blog/${year}/${month}/${day}/${slug}`
}
