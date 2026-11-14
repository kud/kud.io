import { IndexPage, indexMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = indexMetadata("en")

const Page = () => <IndexPage lang="en" />

export default Page
