---
title: "Newsletter · 20 November 2026"
date: "2026-11-20"
lang: "en"
lede: "Tonight, we stop on a dizzying announcement: an Anthropic mathematician says that, working with Claude, he has proved the Riemann hypothesis, in a proof that for now only a machine can read. Then the deal between London and Brussels, a Russian missile in Poland, cautious hope against pancreatic cancer and a COP31 running into extra time, before we explain how text written by an AI gets “watermarked”. On the technical side, Signal shutting out operating-system assistants and an elegant proof about networks; and four finds, from anger as an object of study to a pixel-art world compiled like code."
generatedAt: "2026-11-20T18:47:00.000+00:00"
readingMinutes: 15
wordCount: 2959
---

Tonight, we stop on a dizzying announcement: an Anthropic mathematician says that, working with Claude, he has proved the Riemann hypothesis, in a proof that for now only a machine can read. Then the deal between London and Brussels, a Russian missile in Poland, cautious hope against pancreatic cancer and a COP31 running into extra time, before we explain how text written by an AI gets “watermarked”. On the technical side, Signal shutting out operating-system assistants and an elegant proof about networks; and four finds, from anger as an object of study to a pixel-art world compiled like code.

## Today’s focus

### 01 · MATHEMATICS · The Riemann hypothesis, claimed in a proof nobody has yet read {#item-01}

Levent Alpöge, a mathematician employed by Anthropic, the company behind the Claude AI, and a member of Harvard’s Society of Fellows, posted a note on his website on Thursday evening saying: “I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis.” He adds that the method extends to the Generalized Riemann Hypothesis. None of it has been independently verified, The Verge stresses, and Anthropic has not commented. What makes the announcement unusual is its form: for now the proof exists only in Lean, a language in which every step of an argument is checked by computer, split across fourteen archive files. Alpöge says he chose not to post a “massive unreadable” document and wants first to understand and write up the argument properly.

**The idea**

Stated by Bernhard Riemann in 1859, the hypothesis concerns the zeros of the zeta function, a function that encodes how the prime numbers are distributed: it says all the “non-trivial” zeros lie on a single line. If it is true, primes can be counted with the best possible precision, and thousands of results that assume it become theorems. It is one of the Clay Institute’s seven Millennium Prize problems, each carrying a $1 million award; according to The Verge, the rules require publication followed by at least two years of scrutiny and general acceptance by the community, and only one of the problems, the Poincaré conjecture, has officially been solved. Lean changes the nature of verification without removing it. If the files compile, a small software kernel guarantees that the formal statement follows from the axioms; but someone still has to check that the formal statement says what the Riemann hypothesis says, and that no axiom slipped in along the way skews the result. That work has begun: Terence Tao, one of the best-known mathematicians alive, writes on Friday that verification is under way on a Lean community forum, and that from a very first look the proof appears to use “the full power” of the Langlands programme and arithmetic geometry.

**Did you know?**

In August, Anthropic described a more modest attempt: a research version of Claude raised the known minimum share of zeros lying on the line from 41.6% to 67.2%, a result checked by two of the company’s mathematicians and two outside specialists. The company wrote at the time that it did not expect those techniques to lead to a proof of the hypothesis. In his note, Alpöge presents his argument as a descendant of Stepanov’s method, which proved the analogue of the hypothesis in a simpler setting, that of “function fields”, and says that near the finish line Claude “far outpaced” him. He also acknowledges that the timing invites suspicion: he says he alerted Anthropic’s chief executive, Dario Amodei, on Sunday night and respected a “constraint”, which The Verge links to the company’s stock market listing on Thursday; he calls the cynical reading of the timing “false”. The same post by Terence Tao sorts two other announcements made with heavy AI assistance by Alpöge and the mathematician Tristan Buckmaster (with Coiculescu on the first): singularities forming in finite time in the Euler equations, the best “digested”, with a human-readable proof, and in the Navier–Stokes equations, which describe fluids and form another Millennium problem, where the strategy is clear but a professional write-up is still needed. In September, OpenAI had already claimed a solution to Navier–Stokes, considered credible but not yet formally recognised and disputed over its methods, The Verge reports.

**Further reading**

Terence Tao’s post, which sorts the three announcements from most to least verified, and Anthropic’s account of the August attempt, useful for measuring how far things have moved.

Sources:

- [The Verge](https://www.theverge.com/ai-artificial-intelligence/1010051/anthropic-riemann-hypothesis-millennium-prize-problem)
- [Levent Alpöge · remark](https://alpo.ge/remark.pdf)
- [Terence Tao · What's new](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/)
- [Anthropic · The Riemann zeta function](https://www.anthropic.com/research/riemann-zeta)

## The essentials

### 02 · EUROPE · London and Brussels sign the next stage of the post-Brexit reset {#item-02}

Meeting in Brussels on Friday 20 November, the UK Prime Minister Andy Burnham, the European Commission President Ursula von der Leyen and the European Council President António Costa concluded a deal that London calls “historic” and the Commission a “turning point”, ten years after the Brexit referendum. From 2028 it scraps most checks on British food exports to the EU, in return for the UK following some EU rules; it creates a “youth experience” scheme letting up to 100,000 people aged 18 to 31 a year in each direction live, study or work for up to three years, by January 2030 at the latest; and it links the two carbon markets, the systems in which industry buys emission allowances, from 2028. Tuition fees for European students are still to be negotiated, within six months. According to Andy Burnham, the Treasury estimates the deal could add “up to” 0.5% to GDP, or £17bn a year; the Conservative leader Kemi Badenoch accuses him of having “plucked that figure out of the air”, and Reform UK’s Nigel Farage calls it a “betrayal”. The red lines stay in place: no single market, no customs union, no freedom of movement. The Prime Minister calls the deal “probably the limit” of what this Parliament can achieve and leaves the case for closer ties to the next general election, due by August 2029.

Sources:

- [BBC](https://www.bbc.co.uk/news/articles/c6jreyqgw4e9o)
- [franceinfo](https://www.franceinfo.fr/monde/royaume-uni/le-royaume-uni-annonce-un-accord-historique-avec-l-union-europeenne-bruxelles-salue-un-tournant-dix-ans-apres-le-referendum-sur-le-brexit_8292233.html)

### 03 · WAR IN UKRAINE · A Russian missile comes down in Poland, near an allied exercise {#item-03}

A Russian Kh-101 cruise missile crashed into a field at Nowy Lipowiec, in south-eastern Poland, about 50km from the Ukrainian border, at around 06.30 local time on Friday 20 November, according to the Polish defence minister, Władysław Kosiniak-Kamysz, quoted by the BBC. Three objects violated Polish airspace: a second suspected missile came down near Rudnik nad Sanem and a jet-powered drone near Mołodycz. No injuries or damage were reported. The incursions happened during one of Russia’s largest air attacks on Ukraine since 2022, which killed at least eight people as it targeted bridges in Kyiv and a station in Lviv. The Prime Minister, Donald Tusk, says it was no accident: the objects fell near Nowa Dęba, where Koalicja 2026 is under way, an exercise led by the UK and France with eleven countries from the “coalition of the willing”, the states preparing a reassurance force in case of a peace deal in Ukraine. Warsaw calls it a “provocation”; Nato’s Secretary General, Mark Rutte, condemned “grave violations” and said jets had been scrambled in response. Russia has not commented. There is a precedent from July, when a missile left a ten-metre crater in the east of the country.

Sources:

- [BBC](https://www.bbc.co.uk/news/articles/cqx2x9dklxnro)

### 04 · HEALTH · Pancreatic cancer: a targeted pill shrinks tumours, without promising a cure {#item-04}

In an early trial presented at the EORTC–NCI–AACR cancer symposium, daraxonrasib, a daily pill, given alongside chemotherapy, stopped tumours growing in 90% of 61 patients, all recently diagnosed with pancreatic cancer that had already spread, the BBC reports. Just over 60% saw their tumours shrink or disappear, and in about one patient in twelve they became undetectable on CT scans. The drug, already approved in the United States, blocks mutations in the RAS gene, found in most pancreatic cancers and long thought impossible to target with a drug. Cancer Research UK calls it “the biggest leap forward in decades”; according to the charity’s Sam Godfrey, the treatment has found a way of “drugging the undruggable”. Why it matters: this cancer has the lowest survival rate of all common cancers in the UK, where it kills about 10,200 people a year, and most patients with advanced disease survive months. The limits, stressed by the doctors themselves: patients were followed for a year and a half on average, nobody yet knows how long the effect lasts, and a tumour that cannot be seen on a scan is not a cure.

Sources:

- [BBC](https://www.bbc.co.uk/news/articles/cqrmgjnzz9l0o)

### 05 · CLIMATE · COP31 goes into extra time, with the science itself up for negotiation {#item-05}

The UN climate conference in Antalya, Turkey, was due to end on Friday 20 November; it is running on with no deal in sight. At least eight countries, among them France, Finland, Panama, Côte d’Ivoire and the Solomon Islands, demand in a public letter that the final decision mention “a clear transition away from fossil fuels” and “clean and immediate electrification”, both missing from the draft released on Thursday, franceinfo reports. The Alliance of Small Island States (Aosis) warns the COP would be “a failure” if it does not respond to warming that is “out of control”. A second, less visible fight concerns the timetable of the IPCC, the UN’s panel of climate scientists whose reports underpin climate agreements: its last plenary session was put on hold in October at the urging of Russia, Iran, Saudi Arabia and Kenya, DW explains, so its next reports may not be ready for the Paris Agreement’s second global stocktake, due in 2028. Why it matters: without an up-to-date scientific assessment, that review of national efforts would rely on figures from 2023.

Sources:

- [franceinfo](https://www.franceinfo.fr/environnement/crise-climatique/cop-climat/plusieurs-pays-dont-la-france-exigent-une-decision-finale-de-la-cop31-incluant-une-transition-claire-hors-des-energies-fossiles_8292470.html)
- [DW](https://www.dw.com/en/at-cop31-conflict-over-climate-science-slows-action-on-global-warming/a-80004894)

## Explainer

### 06 · The watermark in AI-written text {#item-06}

**Why it's in the news.** Anthropic announced on 16 November that text produced by several of its older Claude models now carries its watermark, as text from its models launched since 2 August already does. The company is applying the code of practice it signed under Article 50 of the EU’s Artificial Intelligence Act, which requires generated content to be marked in a machine-readable way.

**What it is.** A text watermark is neither a visible label nor metadata: it is a statistical signal woven into the choice of words. Anthropic does not detail its method, but the approach described in 2023 by researchers at the University of Maryland gives the idea: at each word, a secret key marks part of the vocabulary as “favoured”, and the model leans slightly towards those words without changing the meaning. A reader sees nothing; a detector that knows the key counts the favoured words and works out how likely it is that a human would have written that many by chance. The signal travels with the text when it is copied and pasted. Its limits, as Anthropic sets them out: a very short text, or one heavily rewritten, paraphrased or translated, can lose the mark; for some older models, changing the sampling settings (temperature, top\_p, top\_k) can prevent it; and a detected mark only shows that Claude processed the text, not that it wrote it, since people also use it to proofread or translate. Detection remains restricted, available notably to regulators, media, fact-checkers and researchers. Files, for their part, get signed metadata under the open C2PA standard.

Sources:

- [Claude · How Claude marks AI-generated content](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content)
- [Claude Platform · release notes](https://platform.claude.com/docs/en/release-notes/overview)
- [arXiv · A Watermark for Large Language Models](https://arxiv.org/abs/2301.10226)

## Technology & science

### 07 · PRIVACY · Signal shuts out the AI assistants in Android and iOS {#item-07}

The encrypted messenger Signal has announced that it now blocks screenshots in its app on iOS 27, and on Android when it detects an AI assistant trying to read the screen. The target: agents built into operating systems, which Signal names as Google’s Gemini Intelligence and Siri’s Onscreen Awareness at Apple, that “read” the screen to answer the user’s questions; once captured, messages are beyond the reach of end-to-end encryption and may end up in a local database or on a remote server. Signal did the same last year against Recall, the Windows 11 feature that continuously captures the screen. The setting can be switched off, at the cost, Signal warns, of your contacts’ privacy. The foundation admits the fix is incomplete: an agent could read data already stored on the device, it can do nothing on macOS for lack of tools, and it faults Google, Apple and Microsoft for providing neither documentation nor a simple way to keep these agents out. Why it matters: encryption protects a message in transit, not the screen it is displayed on; that is now where privacy is won or lost.

Sources:

- [Signal](https://signal.org/blog/protecting-your-privacy/)

### 08 · NETWORKS · Four patterns are all it takes to stop a network being perfectly resilient {#item-08}

When a cable fails, a router has to send packets elsewhere without waiting for a full map of the network to be recalculated, using only local information: the destination, the link a packet arrived on, the neighbouring links that are down. A network is called “perfectly resilient” if such local rules always deliver packets as long as some path exists. In 2012, researchers formalised the question and showed, with one example, that it is sometimes impossible. Matthias Bentert and Stefan Schmid of the Technical University of Berlin have now settled the problem, presented in June at the Symposium on Theory of Computing and described by Quanta Magazine: exactly four connection patterns, “forbidden minors” in graph-theory terms, make perfect resilience impossible, and any network containing none of them can achieve it. The proof even yields a fast algorithm, based on the old trick for escaping a maze: always turn right. The limits: the model ignores speed and congestion, and dense real-world networks often contain one of the four patterns, concedes Brighten Godfrey, a co-author of the 2012 work.

Sources:

- [Quanta Magazine](https://www.quantamagazine.org/network-researchers-nail-down-theory-of-perfect-resilience-20261120/)

## In brief

- The US national cyber director, Sean Cairncross, has been removed after a string of outages in banking and air traffic control that officials say were not caused by cyber-attacks, according to CBS and AFP; the White House has not confirmed, but Marco Rubio has named Kirsten Davies to the post ([BBC](https://www.bbc.co.uk/news/articles/cwz0k3nn5p5mo)).
- Google made Gemini 4 Neon generally available in its API on 18 November, priced at $3 per million input tokens and $15 per million output tokens, with a one-million-token context window ([Google · Gemini API release notes](https://aistudio.google.com/docs/changelog)).
- The LLVM compiler project is closing its eight-year move to the Apache 2.0 licence: more than 99.5% of all lines ever contributed are now covered, too small to be protected, or gone ([LWN.net](https://lwn.net/Articles/1108818/)).
- The 2026 Booker Prize goes to The End of Everything by M. John Harrison, 81, the first winner clearly from the world of science fiction according to the scholar Jon Quayle ([The Conversation](https://theconversation.com/m-john-harrisons-2026-booker-prize-win-signals-an-end-for-literary-snobbery-towards-science-fiction-297073)).

## Worth a click

### 09 · Anger explains nothing; it needs explaining {#item-09}

Strikes, school pupils’ marches, the gilets jaunes: since 5 November, France’s protests have been summed up in one word, “anger”, described like the weather as it “rises” and then “explodes”. In The Conversation (20 November, in French), the political scientist Frédéric Gonthier of Sciences Po Grenoble turns the formula round: anger is not an explanation but something to be explained. He separates fear, anxiety and anger, which arises from a broken rule for which someone is held responsible, and recalls, with the historian E.P. Thompson and his “moral economy”, that the step from misfortune to injustice is a political judgement. Why click: a short lesson in method against a way of depoliticising people who protest. The limit: it is a synthesis; its finding across 26 countries, linking anger at inequality with votes for redistribution, refers to his own research without detailing it.

Sources:

- [The Conversation](https://theconversation.com/la-colere-nest-pas-une-explication-cest-un-phenomene-a-expliquer-296714)

### 10 · A nanny that remembers everything {#item-10}

In Aeon (19 November), the psychologist and psychoanalyst Tom Wooldridge of Golden Gate University in San Francisco starts from a Geoff Ryman short story in which a robot nanny rescues a neglected boy, then turns to a teenager who confides in an AI at night because it “remembers”. His argument: for some children, these artificial companions are both a rescue and a trap, because an AI can respond but cannot be changed by the child, and it is the resistance of another mind that teaches a child that other people are real. He anticipates the objection of an AI built to disagree: programmed disagreement is not a separate mind. The limit: a clinical and theoretical essay, built on a composite case, rather than an empirical demonstration.

Sources:

- [Aeon](https://aeon.co/essays/what-would-parenting-by-ai-look-like)

### 11 · A pixel-art world, compiled like code {#item-11}

Frostwind, released under the MIT licence by Trinity Labs, calls itself a “world compiler”: it turns explicit models of terrain, water, weather, animals, people and vernacular building into deterministic pixel-art scenes you can inspect and reproduce exactly. Five worlds playable in the browser, from boreal forest to swamp, share a single scale (26 pixels to 1.70 metres), and the repository includes guidance for coding agents to add worlds and characters. Why click: an unusual take on procedural generation, grounded in physics rather than images generated on demand. The limits, as the project lists them: no night, no dialogue or quests, and a repository that is still very young.

Sources:

- [Frostwind · GitHub](https://github.com/trinity-works/frostwind)

### 12 · Icons that move in your Dock {#item-12}

IconSwapper, a Mac app by the icon designer Michael Flarup, lets you repaint the icons in your Dock: start from the original icon, an image or shared sets, then add effects (foil, neon, glass) and “Live Icons” that reflect activity, a usage meter or what is playing. Why click: a small, carefully made piece of design that thinks about details such as reduced motion. The limits: $19 at launch, macOS 14 or later, changes only hold while the app is running, and live icons ask for broad automation and accessibility permissions.

Sources:

- [IconSwapper](https://iconswapper.app/)

## Watch next

### 13 · Checking the Riemann proof {#item-13}

Verification has begun in the Lean community. What to watch: whether the formal statement really matches the Riemann hypothesis and adds no axioms, then whether a human-readable version appears; the Clay prize itself requires two years of scrutiny after publication.

Sources:

- [Terence Tao · What's new](https://terrytao.wordpress.com/2026/11/20/unforced-euler-singularity-unforced-navier-stokes-singularity-and-the-generalized-riemann-hypothesis/)

### 14 · COP31’s final decision {#item-14}

The Antalya talks are running past Friday. What to watch: whether a “transition away from fossil fuels” returns to the text, and whether the IPCC’s reports are scheduled in time for the 2028 global stocktake.

Sources:

- [franceinfo](https://www.franceinfo.fr/environnement/crise-climatique/cop-climat/plusieurs-pays-dont-la-france-exigent-une-decision-finale-de-la-cop31-incluant-une-transition-claire-hors-des-energies-fossiles_8292470.html)
- [DW](https://www.dw.com/en/at-cop31-conflict-over-climate-science-slows-action-on-global-warming/a-80004894)

Have a good evening, and if you count primes to fall asleep, rest assured Riemann is still watching over the flock.
