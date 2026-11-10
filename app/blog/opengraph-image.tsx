import { getAllPosts } from "@/lib/blog"
import { WRITING_COPY } from "@/lib/section-copy"
import { CARD_SIZE, renderCard } from "@/lib/og/card"

// The /blog index card. Posts list their own images (a cover share image or
// /blog/og/<slug>), so this card stops at the index. Paper, not Dusk: it sits
// with the post cards it lists, in the writing's own world.
export const alt = "Writing by Erwann Mest on kud.io"
export const size = CARD_SIZE
export const contentType = "image/png"

const Image = async () => {
  const posts = await getAllPosts()
  return renderCard({
    ground: "paper",
    kicker: `${posts.length} posts`,
    name: WRITING_COPY.title,
    description: WRITING_COPY.description,
    path: "/blog",
  })
}

export default Image
