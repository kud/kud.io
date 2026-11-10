import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import type { ReactNode } from "react"

// One share-card family for the whole site (1200×630). Every card has the same
// bones: a kicker naming what the link is, the name, one line of what it does,
// and a kud.io footer with the path. The ground follows the world the link
// opens: Dusk for /projects, a project and its docs (warm.css, day light);
// paper for the writing, so its index sits with the post cards it lists.

export const CARD_SIZE = { width: 1200, height: 630 }

const DUSK = {
  bg: "#fbf7f3",
  glow: "radial-gradient(circle at 92% 0%, rgba(246,214,190,0.85), rgba(246,214,190,0) 62%)",
  surface: "#fffbf7",
  border: "#e9dad0",
  text: "#3a2830",
  muted: "#5c4549",
  dim: "#6b5357",
  accent: "#8e3f20",
}

const PAPER = {
  bg: "#fdfbf8",
  glow: "radial-gradient(circle at 88% 0%, rgba(194,112,61,0.10), rgba(194,112,61,0) 55%)",
  surface: "#fffdfa",
  border: "#e7e0d6",
  text: "#1f1813",
  muted: "#5a5048",
  dim: "#9a8f80",
  accent: "#c2703d",
}

export type Ground = "dusk" | "paper"

// The Dusk day category inks (warm.css --dl-cat-*), each AA on the ground.
const KIND_INK: Record<string, string> = {
  product: "#9a4126",
  app: "#9a4126",
  desktop: "#9a4126",
  cli: "#7a530c",
  mcp: "#41602d",
  claude: "#7e4628",
  opencode: "#7e4628",
  ui: "#285f42",
  vscode: "#5f4229",
  theme: "#8f3a4e",
}
export const kindInk = (category: string) => KIND_INK[category] ?? "#5f5246"

// Hanken Grotesk, the site face, as static TTFs: Satori reads TrueType, OpenType
// and WOFF, never WOFF2 or a variable font, and without a face of its own it
// falls back to one whose spacing drifts between words.
type Fonts = NonNullable<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]
>
let fonts: Fonts | null = null
const loadFonts = async () => {
  if (fonts) return fonts
  try {
    const weights = [500, 600, 800] as const
    fonts = await Promise.all(
      weights.map(async (weight) => ({
        name: "Hanken Grotesk",
        weight,
        style: "normal" as const,
        data: await readFile(
          join(process.cwd(), `lib/og/fonts/hanken-grotesk-${weight}.ttf`),
        ),
      })),
    )
  } catch {
    fonts = []
  }
  return fonts
}

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
}

// Satori draws PNG, JPEG and SVG from data URIs reliably, and nothing it has to
// fetch or decode itself (WebP, a site-relative path). Icons are site paths in
// public/ or raw GitHub URLs; anything that fails to load leaves the card
// without it rather than failing the build.
export const loadImage = async (
  src: string | null | undefined,
  { width }: { width?: number } = {},
): Promise<string | null> => {
  if (!src) return null
  try {
    const ext = src.split("?")[0].split(".").pop()?.toLowerCase() ?? ""
    const bytes = /^https?:\/\//.test(src)
      ? Buffer.from(
          await (
            await fetch(src, { signal: AbortSignal.timeout(8000) })
          ).arrayBuffer(),
        )
      : await readFile(join(process.cwd(), "public", src))
    if (MIME[ext] && !width)
      return `data:${MIME[ext]};base64,${bytes.toString("base64")}`
    const { default: sharp } = await import("sharp")
    const jpeg = await sharp(bytes)
      .resize({ width })
      .jpeg({ quality: 86 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch {
    return null
  }
}

// Cut at a word, never mid-word, so a long summary ends on an ellipsis
// instead of running off the card.
export const clip = (text: string | null | undefined, max: number) => {
  if (!text) return null
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, flat.lastIndexOf(" ", max)).replace(/[,.;:—–-]+$/, "")}…`
}

// The name is the one thing a feed thumbnail must keep legible, so it shrinks
// to fit its column (Hanken 800 runs about 0.56em a glyph) before it wraps.
const nameSize = (name: string, column: number, max: number) =>
  Math.max(52, Math.min(max, Math.floor(column / (name.length * 0.56))))

const Tile = ({
  src,
  size,
  bleed,
  ground,
}: {
  src: string
  size: number
  bleed: boolean
  ground: typeof DUSK
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: size * 0.24,
      background: ground.surface,
      border: `1px solid ${ground.border}`,
      overflow: "hidden",
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt=""
      width={bleed ? size : size * 0.62}
      height={bleed ? size : size * 0.62}
      style={{
        objectFit: bleed ? "cover" : "contain",
        borderRadius: bleed ? size * 0.24 : 0,
      }}
    />
  </div>
)

export type CardProps = {
  ground?: Ground
  kicker: string
  kickerInk?: string
  // A small line above the name: the project a docs page belongs to.
  eyebrow?: string | null
  name: string
  description?: string | null
  icon?: string | null
  // Raster app icons fill their tile; SVG glyphs sit inside it.
  iconBleed?: boolean
  art?: string | null
  strip?: string[]
  path: string
}

export const renderCard = async ({
  ground: groundKey = "dusk",
  kicker,
  kickerInk,
  eyebrow,
  name,
  description,
  icon,
  iconBleed = false,
  art,
  strip,
  path,
}: CardProps) => {
  const ground = groundKey === "dusk" ? DUSK : PAPER
  const ink = kickerInk ?? ground.accent
  const column = art ? 470 : 1032
  const titleSize = nameSize(name, column, art ? 76 : 96)
  const summary = clip(description, art ? 110 : 180)

  const kickerRow: ReactNode = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: ink,
      }}
    >
      <div
        style={{ width: 12, height: 12, borderRadius: 6, background: ink }}
      />
      {kicker}
    </div>
  )

  const copy: ReactNode = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: art ? column : "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {icon ? (
            <Tile
              src={icon}
              size={art ? 88 : 104}
              bleed={iconBleed}
              ground={ground}
            />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {kickerRow}
            {eyebrow ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 600,
                  color: ground.text,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>
        </div>
        {strip?.length ? (
          <div style={{ display: "flex", gap: 14 }}>
            {strip.map((src) => (
              <Tile key={src} src={src} size={76} bleed ground={ground} />
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 800,
            letterSpacing: -titleSize * 0.03,
            lineHeight: 1.04,
            color: ground.text,
            wordBreak: "break-word",
          }}
        >
          {name}
        </div>
        {summary ? (
          <div
            style={{
              display: "flex",
              fontSize: art ? 30 : 34,
              fontWeight: 500,
              lineHeight: 1.32,
              color: ground.muted,
              maxWidth: 1000,
            }}
          >
            {summary}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          fontWeight: 500,
          color: ground.dim,
        }}
      >
        <div style={{ display: "flex", fontWeight: 800, color: ground.text }}>
          kud.io
        </div>
        {art ? null : <div style={{ display: "flex" }}>{path}</div>}
      </div>
    </div>
  )

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 52,
        padding: "64px 64px 60px 72px",
        background: ground.bg,
        backgroundImage: ground.glow,
        fontFamily: "Hanken Grotesk",
        color: ground.text,
      }}
    >
      {copy}
      {art ? (
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            width: 542,
            height: 305,
            borderRadius: 22,
            overflow: "hidden",
            border: `1px solid ${ground.border}`,
            boxShadow: "0 24px 48px -28px rgba(58,40,48,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            alt=""
            width={542}
            height={305}
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}
    </div>,
    { ...CARD_SIZE, fonts: await loadFonts() },
  )
}
