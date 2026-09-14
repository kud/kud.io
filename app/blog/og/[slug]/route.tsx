import { ImageResponse } from "next/og"
import { getAllPosts, getPost } from "@/lib/blog"

// Share card for posts that carry no cover. This is a route handler, not an
// opengraph-image.tsx beside the post page, because file-based metadata
// overrides openGraph.images and would replace every post's cover with a
// generated card; here the post page points at /blog/og/<slug> only when there
// is nothing else to show. The card is the post's title page, not a portrait:
// same paper and footer as the site card so the two sit as siblings in a feed.
export const dynamic = "force-static"
export const dynamicParams = false

export const generateStaticParams = async () =>
  (await getAllPosts())
    .filter((post) => !post.cover)
    .map(({ slug }) => ({ slug }))

const size = { width: 1200, height: 630 }

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso))

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const post = await getPost((await params).slug)
  if (!post) return new Response("Not found", { status: 404 })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px 84px",
        background: "#fdfbf8",
        color: "#1f1813",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#9a8f80",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "#c2703d",
          }}
        />
        Blog · {formatDate(post.date)}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          textWrap: "balance",
          overflow: "hidden",
          maxHeight: 76 * 1.1 * 3,
        }}
      >
        {post.title}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 30,
          color: "#1f1813",
        }}
      >
        <div style={{ display: "flex", fontWeight: 700 }}>kud.io</div>
        <div style={{ display: "flex", color: "#9a8f80" }}>Erwann Mest</div>
      </div>
    </div>,
    { ...size },
  )
}
