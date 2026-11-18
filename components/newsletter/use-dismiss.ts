"use client"

import { type RefObject, useEffect } from "react"

// A pointer press outside every given element closes an open panel: the
// calendar and the reading settings both float over the page, and a reader
// expects a tap beside them to put them away (Erwann, 2026-11-15). Pressing
// the panel's own toggle is inside, so the toggle keeps its own behaviour.
export const useDismiss = (
  open: boolean,
  close: () => void,
  inside: RefObject<HTMLElement | null>[],
) => {
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (inside.some((ref) => ref.current?.contains(target ?? null))) return
      close()
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
    // inside holds stable refs; close is read fresh on each open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}
