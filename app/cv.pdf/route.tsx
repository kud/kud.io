import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  Svg,
  Path,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import { experience, yearsOfExperience } from "@/lib/experience"
import { focus, coreTech } from "@/lib/focus"

// Rendered once at build time (force-static) and served as a cached static asset
// from /cv.pdf. Reads the same experience + focus data as the site, so the CV can
// never drift. Designed to carry kud's identity (warm palette, eyebrow-dot, focus
// pills, dotted timeline). Page 1 = who I am + skills, page 2 = experience.
export const runtime = "nodejs"
export const dynamic = "force-static"

// Disable word hyphenation — React-PDF otherwise breaks words like "Snowflake-"
// across lines, which reads as a typo.
Font.registerHyphenationCallback((word) => [word])

const AVATAR_URL =
  "https://www.gravatar.com/avatar/e6eaeaa6da69e804c27c2d4cd55107e0?s=256"

const BG = "#fdfbf8"
const ACCENT = "#c2703d"
const ACCENT_DEEP = "#a85f33"
const INK = "#1a1512"
const BODY = "#4a443d"
const MUTED = "#6f6a62"
const FAINT = "#9a958c"
const RULE = "#e7ddcf"
const PILL_BG = "#f6ece2"
const PILL_BORDER = "#e7d2bf"

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    paddingTop: 44,
    paddingBottom: 42,
    paddingHorizontal: 46,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: BODY,
  },

  // Header ------------------------------------------------------------------
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    marginRight: 18,
    border: `1.5pt solid ${RULE}`,
    objectFit: "cover",
  },
  headerText: {
    flex: 1,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginRight: 7,
  },
  eyebrowText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 6,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 23,
    lineHeight: 1,
    letterSpacing: -0.5,
    color: INK,
  },

  // Contact (icon + text per item) -----------------------------------------
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 13,
  },
  contactIcon: {
    marginRight: 4,
  },
  contactText: {
    fontSize: 8.5,
    color: MUTED,
    textDecoration: "none",
  },

  rule: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  intro: {
    marginTop: 14,
  },
  introPara: {
    fontSize: 10,
    lineHeight: 1.5,
    color: BODY,
  },

  // Section label -----------------------------------------------------------
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: ACCENT,
  },

  // Focus pills (page 1) ----------------------------------------------------
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pill: {
    marginRight: 6,
    marginBottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PILL_BORDER,
    backgroundColor: PILL_BG,
    fontSize: 9,
    color: ACCENT_DEEP,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  techItem: {
    fontSize: 10,
    lineHeight: 1.6,
    color: BODY,
  },

  // Experience timeline -----------------------------------------------------
  tlRow: {
    flexDirection: "row",
  },
  tlRail: {
    width: 13,
    borderLeftWidth: 1.5,
    borderLeftColor: RULE,
    position: "relative",
  },
  tlDot: {
    position: "absolute",
    left: -4,
    top: 2.5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  tlDotFilled: {
    backgroundColor: ACCENT,
  },
  tlDotNext: {
    borderColor: ACCENT,
    borderStyle: "dashed",
    backgroundColor: BG,
  },
  tlContent: {
    flex: 1,
    paddingLeft: 4,
    paddingBottom: 12,
  },
  entryHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  entryRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: INK,
  },
  entryPeriod: {
    fontSize: 8,
    letterSpacing: 0.4,
    color: FAINT,
  },
  entryOrg: {
    marginTop: 1,
    marginBottom: 4,
    fontSize: 9,
    color: MUTED,
  },
  entrySummary: {
    marginBottom: 4,
    fontSize: 9,
    lineHeight: 1.4,
    color: BODY,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 9,
    color: ACCENT,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.35,
    color: BODY,
  },
  stack: {
    marginTop: 4,
    fontSize: 8.5,
    color: FAINT,
  },
  stackLabel: {
    fontFamily: "Helvetica-Bold",
    color: MUTED,
  },
})

const SEP = "  ·  "

// Monochrome flat icons (24×24 paths) for the contact line.
const ICON_PATHS: Record<string, string> = {
  location:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  globe:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.08 16zm2.95-8H5.08a7.99 7.99 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
}

const ContactIcon = ({ name }: { name: string }) => (
  <Svg style={styles.contactIcon} width={8.5} height={8.5} viewBox="0 0 24 24">
    <Path d={ICON_PATHS[name]} fill={MUTED} />
  </Svg>
)

const CONTACTS = [
  { icon: "location", text: "London", href: null },
  { icon: "globe", text: "kud.io", href: "https://kud.io" },
  { icon: "mail", text: "m+job@kud.io", href: "mailto:m+job@kud.io" },
  {
    icon: "linkedin",
    text: "linkedin.kud.io",
    href: "https://linkedin.kud.io/",
  },
  { icon: "github", text: "github.kud.io", href: "https://github.kud.io/" },
]

