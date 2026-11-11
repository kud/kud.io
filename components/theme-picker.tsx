"use client"

import { Droplet, Monitor, Moon, Palette, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  INK_TONES,
  SECTION_LABEL,
  type InkTone,
  type ThemeStyle,
  useScopedTheme,
} from "@/components/scoped-theme"

const TONE: Record<InkTone, { label: string; Icon: LucideIcon }> = {
  system: { label: "Auto", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
}

const STYLES = ["colour", "ink"] as const satisfies readonly ThemeStyle[]

const STYLE: Record<ThemeStyle, { label: string; Icon: LucideIcon }> = {
  colour: { label: "Colour", Icon: Palette },
  ink: { label: "Ink", Icon: Droplet },
}

// Two axes, two rows: the light (Auto, Light, Dark) and the style (Colour or
// Ink). Each row keeps the other's choice, so Dark then Ink is a dark ink and
// Light then Ink the white paper Ink has always been. Stamped on the
// data-ground="dusk" wrapper, never on <html>; the server renders Auto and
// Colour, and the stored choice is marked once the client reads it.
//
// Once the visitor has chosen a theme per section (launcher settings), a quiet
// word names the section, so a pick that leaves the other one alone does not
// read as a bug. Until then nothing is added.
export const ThemePicker = ({ className }: { className?: string }) => {
  const { tone, setTone, style, setStyle, split, section } = useScopedTheme()
  const scope = split && section ? SECTION_LABEL[section] : null

  return (
    <div
      role="group"
      aria-label={scope ? `${scope} colour theme` : "Colour theme"}
      className={["dusk-picker", className].filter(Boolean).join(" ")}
    >
      {scope ? (
        <span className="dusk-picker-scope" aria-hidden>
          {scope}
        </span>
      ) : null}
      <div role="radiogroup" aria-label="Light" className="dusk-picker-row">
        <span className="dusk-picker-label" aria-hidden>
          Light
        </span>
        {INK_TONES.map((value) => {
          const { label, Icon } = TONE[value]
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={tone === value}
              aria-label={label}
              title={label}
              onClick={() => setTone(value)}
            >
              <Icon aria-hidden size={14} strokeWidth={2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
      <div role="radiogroup" aria-label="Style" className="dusk-picker-row">
        <span className="dusk-picker-label" aria-hidden>
          Style
        </span>
        {STYLES.map((value) => {
          const { label, Icon } = STYLE[value]
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={style === value}
              aria-label={label}
              title={label}
              onClick={() => setStyle(value)}
            >
              <Icon aria-hidden size={14} strokeWidth={2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
