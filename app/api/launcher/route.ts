import { getLauncherIndex } from "@/lib/launcher-index"

// Static, refreshed on the same hour the project list itself is cached for.
export const revalidate = 3600

export const GET = async () => Response.json(await getLauncherIndex())
