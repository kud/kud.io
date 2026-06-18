// Single source of truth for the career history. Read by both the home page
// timeline (components/experience-timeline.tsx) and the generated CV
// (app/cv.pdf/route.tsx), so there is exactly one copy to keep accurate.

export type ExperienceDetail = {
  // A short paragraph expanding on the one-line note — the modal's lede.
  summary: string
  // Scannable bullets: scope, ownership, what was actually built.
  highlights: string[]
  // Tools and disciplines, rendered as chips.
  stack: string[]
}

export type Experience = {
  period: string
  role: string
  org: string
  team?: string
  url: string
  place: string
  note: string
  detail?: ExperienceDetail
}

// Proper nouns use a non-breaking space ( ) so the words never wrap apart.
// NOTE: every `detail` block below is DRAFTED from the existing one-line notes
// and public context — verify the specifics (especially `stack`) before relying
// on them in the CV.
export const experience: Experience[] = [
  {
    period: "2022 — Present",
    role: "Senior Software Engineer / Tech Lead",
    org: "Sony Music",
    team: "Mobile Team",
    url: "https://www.sonymusic.com/",
    place: "London",
    note: "Mobile architecture, AI-assisted engineering workflows, and developer experience across product, design, and engineering.",
    detail: {
      summary:
        "Technical lead on the mobile team — owning architecture and the day-to-day engineering practice, and working across product, design, and engineering to keep the codebase coherent and the team moving fast.",
      highlights: [
        "Lead mobile architecture and set technical direction across the team.",
        "Introduced AI-assisted engineering workflows — agents, skills, and automation — to accelerate delivery without sacrificing quality.",
        "Champion developer experience: tooling, conventions, and review practices that reduce friction for the whole team.",
        "Partner closely with product and design to shape solutions before they reach implementation.",
      ],
      stack: [
        "React Native",
        "TypeScript",
        "Mobile CI/CD",
        "AI-assisted tooling",
      ],
    },
  },
  {
    period: "2022 — 2023",
    role: "Senior Software Engineer",
    org: "The Orchard",
    url: "https://www.theorchard.com/",
    place: "London",
    note: "Front-end architecture, performance, and UX for the analytics & metrics platform used by labels, artists, and internal teams.",
    detail: {
      summary:
        "Worked on the analytics & metrics platform that labels, artists, and internal teams rely on, focusing on front-end architecture, performance, and the quality of the everyday experience.",
      highlights: [
        "Shaped front-end architecture for a data-dense analytics platform.",
        "Improved performance and responsiveness across heavy metrics dashboards.",
        "Refined UX for labels, artists, and internal teams.",
      ],
      stack: ["React", "TypeScript", "Data visualisation", "Web performance"],
    },
  },
  {
    period: "2017 — 2022",
    role: "Lead Front-end Developer",
    org: "Contexte",
    url: "https://www.contexte.com/",
    place: "Paris",
    note: "Built a PWA from scratch and a company-wide design system for an online public-policy media.",
    detail: {
      summary:
        "Led front-end for an online public-policy media — building its progressive web app from the ground up and a company-wide design system that unified the product.",
      highlights: [
        "Built the progressive web app from scratch.",
        "Created and maintained a company-wide design system.",
        "Set front-end standards and mentored the team as lead.",
      ],
      stack: ["React", "Next.js", "PWA", "Design systems", "JavaScript"],
    },
  },
  {
    period: "2020 — 2022",
    role: "Front-end Trainer",
    org: "EEMI",
    url: "https://www.eemi.com/",
    place: "Paris",
    note: "Taught front-end culture and Next.js to students training to become lead developers and CTOs.",
    detail: {
      summary:
        "Taught front-end culture and Next.js to students training to become lead developers and CTOs — focusing on judgement and fundamentals, not just syntax.",
      highlights: [
        "Designed and delivered a front-end curriculum centred on Next.js.",
        "Mentored future lead developers and CTOs.",
        "Emphasised engineering culture over rote tooling.",
      ],
      stack: ["Next.js", "React", "Teaching"],
    },
  },
  {
    period: "2013 — 2022",
    role: "Web Trainer",
    org: "ESG Executive Education",
    url: "https://www.esg.fr/",
    place: "Paris",
    note: "Taught the web, HTML and CSS to career-changers — from zero to their own static site.",
    detail: {
      summary:
        "Taught the web, HTML, and CSS to career-changers — guiding complete beginners all the way to shipping their own static site, across nearly a decade alongside engineering work.",
      highlights: [
        "Taught HTML, CSS, and web fundamentals to career-changers.",
        "Took complete beginners from zero to their own published site.",
        "Sustained nearly a decade of continuous teaching.",
      ],
      stack: ["HTML", "CSS", "Web fundamentals"],
    },
  },
]

// Recomputed on every build so the headline figure never goes stale. kud's
// professional web career began in 2008 (→ 18 years in 2026).
export const CAREER_START_YEAR = 2008

export const yearsOfExperience = () =>
  new Date().getFullYear() - CAREER_START_YEAR
