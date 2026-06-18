import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // React-PDF bundles its own reconciler + Yoga layout engine; keep it as a
  // runtime Node dependency rather than letting the bundler inline it.
  serverExternalPackages: ["@react-pdf/renderer"],
}

const withMDX = createMDX()

export default withMDX(config)
