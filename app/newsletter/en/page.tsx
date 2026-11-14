import { LatestPage, latestMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const generateMetadata = () => latestMetadata("en")

const Page = () => <LatestPage lang="en" />

export default Page
