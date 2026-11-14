"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  COPY,
  LANG_NAME,
  LANGS,
  signupStateOf,
  type Lang,
  type SignupState,
} from "@/lib/newsletter/language"

// A plain form post, so it works before (and without) any script: the
// subscribe and confirm routes answer with a redirect back here carrying
// ?subscribed=check|1|0 (&reason=… on 0) and #signup, which lands on this
// section. A pending or confirmed reader sees only the message; after an
// error the form stays so they can try again. The hidden "website" field is a
// honeypot; a person never sees or fills it.
export const Signup = ({
  lang,
  styles,
}: {
  lang: Lang
  styles: Record<string, string>
}) => {
  const copy = COPY[lang]
  const [state, setState] = useState<SignupState | null>(null)

  useEffect(() => {
    // Read after hydration: the page is static, so the query is the browser's.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(signupStateOf(location.search))
  }, [])

  const done = state === "check" || state === "confirmed"

  return (
    <section
      id="signup"
      className={styles.signup}
      aria-labelledby="signup-title"
      data-signup-state={state ?? undefined}
    >
      <h2 id="signup-title" className={styles.signupTitle}>
        {copy.signupTitle}
      </h2>
      {state && (
        <p
          className={done ? styles.signupDone : styles.signupError}
          role={done ? "status" : "alert"}
        >
          {copy.signupState[state]}
        </p>
      )}
      {done ? null : (
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
          <p className={styles.signupConsent}>
            {copy.consent}{" "}
            <Link href="/privacy#newsletter" hrefLang="en-GB">
              {copy.privacy}
            </Link>
          </p>
          <button type="submit" className={styles.barPrimary}>
            {copy.subscribe}
          </button>
        </form>
      )}
    </section>
  )
}
