import type { Edition } from "./content.ts"
import { formatEditionDate, type Lang } from "./language.ts"

// The research prompt is built here, in the reader's browser, from what the
// page already holds: no model is called and nothing leaves the page until
// the reader pastes it somewhere. It names no assistant, so it works in any.
//
// It hands over each selected item's title, summary and public sources as a
// starting point, then asks for the work the edition could not do in a few
// lines: primary sources, independent cross-reading, the background, and an
// honest line between fact, attributed claim and uncertainty.

const INSTRUCTIONS: Record<Lang, string[]> = {
  fr: [
    "Pars des sources ci-dessus, mais ne t’y arrête pas : poursuis la recherche au-delà.",
    "Privilégie les sources primaires quand elles existent : décisions de justice, études, dépôts et documents officiels, données publiques, déclarations et rapports d’origine.",
    "Croise les affirmations importantes avec plusieurs comptes rendus fiables et indépendants avant de t’appuyer dessus.",
    "Reconstitue le contexte et la chronologie : ce qui a mené là, et ce qui s’est passé, quand.",
    "Sépare clairement les faits établis, les affirmations attribuées (en disant à qui) et ce qui reste incertain.",
    "Signale ce qui est contesté ou inconnu, et par qui.",
    "Rédige en français une explication autonome, lisible sans la newsletter ni les sources sous les yeux.",
    "Termine par ta propre liste de sources, avec leurs liens, en indiquant lesquelles sont primaires.",
  ],
  en: [
    "Start from the sources above, but don’t stop there: research the subject further.",
    "Prefer primary sources wherever they exist: court rulings, studies, filings and official documents, public data, the original statement or report.",
    "Cross-read important claims against more than one reliable, independent account before relying on them.",
    "Reconstruct the background and the timeline: what led here, and what happened when.",
    "Separate clearly what is established fact, what is a claim attributed to someone (say whom), and what remains uncertain.",
    "Flag anything that is disputed or unknown, and by whom.",
    "Write a self-contained explanation in British English, readable without the newsletter or the sources to hand.",
    "End with your own list of sources, with links, noting which are primary.",
  ],
}

const COPY = {
  fr: {
    intro: (date: string, count: number) =>
      `Je lis la newsletter de kud.io du ${date} et je voudrais comprendre ${count === 1 ? "le sujet suivant" : "les sujets suivants"} en profondeur.`,
    subjects: (count) => (count === 1 ? "Sujet" : "Sujets"),
    starting: "Sources de départ :",
    ask: "Ce que je te demande",
    context: "Contexte : l’édition du soir",
    contextNote:
      "L’introduction de l’édition, pour situer ces sujets. Elle n’est qu’un point de départ, pas une source.",
  },
  en: {
    intro: (date: string, count: number) =>
      `I’m reading the kud.io newsletter of ${date} and would like to understand ${count === 1 ? "the following subject" : "the following subjects"} properly.`,
    subjects: (count) => (count === 1 ? "Subject" : "Subjects"),
    starting: "Starting sources:",
    ask: "What I’d like you to do",
    context: "Context: tonight’s edition",
    contextNote:
      "The edition’s introduction, to place these subjects. It is a starting point, not a source.",
  },
} satisfies Record<
  Lang,
  {
    intro: (date: string, count: number) => string
    subjects: (count: number) => string
    starting: string
    ask: string
    context: string
    contextNote: string
  }
>

// "KICKER · Title", or whichever of the two the story has.
export const headline = (
  item: Pick<Edition["items"][number], "kicker" | "title">,
  lang: Lang,
) => {
  const kicker = item.kicker?.[lang]?.trim()
  const title = item.title[lang].trim()
  return kicker && kicker !== title ? `${kicker} · ${title}` : title
}

// Selected ids are taken in the edition's own order, whatever order they were
// ticked in, and unknown ids are ignored. An empty selection is a caller bug:
// the button that calls this only exists once something is ticked.
export const buildResearchPrompt = (
  edition: Pick<Edition, "date" | "items"> & {
    narrative?: Pick<Edition["narrative"], "overview">
  },
  ids: Iterable<string>,
  lang: Lang,
): string => {
  const wanted = new Set(ids)
  const items = edition.items.filter((item) => wanted.has(item.id))
  if (items.length === 0)
    throw new RangeError("buildResearchPrompt: no known item selected")

  const copy = COPY[lang]
  const overview = edition.narrative?.overview?.[lang]?.trim() || null
  const date = `${formatEditionDate(edition.date, lang)} (${edition.date})`

  const subjects = items.map((item) =>
    [
      `### ${item.id} · ${headline(item, lang)}`,
      "",
      item.summary[lang],
      ...(item.sources.length > 0
        ? [
            "",
            copy.starting,
            ...item.sources.map(
              (source) => `- ${source.label[lang]}: ${source.url}`,
            ),
          ]
        : []),
    ].join("\n"),
  )

  return [
    copy.intro(date, items.length),
    "",
    `## ${copy.subjects(items.length)}`,
    "",
    subjects.join("\n\n"),
    "",
    ...(overview
      ? [`## ${copy.context}`, "", `_${copy.contextNote}_`, "", overview, ""]
      : []),
    `## ${copy.ask}`,
    "",
    ...INSTRUCTIONS[lang].map((line, index) => `${index + 1}. ${line}`),
    "",
  ].join("\n")
}
