import { EditionsPage, editionsMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = editionsMetadata("fr")

const Page = () => <EditionsPage lang="fr" />

export default Page
