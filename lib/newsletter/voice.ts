import type { Lang } from "./language.ts"

// The voice the listen button speaks with, chosen from what the reader's
// system offers. Free system voices vary from robotic to very good, and the
// good ones say so in their names: Apple's "Enhanced" and "Premium" downloads,
// Edge's "Natural" online voices, Google's network voices in Chrome. The
// page's own accent comes first (en-GB over en-US), then one of those, then
// the system default, then the first listed. No voice for the language means
// no button.

export const SPEECH_LANG: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" }

export type VoiceLike = Pick<SpeechSynthesisVoice, "name" | "lang" | "default">

const QUALITY = /\b(?:enhanced|premium|natural|neural)\b|google/i

const normalise = (tag: string) => tag.replace(/_/g, "-").toLowerCase()

export const pickVoice = <V extends VoiceLike>(
  voices: readonly V[],
  lang: Lang,
): V | null => {
  const wanted = SPEECH_LANG[lang].toLowerCase()
  const base = wanted.split("-")[0]
  const candidates = voices.filter(
    (voice) => normalise(voice.lang).split("-")[0] === base,
  )
  if (candidates.length === 0) return null
  const score = (voice: V) =>
    (normalise(voice.lang) === wanted ? 4 : 0) +
    (QUALITY.test(voice.name) ? 2 : 0) +
    (voice.default ? 1 : 0)
  // Stable: among equals, the order the system listed them in.
  return candidates.reduce((best, voice) =>
    score(voice) > score(best) ? voice : best,
  )
}
