import "./global.css"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"
import { ViewTransitions } from "next-view-transitions"
import { InkTransition } from "@/components/ink-transition"
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

// Preview switchboard for Dusk: ?n=1..5 picks the night candidate (5 when
// none is given) and
// ?mode=light|dark|system pins the light. Both stick for the session's later
// pages. Runs before paint so nothing flashes; without it the system
// preference decides, which is the behaviour the prototype recommends.
const DUSK_PREVIEW = `(function(){try{var q=new URLSearchParams(location.search),s=sessionStorage,d=document.documentElement,n=q.get("n"),m=q.get("mode");if(n)s.setItem("dusk-n",n);else n=s.getItem("dusk-n")||"5";if(m)s.setItem("dusk-mode",m);else m=s.getItem("dusk-mode");if(n&&n!=="1")d.dataset.night=n;if(m==="light"||m==="dark")d.dataset.mode=m}catch(e){}})()`

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ViewTransitions>
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={sans.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DUSK_PREVIEW }} />
      </head>
      <body className="flex min-h-screen flex-col">
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
