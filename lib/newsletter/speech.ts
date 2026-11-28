import type { Lang } from "./language.ts"

// What the edition's Listen control says, as pure text work so it can be
// tested without a browser. The page decides which blocks are read; these
// decide how each one sounds.

// A kicker is set in capitals for the eye ("ARMES AUTONOMES"); a voice may
// spell capitals out letter by letter. Long words go to lower case, short
// ones (IA, COP, UN) are kept, since they are usually acronyms.
export const speakableKicker = (kicker: string, lang: Lang) => {
  const words = kicker
    .replace(/\s*&\s*/g, lang === "fr" ? " et " : " and ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.length > 3 && word === word.toLocaleUpperCase(lang)
        ? word.toLocaleLowerCase(lang)
        : word,
    )
  const text = words.join(" ")
  return text.charAt(0).toLocaleUpperCase(lang) + text.slice(1)
}

// A story heading as it should be heard: its number, its kicker, its title.
export const spokenHeading = (
  { id, kicker, title }: { id: string; kicker?: string | null; title: string },
  lang: Lang,
) => {
  const number = Number(id)
  const parts = [
    Number.isFinite(number) ? String(number) : id,
    kicker ? speakableKicker(kicker, lang) : null,
    kicker !== title ? title : null,
  ].filter(Boolean)
  return parts.join(". ")
}

// What a voice should not read: raw addresses, footnote markers, the arrow on
// a citation, and the separators that only space things for the eye.
export const cleanSpokenText = (text: string) =>
  text
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .replace(/\[\^?\d+\]/g, "")
    .replace(/[↗↑→←]/g, "")
    .replace(/\s+·\s+/g, ", ")
    .replace(/\s+([,.;:!?])/g, (match, mark: string) =>
      // French keeps its space before : ; ! ? and a voice does not care.
      /[:;!?]/.test(mark) ? ` ${mark}` : mark,
    )
    .replace(/\s+/g, " ")
    .trim()

// Some engines stop part-way through a long utterance (Chrome's online voices
// fall silent after about fifteen seconds), so a block is spoken in pieces of
// whole sentences, each short enough to finish. A sentence longer than the
// limit is cut at its last comma or space before it.
export const chunkText = (text: string, limit = 220): string[] => {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+["»”’)]*|$)\s*/g) ?? [text]
  const chunks: string[] = []
  let current = ""
  const push = () => {
    if (current.trim()) chunks.push(current.trim())
    current = ""
  }
  for (const sentence of sentences) {
    if ((current + sentence).length <= limit) {
      current += sentence
      continue
    }
    push()
    let rest = sentence
    while (rest.length > limit) {
      const slice = rest.slice(0, limit)
      const cut = Math.max(slice.lastIndexOf(", "), slice.lastIndexOf(" "))
      const at = cut > limit / 3 ? cut + 1 : limit
      chunks.push(rest.slice(0, at).trim())
      rest = rest.slice(at)
    }
    current = rest
  }
  push()
  return chunks
}

// The best installed voice for a language: the edition's own region first
// (fr-FR, en-GB), then any voice of that language; on-device before network,
// the system default before the rest. Null lets the engine choose by lang.
export type VoiceLike = {
  lang: string
  localService: boolean
  default: boolean
}

export const pickVoice = <V extends VoiceLike>(
  voices: readonly V[],
  lang: Lang,
): V | null => {
  const region = lang === "fr" ? "fr-fr" : "en-gb"
  const score = (voice: V) => {
    const tag = voice.lang.toLowerCase().replace("_", "-")
    if (!tag.startsWith(lang)) return -1
    return (
      (tag === region ? 4 : 0) +
      (voice.localService ? 2 : 0) +
      (voice.default ? 1 : 0)
    )
  }
  let best: V | null = null
  let bestScore = -1
  for (const voice of voices) {
    const value = score(voice)
    if (value > bestScore) {
      best = voice
      bestScore = value
    }
  }
  return best
}
