import { DatePage, dateMetadata, dateParams } from "@/app/newsletter/pages"

type Params = { params: Promise<{ date: string }> }

// Only dates that exist on disk are pages; anything else is a 404.
export const dynamicParams = false

export const generateStaticParams = dateParams

export const generateMetadata = async ({ params }: Params) =>
  dateMetadata((await params).date, "fr")

const Page = async ({ params }: Params) => (
  <DatePage date={(await params).date} lang="fr" />
)

export default Page
