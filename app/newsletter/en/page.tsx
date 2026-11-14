import { EditionsPage, editionsMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = editionsMetadata("en")

const Page = () => <EditionsPage lang="en" />

export default Page
