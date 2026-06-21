import { getContributions } from "@/lib/contributions"
import styles from "./contributions.module.css"

// "Contributions" — work I've upstreamed beyond my own projects, at the end of
// /projects. Raycast extensions I contribute to render store-style (icon,
// downloads, commands, Install); external repos show a live merged-PR count.
export const Contributions = async () => {
  const items = await getContributions()
  if (items.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.dot} />
        Contributions
        <span className={styles.count}>{items.length}</span>
      </h2>
      <p className={styles.blurb}>
        Open source I&apos;ve helped build beyond my own projects — Raycast
        extensions I co-maintain, and patches merged into tools I rely on.
      </p>
      <div className={styles.list}>
        {items.map((item) =>
          item.kind === "raycast" ? (
            <div key={`ray-${item.storeUrl}`} className={styles.row}>
              {item.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.icon}
                  src={item.icon}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className={styles.icon} aria-hidden />
              )}
              <span className={styles.body}>
                <a
                  className={styles.name}
                  href={item.storeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.title}
                </a>
                {item.description ? (
                  <span className={styles.note}>{item.description}</span>
                ) : null}
              </span>
              <span className={styles.meta}>
                <span className={styles.metric} title="Downloads">
                  ↓ {item.downloads.toLocaleString()}
                </span>
                <span className={styles.metric} title="Commands">
                  ⌘ {item.commands}
                </span>
              </span>
              <a className={styles.action} href={item.installUrl}>
                Install
              </a>
            </div>
          ) : (
            <div key={`repo-${item.repo}`} className={styles.row}>
              {item.ownerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.icon}
                  src={item.ownerAvatar}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className={styles.icon} aria-hidden />
              )}
              <span className={styles.body}>
                <a
                  className={styles.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
                <span className={styles.repo}>{item.repo}</span>
                {item.note ? (
                  <span className={styles.note}>{item.note}</span>
                ) : null}
              </span>
              <span className={styles.meta}>
                {item.mergedPrs > 0 ? (
                  <span className={styles.prs}>
                    {item.mergedPrs} merged PR{item.mergedPrs === 1 ? "" : "s"}
                  </span>
                ) : null}
                {item.stars > 0 ? (
                  <span className={styles.metric}>
                    ★ {item.stars.toLocaleString()}
                  </span>
                ) : null}
              </span>
              <a
                className={styles.action}
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                View ↗
              </a>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
