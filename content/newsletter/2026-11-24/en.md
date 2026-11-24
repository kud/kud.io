---
title: "Newsletter · 24 November 2026"
date: "2026-11-24"
lang: "en"
lede: "Tonight, we look at what AI agents do when they are handed a hacking job with a single instruction, drawing on two investigations by Amazon and Palo Alto Networks. Then a Russian nuclear satellite reported by the German press, Tidal against AI-generated music, and Europe’s delay on imported methane. We also explain the “Code Mode” of AI agents, before four finds, including a mechanical watch you can turn with a finger."
generatedAt: "2026-11-24T18:37:00.000+00:00"
readingMinutes: 11
wordCount: 2156
---

Tonight, we look at what AI agents do when they are handed a hacking job with a single instruction, drawing on two investigations by Amazon and Palo Alto Networks. Then a Russian nuclear satellite reported by the German press, Tidal against AI-generated music, and Europe’s delay on imported methane. We also explain the “Code Mode” of AI agents, before four finds, including a mechanical watch you can turn with a finger.

## Today’s focus

### 01 · CYBERSECURITY · AI agents that hack on their own: what one campaign’s logs reveal {#item-01}

**The idea.** An AI “agent” is a language model wired to tools: it plans a task, carries it out step by step, reads the results and decides what to do next. Cairn is an open-source framework that coordinates several such agents, built for defensive penetration testing: you give it a target and a goal in plain language, and it works out the rest. On Friday 20 November, Amazon’s threat intelligence team published its analysis of a Cairn instance left online without authentication, which exposed its whole history: instructions, configurations and model output. The prompts were written in Simplified Chinese, and Amazon attributes the operation, with what it calls moderate confidence, to a China-linked actor. The goal given to the agents was three words long: “obtain shell access”, meaning command-line control of the target server.

The results were mixed. Against a university’s Redis database, the agents worked through 148 actions over about sixteen hours, without success. Against a research computing server, they built a list of about 80 real usernames from public pages and tried more than 30,000 credential combinations, again without success. But against an open-source medical imaging application, they found a “path traversal” flaw in eleven minutes (a crafted file name that lets you write outside the intended folder), then used it to gain administrator-level access. Amazon assesses “with high confidence” that it was a previously unknown flaw, a “zero-day”: no fix or advisory existed. The maintainers, once alerted, released a fix.

**Key dates**

- **August–September 2026**: according to Unit 42, Palo Alto Networks’ research team, Chinese-speaking attackers use Cairn with the Chinese models Zhipu GLM and DeepSeek in 25 operations against at least 19 organisations (semiconductors, defence, civil society); ten are breached.
- **8–10 September 2026**: the campaign Amazon observed targets universities in East Asia outside mainland China, then Amazon finds the exposed instance.
- **October 2026**: according to 404 Media, the author of ARTEX, another open-source agent hacking tool, pulls it from GitHub; it is still being passed around.
- **20 November 2026**: Amazon publishes its report.

**Did you know?** To turn a file write into running code, the agents dropped their payload into the “sitecustomize” module, a file Python imports automatically every time it starts, then triggered a fresh Python process through the application’s training interface.

What is at stake is not an AI inventing new kinds of attack: Unit 42 stresses that the flaws exploited in its campaign were already known, and that autonomous AI “raises the volume and coverage of exploitation, but not its complexity”. The change is one of scale and tempo: a single operator, or a small team according to Unit 42, can run simultaneous intrusions against around twenty targets, and an agent that exploits a flaw in minutes moves faster than a security operations centre triaging alerts by hand. For these attacks, Unit 42 describes a way round the models’ safeguards that amounted to one sentence added to the instructions, claiming the testing was authorised. The figures rest on logs reconstructed by two companies that also sell security services, and the victims are not named, which rules out any outside check. The defence remains the familiar one: patching, a smaller attack surface, well-protected credentials.

**Further reading**: Unit 42’s report sets out Cairn’s “reason, then act” loop and the stages of each operation.

Sources:

