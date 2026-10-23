// Derives a share image from every blog cover: 1200×630 JPEG beside the cover,
// as public/blog/<slug>/<hash>.share.jpg. The cover stays the page's hero at
// full size; the share image is what og:image points at.
//
// A cover straight from Notion is a multi-megabyte PNG, and WhatsApp drops any
// preview image much over 300 KB, so the post shared with no picture at all.
// 1200×630 is the 1.91:1 frame every link preview crops to anyway, and JPEG is
// the one format every crawler reads.
//
// Runs at the end of sync-notion.js, and on its own (npm run share-images) to
// backfill. A share image already on disk is kept: its name carries the cover's
// hash, so a new cover gets a new file and an unchanged one is never redone.
import { access, readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

const CONTENT_DIR = "content/blog"
const PUBLIC_DIR = "public"

export const SHARE_WIDTH = 1200
export const SHARE_HEIGHT = 630

// Comfortably under WhatsApp's limit, with headroom for crawlers stricter still.
const MAX_BYTES = 250_000
const QUALITIES = [82, 74, 66, 58, 50]

// Mirrors shareImage in lib/blog.ts: change one, change both.
export const shareImageOf = (cover) => cover.replace(/\.[^./]+$/, ".share.jpg")

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  )

const coverOf = (raw) => {
  const line = raw.match(/^cover: (.+)$/m)?.[1]
  return line ? JSON.parse(line) : undefined
}

const encode = async (source) => {
  const frame = sharp(source)
    .rotate()
    .resize(SHARE_WIDTH, SHARE_HEIGHT, { fit: "cover", position: "centre" })
    .flatten({ background: "#ffffff" })

  let bytes
  for (const quality of QUALITIES) {
    bytes = await frame
      .clone()
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toBuffer()
    if (bytes.length <= MAX_BYTES) break
  }
  return bytes
}

export const writeShareImages = async () => {
  const files = await readdir(CONTENT_DIR).catch(() => [])
  let written = 0

  for (const file of files) {
    if (!file.endsWith(".md")) continue
    const cover = coverOf(await readFile(join(CONTENT_DIR, file), "utf8"))
    if (!cover?.startsWith("/")) continue

    const target = join(PUBLIC_DIR, shareImageOf(cover))
    if (await exists(target)) continue

    const source = join(PUBLIC_DIR, decodeURI(cover))
    if (!(await exists(source))) continue

    await writeFile(target, await encode(source))
    written += 1
  }

  return written
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const written = await writeShareImages()
  console.log(`share images: ${written} written`)
}
