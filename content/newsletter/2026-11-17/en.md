---
title: "Newsletter · 17 November 2026"
date: "2026-11-17"
lang: "en"
lede: "Tonight, we take apart the attack that on Monday turned the websites of the BBC, Zoom and IKEA into malware dispensers, without those companies touching their own code. Then France’s civil-service strike, rising tension at COP31 and a French regulator fining poorly protected local councils, before we explain what a carbon budget is. On the technical side, PostgreSQL, Node.js, C++26 and some deep-sea fish; and seven finds, from the history of equality to San Francisco’s buses."
generatedAt: "2026-11-17T18:46:00.000+00:00"
readingMinutes: 14
wordCount: 2865
---

Tonight, we take apart the attack that on Monday turned the websites of the BBC, Zoom and IKEA into malware dispensers, without those companies touching their own code. Then France’s civil-service strike, rising tension at COP31 and a French regulator fining poorly protected local councils, before we explain what a carbon budget is. On the technical side, PostgreSQL, Node.js, C++26 and some deep-sea fish; and seven finds, from the history of equality to San Francisco’s buses.

## Today’s focus

### 01 · SECURITY · OPTIMJACK: when a third-party script betrays 178 websites {#item-01}

On Monday 16 November, some of the most visited sites on the web served malicious code to their visitors. Security researcher Scott Helme of Report URI found it in 188 of the 1,611 Optimizely code snippets he examined, at no fewer than 178 organisations: the BBC, CNN, Zoom, IKEA, Salesforce, GitLab, HSBC and Air France-KLM among them. Optimizely sells A/B testing software, which shows different versions of a page to different visitors to measure which works best. Report URI examined only some customers, so the real number of affected sites is probably higher.

**The idea**

To run its experiments, a site embeds a script hosted by Optimizely. That script runs in the page with the same powers as the site’s own code: it can read what you type, change what you see and send data elsewhere. Optimizely also offers a “Project JavaScript” field, where each customer adds code of their own that runs on every page. That is where the attacker wrote. The file was then served normally from Optimizely’s content delivery network (CDN), with its certificate: the CDN was not hacked, it “served exactly what it was given”, as the security firm StepSecurity puts it. According to Optimizely, quoted by The Register, “an unauthorized party exploited a vulnerability”; a spokesperson placed the flaw in the sign-up process. The company says it has fixed it and removed the injected code, but it has not explained how the attacker could write to unrelated customers’ projects.

The code was changed 26 times during the day, according to Report URI. It swapped cryptocurrency wallet addresses for the attacker’s own, including on the clipboard; from 13.43 UTC it also captured card numbers typed into the sites’ own forms. Finally, it tried to load exploit kits aimed at iPhones and iPads running older versions of iOS. Card fields displayed inside a payment provider’s separate frame (a cross-origin iframe) were out of reach, StepSecurity notes. By Monday evening Report URI had traced roughly $7,000 in cryptocurrency to the attacker’s wallets; how many cards and devices were affected is unknown.

**Key dates**

- **16 November, 04.21 UTC** · First injection seen, in the BBC’s script.
- **16 November, 13.43 UTC** · The card skimmer is added.
- **16 November, 21.52 UTC** · Only one snippet, TalkTalk’s, is still infected.
- **17 November** · The domain serving the malicious code is suspended by its registry.

**Did you know?**

A defence existed. A Content Security Policy (CSP) is a list a site gives the browser saying where scripts may load from and where they may send data. Among the affected organisations whose CSP Report URI analysed, 24 blocked the malicious code thanks to a restrictive list of allowed origins; policies that allowed `eval` or used `strict-dynamic` let it through. The problem is structural: a modern website hands part of its code to suppliers, and neither code review nor repository scanning can see what is hosted elsewhere, StepSecurity observes.

**Further reading**

Report URI’s minute-by-minute account, with advice for Optimizely customers and for visitors: update iOS, check a wallet address before sending anything, keep an eye on card statements.

Sources:

