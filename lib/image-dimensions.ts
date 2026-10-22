import { readFileSync } from "node:fs"
import path from "node:path"
import { imageSize } from "image-size"

export type ImageDimensions = { width: number; height: number }

// EXIF orientations 5–8 rotate the image a quarter turn, so the stored width
// and height are the displayed height and width.
const isQuarterTurn = (orientation?: number) =>
  orientation !== undefined && orientation >= 5 && orientation <= 8

// A body image is drawn at width: auto, so until it loads its box has no size
// and nothing can be painted there. Reading the size from the file at render
// time lets the frame reserve its box up front. Anything unreadable (a remote
// URL, an unknown format) returns null and the image lays out as before.
export const imageDimensions = (src: string): ImageDimensions | null => {
  if (!src.startsWith("/")) return null

  let bytes: Buffer
  try {
    bytes = readFileSync(path.join(process.cwd(), "public", decodeURI(src)))
  } catch {
    return null
  }

  try {
    const { width, height, orientation } = imageSize(bytes)
    if (!width || !height) return null
    return isQuarterTurn(orientation)
      ? { width: height, height: width }
      : { width, height }
  } catch {
    return null
  }
}
