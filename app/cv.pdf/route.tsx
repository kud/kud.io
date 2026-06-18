import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import { experience, yearsOfExperience } from "@/lib/experience"

// Rendered once at build time (force-static) and served as a cached static
// asset from /cv.pdf. Reads the same experience data as the home timeline, so
// the CV can never drift from the site.
export const runtime = "nodejs"
export const dynamic = "force-static"

const ACCENT = "#c2703d"
const INK = "#1f1813"
const MUTED = "#6a6a74"
const FAINT = "#9a9aa3"
const RULE = "#e8e1d6"

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 44,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
    lineHeight: 1.5,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    letterSpacing: -0.5,
    color: INK,
  },
  title: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contact: {
    marginTop: 8,
    fontSize: 9,
    color: MUTED,
  },
  contactLink: {
    color: MUTED,
    textDecoration: "none",
  },
  profile: {
    marginTop: 14,
    fontSize: 10,
    color: "#574f47",
    lineHeight: 1.6,
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: INK,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  entry: {
    marginBottom: 16,
  },
  entryPeriod: {
    fontSize: 8.5,
    color: FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  entryRole: {
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: INK,
  },
  entryOrg: {
    marginTop: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#44444c",
  },
  entrySummary: {
    marginTop: 5,
    color: MUTED,
    lineHeight: 1.55,
  },
  bullet: {
    flexDirection: "row",
    marginTop: 4,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    color: ACCENT,
  },
  bulletText: {
    flex: 1,
    color: "#574f47",
    lineHeight: 1.5,
  },
  stack: {
    marginTop: 6,
    fontSize: 9,
    color: FAINT,
  },
  stackLabel: {
    fontFamily: "Helvetica-Bold",
    color: MUTED,
  },
})

const Contact = () => (
  <Text style={styles.contact}>
    London ·{" "}
    <Link style={styles.contactLink} src="https://kud.io">
      kud.io
    </Link>{" "}
    ·{" "}
    <Link style={styles.contactLink} src="mailto:m+site@kud.io">
      m+site@kud.io
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

const Cv = () => (
  <Document
    author="Erwann Mest"
    title="Erwann Mest — CV"
    subject="Senior Software Engineer & Tech Lead"
  >
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>Erwann Mest</Text>
      <Text style={styles.title}>Senior Software Engineer & Tech Lead</Text>
      <Contact />

      <Text style={styles.profile}>
        Senior engineer and tech lead with {yearsOfExperience()} years across
        product, design, and engineering. I think in systems and the people they
        serve — reducing cognitive load for users and engineers alike, and
        architecting solutions I then execute with deliberate, AI-assisted
        workflows.
      </Text>

      <Text style={styles.sectionLabel}>Experience</Text>

      {experience.map((item) => (
        <View
          key={`${item.org}-${item.period}`}
          style={styles.entry}
          wrap={false}
        >
          <Text style={styles.entryPeriod}>{item.period}</Text>
          <Text style={styles.entryRole}>{item.role}</Text>
          <Text style={styles.entryOrg}>
            {item.org}
            {item.team ? ` · ${item.team}` : ""} · {item.place}
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
                  <Text style={styles.stackLabel}>Stack: </Text>
                  {item.detail.stack.join(" · ")}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.entrySummary}>{item.note}</Text>
          )}
        </View>
      ))}
    </Page>
  </Document>
)

export const GET = async () => {
  const buffer = await renderToBuffer(<Cv />)
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="erwann-mest-cv.pdf"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  })
}
