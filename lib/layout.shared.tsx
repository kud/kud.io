import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: "kud",
    url: "/projects",
  },
  // fumadocs' own switch stays off: <html> is forced dark, and the Dusk docs
  // carry their own scoped ThemePicker, top right as on the project pages.
  themeSwitch: { enabled: false },
})
