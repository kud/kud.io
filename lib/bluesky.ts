// The latest post of Erwann's own on Bluesky, from the public AppView (no
// auth). Fetched on the server and revalidated every six hours; any failure,
// or a latest post older than about six weeks, returns null and the card
// renders nothing: a stale post reads as an abandoned account.
const HANDLE = "kud.io"
const FEED = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${HANDLE}&limit=10&filter=posts_no_replies`
const REVALIDATE = 21600
const MAX_AGE_MS = 42 * 24 * 60 * 60 * 1000

export type BlueskySegment = { text: string; href?: string }

export type BlueskyPost = {
  url: string
  segments: BlueskySegment[]
  createdAt: string
  image?: { src: string; alt: string }
  likes: number
  replies: number
  reposts: number
}

type Facet = {
  index: { byteStart: number; byteEnd: number }
  features: { $type: string; uri?: string; did?: string; tag?: string }[]
}

type ImageView = { thumb: string; alt?: string }

type Embed = {
  $type: string
  images?: ImageView[]
  external?: { thumb?: string; title?: string }
  media?: Embed
}

type FeedItem = {
  reason?: unknown
  post: {
    uri: string
    author: { handle: string }
    record: {
      text: string
      createdAt: string
      reply?: unknown
      facets?: Facet[]
    }
    embed?: Embed
    likeCount?: number
    replyCount?: number
    repostCount?: number
  }
}

const featureHref = (feature: Facet["features"][number]) => {
  if (feature.uri) return feature.uri
  if (feature.did) return `https://bsky.app/profile/${feature.did}`
  if (feature.tag)
    return `https://bsky.app/hashtag/${encodeURIComponent(feature.tag)}`
  return undefined
}

// Facet offsets count UTF-8 bytes, not UTF-16 code units, so the text is
// sliced as bytes and decoded back.
const toSegments = (text: string, facets: Facet[] = []): BlueskySegment[] => {
  const bytes = new TextEncoder().encode(text)
  const decode = (start: number, end: number) =>
    new TextDecoder().decode(bytes.slice(start, end))
  const sorted = [...facets].sort(
    (a, b) => a.index.byteStart - b.index.byteStart,
  )
  const segments: BlueskySegment[] = []
  let cursor = 0
  for (const facet of sorted) {
    const { byteStart, byteEnd } = facet.index
    if (byteStart < cursor || byteEnd > bytes.length) continue
    if (byteStart > cursor) segments.push({ text: decode(cursor, byteStart) })
    const href = facet.features.map(featureHref).find(Boolean)
    segments.push({ text: decode(byteStart, byteEnd), href })
    cursor = byteEnd
  }
  if (cursor < bytes.length)
    segments.push({ text: decode(cursor, bytes.length) })
  return segments
}

const firstImage = (embed?: Embed): BlueskyPost["image"] => {
  if (!embed) return undefined
  const image = embed.images?.[0]
  if (image) return { src: image.thumb, alt: image.alt ?? "" }
  // A link card's thumbnail illustrates the link; the text already says it.
  if (embed.external?.thumb) return { src: embed.external.thumb, alt: "" }
  return firstImage(embed.media)
}

// at://did/app.bsky.feed.post/rkey → https://bsky.app/profile/handle/post/rkey
const postUrl = (uri: string) =>
  `https://bsky.app/profile/${HANDLE}/post/${uri.split("/").pop()}`

export const getLatestBlueskyPost = async (): Promise<BlueskyPost | null> => {
  try {
    const response = await fetch(FEED, { next: { revalidate: REVALIDATE } })
    if (!response.ok) return null
    const { feed } = (await response.json()) as { feed?: FeedItem[] }
    const item = feed?.find(
      ({ reason, post }) =>
        !reason && !post.record.reply && post.author.handle === HANDLE,
    )
    if (!item) return null
    const { post } = item
    const age = Date.now() - new Date(post.record.createdAt).getTime()
    if (!(age < MAX_AGE_MS)) return null
    return {
      url: postUrl(post.uri),
      segments: toSegments(post.record.text, post.record.facets),
      createdAt: post.record.createdAt,
      image: firstImage(post.embed),
      likes: post.likeCount ?? 0,
      replies: post.replyCount ?? 0,
      reposts: post.repostCount ?? 0,
    }
  } catch {
    return null
  }
}
