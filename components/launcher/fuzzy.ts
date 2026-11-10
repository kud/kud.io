// A small fuzzy scorer, enough for a few hundred titles: a whole-title prefix
// beats a word start, which beats a substring, which beats letters in order.
// Accents and case are folded so "cafe" finds "Café". Zero means no match.
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const scoreOne = (query: string, text: string): number => {
  const target = fold(text)
  if (!target) return 0
  if (target === query) return 100
  if (target.startsWith(query)) return 90 - Math.min(target.length / 10, 9)
  const at = target.indexOf(query)
  if (at > 0) {
    const wordStart = /[\s\-_/.:]/.test(target[at - 1])
    return (wordStart ? 75 : 55) - Math.min(at / 4, 10)
  }

  // Letters in order: each consecutive run and each word-start hit earns,
  // each gap costs, so "mcpj" finds "mcp-jenkins" well above a scattered hit.
  let score = 0
  let from = 0
  let previous = -2
  for (const char of query) {
    if (char === " ") continue
    const index = target.indexOf(char, from)
    if (index === -1) return 0
    if (index === previous + 1) score += 3
    else if (index === 0 || /[\s\-_/.:]/.test(target[index - 1])) score += 2
    else score -= Math.min(index - from, 4) * 0.5
    previous = index
    from = index + 1
  }
  return Math.max(1, 20 + score)
}

// The best of the title and its extra words, the extras weighed lower: a
// project found by its type should sit under one found by its name.
export const fuzzyScore = (
  rawQuery: string,
  title: string,
  extras: string[] = [],
): number => {
  const query = fold(rawQuery.trim())
  if (!query) return 0
  const best = scoreOne(query, title)
  const extra = Math.max(0, ...extras.map((text) => scoreOne(query, text)))
  return Math.max(best, extra * 0.7)
}
