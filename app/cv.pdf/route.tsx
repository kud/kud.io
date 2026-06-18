import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import { experience, yearsOfExperience } from "@/lib/experience"
import { focus, coreTech } from "@/lib/focus"

// Rendered once at build time (force-static) and served as a cached static
// asset from /cv.pdf. Reads the same experience + focus data as the site, so the
// CV can never drift. Designed — not just a PDF — to carry kud's identity: warm
// palette, the terracotta eyebrow-dot, focus pills, and the dotted experience
// timeline that echo kud.io. Page 1 = who I am + skills, page 2 = experience.
export const runtime = "nodejs"
export const dynamic = "force-static"

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
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 23,
    lineHeight: 1,
    letterSpacing: -0.5,
    color: INK,
  },
  contact: {
    marginTop: 7,
    fontSize: 8.5,
    color: MUTED,
  },
  contactLink: {
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
  techLine: {
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

const Contact = () => (
  <Text style={styles.contact}>
    London ·{" "}
    <Link style={styles.contactLink} src="https://kud.io">
      kud.io
    </Link>{" "}
    ·{" "}
    <Link style={styles.contactLink} src="mailto:m+job@kud.io">
      m+job@kud.io
    </Link>{" "}
    ·{" "}
    <Link style={styles.contactLink} src="https://linkedin.kud.io/">
      linkedin.kud.io
    </Link>{" "}
    ·{" "}
    <Link style={styles.contactLink} src="https://github.kud.io/">
      github.kud.io
    </Link>
  </Text>
)

const Cv = ({ avatar }: { avatar: string | null }) => (
  <Document
    author="Erwann Mest"
    title="Erwann Mest — CV"
    subject="Senior Software Engineer & Tech Lead"
  >
    {/* Page 1 — who I am + skills */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {avatar ? <Image src={avatar} style={styles.avatar} /> : null}
        <View style={styles.headerText}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>
              Senior Software Engineer & Tech Lead
            </Text>
          </View>
          <Text style={styles.name}>Erwann Mest</Text>
          <Contact />
        </View>
      </View>

      <View style={styles.rule} />

      <Text style={styles.intro}>
        Senior engineer and tech lead with {yearsOfExperience()} years across
        product, design, and engineering. I think in systems and the people they
        serve, reducing cognitive load for users and engineers alike, and
        architecting solutions I then execute with deliberate, AI-assisted
        workflows.
      </Text>

      <Text style={styles.sectionLabel}>Focus</Text>
      <View style={styles.pillRow}>
        {focus.map((item) => (
          <Text key={item.label} style={styles.pill}>
            {item.label}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Core tech</Text>
      <Text style={styles.techLine}>{coreTech.join(SEP)}</Text>

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
      "Content-Disposition": 'attachment; filename="erwann-mest-cv.pdf"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
