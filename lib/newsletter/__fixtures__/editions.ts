// The invented editions the pages are developed and tested against, written as
// Notion block trees: the same input the publication sync reads. `generate.ts`
// runs them through the real parser and derive step to produce content/, and
// fixtures.test.ts fails if the committed files drift from what the pipeline
// writes, so the pages can never be built against a shape the pipeline does
// not produce. Every place, person, figure and host here is fictional.

import { h1, h2, h3, li, p, t } from "../fixtures.ts"
import type { NotionBlock, RichTextNode } from "../parse.ts"

type Lang = "fr" | "en"
type Rich = RichTextNode | string

const b = (text: string): RichTextNode => ({ ...t(text), annotations: { bold: true } })

const sources = (lang: Lang, list: Array<[string, string, string]>) => [
  p(lang === "fr" ? "Sources :" : "Sources:"),
  ...list.map(([url, fr, en]) => li([t(lang === "fr" ? fr : en, url)])),
]

const item = (lang: Lang, heading: [string, string], body: Array<NotionBlock>, list: Array<[string, string, string]> = []) => [
  h3(heading[lang === "fr" ? 0 : 1]),
  ...body,
  ...(list.length ? sources(lang, list) : []),
]

const pick = <T,>(lang: Lang, fr: T, en: T) => (lang === "fr" ? fr : en)
const para = (lang: Lang, fr: Rich[] | string, en: Rich[] | string) => {
  const value = pick(lang, fr, en)
  return p(...(typeof value === "string" ? [value] : value))
}

const REPORT: [string, string, string] = ["https://example.org/port-lune/rapport-regie-2025", "Rapport annuel de la régie (fictif)", "Utility annual report (fictional)"]
const OPEN_DATA: [string, string, string] = ["https://data.example.org/port-lune/eau", "Données publiques de Port-Lune (fictives)", "Port-Lune open data (fictional)"]
const RESOLUTION: [string, string, string] = ["https://example.org/valmoreau/deliberation-2026-118", "Délibération du conseil (fictive)", "Council resolution (fictional)"]
const COURIER: [string, string, string] = ["https://news.example.com/valmoreau-port", "Le Courrier d’Exemple", "The Example Courier"]
const ACCORD: [string, string, string] = ["https://example.net/kestrel-accord.pdf", "Texte de l’accord (fictif)", "Text of the accord (fictional)"]
const AGENCY: [string, string, string] = ["https://press.example.org/kestrel", "Agence Exemple", "Example Agency"]
const COURT: [string, string, string] = ["https://courts.example.org/aubrac-nord/2026/341", "Ordonnance de la cour (fictive)", "Court order (fictional)"]
const COMET: [string, string, string] = ["https://observatory.example.net/circulars/2026-77", "Circulaire de l’observatoire (fictive)", "Observatory circular (fictional)"]
const ATLAS: [string, string, string] = ["https://lighthouses.example.com/", "Atlas des phares (exemple)", "Lighthouse atlas (example)"]
const LIBRARY = "https://example.org/saint-exemple/bibliotheque"

