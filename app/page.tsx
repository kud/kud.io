import { InkLink } from "@/components/ink-link"
import { ButtonIcon } from "@/components/button-icon"
import { AvatarImage } from "@/components/avatar-image"
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
import { ThemeScopeScript } from "@/components/scoped-theme"
import { BlueskyPeek } from "@/components/bluesky-card"
import { ContactLink } from "@/components/contact-link"
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

const AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=512"

const DESKTOP_AVATAR =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=2056"

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
    Less to hold in your head, for the people who use software and the people
    who build it.
  </p>
)

const BioLead = () => (
  <p className={styles.bio}>
    What I love most is taking load off people&apos;s minds: mine, the engineers
    I work with, my team&apos;s, and the people who use what we build. Fewer
    things to remember, fewer steps, fewer surprises.
  </p>
)

const BioMore = () => (
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
      <strong>{"how can we help people do their best work? "}</strong>That
      question has pulled me across a lot of ground. Engineering and tech
      leadership, hiring, performance, developer experience, even security and
      how a team is organised. I&apos;m at my best when I can make something
      complicated feel clear.
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
      that leave people with clarity, autonomy, and trust. At{" "}
      <a href="https://www.sonymusic.com/" target="_blank" rel="noreferrer">
        Sony&nbsp;Music
      </a>{" "}
      I spent years on the mobile team, building the apps people carry in their
      pocket. Now I&apos;m on the accounting team, working on the systems that
      make sure the people behind the music get paid. A different kind of
      complexity, quieter and just as human: when the figures are right, people
      can trust them.
    </p>
  </>
)

const Bio = () => (
  <>
    <BioLead />
    <BioMore />
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
  <InkLink href="/projects" className={styles.primary}>
    <ButtonIcon name="projects" />
    Explore my projects
  </InkLink>
)

const Writing = () => (
  <InkLink href="/blog" className={styles.secondary}>
    <ButtonIcon name="docs" />
    Writing
  </InkLink>
)

const SocialLinks = () => (
  <ul className={styles.socials}>
    {socials.map(({ label, href, Icon }) => {
      // Email opens the launcher on its message form; the mailto stays the
      // fallback without JavaScript.
      const link =
        label === "Email" ? (
          <ContactLink href={href} aria-label={label} data-mascot="contact">
            <Icon className={styles.socialIcon} />
          </ContactLink>
        ) : (
          <a
            href={href}
            aria-label={label}
            {...(isExternal(href)
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
          >
            <Icon className={styles.socialIcon} />
          </a>
        )
      // The Bluesky icon peeks the latest post above itself.
      return label === "Bluesky" ? (
        <BlueskyPeek key={label}>{link}</BlueskyPeek>
      ) : (
        <li key={label}>{link}</li>
      )
    })}
  </ul>
)

// Desktop: the split-screen hero (photo beside a single column of content).
const HeroDesktop = () => (
  <section className={styles.hero}>
    <AvatarImage
      src={DESKTOP_AVATAR}
      alt="Erwann Mest"
      width={1028}
      height={1028}
      className={styles.photo}
      placeholderIcon={false}
    />

    <div className={styles.content}>
      <div className={styles.inner}>
        <Eyebrow />
        <Name />
        <Tagline />
        <BioLead />
        <div className={styles.actions}>
          <Cta />
          <Writing />
        </div>
        <SocialLinks />
        <ScrollHint href="#about" label="About" />
      </div>
    </div>
  </section>
)

// Desktop: the rest of the bio, one scroll down, so the hero itself fits a
// laptop screen. Mirrors the mobile split (carte de visite, then about).
const AboutDesktop = () => (
  <section id="about" className={styles.about} aria-label="About">
    <div className={styles.aboutInner}>
      <BioMore />
      <FocusTags />
      <Personal />
      <ScrollHint />
    </div>
  </section>
)

// Mobile: two full-height slides — a "carte de visite" (identity + links) and
// the longer description — that snap into place as you swipe down.
const HeroMobile = () => (
  <>
    <section className={styles.slideCard}>
      <AvatarImage
        src={AVATAR}
        alt="Erwann Mest"
        width={156}
        height={156}
        className={styles.cardAvatar}
      />
      <Eyebrow />
      <Name />
      <Tagline />
      <div className={styles.cardLinks}>
        <div className={styles.actions}>
          <Cta />
          <Writing />
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
  // A theme scope for Ink only; home keeps one look under Light and Dark.
  <div
    className={styles.home}
    data-theme-scope
    data-theme="system"
    suppressHydrationWarning
  >
    <ThemeScopeScript />
    <HeroDesktop />
    <AboutDesktop />
    <HeroMobile />
    <ExperienceTimeline />
    {/* A snap point at the timeline's end, so strict snap can always reach
        the bottom of the page when nothing follows it. */}
    <div className={styles.snapEnd} aria-hidden />
    <PromptMascot />
  </div>
)

export default Home
