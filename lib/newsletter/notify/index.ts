// The newsletter's email side: configuration, double opt-in tokens, the
// messages, and the provider behind an interface.

import type { Lang } from "../sections.ts"
import { emailConfig } from "./config.ts"
import type { NewsletterProvider } from "./provider.ts"
import { createResendProvider } from "./resend.ts"

export * from "./config.ts"
export * from "./token.ts"
export * from "./teaser.ts"
export type { Message, NewsletterProvider } from "./provider.ts"

// The configured provider, or null when email is off.
export const providerFromEnv = (
  env: Record<string, string | undefined> = process.env,
): NewsletterProvider | null => {
  const config = emailConfig(env)
  if (!config) return null
  const segments: Record<Lang, string> = {
    fr: config.RESEND_SEGMENT_FR,
    en: config.RESEND_SEGMENT_EN,
  }
  return createResendProvider({
    apiKey: config.RESEND_API_KEY,
    from: config.NEWSLETTER_FROM,
    segments,
  })
}
