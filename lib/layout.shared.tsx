import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: "kud",
    url: "/projects",
  },
  // fumadocs' own switch stays off: the Dusk docs carry ThemePicker at the
  // head of the sidebar, the same control as on the project pages.
  themeSwitch: { enabled: false },
})
