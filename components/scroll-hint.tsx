import styles from "@/app/page.module.css"

type ScrollHintProps = {
  href?: string
  label?: string
}

// A plain hash link: HashScroll (components/hash-scroll.tsx) turns it into a
// scroll, smooth or instant under reduced motion, through scrollIntoView, which
// also reaches home's scroll-snap container on phones, where a bare fragment
// jump would scroll the document (which doesn't move) and look dead.
export const ScrollHint = ({
  href = "#experience",
  label = "Experience",
}: ScrollHintProps) => (
  <a className={styles.scrollHint} href={href}>
    {label}
    <span className={styles.chevron} aria-hidden>
      ↓
    </span>
  </a>
)
