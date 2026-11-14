// Text that must never reach a public edition: contact details, account
// numbers, credentials. The patterns are deliberately blunt; editorial prose
// rarely needs a phone number or a 40-character token, and a false positive
// costs only a rewrite.
//
// A finding names WHAT kind of thing was found and where, never the match
// itself: the message ends up in a CI log and in Notion, and echoing a leaked
// key there would leak it twice.

export type TextProblem =
  | "TEXT_EMAIL"
  | "TEXT_PHONE"
  | "TEXT_IBAN"
  | "TEXT_API_KEY"
  | "TEXT_TOKEN"

type Rule = { code: TextProblem; label: string; pattern: RegExp }

const RULES: Rule[] = [
  {
    code: "TEXT_EMAIL",
    label: "an email address",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/i,
  },
  {
    code: "TEXT_PHONE",
    label: "a phone number",
    // International (+33 6 12 34 56 78, +44 20 7946 0000) or a French national
    // number (06 12 34 56 78). Plain large numbers and year ranges don't match.
    pattern: /(?:\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4})|(?:\b0[1-9](?:[\s.-]?\d{2}){4}\b)/,
  },
  {
    code: "TEXT_IBAN",
    label: "an IBAN-like account number",
    pattern: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,4})?\b/,
  },
  {
    code: "TEXT_API_KEY",
    label: "an API key or credential",
    pattern: new RegExp(
      [
        "\\bsk-[A-Za-z0-9_-]{16,}",
        "\\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}",
        "\\bgithub_pat_[A-Za-z0-9_]{20,}",
        "\\bxox[abposr]-[A-Za-z0-9-]{10,}",
        "\\bAKIA[0-9A-Z]{16}\\b",
        "\\bAIza[0-9A-Za-z_-]{35}",
        "\\bre_[A-Za-z0-9_]{20,}",
        "\\b(?:secret|ntn)_[A-Za-z0-9]{30,}",
        "-----BEGIN [A-Z ]*PRIVATE KEY-----",
        "\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}",
      ].join("|"),
    ),
  },
  {
    code: "TEXT_TOKEN",
    label: "a long token-like string",
    // 32+ hex characters, or 40+ base64 characters mixing cases and digits.
    pattern: /\b[0-9a-f]{32,}\b|(?=[A-Za-z0-9+/_-]*[a-z])(?=[A-Za-z0-9+/_-]*[A-Z])(?=[A-Za-z0-9+/_-]*\d)[A-Za-z0-9+/_-]{40,}/,
  },
]

export type TextFinding = { code: TextProblem; label: string }

export const scanText = (text: string): TextFinding[] =>
  RULES.filter((rule) => rule.pattern.test(text)).map(({ code, label }) => ({
    code,
    label,
  }))

// For an error string about to be written somewhere visible (Notion's Error
// property, a log line): every match of every rule replaced, then cut short.
export const redact = (text: string, max = 300) => {
  let out = text
  for (const rule of RULES)
    out = out.replace(new RegExp(rule.pattern.source, `${rule.pattern.flags.replace("g", "")}g`), "[redacted]")
  return out.length > max ? `${out.slice(0, max - 1)}…` : out
}
