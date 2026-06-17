import Link from "next/link"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
  InstagramIcon,
  MailIcon,
} from "@/components/social-icons"
import styles from "./page.module.css"

const socials = [
  { label: "GitHub", href: "http://github.kud.io/", Icon: GitHubIcon },
  { label: "LinkedIn", href: "http://linkedin.kud.io/", Icon: LinkedInIcon },
  { label: "Bluesky", href: "https://bsky.kud.io", Icon: BlueskyIcon },
  { label: "Instagram", href: "http://instagram.kud.io/", Icon: InstagramIcon },
  { label: "Email", href: "mailto:m+site@kud.io", Icon: MailIcon },
]

const isExternal = (href: string) => href.startsWith("http")

const Home = () => (
  <div className={styles.wrapper}>
    <div className={styles.photo} role="img" aria-label="Erwann Mest" />

    <main className={styles.content}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Software Engineer · Technical Lead</p>

        <h1 className={styles.name}>Erwann Mest</h1>

        <p className={styles.tagline}>
          I build and shape systems — not just features.
        </p>

        <p className={styles.bio}>
          Mobile &amp; front-end engineer with 18 years of experience, working
          at the intersection of engineering, product thinking, and developer
          experience. Currently Senior Engineer / Tech Lead on the mobile team
          at{" "}
          <a href="https://www.sonymusic.com/" target="_blank" rel="noreferrer">
            Sony Music
          </a>{" "}
          in London — and deep in AI-assisted engineering, exploring how
          agent-based workflows reshape how we build, review, and ship software.
        </p>

        <p className={styles.personal}>
          Off the clock: photographer, drummer, gamer, and cinema lover.
        </p>

        <div className={styles.actions}>
          <Link href="/projects" className={styles.primary}>
            Explore my projects
            <span aria-hidden>→</span>
          </Link>
          <a
            href="http://linkedin.kud.io/"
            target="_blank"
            rel="noreferrer"
            className={styles.secondary}
          >
            LinkedIn
            <span aria-hidden>↗</span>
          </a>
        </div>

        <ul className={styles.socials}>
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                {...(isExternal(href)
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                <Icon className={styles.socialIcon} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  </div>
)

export default Home