const rendition13 = (lang: Lang): NotionBlock[] => [
  para(
    lang,
    "Ce soir, on revient sur la facture d’eau de Port-Lune, une ville imaginaire où elle a pris un tiers en deux ans, et sur ce qu’elle dit du coût des réseaux qui vieillissent. Après le tour de l’actualité, inventée de bout en bout pour cette maquette, on vous explique ce qu’est une clause de révision. Et une trouvaille qui mérite un clic.",
    "Tonight, we look at the water bill in Port-Lune, an imaginary city where it has risen by a third in two years, and at what it says about the cost of ageing networks. After the round-up of the news, invented from start to finish for this mock-up, we explain what a review clause is. And one find worth a click.",
  ),
  h2(pick(lang, "Le sujet du jour", "Today’s focus")),
  ...item(lang, ["01 · Pourquoi l’eau coûte plus cher à Port-Lune", "01 · Why water costs more in Port-Lune"], [
    para(lang,
      "Dans la ville imaginaire de Port-Lune, la facture d’eau a augmenté d’un tiers en deux ans, selon le rapport annuel de la régie, l’établissement public qui gère le réseau. Trois causes se superposent : des canalisations posées il y a soixante ans, une nappe qui recule et un emprunt à taux variable.",
      "In the imaginary city of Port-Lune, the water bill has risen by a third in two years, according to the annual report of the utility, the public body that runs the network. Three causes overlap: pipes laid sixty years ago, a falling water table and a variable-rate loan."),
    p(b(pick(lang, "Le concept", "The idea"))),
    para(lang,
      "Une régie facture l’eau à son coût : quand les fuites augmentent, il faut produire davantage pour livrer autant, et c’est l’abonné qui paie la différence.",
      "A public utility charges for water at cost: when leaks grow, it has to produce more to deliver the same amount, and the customer pays the difference."),
    p(b(pick(lang, "Les dates clés", "Key dates"))),
    li([b("1966"), pick(lang, " — Le réseau est posé. La ville pose l’essentiel de ses canalisations en fonte, prévues pour cinquante ans.", " — The network goes in. The city lays most of its cast-iron pipes, designed to last fifty years.")]),
    li([b("2019"), pick(lang, " — L’emprunt. La régie emprunte à taux variable pour rénover l’usine de traitement.", " — The loan. The utility borrows at a variable rate to rebuild its treatment works.")]),
    li([b("2024"), pick(lang, " — Première hausse. Le prix du mètre cube augmente de 14 %, la première hausse depuis dix ans.", " — The first rise. The price per cubic metre goes up 14%, the first increase in ten years.")]),
    p(b(pick(lang, "Le saviez-vous ?", "Did you know?"))),
    para(lang,
      "Selon les données publiques de la ville, 28 % de l’eau produite n’arrive jamais au robinet.",
      "According to the city’s open data, 28% of the water produced never reaches a tap."),
    p(b(pick(lang, "Pour aller plus loin", "Further reading"))),
    para(lang,
      "Le conseil votera en janvier entre étaler les travaux et une nouvelle hausse.",
      "The council votes in January on spreading the works out or raising prices again."),
  ], [REPORT, OPEN_DATA]),
  h2(pick(lang, "L’essentiel", "The essentials")),
  ...item(lang, ["02 · VALMOREAU · Le port fermé aux voitures", "02 · VALMOREAU · A harbour closed to cars"], [
    para(lang,
      "Le conseil municipal de la ville fictive de Valmoreau a voté jeudi, par 17 voix contre 14, la piétonnisation complète de son port à partir du 1er avril. La mesure remplace 300 places de stationnement par un marché couvert et une piste cyclable. « Le port redevient un lieu où l’on s’arrête », a réagi la maire, tandis que l’association des commerçants dit craindre pour les livraisons du matin, rapporte Le Courrier d’Exemple.",
      "Valmoreau’s town council, in a fictional town, voted 17 to 14 on Thursday to pedestrianise its whole harbour from 1 April. The measure swaps 300 parking spaces for a covered market and a cycle lane. “The harbour becomes a place you stop again,” the mayor said, while the traders’ association fears for morning deliveries, The Example Courier reports."),
  ], [RESOLUTION, COURIER]),
  ...item(lang, ["03 · PÊCHE · Accord dans le détroit de Kestrel", "03 · FISHERIES · An accord in the Kestrel Strait"], [
    para(lang,
      "Deux États imaginaires riverains du détroit de Kestrel ont signé mercredi un accord qui plafonne les prises de hareng à 40 000 tonnes par an pendant cinq ans et crée une autorité commune de contrôle. Le texte prévoit une clause de révision si les stocks se reconstituent plus vite que prévu.",
      "Two imaginary states on the Kestrel Strait signed an accord on Wednesday capping herring catches at 40,000 tonnes a year for five years and creating a joint inspection authority. The text includes a review clause should stocks recover faster than expected."),
  ], [ACCORD, AGENCY]),
  ...item(lang, ["04 · JUSTICE · Une taxe sur les livres suspendue", "04 · COURTS · A tax on books suspended"], [
    para(lang,
      "La cour administrative de la province inventée d’Aubrac-Nord a suspendu mardi une taxe de 4 % sur les livres neufs, estimant qu’elle n’avait pas été débattue par l’assemblée provinciale, l’organe qui vote le budget local.",
      "The administrative court of the invented province of North Aubrac on Tuesday suspended a 4% tax on new books, ruling it had not been debated by the provincial assembly, the body that votes the local budget."),
  ], [COURT]),
  h2(pick(lang, "C’est quoi ?", "Explainer")),
  ...item(lang, ["05 · C’est quoi, une clause de révision ?", "05 · What is a review clause?"], [
    para(lang, [b("Pourquoi on en parle."), " L’accord de pêche du détroit de Kestrel en contient une."], [b("Why it’s in the news."), " The Kestrel Strait fisheries accord contains one."]),
    para(lang,
      [b("En quoi ça consiste."), " C’est une disposition qui permet de rouvrir un accord avant son terme si une condition fixée à l’avance est remplie, ici la reconstitution des stocks de hareng."],
      [b("What it is."), " A provision that lets the parties reopen an agreement before it expires if a condition set in advance is met, here the recovery of herring stocks."]),
  ], [ACCORD]),
  h2(pick(lang, "Analyse", "Analysis")),
  para(lang,
    ["Port-Lune et Valmoreau tranchent la même question sous deux formes : qui paie l’entretien de ce qui existe déjà. La ", t("régie", REPORT[0]), " répercute ses fuites sur l’abonné ; Valmoreau, elle, choisit de ", t("retirer des places", RESOLUTION[0]), " plutôt que d’agrandir le port."],
    ["Port-Lune and Valmoreau settle the same question in two shapes: who pays to maintain what already exists. The ", t("utility", REPORT[0]), " passes its leaks on to the customer; Valmoreau chooses to ", t("remove spaces", RESOLUTION[0]), " rather than enlarge the harbour."]),
  para(lang,
    ["La suite dépend des calendriers : le vote de janvier à Port-Lune, et la ", t("clause de révision", ACCORD[0]), " de Kestrel, qui montre qu’un accord peut prévoir sa propre remise en cause."],
    ["What follows depends on timetables: Port-Lune’s January vote, and Kestrel’s ", t("review clause", ACCORD[0]), ", which shows an agreement can plan for its own reopening."]),
  h2(pick(lang, "Technologie & science", "Technology & science")),
  ...item(lang, ["06 · ESPACE · Une comète inventée frôlera la Terre", "06 · SPACE · An invented comet will pass close to Earth"], [
    para(lang,
      "Un observatoire fictif annonce le passage de la comète C/2026 X9 à 0,3 unité astronomique de la Terre, soit environ 45 millions de kilomètres, le 9 février. Elle devrait être visible à la jumelle.",
      "A fictional observatory says comet C/2026 X9 will pass 0.3 astronomical units from Earth, about 45 million kilometres, on 9 February. It should be visible through binoculars."),
  ], [COMET]),
  h2(pick(lang, "Chronologie", "Timeline")),
  li([pick(lang, "2026-11-11 — Signature de l’", "2026-11-11 — The "), t(pick(lang, "accord de Kestrel", "Kestrel accord"), ACCORD[0]), pick(lang, ".", " is signed.")]),
  li([pick(lang, "2026-11-12 — Vote du ", "2026-11-12 — Valmoreau’s "), t(pick(lang, "conseil de Valmoreau", "council votes"), RESOLUTION[0]), "."]),
  h2(pick(lang, "En bref", "In brief")),
  li([t(pick(lang, "La bibliothèque imaginaire de Saint-Exemple ouvrira désormais le dimanche après-midi.", "The imaginary library of Saint-Exemple will now open on Sunday afternoons."), LIBRARY)]),
  h2(pick(lang, "Ça vaut un clic", "Worth a click")),
  ...item(lang, ["07 · Des phares qui n’ont jamais brillé", "07 · Lighthouses that never shone"], [
    para(lang,
      "Un site d’exemple recense cent phares qui n’ont jamais existé. Chacun a sa carte marine, son rythme de feu et une courte histoire de gardien. On s’y perd volontiers, une côte imaginaire après l’autre.",
      "An example site catalogues a hundred lighthouses that never existed. Each has its chart, its light rhythm and a short keeper’s tale. It is easy to lose an evening there, one imaginary coast after another."),
  ], [ATLAS]),
  h2(pick(lang, "À surveiller", "Watch next")),
  ...item(lang, ["08 · Le budget de l’eau à Port-Lune", "08 · Port-Lune’s water budget"], [
    para(lang,
      "Le conseil de Port-Lune doit publier vendredi l’ordre du jour de sa séance de janvier.",
      "Port-Lune’s council is due to publish the agenda for its January session on Friday."),
  ]),
  h2(pick(lang, "Pour finir", "To close")),
  para(lang, "Bonne soirée, et à demain pour une nouvelle édition.", "Have a good evening, and see you tomorrow for the next edition."),
]

