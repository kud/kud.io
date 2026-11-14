import { ArchivePage, archiveMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = archiveMetadata("en")

const Page = () => <ArchivePage lang="en" />

export default Page
