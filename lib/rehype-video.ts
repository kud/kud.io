// Markdown has no video syntax, so a video arrives as a paragraph led by one
// link, and this swaps that paragraph for a <video>. Shared by the blog
// (lib/blog.ts) and the project pages (source.config.ts), and kept free of
// imports so node --test can run it.
//
// Two shapes count as a video:
//
// - A link to an .mp4 or .webm. A Notion video arrives this way
//   (scripts/sync-notion.js), labelled "Video" or with its caption.
// - A bare GitHub attachment URL (github.com/user-attachments/assets/<uuid>)
//   on its own line, which GitHub plays as a video in a README. Images take
//   ![]() syntax, so a bare attachment line is a video. Labelled, it is a
//   link on GitHub, and stays one here.
//
// A caption, if any, follows on the next line of the same paragraph, links
// intact: the video is then wrapped in a <figure> with a visible <figcaption>,
// since it is where a credit goes. A link inside running prose stays a link.
//
// Posts synced before the caption moved out of the link text still carry it
// there; anything but the "Video" fallback or the URL itself is read as the
// caption.

export type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

export const hastText = (node: HastNode): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(hastText).join("")

const VIDEO_HREF = /\.(mp4|webm)(\?.*)?$/i
const ATTACHMENT_HREF =
  /^https:\/\/github\.com\/user-attachments\/assets\/[0-9a-f-]+\/?$/i
const VIDEO_FALLBACK = "Video"

const isVideoLink = (href: string, label: string) =>
  VIDEO_HREF.test(href) || (ATTACHMENT_HREF.test(href) && label === href)

const trimStart = (nodes: HastNode[]): HastNode[] => {
  const [first, ...rest] = nodes
  if (first?.type !== "text") return nodes
  const value = first.value?.replace(/^\s+/, "") ?? ""
  return value ? [{ ...first, value }, ...rest] : trimStart(rest)
}

export const rehypeVideo = () => (tree: HastNode) => {
  const walk = (node: HastNode) => {
    const children = node.children ?? []
    for (const [index, child] of children.entries()) {
      if (child.type === "element" && child.tagName === "p") {
        const [link, ...after] = trimStart(child.children ?? [])
        const href = link?.properties?.href
        const label = link ? hastText(link).trim() : ""
        if (
          link?.type === "element" &&
          link.tagName === "a" &&
          typeof href === "string" &&
          isVideoLink(href, label) &&
          // The caption starts on its own line; a link followed by prose on
          // the same line is a sentence that happens to start with a link.
          (after.length === 0 ||
            (after[0].type === "text" &&
              /^[ \t]*\n/.test(after[0].value ?? "")))
        ) {
          const trailing = trimStart(after)
          const caption: HastNode[] = trailing.length
            ? trailing
            : label && label !== VIDEO_FALLBACK && label !== href
              ? [{ type: "text", value: label }]
              : []
          const video: HastNode = {
            type: "element",
            tagName: "video",
            properties: {
              src: href,
              "aria-label":
                caption.map(hastText).join("").trim() ||
                (label !== href && label) ||
                VIDEO_FALLBACK,
              controls: true,
              muted: true,
              loop: true,
              autoPlay: true,
              playsInline: true,
              preload: "metadata",
            },
            children: [],
          }
          children[index] = caption.length
            ? {
                type: "element",
                tagName: "figure",
                properties: { "data-video": "" },
                children: [
                  video,
                  {
                    type: "element",
                    tagName: "figcaption",
                    properties: {},
                    children: caption,
                  },
                ],
              }
            : video
          continue
        }
      }
      walk(child)
    }
  }
  walk(tree)
}