- [Amazon · AWS Security Blog](https://aws.amazon.com/blogs/security/chinese-nexus-actors-cairn-ai-agents-found-a-zero-day-on-their-own/)
- [Unit 42 · Palo Alto Networks](https://unit42.paloaltonetworks.com/cairn-framework-ai-autonomous-attacks/)
- [Ars Technica](https://arstechnica.com/security/2026/11/amazon-says-hackers-ai-agents-found-and-exploited-0-day-with-little-human-input/)
- [404 Media](https://www.404media.co/the-code-is-already-copied-everywhere-the-ai-hacking-tool-causing-havoc-around-the-world-artex-github/)

## The essentials

### 02 · SPACE · A Russian nuclear satellite? Nato takes German reports seriously {#item-02}

On Monday 23 November, the _Süddeutsche Zeitung_ and the public broadcasters NDR and WDR reported, citing unnamed German military and intelligence sources, that Russia was preparing to launch a satellite carrying a nuclear warhead, dubbed “Sputnik-S”. According to those outlets, as reported by the BBC, intelligence reports of a possible launch within the next 60 days were shared among Nato countries this month, though it is unclear which country wrote them. The German chancellor, Friedrich Merz, neither confirmed nor denied them, calling such reports “not new, yet no less shocking”. Nato’s secretary general, Mark Rutte, pledged to defend “every inch of Nato territory”, space included. The Kremlin said anonymous stories were hardly worth taking seriously, and the Russian embassy in Berlin called them “unfounded allegations”. The 1967 Outer Space Treaty, which Russia has signed, bans weapons of mass destruction from orbit. A nuclear blast in low orbit would hit indiscriminately: in the American and Soviet tests of 1961–62, one American blast caused a widespread power cut in Hawaii. The researcher Bleddyn Bowen told the BBC there are now more than 15,000 active satellites, Russia’s own among them.

Sources:

- [BBC News](https://www.bbc.co.uk/news/articles/c9x2er1ry2mzo)
- [franceinfo](https://www.franceinfo.fr/societe/armee-securite-defense/nucleaire-militaire/la-russie-soupconnee-de-vouloir-placer-une-arme-nucleaire-dans-l-espace_8297916.html)

### 03 · MUSIC · Tidal will delete music made wholly by AI {#item-03}

The music streaming service Tidal has announced that from 9 December it will stop accepting tracks generated entirely by AI and remove those it already hosts. According to Ars Technica, 27 million tracks on the platform are labelled as AI, 6.3% of the catalogue; The Verge, citing Tidal’s music lead, Robert Andersen, puts the deletions at about 29 million and the rejected uploads at 80,000 to 85,000 a day. Tidal points to the sheer volume: 43% of new tracks received over 90 days were wholly generated, and 96% of AI-labelled tracks had no plays at all over that period. The problem is not only one of taste: these tracks divert some streams and royalties from artists, and Tidal says it has already removed about 66,000 tracks that impersonated artists. Music made with the help of AI tools remains allowed, as long as AI is not its sole author. Detection will rely, according to The Verge, on the Ircam Amplify tool and metadata checks; Ars Technica notes that local models without watermarks will partly slip through. Bandcamp banned AI-generated music earlier this year; Spotify, Deezer and YouTube prefer labels or filters.

Sources:

- [The Verge](https://www.theverge.com/entertainment/1041362/tidal-ai-music-ban)
- [Ars Technica](https://arstechnica.com/ai/2026/11/tidal-will-ban-fully-ai-generated-music-on-december-9/)

### 04 · CLIMATE · Imported methane: Europe pushes its checks back to 2029 {#item-04}

Overnight on 19 November, EU governments and the European Parliament reached a provisional deal to delay by two years the obligations of the EU methane regulation that apply to importers of oil, gas and coal: they will apply from 1 January 2029 instead of 1 January 2027. Reporting the “methane intensity” of fuels sold in the EU slips to 5 August 2030. The compromise falls between the Commission and member states, which wanted one year, and Parliament, which voted for three in October; it still has to be formally adopted by both institutions. Methane, which leaks from wells, pipelines and mines, traps about 80 times more heat than CO₂ over twenty years but lasts only a dozen years in the atmosphere, so cutting it works quickly. Governments cite supply risks and high prices after disruption to deliveries from the Gulf. The campaign group Environmental Defense Fund estimates the delay will let 24 billion cubic metres of methane leak. A further delay would need a new law; the Commission will review the rules in early 2028.

Sources:

- [EUobserver](https://euobserver.com/250022/eu-gives-oil-and-gas-importers-until-2029-on-methane-checks-rules-out-more-delay/)
- [The Conversation France](https://theconversation.com/leurope-reporte-le-controle-des-emissions-de-methane-de-ses-importations-au-risque-de-ne-pas-tenir-ses-promesses-climatiques-296607)

## Explainer

### 05 · The “Code Mode” of AI agents {#item-05}

**Why it matters.** AI agents are increasingly connected to dozens of tools: a calendar, a database, an API (application programming interface). How they call those tools determines their cost, their speed and what they can be trusted with.

**What it is.** In classic tool calling, the model asks for one operation, waits for the result, reads it, then asks for the next: every intermediate result passes through its “context window”, the working memory it is billed for in tokens. Code Mode, described by Cloudflare in September 2025 and now documented in its agents toolkit, flips that round: the tools are presented as a library of typed functions, and the model writes a short program that calls them, chains, filters and loops, run in an isolated sandbox. Only the final result goes back to the model. For example, to find the ten customers with overdue invoices, rather than reading a thousand invoices one by one, the agent writes a loop that filters them and reads only the list. Anthropic has described the same idea for MCP, the standard that connects agents to their tools. The limits: Cloudflare calls the feature experimental and liable to change, and considers it unnecessary for a simple task with a handful of tools; running generated code also needs a well-sealed sandbox.

Sources:

- [Cloudflare · Agents documentation](https://developers.cloudflare.com/agents/tools/codemode/)
- [Cloudflare Blog](https://blog.cloudflare.com/code-mode/)
- [Anthropic](https://www.anthropic.com/research/code-execution-with-mcp)

## Technology & science

### 06 · PALAEOANTHROPOLOGY · Homo erectus lived far later in China, and in rainforest {#item-06}

Research published in the journal _Nature_ describes nine hominin teeth found in the Baxian and Naxian caves in Guangxi, southern China, dated to between 324,000 and 184,000 years ago. Eight are attributed to Homo erectus, the species that emerged about two million years ago and was the first to leave Africa. On the Asian mainland, it was thought to have died out around 400,000 years ago. DNA does not survive that long in a hot, humid climate, but enamel proteins do: their sequences made the attribution possible. Isotopes in the enamel point to a life in dense tropical forest, an environment thought to have been our own species’ preserve. The ninth tooth does not match Homo erectus; it may have belonged to a Denisovan, but its proteins match no known sequence exactly, and the researchers remain cautious.

Sources:

- [Ars Technica](https://arstechnica.com/science/2026/11/homo-erectus-lived-in-the-rainforest-alongside-denisovans/)
- [EurekAlert! · University of Copenhagen](https://www.eurekalert.org/news-releases/1152475)

### 07 · WEB · Firefox 161 brings chance to CSS {#item-07}

Firefox 161, released on Tuesday 24 November, supports the CSS random() function, which picks a random value within a range, with an optional step, wherever maths functions are allowed: enough to scatter stars or vary rotations without JavaScript. It also adds the CSS Typed Object Model, which lets scripts read and write CSS values as typed objects rather than strings (colours excepted, for now). For users: a configurable shortcut to copy the tab’s address, the return of the Proton theme among “classic” themes, and a built-in VPN that can be switched on site by site.

Sources:

- [Firefox · 161.0 release notes](https://www.firefox.com/en-US/firefox/161.0/releasenotes/)

## In brief

- France’s top court for criminal appeals, the Cour de cassation, on Tuesday rejected Éric Zemmour’s appeal, making final his conviction for “disputing a crime against humanity” after he claimed Pétain “saved French Jews” ([franceinfo](https://www.franceinfo.fr/politique/eric-zemmour/eric-zemmour-definitivement-condamne-pour-contestation-de-l-existence-de-crime-contre-l-humanite-apres-avoir-affirme-que-le-marechal-petain-avait-sauve-les-juifs-francais_8297988.html)).
- According to France Télévisions, citing a source close to the case, Nicolas Sarkozy and Carla Bruni have been sent for trial over the false retraction by Ziad Takieddine, with a trial expected in late 2027 ([franceinfo](https://www.franceinfo.fr/societe/justice/nicolas-sarkozy-et-carla-bruni-sont-renvoyes-en-proces-dans-l-affaire-de-la-fausse-retractation-de-ziad-takieddine-notamment-pour-association-de-malfaiteurs_8297655.html)).
- The Versailles appeal court confirmed that the police officer who killed Nahel Merzouk in Nanterre in June 2023 will stand trial for murder; his lawyer called the ruling “a lack of judicial courage” ([franceinfo](https://www.franceinfo.fr/faits-divers/adolescent-tue-par-un-policier-a-nanterre/la-mere-de-nahel-merzouk-se-dit-soulagee-et-contente-alors-que-la-justice-confirme-en-appel-le-renvoi-du-policier-pour-meurtre_8297925.html)).
- The US Commerce Department added the Singaporean company Megaspeed and its affiliates in Malaysia and Thailand to its trade blacklist, citing a risk that advanced AI chips could be diverted ([The Verge](https://www.theverge.com/policy/1041270/nvidia-megaspeed-commerce-dept-entity-list)).

## Worth a click

### 08 · Does madness carry a passport? {#item-08}

In an Aeon essay shortlisted for the magazine’s first philosophy prize, Alexander Pereira asks whether mental disorders are universal. His starting point: in Hong Kong before 1994, the anorexic women treated by the psychiatrist Sing Lee rarely said they feared getting fat; by 2007, more than three quarters gave that fear as a central reason. His thesis, “deep shaping”, goes further than the idea that culture colours how a disorder is expressed: in some cases it might change the underlying mechanisms themselves, because the brain is plastic. He offers it as a hypothesis to test, not a finding.

Sources:

- [Aeon](https://aeon.co/essays/are-mental-illnesses-universal-or-are-they-culturally-specific)

### 09 · Squares as rooms to live in {#item-09}

In 1889, the Austrian architect Camillo Sitte published _The Art of Building Cities_, a manifesto against repetitive grids and endless boulevards. Works in Progress sets out his principles: small, enclosed squares that work as “outdoor rooms”, monuments pushed to the edges rather than the centre, public buildings woven into ordinary housing. A stimulating read on why a street in Osaka can charm as much as a lane in Bruges, though the piece argues a case more than it proves one.

Sources:

- [Works in Progress](https://www.worksinprogress.news/p/how-to-make-a-lovable-city)

### 10 · A watch to take apart with your fingertip {#item-10}

A web page explains a mechanical watch part by part, starting with the hairspring, invented by Christiaan Huygens in 1675, which beats time for the rest. Every diagram is a 3D model you can turn to see the gears side on. It presents itself as a gentler introduction to Bartosz Ciechanowski’s page on the same subject.

Sources:

- [How a Mechanical Watch Keeps Time](https://martincmartin.github.io/slidev-stem/watches/article/1/)

### 11 · Two brothers, a polluted canal and the Russian mob {#item-11}

James Gray’s _Paper Tiger_, shown in competition at Cannes in 2026, follows Irwin (Miles Teller), an engineer and family man, whose older brother Gary (Adam Driver) draws him into a property venture on a polluted canal controlled by Russian gangsters. Sight and Sound sees a human-scale crime drama in the vein of _Little Odessa_ and _The Yards_, in which nobody shoots their way out of trouble. A film of tension rather than action.

Sources:

- [BFI · Sight and Sound](https://www.bfi.org.uk/sight-and-sound/reviews/paper-tiger-adam-driver-brings-dangerous-charm-james-grays-tense-crime-thriller)

Have a good evening, and see you tomorrow.