const STRIKE: [string, string, string] = ["https://news.example.com/ile-brune-greve", "Le Courrier d’Exemple", "The Example Courier"]
const SENSORS: [string, string, string] = ["https://research.example.org/orme-sensors", "Note de recherche (fictive)", "Research note (fictional)"]
const CLOUDS: [string, string, string] = ["https://clouds.example.net/glossary", "Glossaire des nuages (exemple)", "Cloud glossary (example)"]

const rendition12 = (lang: Lang): NotionBlock[] => [
  para(lang,
    "Ce soir, une grève fictive sur les traversiers de l’île Brune et une rivière inventée qui gagne quarante capteurs. Et une trouvaille pour regarder le ciel autrement.",
    "Tonight, a fictional ferry strike on Isle Brune and an invented river gaining forty sensors. And one find to look at the sky differently."),
  h2(pick(lang, "L’essentiel", "The essentials")),
  ...item(lang, ["01 · TRANSPORTS · Grève des traversiers de l’île Brune", "01 · TRANSPORT · Isle Brune ferry strike"], [
    para(lang,
      "Les équipages des traversiers de l’île imaginaire de Brune cessent le travail pour 48 heures à partir de vendredi, réclamant des rotations plus courtes, rapporte Le Courrier d’Exemple.",
      "Ferry crews serving the imaginary Isle Brune stop work for 48 hours from Friday, asking for shorter rotations, The Example Courier reports."),
  ], [STRIKE]),
  h2(pick(lang, "Technologie & science", "Technology & science")),
  ...item(lang, ["02 · ENVIRONNEMENT · Quarante capteurs pour l’Orme", "02 · ENVIRONMENT · Forty sensors for the Orme"], [
    para(lang,
      "Des chercheurs fictifs déploient quarante capteurs le long de la rivière Orme pour mesurer sa température heure par heure.",
      "Fictional researchers are deploying forty sensors along the River Orme to log its temperature every hour."),
  ], [SENSORS]),
  h2(pick(lang, "Ça vaut un clic", "Worth a click")),
  ...item(lang, ["03 · Les nuages ont des noms", "03 · Clouds have names"], [
    para(lang,
      "Une page d’exemple qui présente chaque genre de nuage en une phrase et une photo. De quoi briller à la prochaine averse.",
      "An example page that introduces each cloud genus in a sentence and a photo. Handy for the next downpour."),
  ], [CLOUDS]),
]

const blocks = (rendition: (lang: Lang) => NotionBlock[]) => [
  h1("🇫🇷 Français"),
  ...rendition("fr"),
  h1("🇬🇧 English"),
  ...rendition("en"),
]

export const FIXTURE_EDITIONS = [
  {
    date: "2026-11-12",
    generatedAt: "2026-11-12T17:40:00.000Z",
    publishedAt: "2026-11-12T18:05:00.000Z",
    blocks: blocks(rendition12),
  },
  {
    date: "2026-11-13",
    generatedAt: "2026-11-13T17:40:00.000Z",
    publishedAt: "2026-11-13T18:05:00.000Z",
    blocks: blocks(rendition13),
  },
]
