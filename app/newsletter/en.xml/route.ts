import { feed } from "@/app/newsletter/feed"

export const dynamic = "force-static"

export const GET = () => feed("en")
