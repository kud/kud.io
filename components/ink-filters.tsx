// The e-paper image filter, referenced from CSS as url(#ink-dither) (app/ink.css).
// A CSS filter can only point at an SVG filter in the same document, so it is
// rendered once in the root layout, zero-sized and out of the accessibility
// tree.
//
// Greys, a fine grain added before quantising, eight grey levels, then the
// source alpha again: the grain breaks the banding the way a panel's dither
// does, at no cost in assets. Applied to every raster inside an Ink scope.
export const InkFilters = () => (
  <svg
    width="0"
    height="0"
    aria-hidden="true"
    focusable="false"
    style={{ position: "absolute" }}
  >
    <filter id="ink-dither" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" result="grey" />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.85"
        numOctaves="1"
        seed="7"
        stitchTiles="stitch"
        result="noise"
      />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
        result="grain"
      />
      <feComposite
        in="grey"
        in2="grain"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="0.16"
        k4="-0.08"
        result="grained"
      />
      <feComponentTransfer in="grained" result="levels">
        <feFuncR
          type="discrete"
          tableValues="0 0.14 0.29 0.43 0.57 0.71 0.86 1"
        />
        <feFuncG
          type="discrete"
          tableValues="0 0.14 0.29 0.43 0.57 0.71 0.86 1"
        />
        <feFuncB
          type="discrete"
          tableValues="0 0.14 0.29 0.43 0.57 0.71 0.86 1"
        />
        <feFuncA type="identity" />
      </feComponentTransfer>
      {/* The grain lands on transparent pixels too: clip back to the source
          alpha so an icon keeps a clean edge. */}
      <feComposite in="levels" in2="SourceGraphic" operator="in" />
    </filter>
  </svg>
)
