"use client"

import { Droplet, Monitor, Moon, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  SCOPED_THEMES,
  SECTION_LABEL,
  type ScopedTheme,
  useScopedTheme,
} from "@/components/scoped-theme"

// The list comes from SCOPED_THEMES; only the word and the mark live here, so
// a new theme cannot ship without both.
const OPTION: Record<ScopedTheme, { label: string; Icon: LucideIcon }> = {
  system: { label: "System", Icon: Monitor },
  dark: { label: "Dark", Icon: Moon },
  light: { label: "Light", Icon: Sun },
  ink: { label: "Ink", Icon: Droplet },
}

// System, Dark, Light or Ink for the Dusk pages: the shared scoped theme,
// stamped on the data-ground="dusk" wrapper, never on <html>. The server
// renders System; the stored choice is marked once the client reads it.
//
// It shows and sets this section's theme. Once the visitor has chosen a theme
// per section (launcher settings), a quiet word names the section, so a pick
// that leaves the other one alone does not read as a bug. Until then nothing
// is added: the default visitor never sees the option's furniture.
export const ThemePicker = ({ className }: { className?: string }) => {
  const { theme, setTheme, split, section } = useScopedTheme()
  const scope = split && section ? SECTION_LABEL[section] : null

  return (
    <div
      role="radiogroup"
      aria-label={scope ? `${scope} colour theme` : "Colour theme"}
      className={["dusk-picker", className].filter(Boolean).join(" ")}
    >
      {scope ? (
        <span className="dusk-picker-scope" aria-hidden>
          {scope}
        </span>
      ) : null}
      {SCOPED_THEMES.map((value) => {
        const { label, Icon } = OPTION[value]
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            aria-label={label}
            title={label}
            onClick={(event) => setTheme(value, event.currentTarget)}
          >
            <Icon aria-hidden size={14} strokeWidth={2} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
