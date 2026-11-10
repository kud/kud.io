import styles from "./rail-toc.module.css"

export type TocItem = { url: string; title: React.ReactNode }

// "On this page", under the infobox in a project's right rail. Hidden once the
// rail stacks above the story, where it would only push the reading down.
export const RailToc = ({ items }: { items: TocItem[] }) =>
  items.length > 1 ? (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.title}>On this page</p>
      <ul>
        {items.map((item) => (
          <li key={item.url}>
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  ) : null
