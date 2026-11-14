"use client"

import { useEffect, useState } from "react"
import { COPY, LANG_NAME, LANGS, type Lang } from "@/lib/newsletter/language"

// A plain form post, so it works before (and without) any script: the
// endpoint answers with a redirect back here carrying ?subscribed=1. The
// hidden "website" field is a honeypot; a person never sees or fills it.
export const Signup = ({
  lang,
  styles,
}: {
  lang: Lang
  styles: Record<string, string>
}) => {
  const copy = COPY[lang]
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // Read after hydration: the page is static, so the query is the browser's.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubscribed(
      new URLSearchParams(location.search).get("subscribed") === "1",
    )
  }, [])

  return (
    <section className={styles.signup} aria-labelledby="signup-title">
      <h2 id="signup-title" className={styles.signupTitle}>
        {copy.signupTitle}
      </h2>
      {subscribed ? (
        <p className={styles.signupDone} role="status">
          {copy.subscribed}
        </p>
      ) : (
        <form
          method="post"
          action="/api/newsletter/subscribe"
          className={styles.signupForm}
        >
          <p className={styles.signupBody}>{copy.signupBody}</p>
          <label className={styles.signupField}>
            <span>{copy.email}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
            />
          </label>
          <fieldset className={styles.signupLangs}>
            <legend>{copy.language}</legend>
            {LANGS.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="lang"
                  value={option}
                  defaultChecked={option === lang}
                />
                <span lang={option === "fr" ? "fr" : "en-GB"}>
                  {LANG_NAME[option]}
                </span>
              </label>
            ))}
          </fieldset>
          <div className={styles.honeypot} aria-hidden>
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <p className={styles.signupConsent}>{copy.consent}</p>
          <button type="submit" className={styles.barPrimary}>
            {copy.subscribe}
          </button>
        </form>
      )}
    </section>
  )
}
