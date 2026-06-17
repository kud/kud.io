import Link from "next/link"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
  InstagramIcon,
  MailIcon,
} from "@/components/social-icons"
import { Reveal } from "@/components/reveal"
import styles from "./page.module.css"

const socials = [
  { label: "GitHub", href: "http://github.kud.io/", Icon: GitHubIcon },
  { label: "LinkedIn", href: "http://linkedin.kud.io/", Icon: LinkedInIcon },
  { label: "Bluesky", href: "https://bsky.kud.io", Icon: BlueskyIcon },
  { label: "Instagram", href: "http://instagram.kud.io/", Icon: InstagramIcon },
  { label: "Email", href: "mailto:m+site@kud.io", Icon: MailIcon },
]

const experience = [
  {
    period: "2022 — Present",
    role: "Senior Software Engineer / Tech Lead",
    org: "Sony Music · Mobile Team",
    place: "London",
    note: "Mobile architecture, AI-assisted engineering workflows, and developer experience across product, design, and engineering.",
  },
  {
    period: "2022 — 2023",
    role: "Senior Software Engineer",
    org: "The Orchard",
    place: "London",
    note: "Front-end architecture, performance, and UX for the analytics & metrics platform used by labels, artists, and internal teams.",
  },
  {
    period: "2017 — 2022",
    role: "Lead Front-end Developer",
    org: "Contexte",
    place: "Paris",
    note: "Built a PWA from scratch and a company-wide design system for an online public-policy media.",
  },
  {
    period: "2020 — 2022",
    role: "Front-end Trainer",
    org: "EEMI",
    place: "Paris",
    note: "Taught front-end culture and Next.js to students training to become lead developers and CTOs.",
  },
  {
    period: "2013 — 2022",
    role: "Web Trainer",
    org: "ESG Executive Education",
    place: "Paris",
    note: "Taught the web, HTML and CSS to career-changers — from zero to their own static site.",
  },
]

const isExternal = (href: string) => href.startsWith("http")

const Home = () => (
  <>
    <section className={styles.hero}>
      <div className={styles.photo} role="img" aria-label="Erwann Mest" />

      <div className={styles.content}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>
            Senior Engineer &amp; Tech Lead · London
          </p>

          <h1 className={styles.name}>Erwann Mest</h1>

          <p className={styles.tagline}>
            I build and shape systems — not just features.
          </p>

          <p className={styles.bio}>
            I don&apos;t think in tickets and lines of code — I think in systems
            and the people they serve. Starting from empathy for the user and
            the product, I work shoulder-to-shoulder with designers and PMs to
            guide people through their journey and cut friction. What I love
            most is architecting and designing the solution, then delegating its
            execution to AI in a deliberate, fine-tuned way — turning years of
            experience into skills and agents, and pushing the output to get
            sharper with every pass. Currently on the mobile team at{" "}
            <a
              href="https://www.sonymusic.com/"
              target="_blank"
              rel="noreferrer"
            >
              Sony Music
            </a>
            .
          </p>

          <ul className={styles.focus}>
            <li>Systems thinking</li>
            <li>User empathy</li>
            <li>Design &amp; product partnership</li>
            <li>AI-assisted engineering</li>
            <li>Developer experience</li>
          </ul>

          <p className={styles.personal}>
            Off the clock: a{" "}
            <a
              href="https://www.instagram.com/_kud/"
              target="_blank"
              rel="noreferrer"
            >
              photographer
            </a>
            , a drummer, a{" "}
            <a
              href="https://steamcommunity.com/id/kud"
              target="_blank"
              rel="noreferrer"
            >
              gamer
            </a>
            , and a{" "}
            <a
              href="https://trakt.tv/users/_kud"
              target="_blank"
              rel="noreferrer"
            >
              cinema lover
            </a>
            .
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

          <a className={styles.scrollHint} href="#experience">
            Experience{" "}
            <span className={styles.chevron} aria-hidden>
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>

    <section id="experience" className={styles.timeline}>
      <div className={styles.timelineInner}>
        <p className={styles.timelineEyebrow}>Career</p>
        <h2 className={styles.timelineTitle}>Experience</h2>

        <div className={styles.track}>
          {experience.map((item, index) => (
            <Reveal
              key={`${item.org}-${item.period}`}
              className={styles.entry}
              delay={index * 70}
            >
              <div className={styles.entryPeriod}>{item.period}</div>
              <h3 className={styles.entryRole}>{item.role}</h3>
              <p className={styles.entryOrg}>
                {item.org}{" "}
                <span className={styles.entryPlace}>· {item.place}</span>
              </p>
              <p className={styles.entryNote}>{item.note}</p>
            </Reveal>
          ))}
        </div>

        <a
          className={styles.timelineLink}
          href="http://linkedin.kud.io/"
          target="_blank"
          rel="noreferrer"
        >
          Full history on LinkedIn ↗
        </a>
      </div>
    </section>
  </>
)

export default Home
