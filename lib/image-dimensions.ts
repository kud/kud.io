import { readFileSync } from "node:fs"
import path from "node:path"

export type ImageDimensions = { width: number; height: number }

// A body image is drawn at width: auto, so until it loads its box has no size
// and nothing can be painted there. Reading the size from the file's own
// header at render time lets the frame reserve its box up front. Only the
// formats the Notion sync writes into public/ are read; anything else (a
// remote URL, an unknown format) returns null and the image lays out as before.
export const imageDimensions = (src: string): ImageDimensions | null => {
  if (!src.startsWith("/")) return null

  let bytes: Buffer
  try {
    bytes = readFileSync(path.join(process.cwd(), "public", decodeURI(src)))
  } catch {
    return null
  }

  const isPng = bytes.readUInt32BE(0) === 0x89504e47
  if (isPng) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  }

  const isGif = bytes.toString("ascii", 0, 3) === "GIF"
  if (isGif) {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) }
  }

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8
  if (isJpeg) return jpegDimensions(bytes)

  return null
}

// The size lives in the first start-of-frame segment (SOF0–SOF15, less the
// three markers in that range that are not frames: DHT, JPG and DAC).
const NOT_FRAME_MARKERS = new Set([0xc4, 0xc8, 0xcc])

const jpegDimensions = (bytes: Buffer): ImageDimensions | null => {
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && !NOT_FRAME_MARKERS.has(marker)
    if (isFrame) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      }
    }
    offset += 2 + bytes.readUInt16BE(offset + 2)
  }
  return null
}
