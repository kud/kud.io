import { InkLink as Link } from "@/components/ink-link"
import { postPath, type Post } from "@/lib/blog"
import styles from "./project-family.module.css"

// The posts that link to this project (lib/post-project-links.ts), as quiet
// tiles at the foot of its page, on the family row's own tiles. Hidden when
// nothing has been written about it.
export const ProjectPosts = ({ posts }: { posts: Post[] }) =>
  posts.length === 0 ? null : (
    <section className={styles.family} aria-labelledby="posts-heading">
      <h2 id="posts-heading" className={styles.heading}>
        Written about in…
      </h2>
      <ul className={styles.grid}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={postPath(post)} className={styles.tile}>
              <span className={styles.body}>
                <span className={styles.head}>
                  <span className={styles.name}>{post.title}</span>
                  <time className={styles.type} dateTime={post.date}>
                    {post.date}
                  </time>
                </span>
                {post.description ? (
                  <span className={styles.summary}>{post.description}</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