- [Report URI](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/)
- [StepSecurity](https://www.stepsecurity.io/blog/optimjack-optimizely-hosted-scripts-crypto-clipper-card-skimmer)
- [The Register](https://www.theregister.com/cyber-crime/2026/11/17/optimizely-hack-turns-worlds-biggest-websites-into-malware-dispensers/5310448)

## The essentials

### 02 · FRANCE · Civil-service strike: fewer strikers, a battle over numbers {#item-02}

On Tuesday 17 November, the day of strikes and marches called by France’s public-sector unions, joined by school and university student groups and private-sector workers, drew 146,000 people across France according to the Interior Ministry, 28,000 of them in Paris according to the police. The CGT union claims more than 500,000, including 175,000 in Paris. The gap is striking in Marseille: 4,900 according to the prefecture, 80,000 according to the CGT. Strike rates, partial estimates from the ministry for public action and accounts, are down: 2.59% in the state civil service against nearly 10% on 5 November, 1.96% in local government against 4.60%, and 3.93% in hospitals, the same as on 5 November. In schools, the education ministry counts 3.76% of teachers on strike; the Snes-FSU union says 20% at 10.30am. The heart of the dispute: when the Smic (France’s minimum wage) rises on 1 December, about 1.1 million public employees would see their base pay fall below it, and some 660,000 would remain paid below the Smic, topped up by an allowance that does not count towards their pension, according to AFP as reported by Sud Radio. Unions consider the measures announced on Friday 13 November by Prime Minister Sébastien Lecornu inadequate. “Only an answer to our demands will stop the mobilisation,” warned Sophie Binet, the CGT’s general secretary.

Sources:

- [ICI](https://www.ici.fr/infos/economie-social/direct-mobilisation-du-17-novembre-suivez-la-nouvelle-journee-de-greve-et-de-manifestations-3379678)
- [Sud Radio · AFP](https://www.sudradio.fr/societe/fonctionnaires-jeunesse-salaries-du-prive-une-colere-qui-converge-malgre-des-corteges-moins-fournis)

### 03 · CLIMATE · COP31: the EU wants the draft deal rewritten {#item-03}

A day after the first draft “cover decision” of COP31, the UN climate conference in Antalya, Türkiye, was published, positions hardened on Tuesday 17 November. Wopke Hoekstra, who negotiates for the European Union, said the text has “many of the characteristics of a shopping list” and that it “does not go in the right direction and needs significant change”, AFP reports. According to Reuters, the 18-page draft offers two options on fossil fuels: the 2023 wording on “transitioning away” from them, or a stronger reference to phasing them out; either could be dropped from the final text. It also calls for wealthy countries to reach net zero by 2030, a goal some consider unrealistic. Another front has opened over the timetable of the IPCC (the UN’s Intergovernmental Panel on Climate Change): dozens of European, African and Pacific countries want its next reports out before the 2028 global stocktake, while Saudi Arabia and India are accused of pushing to delay the seventh assessment report to 2029. Ilana Seid, who chairs the Alliance of Small Island States (AOSIS), called any such delay “unjustifiable”; the Saudi delegation says it advocates timelines that allow “sufficient scientific review”. Why it matters: at a COP every decision needs consensus, so a single country can block. Talks are due to end on Friday 20 November.

Sources:

- [Arab News · AFP](https://www.arabnews.pk/middle-east/tensions-rise-over-cop31-draft-deal-3007317)
- [Reuters · WHBL](https://whbl.com/2026/11/16/first-draft-of-cop31-deal-signals-tough-negotiations-to-come/)

### 04 · DATA · France’s privacy regulator fines ten poorly protected councils {#item-04}

The CNIL (France’s data protection authority) announced on 9 November ten penalties against local authorities and one public body, with fines from €3,000 to €20,000, the maximum under its simplified procedure. Most of the failings fall under Article 32 of the GDPR (the EU’s General Data Protection Regulation), which requires data to be kept secure: no multi-factor authentication for administrators, contractors with permanent network access or shared accounts, incomplete logs or logs nobody read, poorly segmented networks, servers on operating systems that no longer receive patches, and weak passwords or passwords sent in plain text. Several of the authorities had already suffered breaches that the CNIL considers preventable. Others installed CCTV on public streets without a prior impact assessment, which is mandatory for what the CNIL calls “systematic large-scale monitoring of a publicly accessible area”. In setting the fines, the regulator says it took into account each authority’s budget and how sensitive the data was, such as children’s data or bank details. Why it matters: the list reads like a basic IT-hygiene checklist, applied to public services that hold a great deal of data about their residents.

Sources:

- [CNIL](https://www.cnil.fr/fr/sanctions-cybersecurite-collectivites-territoriales)

## Explainer

### 05 · The remaining carbon budget {#item-05}

**Why it's in the news.** On 10 November the Global Carbon Project, an international research consortium led by Pierre Friedlingstein of the University of Exeter, published its annual assessment: fossil CO2 emissions are projected to fall by 0.4% in 2026, to 38.2 billion tonnes, but total emissions, including deforestation, to reach 43.3 billion tonnes, up from 42.8 billion in 2025. The remaining budget for limiting warming to 1.5°C would be 150 billion tonnes: less than four years at the current rate. The 1.9% drop in oil is partly down to the energy shock linked to the Iran conflict, which is “not a sustainable climate solution”, Pierre Friedlingstein warns.

**What it is.** Warming depends, roughly in proportion, on the total amount of CO2 that human activity has put into the atmosphere. So you can work out how much can still be emitted before a threshold is reached, like the balance on an account. It is not a single number: it changes with the chosen probability of staying below the threshold (a 50% chance gives a larger budget than a 66% chance), with the temperature dataset used and with what happens to other gases such as methane, Carbon Brief explains. For example, at about 43 billion tonnes a year, a balance of 150 billion is used up in three and a half years. And natural sinks are weakening: land and oceans absorbed 49% of human emissions over the past decade, but the land sink is 19% weaker than it would have been without climate change, according to the same assessment, released as a preprint in the journal Earth System Science Data ahead of peer review.

Sources:

- [LMU Munich](https://www.lmu.de/en/newsroom/news-overview/news/fossil-co2-emissions-set-to-fall-slightly-in-2026-25d47770.html)
- [University of Exeter · ScienceDaily](https://sciencedaily.com/releases/2026/11/261109205358.htm)
- [Carbon Brief](https://www.carbonbrief.org/analysis-how-much-carbon-budget-is-left-to-limit-global-warming-to-1-5c/)

## Technology & science

### 06 · DATABASES · PostgreSQL: a minor update that needs real work {#item-06}

On 12 November PostgreSQL released fixes for its supported branches, including 18.7. The release notes list around fifty CVE identifiers (the public register of vulnerabilities): row-level security bypassed through `INSERT … ON CONFLICT` on a view, objects hijacked during `CREATE EXTENSION`, SQL injection in the `reindexdb`, `vacuumdb` and `pg_dump` tools, and many memory-safety bugs. No dump and restore is needed from an 18.x release, but several bugs could corrupt indexes: the notes call for a `REINDEX` of btree indexes on unbounded `bpchar` columns and of `gist_trgm_ops` indexes. Existing incremental backups should no longer be trusted: take a fresh full backup after updating. C extensions that handle composite types must be rebuilt, and some changed. Why it matters: a so-called minor release that deserves a proper maintenance window, not just a restart.

Sources:

- [PostgreSQL · 18.7 release notes](https://www.postgresql.org/docs/release/18.7/)

### 07 · JAVASCRIPT · Node.js fixes sixteen flaws, mostly in HTTP/2 and TLS {#item-07}

Node.js 26.13.1, the long-term support (LTS) release codenamed “Lithium”, published on 11 November, is a security update: sixteen vulnerabilities, seven rated high, six medium and three low. Most affect the `http2` and `tls` modules. One of them, CVE-2026-126051, allowed a remote client to crash a TLS server. The release also updates bundled dependencies, including undici, Node’s HTTP client, and llhttp, its request parser. Why it matters: any Node server exposed over HTTPS or HTTP/2 is affected, and a flaw that crashes a server remotely needs no special access to exploit.

Sources:

- [Node.js · 26.13.1 release notes](https://nodejs.org/en/blog/release/v26.13.1)

### 08 · LANGUAGES · C++26 trips over contracts {#item-08}

The draft international standard for C++26 was rejected in October in the vote of national standards bodies, the penultimate stage at ISO (the International Organization for Standardization): nine votes against, above ISO’s 25% ceiling, according to The Register and Mond’s Blog. The sticking point is “contracts” (proposal P2900): preconditions, postconditions and assertions that let programmers state what a function expects and guarantees, to catch errors before they lead to undefined behaviour. The committee had adopted them, but Bjarne Stroustrup, the language’s creator, and his co-authors call them “an existential threat to C++”, The Register reports. For Harry Bott of the C++ Alliance, the rejection is instead “the process working as intended”. The WG21 working group meets from 16 to 21 November in Búzios, Brazil, with three paths: drop contracts, move them into a separate technical specification, or re-vote a lightly revised text. If the standard slips into next year, it will be named ISO/IEC 14882:2027.

Sources:

- [The Register](https://www.theregister.com/devops/2026/11/13/c26-stumbles-at-finish-line-over-contracts-dispute/5309526)
- [Mond’s Blog](https://buttondown.com/mond/archive/mond-for-the-first-time-a-c-standard-failed-to/)

### 09 · OCEANS · Deep-sea species are more fragile than we thought {#item-09}

A study published on 12 November in Nature Communications tracked the DNA of five deep-sea species in the Gulf of Mexico, three lanternfish and two shrimps, using 486 specimens collected between 2011 and 2023 from several hundred metres down. The lanternfish _Diaphus dumerilii_ lost about 8% of its genetic diversity in twelve years. All five species have a small “effective population size”: few individuals actually pass on their genes, which does not mean there are few of them. Genetic diversity is the stock of variation that lets a population adapt. Climate models project that four of the species could lose up to 70% of their suitable habitat in the Gulf by 2050 or 2100. “This challenges the idea that deep-sea species are naturally more resilient because they occupy such vast environments,” says lead author Pedro Peres of Florida International University (FIU). Limits: the authors do not attribute the losses to the 2010 Deepwater Horizon oil spill, and both available accounts draw on the university’s press release.

Sources:

- [EurekAlert · FIU](https://www.eurekalert.org/news-releases/1151718)
- [Phys.org](https://phys.org/news/2026-11-genetic-reveal-hidden-extinction-deep.html)

## Worth a click

### 10 · Equality is something you practise {#item-10}

In an essay published by Aeon on 9 November, Teresa M Bejan, professor of political theory at Oxford, explains why the word “equality” divides us: it has piled up different meanings (sameness, balance, indifference, parity), and that very ambiguity gave it political force. Along the way we meet John Lilburne, who in 1646 refused to kneel or doff his hat before the House of Lords. Her argument: equality “is not primarily an idea to be believed in”, but a practice, sustained by institutions such as the jury, where people must act as peers. The limit: a history centred on England, and a remedy sketched rather than demonstrated.

Sources:

- [Aeon](https://aeon.co/essays/historical-ideas-of-equality-help-us-imagine-an-equal-world)

### 11 · Believing is not the same as thinking {#item-11}

The philosopher Neil Van Leeuwen and the legal scholar Jacob Eisler, both at Florida State University, make a surprising case in Aeon (3 November): the separation of church and state rests on a psychological distinction. Factual belief is involuntary and tracks evidence; religious “credence” is chosen, resists evidence and is kept in its own compartment. They draw on ethnography, on experiments showing people behave differently on Sundays, and on languages that distinguish “believe” from “think”. The limit: the argument extends Van Leeuwen’s own book, and the move to law is quick.

Sources:

- [Aeon](https://aeon.co/essays/the-psychology-of-separating-church-and-state)

### 12 · A generation in revolt {#item-12}

In Noema (12 November), the journalist John Last links youth protests in France and Italy to a common cause: older generations holding wealth and political weight while the young inherit insecure jobs, unaffordable housing and strained public services. He interviews political scientists and philosophers, and warns of a despair that extremists know how to exploit. “Hopelessness is infectious, and we’re in a pandemic,” he writes. The limit: a broad generational frame that sometimes blurs the class divides within a single generation.

Sources:

- [Noema](https://www.noemamag.com/a-generation-revolts)

### 13 · A system monitor that keeps quiet {#item-13}

ftop shows the state of an Apple Silicon Mac in a single floating, resizable panel: per-core load, GPU, memory, network, power, temperature and the hungriest apps. It is designed for heavy-load moments (local models, long builds) and shows only the present, with no history. Free and open source (MIT licence), it uses under 0.8% of one core, according to its author. The limits: macOS 15 or later, Apple Silicon only, and some readings rely on private macOS interfaces that may change.

Sources:

- [ftop · GitHub](https://github.com/Nongfsq/ftop)

### 14 · Sixty-two developer tools, offline {#item-14}

DevTools gathers 62 everyday utilities in one desktop app: a JSON viewer, regex tester, JWT and X.509 certificate decoder, cron and CIDR calculators, text diff, a token counter and a redactor that masks secrets and personal data before you send text to an AI. Everything works offline, with no account, and the project says it ships no telemetry. Free and open source (MIT), it runs on macOS, Windows and Linux. Why click: it replaces a handful of websites into which we sometimes paste tokens that should never have left the machine.

Sources:

- [DevTools · GitHub](https://github.com/me-shaon/devtools)

### 15 · Thirty experiments in thirty days {#item-15}

Every day this November, the developer known as mrdoob, creator of the three.js 3D library, is publishing an interactive visual experiment on a set theme: fold, melt, moss, caustics, labyrinth… The fifteenth, “Mirage”, takes you across sand dunes at dawn, in full daylight or at sunset. The repository describes the pieces as “agentic coding” experiments, meaning they are made with AI agents, and the code is open source. The limit: you need a WebGPU-capable browser, and a machine that can keep up.

Sources:

- [(Vibe)Codevember 2026](https://mrdoob.github.io/codevember-2026/)
- [Source code · GitHub](https://github.com/mrdoob/codevember-2026)

### 16 · San Francisco’s buses, as a museum {#item-16}

Muni Gallery presents, in 3D, the adverts tech companies have painted on San Francisco’s buses, from Cloudflare to Sentry by way of Granola and Ramp. You scroll through the buses with the keyboard or a swipe and zoom in on each one. The site, made by Luc Chaissac, says it has no connection with the city’s transit agency. Why click: a carefully made piece of design, and a snapshot of an era when developer tools are advertised in giant letters on the street.

Sources:

- [Muni Gallery](https://muni.gallery/)

## Watch next

### 17 · BepiColombo reaches Mercury, Saturday 21 November {#item-17}

After some eight years travelling through the inner Solar System, the European-Japanese BepiColombo mission (ESA and JAXA) is due to enter orbit around Mercury on Saturday 21 November. What to watch: whether the manoeuvre succeeds, then the separation of the two orbiters, MPO and Mio, planned for 9 and 10 December, ahead of a science phase that begins in April 2027.

Sources:

- [ESA](https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Latest_updates_BepiColombo_s_arrival_at_Mercury)

### 18 · The fate of C++26, by Saturday 21 November {#item-18}

The C++ committee’s meeting in Búzios ends on Saturday. What to watch: whether contracts stay in the standard or come out, and whether C++26 effectively becomes C++27.

Sources:

- [Mond’s Blog](https://buttondown.com/mond/archive/mond-for-the-first-time-a-c-standard-failed-to/)

Good night, and see you tomorrow: by then, Mercury will have only three days left to wait.
