import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { getProjectDocsTree } from "@/lib/source"
import { getIcons } from "@/lib/icons"
import { baseOptions } from "@/lib/layout.shared"

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
    <DocsLayout
      tree={getProjectDocsTree(slug)}
      {...base}
      nav={{ ...base.nav, title, url: `/projects/${slug}` }}
    >
      {children}
    </DocsLayout>
  )
}

export default Layout
