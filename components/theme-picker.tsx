"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

const OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "light", label: "Light", Icon: Sun },
] as const

const noop = () => () => {}

// System, Dark or Light for the Dusk pages, through next-themes. Nothing is
// marked until mounted: the stored choice is only known on the client.
export const ThemePicker = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={["dusk-picker", className].filter(Boolean).join(" ")}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const checked = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
          >
            <Icon aria-hidden size={14} strokeWidth={2} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
