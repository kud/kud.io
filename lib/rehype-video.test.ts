import { describe, it } from "node:test"
import assert from "node:assert/strict"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { filterLanding } from "../scripts/lib/landing-filter.js"
import { rehypeVideo, type HastNode } from "./rehype-video.ts"

const ATTACHMENT =
  "https://github.com/user-attachments/assets/0f3c2a1e-8b4d-4e6f-9a7c-1d2e3f4a5b6c"

const render = (markdown: string): HastNode[] => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype)
  const tree = processor.runSync(processor.parse(markdown)) as HastNode
  rehypeVideo()(tree)
  return (tree.children ?? []).filter((node) => node.type === "element")
}

describe("rehypeVideo", () => {
  it("plays a bare attachment line as a video", () => {
    const [video] = render(`${ATTACHMENT}\n`)
    assert.equal(video.tagName, "video")
    assert.equal(video.properties?.src, ATTACHMENT)
    assert.equal(video.properties?.["aria-label"], "Video")
    assert.equal(video.properties?.autoPlay, true)
  })

  it("wraps an attachment with a caption line in a figure", () => {
    const [figure] = render(`${ATTACHMENT}\nThe picker, start to finish.\n`)
    assert.equal(figure.tagName, "figure")
    assert.deepEqual(figure.properties, { "data-video": "" })
    const [video, caption] = figure.children ?? []
    assert.equal(video.tagName, "video")
    assert.equal(caption.tagName, "figcaption")
    assert.equal(
      video.properties?.["aria-label"],
      "The picker, start to finish.",
    )
  })

  it("leaves an image attachment alone", () => {
    const [paragraph] = render(`![Demo](${ATTACHMENT})\n`)
    assert.equal(paragraph.tagName, "p")
    assert.equal(paragraph.children?.[0].tagName, "img")
  })

  it("leaves a labelled attachment link alone", () => {
    const [paragraph] = render(`[Watch the demo](${ATTACHMENT})\n`)
    assert.equal(paragraph.tagName, "p")
    assert.equal(paragraph.children?.[0].tagName, "a")
  })

  it("leaves a sentence that starts with a link alone", () => {
    const [paragraph] = render(`${ATTACHMENT} shows the picker.\n`)
    assert.equal(paragraph.tagName, "p")
    assert.equal(paragraph.children?.[0].tagName, "a")
  })

  it("plays a bare .mp4 link without using its URL as a caption", () => {
    const [video] = render("https://example.com/demo.mp4\n")
    assert.equal(video.tagName, "video")
    assert.equal(video.properties?.["aria-label"], "Video")
  })

  it("plays a [Video] .webm link", () => {
    const [video] = render("[Video](https://example.com/demo.webm)\n")
    assert.equal(video.tagName, "video")
  })

  it("survives the landing filter inside Features", () => {
    const landing = filterLanding(
      `# tool\n\nIntro.\n\n## Features\n\n${ATTACHMENT}\n\n- Fast\n\n## Install\n\nnpm i tool\n\n## Development\n\nnpm test\n`,
    )
    assert.ok(landing.includes(`## Features\n\n${ATTACHMENT}\n`))
    assert.ok(render(landing).some((node) => node.tagName === "video"))
  })
})
