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

// Code stays dark in both lights, on a deep plum block (#241820, set in
// app/warm.css) that sits on paper and at night alike. Palette 1, "plum": the
// ground's own mauves and peaches; every token clears 7:1 on the block.
// duskDay stays for surfaces outside Dusk that still read --shiki-light.
export const duskNight = theme("dusk-night", "dark", "#241820", {
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

// Palette 2, "ember": a warmer umber block (#1d1714) with terracotta keywords
// and lamp-amber numbers. Emitted as a third Shiki theme (--shiki-ember) so
// the preview can compare it live with ?code=2; every token clears 6:1.
export const duskEmber = theme("dusk-ember", "dark", "#1d1714", {
  fg: "#efe4d8",
  comment: "#a8978b",
  keyword: "#e8906f",
  string: "#c8c07e",
  number: "#f0b46e",
  fn: "#f3cfa6",
  type: "#d9a6b9",
  punct: "#c2b2a5",
})
