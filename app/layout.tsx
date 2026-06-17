import "./global.css"
import type { Metadata } from "next"
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

export const metadata: Metadata = {
  metadataBase: new URL("https://kud.io"),
  title:
    "Erwann Mest — Senior Software Engineer specialised in Front-end / JavaScript",
  description:
    "My name is Erwann Mest and I am a Senior Software Engineer specialised in Front-end / JavaScript. I currently live in London and work in the Music Industry!",
  openGraph: {
    type: "website",
    url: "https://kud.io",
    title:
      "Erwann Mest — Senior Software Engineer specialised in Front-end / JavaScript",
    description:
      "My name is Erwann Mest and I am a Senior Software Engineer specialised in Front-end / JavaScript. I currently live in London and work in the Music Industry!",
    images: [
      "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=1024",
    ],
  },
  twitter: {
    card: "summary",
    site: "@_kud",
  },
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ViewTransitions>
    <html lang="en" suppressHydrationWarning className={sans.variable}>
      <body className="flex min-h-screen flex-col">
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
