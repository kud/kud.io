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
// Detail blocks are drawn from the live LinkedIn profile — keep them in step
// with it when roles change.
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
        "Working across Sony Music's mobile ecosystem: product delivery, technical architecture, and engineering workflows, collaborating closely with product, design, and backend teams.",
      highlights: [
        "Provide technical leadership and architectural guidance for the mobile team.",
        "Build and ship mobile applications across the product ecosystem.",
        "Introduce AI-assisted engineering workflows and raise developer experience.",
        "Drive reliability, maintainability, and scalability improvements.",
        "Keep delivery aligned across initiatives, product, design, and backend.",
      ],
      stack: [
        "React Native",
        "TypeScript",
        "GraphQL/Apollo",
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
        "Focused on The Orchard's analytics and metrics platform: front-end architecture, performance, and product usability for the data-heavy interfaces labels, artists, and internal teams rely on.",
      highlights: [
        "Owned front-end architecture and feature development on the analytics platform.",
        "Optimised performance and rendering across data-dense dashboards.",
        "Built analytics and data-visualisation interfaces.",
        "Partnered with product and design to ship clear, responsive data features.",
      ],
      stack: ["React", "GraphQL", "Data visualisation", "Web performance"],
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
        "Led front-end for an online media covering public policy, building a complete progressive web app from scratch and a company-wide design system, and lifting the whole team's front-end practice.",
      highlights: [
        "Built a complete progressive web app (PWA) from scratch.",
        "Created a company-wide design system in partnership with designers.",
        "Maintained all of the company's front-end components.",
        "Mentored the team to sharpen their front-end skills.",
      ],
      stack: [
        "React",
        "Webpack",
        "Python/Django",
        "Elasticsearch",
        "AWS",
        "Design systems",
      ],
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
        "Taught front-end culture to students training to become lead developers and CTOs: a global view of the stack, modern HTML and CSS, and Next.js end to end.",
      highlights: [
        "Taught front-end culture and a global view of front-end and back-end stacks.",
        "Taught Next.js end to end.",
        "Covered modern HTML5 and CSS3: flexbox, grid, and the latest features.",
      ],
      stack: ["Next.js", "HTML5", "CSS3"],
    },
  },
  {
    period: "2013 — 2022",
    role: "Web Trainer",
    org: "ESG Executive Education",
    url: "https://www.esg.fr/",
    place: "Paris",
    note: "Taught the web, HTML and CSS to career-changers, from zero to their own static site.",
    detail: {
      summary:
        "Taught career-changers how the web works and how to build a site from nothing, over nine years alongside engineering work.",
      highlights: [
        "Explained the internet and the web from first principles.",
        "Taught HTML5 and CSS3 from the ground up.",
        "Guided complete beginners to build their own static site by hand (no IDE).",
        "Ran the oral exams.",
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
