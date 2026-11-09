"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { RootProvider } from "fumadocs-ui/provider/next"

// The Dusk pages (/projects, the landings and their docs) follow the reader's
// choice: System by default, or Dark or Light from the picker, remembered by
// next-themes. Everything else on kud.io is still dark-only, so it is forced.
// usePathname resolves on the server too, so next-themes' blocking script
// already knows which case it is in and the first paint is right.
export const ThemeRoot = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname() ?? ""
  const dusk = pathname === "/projects" || pathname.startsWith("/projects/")

  return (
    <RootProvider
      theme={{
        defaultTheme: "system",
        enableSystem: true,
        forcedTheme: dusk ? undefined : "dark",
      }}
    >
      {children}
    </RootProvider>
  )
}
