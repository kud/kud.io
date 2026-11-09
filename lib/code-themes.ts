// Syntax themes drawn from the warm illustration palette (cream, peach,
// terracotta, mustard, sage, forest, teak). Every token colour clears WCAG AA
// (4.5:1) against its own background and against the ground's card surface,
// which is where fumadocs actually paints the block.

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

export const warmNight = theme("warm-night", "dark", "#1c2822", {
  fg: "#efe6d6",
  comment: "#9aa595",
  keyword: "#ec9a6e",
  string: "#bccc9f",
  number: "#e6bf66",
  fn: "#f2b48c",
  type: "#dcb98f",
  punct: "#c9bfae",
})

export const warmDay = theme("warm-day", "light", "#fbf6ee", {
  fg: "#2b2420",
  comment: "#6c6356",
  keyword: "#a3442a",
  string: "#4a6636",
  number: "#82590f",
  fn: "#8c4524",
  type: "#6b4a2f",
  punct: "#5a4f45",
})
