// Regenerates lib/newsletter/__fixtures__/content/ from editions.ts through the
// real parser and derive step: `npm run newsletter:fixtures`.

import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { deriveFiles, type DerivedFiles } from "../derive.ts"
import { errorsOf, parseEdition } from "../parse.ts"
import { FIXTURE_EDITIONS } from "./editions.ts"

export const FIXTURE_CONTENT = path.join(path.dirname(fileURLToPath(import.meta.url)), "content")

export const deriveFixtures = () =>
  FIXTURE_EDITIONS.map(({ date, generatedAt, publishedAt, blocks }) => {
    const { edition, issues } = parseEdition(blocks, { date, generatedAt })
    const errors = errorsOf(issues)
    if (errors.length || !edition)
      throw new Error(`fixture ${date}: ${errors.map((e) => e.message).join("; ")}`)
    return { date, files: deriveFiles(edition, publishedAt) as DerivedFiles }
  })

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await rm(FIXTURE_CONTENT, { recursive: true, force: true })
  for (const { date, files } of deriveFixtures()) {
    const dir = path.join(FIXTURE_CONTENT, date)
    await mkdir(dir, { recursive: true })
    for (const [name, text] of Object.entries(files)) await writeFile(path.join(dir, name), text)
  }
  console.log(`wrote ${FIXTURE_EDITIONS.length} fixture editions to ${FIXTURE_CONTENT}`)
}
