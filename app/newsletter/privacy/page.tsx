import type { Metadata } from "next"
import { InkLink as Link } from "@/components/ink-link"
import styles from "../newsletter.module.css"

// What signing up keeps, in plain words. The newsletter is the only thing on
// kud.io that asks a reader for anything, so the note lives beside it rather
// than as a site-wide policy page. British English only: it describes the
// site, not an edition. Keep it true to lib/newsletter/notify/: if what is
// sent to the provider changes, this page changes with it.

const TITLE = "Newsletter privacy"
const DESCRIPTION =
  "What signing up for the kud.io newsletter keeps, where it is kept, and how to leave."

export const metadata: Metadata = {
  title: `${TITLE} — kud.io`,
  description: DESCRIPTION,
  alternates: { canonical: "/newsletter/privacy" },
  openGraph: {
    type: "website",
    url: "https://kud.io/newsletter/privacy",
    siteName: "kud.io",
    locale: "en_GB",
    title: `${TITLE} — kud.io`,
    description: DESCRIPTION,
  },
}

export const dynamic = "force-static"

const Page = () => (
  <article className={styles.note} lang="en-GB">
    <p className={styles.kicker}>Newsletter</p>
    <h1 className={styles.title}>Privacy</h1>
    <p className={styles.lede}>
      The newsletter is the one place on kud.io that asks you for anything.
      Here is what it keeps, and how to take it back.
    </p>

    <h2 id="newsletter">What signing up keeps</h2>
    <p>
      Two things: your email address and the language you chose, French or
      English. No name, no other details. They are kept by{" "}
      <a href="https://resend.com/legal/privacy-policy">Resend</a>, the email
      service that sends the newsletter, and by nothing on this site.
    </p>

    <h2>Nothing until you confirm</h2>
    <p>
      Signing up sends you one email with a confirmation link, signed and
      valid for a limited time. Your address joins the list only when you
      open that link. If you never do, you are not subscribed and nothing
      more is sent.
    </p>

    <h2>Leaving</h2>
    <p>
      Every email carries an unsubscribe link. One click takes you off the
      list, and no further edition is sent to you.
    </p>

    <h2>No tracking from the site</h2>
    <p>
      The newsletter pages add no analytics and no tracking cookies. The only
      things they remember sit in your own browser: the language you read in,
      so the right edition opens next time, and your reading preferences
      (typeface, size, width).
    </p>

    <p>
      <Link href="/newsletter">Back to the newsletter</Link>
    </p>
  </article>
)

export default Page
