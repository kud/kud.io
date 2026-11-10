// Preview only (app/docs-motion.css): each query param picks a numbered
// candidate for this tab and keeps it across navigation; 0 clears it.
//   ?docs=1..3  the move between docs pages
// Stamped on <html> as data-<name>-candidate, before any themed wrapper is
// parsed, so their own scripts can read it.
export const INK_CANDIDATE_KEY = "kud.inkCandidate"

const PARAMS = { docs: 3 }

const SCRIPT = `try{var p=${JSON.stringify(PARAMS)},k=${JSON.stringify(
  INK_CANDIDATE_KEY,
)},q=new URLSearchParams(location.search),d=document.documentElement.dataset;Object.keys(p).forEach(function(n){var s=k+"."+n,v=q.get(n);if(v!==null){if(/^[1-9]$/.test(v)&&+v<=p[n])sessionStorage.setItem(s,v);else sessionStorage.removeItem(s)}v=sessionStorage.getItem(s);if(v)d[n+"Candidate"]=v})}catch(e){}`

export const InkCandidateScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: SCRIPT }}
  />
)
