import { DatePage, dateMetadata, dateParams } from "@/app/newsletter/pages"
import type { EditionSegments } from "@/lib/newsletter/language"

type Params = { params: Promise<EditionSegments> }

// Only dates that exist on disk are pages; anything else is a 404.
export const dynamicParams = false

export const generateStaticParams = dateParams

export const generateMetadata = async ({ params }: Params) =>
  dateMetadata(await params, "en")

const Page = async ({ params }: Params) => (
  <DatePage segments={await params} lang="en" />
)

export default Page
