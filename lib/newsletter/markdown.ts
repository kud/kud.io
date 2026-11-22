import { editionPath, formatEditionDate, type Lang } from "./language.ts"

// An edition as plain Markdown, for language models and anything else that
// reads text rather than a page: the llms.txt convention's "same URL with .md"
// (https://llmstxt.org). It is the committed <lang>.md the page already reads,
// with its front matter and heading anchors taken off and a short preface put
// on, so it cannot say anything the page does not.

const SITE = "https://kud.io"

// The edition's address with .md, as the convention asks; the language rides
// in the query, as it does for the page.
export const markdownPath = (date: string) => `${editionPath(date)}.md`

export const markdownHref = (date: string, lang: Lang) =>
  `${markdownPath(date)}?lang=${lang}`

export const markdownUrl = (date: string, lang: Lang) =>
  `${SITE}${markdownHref(date, lang)}`

const AUTHOR = "Erwann Mest (kud)"

// French typography: a non-breaking space before : ; ? ! and inside « ».
const NB = "\u00a0"

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

// A few lines for the model that reads the file, in the edition's language:
// what it is, how it is laid out, how to read it aloud, who wrote it.
const preface = (date: string, lang: Lang) => {
  const day = formatEditionDate(date, lang)
  const page = `${SITE}${editionPath(date)}?lang=${lang}`
  const lines =
    lang === "fr"
      ? [
          `**Comment lire cette édition.** Newsletter du soir de kud.io, en français, écrite par ${AUTHOR}, édition du ${day}.`,
          `Une introduction, puis des sections (##) qui regroupent des sujets numérotés (###)${NB}; «${NB}En bref${NB}» est une liste de faits courts.`,
          `Pour un aperçu, lisez les titres, puis le premier paragraphe de chaque sujet.`,
          `Les «${NB}Sources${NB}» sont des liens${NB}: ne lisez pas les adresses à voix haute, sauf si on vous le demande${NB}; nommez la source.`,
          `Si vous la reprenez, citez ${AUTHOR} et cette édition${NB}: ${page}`,
        ]
      : [
          `**How to read this edition.** The kud.io evening newsletter, in English, written by ${AUTHOR}, edition of ${day}.`,
          "An introduction, then sections (##) grouping numbered stories (###); “In brief” is a list of short facts.",
          "For an overview, read the titles, then the first paragraph of each story.",
          "“Sources” are links: do not read web addresses aloud unless asked; name the source instead.",
          `If you quote it, credit ${AUTHOR} and this edition: ${page}`,
        ]
  return lines.map((line) => `> ${line}`).join("\n>\n")
}

// Front matter, if any, is the first block between two --- lines.
const stripFrontMatter = (markdown: string) =>
  markdown.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, "")

// "### 01 · TITLE {#item-01}": the anchor is the page's, not the text's.
const stripHeadingAnchors = (markdown: string) =>
  markdown.replace(/^(#{1,6} .*?)\s*\{#[\w-]+\}\s*$/gm, "$1")

export const editionMarkdown = ({
  date,
  lang,
  markdown,
}: {
  date: string
  lang: Lang
  markdown: string
}) => {
  const title = `# Newsletter · ${capitalise(formatEditionDate(date, lang))}`
  const body = stripHeadingAnchors(stripFrontMatter(markdown)).trim()
  return [title, preface(date, lang), body].join("\n\n") + "\n"
}

// The ready prompt the edition page copies for an assistant: read this
// edition aloud, in its language, without the links.
export const listenPrompt = (date: string, lang: Lang) => {
  const day = formatEditionDate(date, lang)
  const url = markdownUrl(date, lang)
  return lang === "fr"
    ? `Lis-moi à voix haute la newsletter du ${day}, en français, sans lire les liens${NB}: ${url}`
    : `Read me the newsletter of ${day} aloud, in English, without reading the links: ${url}`
}

// ChatGPT prefills its composer from ?q= without sending it. Claude's web app
// has no documented equivalent (only the desktop app's claude:// link), so it
// gets the copied prompt instead of a link that may open empty.
export const chatGptUrl = (prompt: string) =>
  `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
