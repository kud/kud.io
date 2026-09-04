import { isValidElement, type ReactNode } from "react"
import { CopyButton } from "@/components/copy-button"

// Shiki has already turned the source into nested spans by the time this runs,
// so the text to copy has to be walked back out of the tree. Re-reading the
// Markdown to get it would mean carrying the raw source through the render
// purely for the clipboard, and the two copies could then disagree.
const toText = (node: ReactNode): string => {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(toText).join("")
  if (isValidElement(node))
    return toText((node.props as { children?: ReactNode }).children)
  return ""
}

// The card is a frame around Shiki's own <pre>, not a replacement for it —
// Shiki's inline token colours live on the spans inside, and the frame's job is
// the ground, the language label and the copy affordance.
export const BlogCodeBlock = ({
  children,
  language,
  styles,
}: {
  children: ReactNode
  language?: string
  styles: Record<string, string>
}) => (
  <div className={styles.card}>
    <div className={styles.cardHead}>
      <span>{language ?? "code"}</span>
      <CopyButton text={toText(children)} className={styles.copy} />
    </div>
    <pre>{children}</pre>
  </div>
)
