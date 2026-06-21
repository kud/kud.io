// App-like categories share the rich AppLanding template and launcher-tile grid:
// `app` is deployed web apps/PWAs, `desktop` is native desktop apps (e.g. Tauri).
// Kept in its own dependency-free module so the client ProjectList can import it
// without pulling server-only code from lib/projects.
export const APP_CATEGORIES = new Set(["app", "desktop"])

export const isAppCategory = (category: string): boolean =>
  APP_CATEGORIES.has(category)
