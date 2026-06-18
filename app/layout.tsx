import "./global.css"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"
import { ViewTransitions } from "next-view-transitions"
import { Hanken_Grotesk } from "next/font/google"

// Hanken Grotesk — a refined, elegant grotesque: subtle squared character with
// open (not compressed) proportions, less geometric/techy than Sora, and every
// weight available (incl. a true 800 for the hero name). Exposed as a neutral
// --font-sans token so swapping the typeface later is a one-line change here.
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const TITLE = "Erwann Mest — Systems Designer & Lead Software Engineer"
const DESCRIPTION =
  "Systems designer and lead software engineer in London. I make complex systems — software, teams, workflows — simpler, more effective, and more humane: reducing cognitive load, improving workflows, and using AI to amplify what people can do. Currently on the mobile team at Sony Music."

// The OpenGraph and Twitter share images are supplied by the file-based
// conventions (app/opengraph-image.tsx + app/twitter-image.tsx), so no images
// are listed here — those would otherwise stack on top of the branded card.
export const metadata: Metadata = {
  metadataBase: new URL("https://kud.io"),
  title: TITLE,
  description: DESCRIPTION,
  // The visible headline leads with "Systems Designer", but every title kud
  // holds stays here so recruiters searching any of them still find the site.
  keywords: [
    "Erwann Mest",
    "kud",
    "Systems Designer",
    "Lead Software Engineer",
    "Senior Software Engineer",
    "Tech Lead",
    "Mobile Engineer",
    "Systems Thinking",
    "AI Workflows",
    "Technical Leadership",
    "Developer Experience",
    "React Native",
    "Software Architecture",
    "Sony Music",
  ],
  openGraph: {
    type: "website",
    url: "https://kud.io",
    siteName: "kud.io",
    locale: "en_GB",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: "@_kud",
    creator: "@_kud",
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: "#fdfbf8",
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ViewTransitions>
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <body className="flex min-h-screen flex-col">
        {/* Off-screen SVG filter: organic turbulence displacement for the home →
            /projects "ink reveal" edge (see vt-ink-reveal in global.css). */}
        <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
          <filter
            id="ink-edge"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009 0.013"
              numOctaves="2"
              seed="11"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="26"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        <RootProvider
          theme={{
            defaultTheme: "dark",
            enableSystem: false,
            forcedTheme: "dark",
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  </ViewTransitions>
)

export default RootLayout
