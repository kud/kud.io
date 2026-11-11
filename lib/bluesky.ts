// Erwann's own recent Bluesky posts, from the public AppView (no auth).
// Fetched on the server and refreshed by the six-hourly rebuild; any failure
// returns nothing.
const HANDLE = "kud.io"
const FEED = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${HANDLE}&limit=10&filter=posts_no_replies`
const REVALIDATE = false

export type BlueskySegment = { text: string; href?: string }

export type BlueskyImage = { src: string; alt: string; ratio?: number }

export type BlueskyLink = {
  href: string
  title: string
  host: string
  thumb?: string
}

export type BlueskyPost = {
  url: string
  segments: BlueskySegment[]
  createdAt: string
  images: BlueskyImage[]
  link?: BlueskyLink
  likes: number
  replies: number
  reposts: number
}

type Facet = {
  index: { byteStart: number; byteEnd: number }
  features: { $type: string; uri?: string; did?: string; tag?: string }[]
}

type ImageView = {
  thumb: string
  alt?: string
  aspectRatio?: { width: number; height: number }
}

type Embed = {
  $type: string
  images?: ImageView[]
  external?: { uri?: string; thumb?: string; title?: string }
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

const imagesOf = (embed?: Embed): BlueskyImage[] => {
  if (!embed) return []
  if (embed.images)
    return embed.images.map(({ thumb, alt, aspectRatio }) => ({
      src: thumb,
      alt: alt ?? "",
      ratio: aspectRatio ? aspectRatio.width / aspectRatio.height : undefined,
    }))
  return imagesOf(embed.media)
}

const linkOf = (embed?: Embed): BlueskyLink | undefined => {
  const external = embed?.external ?? embed?.media?.external
  if (!external?.uri) return undefined
  let host = external.uri
  try {
    host = new URL(external.uri).host.replace(/^www\./, "")
  } catch {}
  return {
    href: external.uri,
    title: external.title || host,
    host,
    thumb: external.thumb,
  }
}

// at://did/app.bsky.feed.post/rkey → https://bsky.app/profile/handle/post/rkey
const postUrl = (uri: string) =>
  `https://bsky.app/profile/${HANDLE}/post/${uri.split("/").pop()}`

export const PROFILE_URL = `https://bsky.app/profile/${HANDLE}`

const getPosts = async (): Promise<BlueskyPost[]> => {
  try {
    const response = await fetch(FEED, { next: { revalidate: REVALIDATE } })
    if (!response.ok) return []
    const { feed } = (await response.json()) as { feed?: FeedItem[] }
    return (feed ?? [])
      .filter(
        ({ reason, post }) =>
          !reason && !post.record.reply && post.author.handle === HANDLE,
      )
      .map(({ post }) => ({
        url: postUrl(post.uri),
        segments: toSegments(post.record.text, post.record.facets),
        createdAt: post.record.createdAt,
        images: imagesOf(post.embed),
        link: linkOf(post.embed),
        likes: post.likeCount ?? 0,
        replies: post.replyCount ?? 0,
        reposts: post.repostCount ?? 0,
      }))
  } catch {
    return []
  }
}

export const getRecentBlueskyPosts = async (n: number) =>
  (await getPosts()).slice(0, n)
