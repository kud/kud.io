import { ART } from "@/lib/art"

// A project's delivered illustration at the slot's ratio; one 16:9 drawing
// serves both, the 4:3 card being its centred crop. Callers render it only for
// a project in ART, so there is no placeholder to fall back to.
export const IllustrationSlot = ({
  ratio,
  slug,
  className,
}: {
  ratio: "16/9" | "4/3"
  slug: string
  className?: string
}) => {
  const art = ART[slug]
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
