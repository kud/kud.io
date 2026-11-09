import "./global.css"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"
import { ViewTransitions } from "next-view-transitions"
import { ArriveScript, InkTransition } from "@/components/ink-transition"
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
  "Systems designer and lead software engineer in London. I make complex systems (software, teams, workflows) simpler, more effective, and more humane, reducing cognitive load, improving workflows, and using AI to amplify what people can do. Currently on the mobile team at Sony Music."

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

// Preview-only comparison of the two Dusk code palettes: ?code=1 or ?code=2
// stamps data-code on <html> for the session (app/warm.css). Never shipped to
// production, where palette 1 is simply the default.
const CODE_PALETTE_SCRIPT =
  process.env.VERCEL_ENV === "production"
    ? null
    : `try{var q=new URLSearchParams(location.search).get("code");if(q)sessionStorage.setItem("kud.code",q);var c=sessionStorage.getItem("kud.code");if(c)document.documentElement.dataset.code=c}catch(e){}`

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ViewTransitions>
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={sans.variable}
    >
      <body className="flex min-h-screen flex-col">
        <ArriveScript />
        {CODE_PALETTE_SCRIPT ? (
          <script dangerouslySetInnerHTML={{ __html: CODE_PALETTE_SCRIPT }} />
        ) : null}
        <InkTransition />
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
