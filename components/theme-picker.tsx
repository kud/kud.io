"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useScopedTheme } from "@/components/scoped-theme"

const OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "light", label: "Light", Icon: Sun },
] as const

// System, Dark or Light for the Dusk pages: the shared scoped theme, stamped
// on the data-ground="dusk" wrapper, never on <html>. The server renders
// System; the stored choice is marked once the client reads it.
export const ThemePicker = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useScopedTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={["dusk-picker", className].filter(Boolean).join(" ")}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
        >
          <Icon aria-hidden size={14} strokeWidth={2} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
