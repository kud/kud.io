import styles from "@/app/page.module.css"

// A plain hash link: HashScroll (components/hash-scroll.tsx) turns it into a
// scroll, smooth or instant under reduced motion, through scrollIntoView, which
// also reaches home's scroll-snap container on phones, where a bare fragment
// jump would scroll the document (which doesn't move) and look dead.
export const ScrollHint = () => (
  <a className={styles.scrollHint} href="#experience">
    Experience
    <span className={styles.chevron} aria-hidden>
      ↓
    </span>
  </a>
)
