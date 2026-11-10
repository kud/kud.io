import { createFromSource } from "fumadocs-core/search/server"
import type { StructuredData } from "fumadocs-core/mdx-plugins"
import { source } from "@/lib/source"

// Every page is tagged with its project slug (/projects/<slug>/docs/...), so the
// docs search dialog can ask for one project's pages only: in sonarqube-cli's
// docs, another project's hits are noise.
export const { GET } = createFromSource(source, {
  language: "english",
  buildIndex: async (page) => {
    const data = page.data as typeof page.data & {
      structuredData?: StructuredData
      load?: () => Promise<{ structuredData: StructuredData }>
    }
    const structuredData =
      data.structuredData ?? (await data.load?.())?.structuredData
    if (!structuredData) throw new Error(`No structured data for ${page.url}`)

    return {
      title: page.data.title ?? page.slugs.at(-1) ?? page.url,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData,
      tag: page.slugs[0],
    }
  },
})
