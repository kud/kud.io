// Derives the sizes a blog cover is actually drawn at, beside the cover in
// public/blog/<slug>/:
//
//   <hash>.hero.webp     1600px wide, the post's hero (twice the 790px column)
//   <hash>.thumb.webp    320×180, the index thumb (80px wide at most, 4x over)
//   <hash>.preview.webp  24px wide, inlined as a blurred ground while either loads
//
// A cover straight from Notion is a multi-megabyte PNG, and the index used to
// load all of it into a 64px tile: the placeholder sat on screen for seconds.
// The cover itself stays as the source of truth and the share image's input.
//
// Runs at the end of sync-notion.js, and on its own (npm run cover-images) to
// backfill. A file already on disk is kept: its name carries the cover's hash,
// so a new cover gets new files and an unchanged one is never redone. Same
// shape as share-images.js.
import { access, readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

const CONTENT_DIR = "content/blog"
const PUBLIC_DIR = "public"

// Mirrors coverImages in lib/blog.ts: change one, change both.
export const coverImageOf = (cover, kind) =>
  cover.replace(/\.[^./]+$/, `.${kind}.webp`)

const KINDS = {
  hero: (image) =>
    image
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 }),
  thumb: (image) =>
    image
      .resize(320, 180, { fit: "cover", position: "centre" })
      .webp({ quality: 78, effort: 6 }),
  // Tiny on purpose: it ships inside the HTML, and the browser blurs it anyway.
  preview: (image) =>
    image.resize({ width: 24 }).webp({ quality: 60, effort: 6 }),
}

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  )

const coverOf = (raw) => {
  const line = raw.match(/^cover: (.+)$/m)?.[1]
  return line ? JSON.parse(line) : undefined
}

export const writeCoverImages = async () => {
  const files = await readdir(CONTENT_DIR).catch(() => [])
  let written = 0

  for (const file of files) {
    if (!file.endsWith(".md")) continue
    const cover = coverOf(await readFile(join(CONTENT_DIR, file), "utf8"))
    if (!cover?.startsWith("/")) continue

    const source = join(PUBLIC_DIR, decodeURI(cover))
    if (!(await exists(source))) continue

    for (const [kind, encode] of Object.entries(KINDS)) {
      const target = join(PUBLIC_DIR, decodeURI(coverImageOf(cover, kind)))
      if (await exists(target)) continue
      await writeFile(target, await encode(sharp(source).rotate()).toBuffer())
      written += 1
    }
  }

  return written
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const written = await writeCoverImages()
  console.log(`cover images: ${written} written`)
}
