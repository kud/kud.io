import { LatestPage, latestMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const generateMetadata = () => latestMetadata("fr")

const Page = () => <LatestPage lang="fr" />

export default Page
