import { RevealLink } from "@/components/reveal-link"
import {
  GitHubIcon,
  LinkedInIcon,
  BlueskyIcon,
  InstagramIcon,
  MailIcon,
} from "@/components/social-icons"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { FocusTags } from "@/components/focus-tags"
import { PromptMascot } from "@/components/prompt-mascot"
import { ScrollHint } from "@/components/scroll-hint"
import { yearsOfExperience } from "@/lib/experience"
import styles from "./page.module.css"

const socials = [
  { label: "GitHub", href: "https://github.kud.io/", Icon: GitHubIcon },
  { label: "LinkedIn", href: "https://linkedin.kud.io/", Icon: LinkedInIcon },
  { label: "Bluesky", href: "https://bsky.kud.io/", Icon: BlueskyIcon },
  {
    label: "Instagram",
    href: "https://instagram.kud.io/",
    Icon: InstagramIcon,
  },
  { label: "Email", href: "mailto:m+site@kud.io", Icon: MailIcon },
]

const isExternal = (href: string) => href.startsWith("http")

/* Shared content pieces — authored once, composed into both the desktop hero
   and the mobile slides so there is no duplicated copy to keep in sync. */

const Eyebrow = () => (
  <p className={styles.eyebrow}>
    Systems&nbsp;Designer &amp; Lead&nbsp;Software&nbsp;Engineer ·&nbsp;London
  </p>
)

// data-mascot summons the easter-egg terminal mascot on hover (see prompt-mascot).
const Name = () => (
  <h1 className={styles.name} data-mascot="greeting">
    Erwann&nbsp;Mest
  </h1>
)

const Tagline = () => (
  <p className={styles.tagline}>
    Less friction, more clarity, for the people who use software, and the people
    who build it.
  </p>
)

const Bio = () => (
  <>
    <p className={styles.bio}>
      I think beyond <span data-mascot="tickets">{"tickets "}</span>and lines of
      code: in systems, workflows, and the people they serve. Software
      engineering, technical leadership, systems design. To me, that&apos;s one
      job. I want to understand how a complex system actually works (software, a
      team, an organisation, the way people deal with each other) and make it
      simpler and more humane.
    </p>
    <p className={styles.bio}>
      Most of what I do comes down to one question:{" "}
      <strong>how can we help people do their best work?</strong> That question
      has pulled me across a lot of ground. Engineering and tech leadership,
      hiring, performance, developer experience, even security and how a team is
      organised. I&apos;m at my best when I can make something complicated feel
      clear.
    </p>
    <p className={styles.bio}>
      I like architecting a solution and then handing its execution to AI, in a
      deliberate, fine-tuned way, turning {yearsOfExperience()}&nbsp;years of
      experience into systems, skills, and agents that get sharper the more I
      use them. The point isn&apos;t to replace judgement; it&apos;s to take the
      repetitive work off people so they have room to think.
    </p>
    <p className={styles.bio}>
      The best systems aren&apos;t the cleverest ones. They&apos;re the ones
      that leave people with clarity, autonomy, and trust. Currently on the
      mobile team at{" "}
      <a href="https://www.sonymusic.com/" target="_blank" rel="noreferrer">
        Sony&nbsp;Music
      </a>
      .
    </p>
  </>
)

const Personal = () => (
  <p className={styles.personal}>
    Off the clock: a{" "}
    <a href="https://www.instagram.com/_kud/" target="_blank" rel="noreferrer">
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
    , a{" "}
    <a href="https://trakt.tv/users/_kud" target="_blank" rel="noreferrer">
      cinema lover
    </a>
    , and a lifelong student of systems.
  </p>
)

const Cta = () => (
  <RevealLink href="/projects" className={styles.primary}>
    Explore my projects
    <span aria-hidden>→</span>
  </RevealLink>
)

const SocialLinks = () => (
  <ul className={styles.socials}>
    {socials.map(({ label, href, Icon }) => (
      <li key={label}>
        <a
          href={href}
          aria-label={label}
          data-mascot={label === "Email" ? "contact" : undefined}
          {...(isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          <Icon className={styles.socialIcon} />
        </a>
      </li>
    ))}
  </ul>
)

// Desktop: the split-screen hero (photo beside a single column of content).
const HeroDesktop = () => (
  <section className={styles.hero}>
    <div className={styles.photo} role="img" aria-label="Erwann Mest" />

    <div className={styles.content}>
      <div className={styles.inner}>
        <Eyebrow />
        <Name />
        <Tagline />
        <Bio />
        <FocusTags />
        <Personal />
        <div className={styles.actions}>
          <Cta />
        </div>
        <SocialLinks />
        <ScrollHint />
      </div>
    </div>
  </section>
)

// Mobile: two full-height slides — a "carte de visite" (identity + links) and
// the longer description — that snap into place as you swipe down.
const HeroMobile = () => (
  <>
    <section className={styles.slideCard}>
      <div className={styles.cardAvatar} role="img" aria-label="Erwann Mest" />
      <Eyebrow />
      <Name />
      <Tagline />
      <div className={styles.cardLinks}>
        <div className={styles.actions}>
          <Cta />
        </div>
        <SocialLinks />
      </div>
    </section>

    <section className={styles.slideAbout}>
      <Bio />
      <FocusTags />
      <Personal />
      <ScrollHint />
    </section>
  </>
)

const Home = () => (
  <div className={styles.home}>
    <HeroDesktop />
    <HeroMobile />
    <ExperienceTimeline />
    <PromptMascot />
  </div>
)

export default Home
