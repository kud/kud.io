import { ArchivePage, archiveMetadata } from "@/app/newsletter/pages"

export const dynamic = "force-static"

export const metadata = archiveMetadata("fr")

const Page = () => <ArchivePage lang="fr" />

export default Page
