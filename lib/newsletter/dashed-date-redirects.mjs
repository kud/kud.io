// Temporary: remove after 2026-11-25, with its test and its one use in
// next.config.mjs.
//
// Editions moved from /newsletter/2026-11-18 to /newsletter/2026/11/18 on
// 2026-11-18. Emails, feeds and shared links already carry the dashed address,
// so it answers with a permanent redirect for one week. Next keeps the query
// (?lang=en), and the browser keeps the #item anchor. The English twin's dashed
// address goes to its slashed one, which the proxy then sends to the public
// address with ?lang=en.
//
// Plain JavaScript because next.config.mjs cannot import TypeScript.
const DASHED = ":year(\\d{4})-:month(\\d{2})-:day(\\d{2})"

export const dashedDateRedirects = [
  {
    source: `/newsletter/${DASHED}`,
    destination: "/newsletter/:year/:month/:day",
    permanent: true,
  },
  {
    source: `/newsletter/en/${DASHED}`,
    destination: "/newsletter/en/:year/:month/:day",
    permanent: true,
  },
]
