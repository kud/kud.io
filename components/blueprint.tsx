// Decorative blueprint motif framing the hero — a faint technical-drawing
// boundary with dimension lines, a radius callout, and registration marks. Kept
// as a frame (no geometry crossing the content) so it never sits over faces or
// text. Purely cosmetic; hidden from assistive tech.
const LINE = "#7db1ff"

export const Blueprint = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 760 760"
    fill="none"
    stroke={LINE}
    aria-hidden="true"
    fontFamily="ui-monospace, 'SF Mono', Menlo, monospace"
  >
    {/* Icon boundary */}
    <rect
      x="170"
      y="170"
      width="420"
      height="420"
      rx="96"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />

    {/* Top dimension line — 512 px */}
    <g strokeWidth="1" strokeOpacity="0.42">
      <path d="M170 122 H590" />
      <path d="M170 114 V130 M590 114 V130" />
    </g>
    <text
      x="380"
      y="110"
      fill={LINE}
      fillOpacity="0.55"
      stroke="none"
      fontSize="15"
      textAnchor="middle"
    >
      512 px
    </text>

    {/* Left dimension line — 512 px */}
    <g strokeWidth="1" strokeOpacity="0.42">
      <path d="M122 170 V590" />
      <path d="M114 170 H130 M114 590 H130" />
    </g>
    <text
      x="108"
      y="384"
      fill={LINE}
      fillOpacity="0.55"
      stroke="none"
      fontSize="15"
      textAnchor="middle"
      transform="rotate(-90 108 384)"
    >
      512 px
    </text>

    {/* Radius callout — points at the top-right rounded corner from outside */}
    <path d="M598 198 L566 210" strokeWidth="1" strokeOpacity="0.4" />
    <path
      d="M566 210 l13 0 m-13 0 l5 -11"
      strokeWidth="1"
      strokeOpacity="0.4"
    />
    <text
      x="606"
      y="192"
      fill={LINE}
      fillOpacity="0.5"
      stroke="none"
      fontSize="13"
    >
      96 px R
    </text>

    {/* Registration marks at the four corners */}
    <g strokeWidth="1" strokeOpacity="0.4">
      <path d="M150 170 H134 M150 170 V154" />
      <path d="M610 170 H626 M610 170 V154" />
      <path d="M150 590 H134 M150 590 V606" />
      <path d="M610 590 H626 M610 590 V606" />
    </g>

    {/* Drafting labels */}
    <text
      x="120"
      y="660"
      fill={LINE}
      fillOpacity="0.4"
      stroke="none"
      fontSize="12"
    >
      FIG. 01 — PROJECTS
    </text>
    <text
      x="640"
      y="660"
      fill={LINE}
      fillOpacity="0.4"
      stroke="none"
      fontSize="12"
      textAnchor="end"
    >
      SCALE 1:1
    </text>
  </svg>
)
