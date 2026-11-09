import { ART } from "@/lib/skin"

// A project's commissioned illustration at the slot's ratio; one 16:9 drawing
// serves both, the 4:3 card being its centred crop.
export const IllustrationSlot = ({
  ratio,
  slug,
  className,
}: {
  ratio: "16/9" | "4/3"
  slug?: string
  className?: string
}) => {
  const art = slug ? ART[slug] : undefined
  if (!art) return <Placeholder ratio={ratio} className={className} />
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

// Stand-in until the art exists: a flat composition in the warm palette at the
// slot's real ratio, honestly labelled. The top-left stays empty — the quiet
// zone the hero title sits in.
const Placeholder = ({
  ratio,
  className,
}: {
  ratio: "16/9" | "4/3"
  className?: string
}) => (
  <div
    className={`illus-slot ${className ?? ""}`}
    style={{ aspectRatio: ratio }}
    aria-hidden
  >
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <rect width="1600" height="900" fill="var(--w-cream)" />
      <circle cx="1240" cy="250" r="150" fill="var(--w-mustard)" />
      <path
        d="M0 640 Q400 520 820 610 T1600 560 V900 H0Z"
        fill="var(--w-sage)"
      />
      <path
        d="M0 760 Q520 650 980 730 T1600 700 V900 H0Z"
        fill="var(--w-forest)"
      />
      <rect
        x="880"
        y="420"
        width="260"
        height="240"
        rx="18"
        fill="var(--w-terracotta)"
      />
      <rect
        x="1160"
        y="480"
        width="180"
        height="180"
        rx="90"
        fill="var(--w-peach)"
      />
      <rect
        x="700"
        y="520"
        width="150"
        height="140"
        rx="12"
        fill="var(--w-teak)"
      />
    </svg>
    <span className="illus-label">Illustration placeholder</span>
  </div>
)
