import { buildLlmsDocument, renderLlmsTxt } from "@/lib/llms"

// Regenerated with the catalogue: the GitHub topic search it reads is cached
// for an hour, so the file refreshes on the same cadence as /projects.
export const revalidate = 3600

export const GET = async () =>
  new Response(renderLlmsTxt(await buildLlmsDocument()), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
