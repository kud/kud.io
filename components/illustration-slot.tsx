import { ART } from "@/lib/art"

// A project's cover at the slot's ratio; one 16:9 image serves both, the 4:3
// card being its centred crop. The cover is its drawing in ART, or the hero
// its README opens on (lib/cover.ts) when passed as src. Callers render it
// only when there is one, so there is no placeholder to fall back to.
export const IllustrationSlot = ({
  ratio,
  slug,
  src,
  className,
}: {
  ratio: "16/9" | "4/3"
  slug: string
  src?: string | null
  className?: string
}) => {
  const art = src ?? ART[slug]
  if (!art) return null
  return (
    <div
      className={`illus-slot illus-art ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} alt="" decoding="async" />
    </div>
  )
}
