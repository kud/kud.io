// Kept apart from lib/blog.ts so a client component can import it: that
// module reads the filesystem, and pulling it into the browser bundle to
// build a string would be a lot of node:fs for one template literal.
// The post URL is composed from the Published date and the slug rather than
// stored, so the two halves can never disagree: a slug with the date baked in
// would keep claiming 2020 after the date was corrected, and nothing would say
// so. The cost is that editing Published moves the URL — loud (a 404) rather
// than silent, and the old date is still in the system to redirect from.
export const postPath = (post: { date: string; slug: string }) =>
  `/blog/${post.date}/${post.slug}`
