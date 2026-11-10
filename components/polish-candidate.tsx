// Preview only (components/polish-banner.tsx): each query param picks a
// numbered candidate for this tab and keeps it across navigation; 0 clears it.
//   ?tiles=1..3    the app launcher tiles on /projects
//   ?avatar=1..3   the avatar's hover and tap effect (home and /projects)
//   ?filters=1..3  the filter rail on /projects
//   ?layout=1..3   the browse width on /projects at large screens
// Stamped on <html> as data-<name>-candidate before the page paints.
export const POLISH_CANDIDATE_KEY = "kud.polishCandidate"

export const POLISH_PARAMS = { tiles: 3, avatar: 3, filters: 3, layout: 3 }

const SCRIPT = `try{var p=${JSON.stringify(POLISH_PARAMS)},k=${JSON.stringify(
  POLISH_CANDIDATE_KEY,
)},q=new URLSearchParams(location.search),d=document.documentElement.dataset;Object.keys(p).forEach(function(n){var s=k+"."+n,v=q.get(n);if(v!==null){if(/^[1-9]$/.test(v)&&+v<=p[n])sessionStorage.setItem(s,v);else sessionStorage.removeItem(s)}v=sessionStorage.getItem(s);if(v)d[n+"Candidate"]=v})}catch(e){}`

export const PolishCandidateScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: SCRIPT }}
  />
)
