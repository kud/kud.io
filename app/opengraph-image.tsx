import { ImageResponse } from "next/og"

// Branded share card (1200×630) rendered at build time. Inherited by every route
// that doesn't define its own, so links to kud.io unfurl as a designed card
// instead of the bare avatar. Twitter reuses this via ./twitter-image.
export const alt =
  "Erwann Mest — Systems Designer & Lead Software Engineer, London"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const Image = () =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px 84px",
        background: "#fdfbf8",
        color: "#1f1813",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AVATAR}
          alt=""
          width={200}
          height={200}
          style={{
            borderRadius: 100,
            border: "5px solid #e7e0d6",
            boxShadow: "0 0 0 8px rgba(194,112,61,0.10)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#9a8f80",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: "#c2703d",
              }}
            />
            Systems Designer · Lead Software Engineer
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>
            Erwann Mest
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 40,
          lineHeight: 1.32,
          color: "#5a5048",
          maxWidth: 1000,
        }}
      >
        Less friction, more clarity, for the people who use software, and the
        people who build it.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 30,
          color: "#1f1813",
        }}
      >
        <div style={{ display: "flex", fontWeight: 700 }}>kud.io</div>
        <div style={{ display: "flex", color: "#9a8f80" }}>
          Systems · Developer experience · AI-assisted engineering
        </div>
      </div>
    </div>,
    { ...size },
  )

export default Image
