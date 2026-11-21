// Structured data for search engines, as one <script type="application/ld+json">.
// `<` is escaped so a title can never close the script element early.
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)
