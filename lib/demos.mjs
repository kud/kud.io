// A project's hosted demo, served at kud.io/projects/<slug>/demo.
//
// Each demo is its own Vercel project; its code never lives in this repo. A
// one-line entry in content/projects/demos.json (slug → deployment origin) is
// all it takes: the rewrites below proxy the path to that deployment, so the
// visitor stays on kud.io and the bare vercel.app address is never linked.
//
// The demo is built with its base set to /projects/<slug>/demo/, which only
// changes the URLs inside its HTML: the deployment still serves its files from
// its own root. So the whole subtree maps onto the deployment's root.
//
// Plain JavaScript because next.config.mjs cannot import TypeScript.
import { readFileSync } from "node:fs"
import path from "node:path"

export const demoPath = (slug) => `/projects/${slug}/demo`

export const readDemos = (
  file = path.join("content", "projects", "demos.json"),
) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return {}
  }
}

export const demoRewrites = (demos) =>
  Object.entries(demos).flatMap(([slug, origin]) => {
    const base = origin.replace(/\/+$/, "")
    return [
      { source: demoPath(slug), destination: `${base}/` },
      { source: `${demoPath(slug)}/:path*`, destination: `${base}/:path*` },
    ]
  })
