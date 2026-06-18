// The focus/skill values shown on the home hero and the CV. Ordered as a
// deliberate narrative — how I think, who I start from, how I work with design &
// product, how I ship, and how I execute — rather than a random pill cloud.
// Descriptions are in kud's own voice.

export type Focus = {
  label: string
  description: string
}

export const focus: Focus[] = [
  {
    label: "Systems thinking",
    description:
      "Everything is a workflow or a pipeline to me. A feature is connected to other features, and to how the team works. I see systems everywhere, in how I work and how I build, and I love thinking in design systems. I work at a higher level: not just the thing we're building, but the system it lives in.",
  },
  {
    label: "Language & meaning",
    description:
      "I'm a linguist at heart: coding is a language, not maths. I'm into terminology and detail, and I need meaning in what I do, in what we build, what we believe, and how we work together.",
  },
  {
    label: "User empathy",
    description:
      "I start by listening, to users and to stakeholders, because the point is to deliver something meaningful to them, not just to close a ticket. I'd rather resolve the real need straight away and then polish, than chase a perfect plan that delivers what we assume the user wants, which often isn't what they actually need.",
  },
  {
    label: "Design & product partnership",
    description:
      "My best work happens with designers and PMs, and I learn the basics of each discipline so we speak the same language. The design review is honestly my favourite meeting. I want to shape the solution together before a line of code is written.",
  },
  {
    label: "Shape Up & iteration",
    description:
      "Inspired by Shape Up. I used to be a handcraft developer; now I'm about optimising systems and the right constraints: the need, the appetite, adjusting the plan as we learn. I treat every feature like a startup: an MVP that already works, then v1, v2, v3, each version usable on its own, improving piece by piece instead of waiting for the whole thing to come alive at the end.",
  },
  {
    label: "Developer experience",
    description:
      "I see developers as users too. That's why I love DX so much: my users are the engineers, and I want to make their work easier. I believe in reducing cognitive load for everyone (users, engineers, and the PMs and designers around them) with better tooling, conventions, automation, and design systems.",
  },
  {
    label: "AI-assisted engineering",
    description:
      "What I love most: architecting the solution, then delegating its execution to AI in a deliberate, fine-tuned way, turning experience into agents and skills that keep getting sharper.",
  },
]

// Core technologies, from the LinkedIn profile's stack line — verified.
export const coreTech = [
  "React Native",
  "React",
  "TypeScript",
  "Next.js",
  "GraphQL/Apollo",
  "TanStack Query",
  "Node.js",
  "AWS",
  "Snowflake",
  "Neo4j",
]
