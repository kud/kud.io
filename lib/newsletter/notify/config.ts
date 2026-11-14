// Email is optional. The site, the archive and the publication workflow all
// work without it; the sign-up form, the confirm route and the "new edition"
// mail switch on only once every value below is set.
//
// Two switches, on purpose. `isEmailConfigured()` reads the server's secrets
// and decides whether the routes and the workflow may talk to the provider.
// The pages cannot read those secrets (they are static), so they read
// NEXT_PUBLIC_NEWSLETTER_EMAIL instead, inlined at build time:
// `isEmailAdvertised()`. Set the flag only once the secrets are in place, or
// the form shows and every submission answers "not available".

export const EMAIL_ENV = [
  "RESEND_API_KEY",
  "RESEND_SEGMENT_FR",
  "RESEND_SEGMENT_EN",
  "NEWSLETTER_FROM",
  "NEWSLETTER_SIGNING_SECRET",
] as const

export type EmailEnvName = (typeof EMAIL_ENV)[number]
export type EmailConfig = Record<EmailEnvName, string>

type Env = Record<string, string | undefined>

export const emailConfig = (env: Env = process.env): EmailConfig | null => {
  const values = EMAIL_ENV.map((name) => [name, env[name]?.trim() ?? ""] as const)
  if (values.some(([, value]) => !value)) return null
  return Object.fromEntries(values) as EmailConfig
}

export const isEmailConfigured = (env: Env = process.env) => emailConfig(env) !== null

// Written out as a literal so Next inlines it into client bundles.
export const isEmailAdvertised = () => process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL === "1"

export const SITE_URL = "https://kud.io"
