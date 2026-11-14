import { IndexPage, indexMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = indexMetadata("fr")

const Page = () => <IndexPage lang="fr" />

export default Page
