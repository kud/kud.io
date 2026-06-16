import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { getProjectDocsTree } from "@/lib/source"
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

  return (
    <DocsLayout
      tree={getProjectDocsTree(slug)}
      {...base}
      nav={{ ...base.nav, title: slug, url: `/projects/${slug}` }}
    >
      {children}
    </DocsLayout>
  )
}

export default Layout
