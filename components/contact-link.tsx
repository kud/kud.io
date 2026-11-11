"use client"

import type { ComponentProps } from "react"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { openOnMessage } from "@/components/launcher/launcher"
import type { MessageDraft } from "@/components/launcher/message-form"

// A mailto link that opens the launcher straight on its message form, so
// writing to me happens in the same panel as everything else. The href stays
// the way in without JavaScript, and a modified click still hands off to the
// mail app.
export const ContactLink = ({
  topic = null,
  onClick,
  ...props
}: ComponentProps<"a"> & { topic?: MessageDraft["topic"] }) => {
  const { setOpenSearch } = useSearchContext()
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        openOnMessage(topic)
        setOpenSearch(true)
      }}
    />
  )
}
