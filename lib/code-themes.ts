// Syntax themes for the Dusk ground, drawn from the delivered project art.
// Every token colour clears WCAG AA (4.5:1) against its own background, which
// is the card surface fumadocs paints the block on.

type Rule = {
  scope: string[]
  settings: { foreground: string; fontStyle?: string }
}

const theme = (
  name: string,
  type: "dark" | "light",
  bg: string,
  c: Record<
    | "fg"
    | "comment"
    | "keyword"
    | "string"
    | "number"
    | "fn"
    | "type"
    | "punct",
    string
  >,
) => ({
  name,
  type,
  colors: { "editor.background": bg, "editor.foreground": c.fg },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: c.comment, fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "keyword.operator.new",
        "keyword.control",
      ],
      settings: { foreground: c.keyword },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "markup.inline.raw",
      ],
      settings: { foreground: c.string },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "support.constant",
        "variable.other.constant",
      ],
      settings: { foreground: c.number },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "variable.function",
      ],
      settings: { foreground: c.fn },
    },
    {
      scope: [
        "entity.name.type",
        "support.type",
        "entity.name.class",
        "entity.other.attribute-name",
        "entity.name.tag",
      ],
      settings: { foreground: c.type },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: c.punct },
    },
    {
      scope: ["variable", "variable.parameter", "meta.definition.variable"],
      settings: { foreground: c.fg },
    },
  ] satisfies Rule[],
})

// The Dusk pair, each on its own light's card surface: night on late dusk's
// #33252c, day on #fdf5ef. Both clear AA there and on the page ground.
export const duskNight = theme("dusk-night", "dark", "#33252c", {
  fg: "#f4e7e1",
  comment: "#b9a1a8",
  keyword: "#dfa0c4",
  string: "#e3c486",
  number: "#f29a86",
  fn: "#f5b791",
  type: "#dcbcae",
  punct: "#cfbabe",
})

export const duskDay = theme("dusk-day", "light", "#fdf5ef", {
  fg: "#3a2830",
  comment: "#76605f",
  keyword: "#80485f",
  string: "#6e5410",
  number: "#a03a4e",
  fn: "#914426",
  type: "#6b4a3f",
  punct: "#5e4448",
})
