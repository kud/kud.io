"use client"

import { useEffect } from "react"

// Hands each infobox its own height as --box-h, so the sticky offset in
// product-record.module.css can let a card taller than the window scroll
// until its last row shows, then hold there.
export function InfoboxFit() {
  useEffect(() => {
    const boxes = document.querySelectorAll<HTMLElement>("[data-infobox]")
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.target as HTMLElement
        box.style.setProperty("--box-h", `${box.offsetHeight}px`)
      }
    })
    boxes.forEach((box) => observer.observe(box))
    return () => observer.disconnect()
  }, [])
  return null
}
