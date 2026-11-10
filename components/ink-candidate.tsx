// Preview only (app/ink-candidates.css): ?ink=1..4 picks a day-ink candidate
// for this tab and keeps it across navigation; ?ink=0 clears it. Runs before
// any themed wrapper is parsed, so their own scripts can read it.
export const INK_CANDIDATE_KEY = "kud.inkCandidate"

const SCRIPT = `try{var k=${JSON.stringify(
  INK_CANDIDATE_KEY,
)},q=new URLSearchParams(location.search).get("ink");if(q!==null){if(/^[1-4]$/.test(q))sessionStorage.setItem(k,q);else sessionStorage.removeItem(k)}var v=sessionStorage.getItem(k);if(v)document.documentElement.dataset.inkCandidate=v}catch(e){}`

// Candidate 4 is "dark everywhere": the themed scopes read this and paint
// their night palette whatever the stored choice.
export const forcesDark = (): boolean =>
  typeof document !== "undefined" &&
  document.documentElement.dataset.inkCandidate === "4"

export const InkCandidateScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: SCRIPT }}
  />
)
