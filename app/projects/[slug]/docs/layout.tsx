import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { getProjectDocsTree } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { baseOptions } from "@/lib/layout.shared"
import { ThemePicker } from "@/components/theme-picker"

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
    <div data-ground="dusk" style={{ display: "contents" }}>
      <DocsLayout
        tree={getProjectDocsTree(slug)}
        {...base}
        nav={{ ...base.nav, title, url: `/projects/${slug}` }}
        sidebar={{ banner: <ThemePicker className="dusk-picker-docs" /> }}
      >
        {children}
      </DocsLayout>
    </div>
  )
}

export default Layout