const Contact = () => (
  <View style={styles.contactRow}>
    {CONTACTS.map(({ icon, text, href }) => (
      <View key={text} style={styles.contactItem}>
        <ContactIcon name={icon} />
        {href ? (
          <Link style={styles.contactText} src={href}>
            {text}
          </Link>
        ) : (
          <Text style={styles.contactText}>{text}</Text>
        )}
      </View>
    ))}
  </View>
)

const Cv = ({ avatar }: { avatar: string | null }) => (
  <Document
    author="Erwann Mest"
    title="Erwann Mest — CV"
    subject="Systems Designer & Lead Software Engineer"
  >
    {/* Page 1 — who I am + skills */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {avatar ? <Image src={avatar} style={styles.avatar} /> : null}
        <View style={styles.headerText}>
          <Text style={styles.eyebrowText}>
            Systems Designer & Lead Software Engineer
          </Text>
          <Text style={styles.name}>Erwann Mest</Text>
          <Contact />
        </View>
      </View>

      <View style={styles.rule} />

      <View style={styles.intro}>
        <Text style={[styles.introPara, { marginBottom: 8 }]}>
          Systems designer and lead software engineer with {yearsOfExperience()}{" "}
          years across product, design, and engineering. I think beyond tickets
          and lines of code: in systems, workflows, and the people they serve.
          To me, software engineering, technical leadership, and systems design
          are one job, understanding how a complex system really works and
          making it simpler and more humane.
        </Text>
        <Text style={styles.introPara}>
          Most of what I do comes down to one question: how can we help people
          do their best work? I like architecting a solution and handing its
          execution to AI in a deliberate, fine-tuned way, turning experience
          into systems, skills, and agents that get sharper the more I use them.
          The best systems aren&apos;t the cleverest ones; they&apos;re the ones
          that leave people with clarity, autonomy, and trust.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Focus</Text>
      <View style={styles.pillRow}>
        {focus.map((item) => (
          <Text key={item.label} style={styles.pill}>
            {item.label}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Core tech</Text>
      <View style={styles.techRow}>
        {coreTech.map((tech, index) => (
          <Text key={tech} style={styles.techItem}>
            {tech}
            {index < coreTech.length - 1 ? SEP : ""}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Experience</Text>

      {/* A forward-looking "open role" at the top of the timeline — a dashed dot
          marks it as the next, not-yet-written entry. */}
      <View style={styles.tlRow} wrap={false}>
        <View style={styles.tlRail}>
          <View style={[styles.tlDot, styles.tlDotNext]} />
        </View>
        <View style={styles.tlContent}>
          <View style={styles.entryHead}>
            <Text style={styles.entryRole}>Open to opportunities</Text>
            <Text style={styles.entryPeriod}>Next</Text>
          </View>
          <Text style={styles.entryOrg}>Your company?</Text>
          <Text style={styles.entrySummary}>
            Exploring the right next role in systems, developer experience, and
            AI-assisted engineering. It could be with you.
          </Text>
        </View>
      </View>

      {experience.map((item, index) => (
        <View
          key={`${item.org}-${item.period}`}
          style={styles.tlRow}
          wrap={false}
        >
          <View style={styles.tlRail}>
            <View
              style={
                index === 0 ? [styles.tlDot, styles.tlDotFilled] : styles.tlDot
              }
            />
          </View>
          <View style={styles.tlContent}>
            <View style={styles.entryHead}>
              <Text style={styles.entryRole}>{item.role}</Text>
              <Text style={styles.entryPeriod}>{item.period}</Text>
            </View>
            <Text style={styles.entryOrg}>
              {item.org}
              {item.team ? `${SEP}${item.team}` : ""}
              {SEP}
              {item.place}
            </Text>

            {item.detail ? (
              <>
                <Text style={styles.entrySummary}>{item.detail.summary}</Text>
                {item.detail.highlights.map((highlight) => (
                  <View key={highlight} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{highlight}</Text>
                  </View>
                ))}
                {item.detail.stack.length > 0 ? (
                  <Text style={styles.stack}>
                    <Text style={styles.stackLabel}>Stack </Text>
                    {item.detail.stack.join("  ·  ")}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.entrySummary}>{item.note}</Text>
            )}
          </View>
        </View>
      ))}
    </Page>
  </Document>
)

const loadAvatar = async (): Promise<string | null> => {
  try {
    const response = await fetch(AVATAR_URL)
    if (!response.ok) return null
    const type = response.headers.get("content-type") ?? "image/png"
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64")
    return `data:${type};base64,${base64}`
  } catch {
    return null
  }
}

export const GET = async () => {
  const avatar = await loadAvatar()
  const buffer = await renderToBuffer(<Cv avatar={avatar} />)
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="erwann-mest-systems-designer-cv.pdf"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
