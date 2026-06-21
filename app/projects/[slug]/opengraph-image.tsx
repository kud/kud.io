import { ImageResponse } from "next/og"
import { getProject, getProjects } from "@/lib/projects"
import { getApp, appDisplayName } from "@/lib/app"
import { getIcons } from "@/lib/icons"

// Prerender one card per project at build time (mirrors the page's own
// generateStaticParams) so crawlers fetch a static PNG instead of triggering a
// GitHub API round-trip on demand.
export const generateStaticParams = async () =>
  (await getProjects()).map((project) => ({ slug: project.slug }))

// Per-project share card (1200×630). Without this, every /projects/<slug> link
// unfurls with the global "Erwann Mest" card; here each project gets its own
// icon, name, and tagline so a shared link reads as that project. Matches the
// dark /projects palette (navy + warm accent) rather than the warm home card.
export const alt = "Project on kud.io"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Satori renders raster images but not remote SVGs reliably, so the icon is only
// drawn when it's a PNG/JPEG — SVG-only projects fall back to the text card.
const isRaster = (url: string | null | undefined): url is string =>
  Boolean(url && /\.(png|jpe?g)$/i.test(url))

const Image = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const project = await getProject(slug)
  const name =
    project?.category === "app"
      ? appDisplayName(slug, getApp(slug))
      : (project?.name ?? slug)
  const description = project?.description ?? null
  const icon = (await getIcons())[slug] ?? project?.icon ?? null

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "84px 88px",
        background: "#08080f",
        backgroundImage:
          "radial-gradient(circle at 80% 0%, rgba(194,112,61,0.18), transparent 55%)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {isRaster(icon) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon}
            alt=""
            width={148}
            height={148}
            style={{ borderRadius: 32, border: "1px solid #1e1e38" }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#e0a87e",
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
          Project
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          {name}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              fontSize: 42,
              lineHeight: 1.3,
              color: "#8892a4",
              maxWidth: 1000,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 30,
          color: "#8892a4",
        }}
      >
        <div style={{ display: "flex", fontWeight: 700, color: "#e2e8f0" }}>
          kud.io
        </div>
        <div style={{ display: "flex" }}>/projects/{slug}</div>
      </div>
    </div>,
    { ...size },
  )
}

export default Image
