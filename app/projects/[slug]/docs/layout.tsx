import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { SearchProvider } from "fumadocs-ui/contexts/search"
import type { DefaultSearchDialogProps } from "fumadocs-ui/components/dialog/search-default"
import { getProjectDocsTree } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { baseOptions } from "@/lib/layout.shared"
import { ThemePicker } from "@/components/theme-picker"
import { ThemeScopeScript } from "@/components/scoped-theme"

const Layout = async ({
  params,
  children,
}: {
  params: Promise<{ slug: string }>
  children: ReactNode
}) => {
  const { slug } = await params
  const base = baseOptions()
  const icon = (await getIcons())[slug]

  const title = icon ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon}
        alt=""
        width={20}
        height={20}
        style={{ borderRadius: 5 }}
      />
      {slug}
    </span>
  ) : (
    slug
  )

  return (
    <div
      data-ground="dusk"
      data-theme="system"
      data-theme-scope
      suppressHydrationWarning
      style={{ display: "contents" }}
    >
      <ThemeScopeScript />
      <ThemePicker className="dusk-picker-docs-top" />
      {/* Search covers this project's docs only: /api/search?tag=<slug>, the
          slug being each page's index tag. Other projects and the blog would
          be noise. The provider lives here, not in the root layout, so ⌘K is
          bound only inside project docs. */}
      <SearchProvider<DefaultSearchDialogProps> options={{ defaultTag: slug }}>
        <DocsLayout
          tree={getProjectDocsTree(slug)}
          {...base}
          nav={{ ...base.nav, title, url: `/projects/${slug}` }}
          // The picker sits top right like every themed page;
          // the drawer copy is for phones, where fumadocs' bar owns that corner.
          sidebar={{ banner: <ThemePicker className="dusk-picker-docs" /> }}
        >
          {children}
        </DocsLayout>
      </SearchProvider>
    </div>
  )
}

export default Layout
