import "./global.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"
import { Lusitana, Roboto, Open_Sans } from "next/font/google"

const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lusitana",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-open-sans",
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
  <html
    lang="en"
    suppressHydrationWarning
    className={`${lusitana.variable} ${roboto.variable} ${openSans.variable}`}
  >
    <body className="flex min-h-screen flex-col">
      <RootProvider theme={{ defaultTheme: "dark", enableSystem: false }}>
        {children}
      </RootProvider>
    </body>
  </html>
)

export default RootLayout
