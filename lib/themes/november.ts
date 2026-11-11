import type { ThemeRegistration } from "shiki"
import novemberJson from "./november.json"

// November as the site renders it. The editor build carries a rule that
// italicises some sixty scopes (keywords, strings, parameters, shell
// arguments) for Operator Mono's cursive. On a web page in JetBrains Mono it
// sets half of every command slanted, so `sonarqube issues --new-code` reads
// as emphasis rather than as something to type. The rule is dropped; comments
// keep their own italic rule, the one slant that still means "aside".
const EDITOR_ONLY = "italicsify for operator mono"

const raw = novemberJson as ThemeRegistration

export const november = {
  ...raw,
  tokenColors: (raw.tokenColors ?? []).filter(
    (rule) => rule.name !== EDITOR_ONLY,
  ),
} as ThemeRegistration
