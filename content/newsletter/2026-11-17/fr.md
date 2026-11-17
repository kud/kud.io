---
title: "Newsletter · 17 novembre 2026"
date: "2026-11-17"
lang: "fr"
lede: "Ce soir, on démonte l’attaque qui a transformé lundi les sites de la BBC, de Zoom ou d’IKEA en distributeurs de code malveillant, sans que ces entreprises aient touché à leur propre code. Puis la grève des fonctionnaires, une COP31 qui se tend et la CNIL qui sanctionne des collectivités mal protégées, avant d’expliquer ce qu’est le budget carbone. Côté technique, PostgreSQL, Node.js, C++26 et des poissons des grands fonds ; et sept trouvailles, de l’histoire de l’égalité aux bus de San Francisco."
generatedAt: "2026-11-17T18:46:00.000+00:00"
readingMinutes: 15
wordCount: 3086
---

Ce soir, on démonte l’attaque qui a transformé lundi les sites de la BBC, de Zoom ou d’IKEA en distributeurs de code malveillant, sans que ces entreprises aient touché à leur propre code. Puis la grève des fonctionnaires, une COP31 qui se tend et la CNIL qui sanctionne des collectivités mal protégées, avant d’expliquer ce qu’est le budget carbone. Côté technique, PostgreSQL, Node.js, C++26 et des poissons des grands fonds ; et sept trouvailles, de l’histoire de l’égalité aux bus de San Francisco.

## Le sujet du jour

### 01 · SÉCURITÉ · OPTIMJACK : quand un script tiers trahit 178 sites {#item-01}

Lundi 16 novembre, des sites parmi les plus visités du Web ont servi du code malveillant à leurs visiteurs. Le chercheur Scott Helme, de la société Report URI, l’a trouvé dans 188 des 1 611 extraits de code Optimizely qu’il a examinés, chez au moins 178 organisations : BBC, CNN, Zoom, IKEA, Salesforce, GitLab, HSBC ou Air France-KLM. Optimizely vend un outil de tests A/B, qui montre des variantes d’une page à différents visiteurs pour mesurer laquelle fonctionne le mieux. Report URI n’a examiné qu’une partie des clients : le nombre réel de sites touchés est probablement plus élevé.

**Le concept**

Pour faire tourner ses expériences, un site insère un script hébergé par Optimizely. Ce script s’exécute dans la page avec les mêmes droits que le code du site lui-même : il peut lire ce que l’on tape, modifier l’affichage, envoyer des données ailleurs. Optimizely propose en outre un champ « Project JavaScript », où chaque client ajoute son propre code, exécuté sur toutes ses pages. C’est là que l’attaquant a écrit. Le fichier était ensuite servi normalement par le réseau de diffusion (CDN) d’Optimizely, avec son certificat : le CDN n’a pas été piraté, il « a servi exactement ce qu’on lui a donné », résume la société StepSecurity. Selon Optimizely, cité par The Register, « une partie non autorisée a exploité une vulnérabilité » ; un porte-parole a situé la faille dans le processus d’inscription. L’entreprise dit l’avoir corrigée et avoir retiré le code injecté, mais n’a pas expliqué comment l’attaquant a pu écrire dans des projets de clients sans lien entre eux.

Le code a été modifié 26 fois dans la journée, selon Report URI. Il remplaçait les adresses de portefeuilles de cryptomonnaies par celles de l’attaquant, y compris dans le presse-papiers ; à partir de 13 h 43 UTC, il capturait aussi les numéros de carte saisis dans les formulaires des sites. Il tentait enfin de charger des kits d’exploitation visant les iPhone et iPad aux versions d’iOS anciennes. Les champs de paiement affichés dans le cadre séparé d’un prestataire (une iframe d’une autre origine) restaient hors de portée, précise StepSecurity. Lundi soir, Report URI avait tracé environ 7 000 dollars de cryptomonnaies vers les portefeuilles de l’attaquant ; on ignore combien de cartes et d’appareils ont été touchés.

**Les dates clés**

- **16 novembre, 4 h 21 UTC** · Première injection observée, dans le script de la BBC.
- **16 novembre, 13 h 43 UTC** · Ajout du voleur de cartes bancaires.
- **16 novembre, 21 h 52 UTC** · Un seul extrait reste infecté, celui de TalkTalk.
- **17 novembre** · Le domaine qui servait le code malveillant est suspendu par son registre.

**Le saviez-vous ?**

Une protection existait. La politique de sécurité du contenu (CSP) est une liste que le site donne au navigateur pour dire d’où les scripts ont le droit de venir et où ils peuvent envoyer des données. Parmi les organisations touchées dont Report URI a analysé la CSP, 24 ont bloqué le code malveillant grâce à une liste d’origines restrictive ; les politiques qui autorisaient `eval` ou le mode `strict-dynamic` l’ont laissé passer. Le problème est structurel : un site moderne délègue une part de son code à des fournisseurs, et ni la revue de code ni l’analyse du dépôt ne voient ce qui est hébergé ailleurs, relève StepSecurity.

**Pour aller plus loin**

Le récit minute par minute de Report URI, avec ses recommandations pour les clients d’Optimizely et pour les visiteurs : mettre à jour iOS, vérifier une adresse de portefeuille avant tout envoi, surveiller ses relevés bancaires.

Sources :

- [Report URI](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/)
- [StepSecurity](https://www.stepsecurity.io/blog/optimjack-optimizely-hosted-scripts-crypto-clipper-card-skimmer)
- [The Register](https://www.theregister.com/cyber-crime/2026/11/17/optimizely-hack-turns-worlds-biggest-websites-into-malware-dispensers/5310448)

## L’essentiel

### 02 · SOCIAL · Grève des fonctionnaires : moins de grévistes, une bataille de chiffres {#item-02}

Mardi 17 novembre, la journée de grève et de manifestations lancée par les syndicats de la fonction publique, rejoints par des organisations de lycéens et d’étudiants et par des salariés du privé, a réuni 146 000 personnes en France selon le ministère de l’Intérieur, dont 28 000 à Paris selon la préfecture de police. La CGT en revendique plus de 500 000, dont 175 000 à Paris. L’écart est saisissant à Marseille : 4 900 selon la préfecture, 80 000 selon la CGT. Les taux de grévistes, estimations partielles du ministère de l’Action et des Comptes publics, reculent : 2,59 % dans la fonction publique d’État contre près de 10 % le 5 novembre, 1,96 % dans la territoriale contre 4,60 %, et 3,93 % à l’hôpital, comme le 5 novembre. Dans l’Éducation nationale, le ministère compte 3,76 % d’enseignants grévistes, le Snes-FSU 20 % à 10 h 30. Le cœur du conflit : avec la hausse du Smic (le salaire minimum) au 1er décembre, environ 1,1 million d’agents verraient leur traitement de base passer sous ce seuil, et quelque 660 000 resteraient payés sous le Smic, compensés par une indemnité qui ne compte pas pour la retraite, selon l’AFP citée par Sud Radio. Les syndicats jugent insuffisantes les mesures annoncées vendredi 13 novembre par le Premier ministre, Sébastien Lecornu. « Seule la réponse à nos revendications arrêtera la mobilisation », prévient Sophie Binet, secrétaire générale de la CGT.

Sources :

- [ICI](https://www.ici.fr/infos/economie-social/direct-mobilisation-du-17-novembre-suivez-la-nouvelle-journee-de-greve-et-de-manifestations-3379678)
- [Sud Radio · AFP](https://www.sudradio.fr/societe/fonctionnaires-jeunesse-salaries-du-prive-une-colere-qui-converge-malgre-des-corteges-moins-fournis)

### 03 · CLIMAT · COP31 : l’Union européenne veut revoir le projet d’accord {#item-03}

Au lendemain de la publication du premier projet de « décision chapeau » de la COP31, la conférence de l’ONU sur le climat réunie à Antalya, en Turquie, les positions se sont durcies mardi 17 novembre. Wopke Hoekstra, qui négocie pour l’Union européenne, estime que le texte a « beaucoup des caractéristiques d’une liste de courses », qu’il « ne va pas dans la bonne direction et doit être profondément modifié », rapporte l’AFP. Selon Reuters, le projet de 18 pages laisse deux options sur les combustibles fossiles : la formule adoptée en 2023 sur une « transition » hors des fossiles, ou une référence plus forte à leur « sortie » ; les deux pourraient disparaître du texte final. Il appelle aussi les pays riches à la neutralité carbone dès 2030, un objectif que certains jugent irréaliste. Un autre front s’est ouvert sur le calendrier du GIEC (Groupe d’experts intergouvernemental sur l’évolution du climat) : des dizaines de pays européens, africains et du Pacifique veulent ses prochains rapports avant le bilan mondial de 2028, tandis que l’Arabie saoudite et l’Inde sont accusées de pousser à repousser le septième rapport à 2029. Ilana Seid, présidente de l’Alliance des petits États insulaires (AOSIS), juge un tel retard « injustifiable » ; la délégation saoudienne dit défendre des délais qui permettent un « examen scientifique suffisant ». Pourquoi c’est important : à la COP, chaque décision exige le consensus, et un seul pays peut bloquer. Les négociations doivent s’achever vendredi 20 novembre.

Sources :

- [Arab News · AFP](https://www.arabnews.pk/middle-east/tensions-rise-over-cop31-draft-deal-3007317)
- [Reuters · WHBL](https://whbl.com/2026/11/16/first-draft-of-cop31-deal-signals-tough-negotiations-to-come/)

### 04 · DONNÉES · La CNIL sanctionne dix collectivités mal protégées {#item-04}

La CNIL (Commission nationale de l’informatique et des libertés, l’autorité française de protection des données personnelles) a annoncé le 9 novembre dix sanctions visant des collectivités territoriales et un établissement public, avec des amendes de 3 000 à 20 000 euros, le maximum prévu par la procédure simplifiée. Les manquements relèvent surtout de l’article 32 du RGPD (règlement général sur la protection des données), qui impose de sécuriser les données : pas d’authentification multifacteur pour les administrateurs, prestataires disposant d’un accès permanent au réseau ou de comptes partagés, journaux incomplets ou jamais relus, réseau mal cloisonné, serveurs sous des systèmes qui ne reçoivent plus de correctifs, mots de passe faibles ou envoyés en clair. Plusieurs collectivités avaient déjà subi des fuites que la CNIL juge évitables. D’autres ont installé de la vidéosurveillance sur la voie publique sans analyse d’impact préalable, obligatoire pour ce que la CNIL qualifie de « surveillance systématique à grande échelle d’une zone accessible au public ». Pour fixer les montants, l’autorité dit avoir tenu compte notamment du budget de chaque collectivité et de la sensibilité des données, comme celles de mineurs ou les coordonnées bancaires. Pourquoi c’est notable : la liste se lit comme une check-list d’hygiène informatique de base, appliquée à des services publics qui détiennent beaucoup de données sur leurs habitants.

Sources :

- [CNIL](https://www.cnil.fr/fr/sanctions-cybersecurite-collectivites-territoriales)

## C’est quoi ?

### 05 · Le budget carbone restant {#item-05}

**Pourquoi on en parle.** Le 10 novembre, le Global Carbon Project, un consortium international de chercheurs dirigé par Pierre Friedlingstein, de l’université d’Exeter, a publié son bilan annuel : les émissions de CO2 d’origine fossile devraient baisser de 0,4 % en 2026, à 38,2 milliards de tonnes, mais les émissions totales, déforestation comprise, atteindre 43,3 milliards de tonnes, contre 42,8 en 2025. Le budget restant pour limiter le réchauffement à 1,5 °C serait de 150 milliards de tonnes, soit moins de quatre ans au rythme actuel. La baisse du pétrole (−1,9 %) tient en partie au choc énergétique lié au conflit iranien, ce qui n’est « pas une solution climatique durable », prévient Pierre Friedlingstein.

**En quoi ça consiste.** Le réchauffement dépend, à peu près proportionnellement, de la quantité totale de CO2 accumulée par les activités humaines. On peut donc calculer combien il reste à émettre avant d’atteindre un seuil, comme le solde d’un compte. Ce n’est pas un chiffre unique : il varie selon la probabilité choisie de rester sous le seuil (une chance sur deux donne un budget plus large que deux chances sur trois), selon le jeu de données de température utilisé et selon l’évolution des autres gaz, comme le méthane, explique Carbon Brief. Exemple : à environ 43 milliards de tonnes par an, un solde de 150 milliards se vide en trois ans et demi. Et les puits naturels faiblissent : terres et océans ont absorbé 49 % des émissions humaines sur la dernière décennie, mais le puits terrestre est 19 % plus faible qu’il ne l’aurait été sans changement climatique, selon le même bilan, publié en prépublication dans la revue Earth System Science Data avant relecture par les pairs.

Sources :

- [Université LMU de Munich](https://www.lmu.de/en/newsroom/news-overview/news/fossil-co2-emissions-set-to-fall-slightly-in-2026-25d47770.html)
- [Université d’Exeter · ScienceDaily](https://sciencedaily.com/releases/2026/11/261109205358.htm)
- [Carbon Brief](https://www.carbonbrief.org/analysis-how-much-carbon-budget-is-left-to-limit-global-warming-to-1-5c/)

## Technologie & science

### 06 · BASES DE DONNÉES · PostgreSQL : une mise à jour mineure qui demande du travail {#item-06}

Le 12 novembre, PostgreSQL a publié des versions correctives pour ses branches maintenues, dont la 18.7. Ses notes de version listent une cinquantaine d’identifiants CVE (le registre public des failles) : contournement de la sécurité au niveau des lignes via `INSERT … ON CONFLICT` sur une vue, détournement d’objets pendant un `CREATE EXTENSION`, injections SQL dans les outils `reindexdb`, `vacuumdb` et `pg_dump`, nombreuses erreurs mémoire. Aucun dump/restore n’est nécessaire depuis une 18.x, mais plusieurs bugs pouvaient corrompre des index : les notes demandent un `REINDEX` des index btree sur des colonnes `bpchar` sans longueur et des index `gist_trgm_ops`. Les sauvegardes incrémentales existantes ne doivent plus être considérées comme fiables : il faut refaire une sauvegarde complète après la mise à jour. Les extensions écrites en C qui manipulent des types composites doivent être recompilées, et certaines modifiées. Pourquoi c’est notable : une version dite mineure qui mérite une vraie fenêtre de maintenance, pas un simple redémarrage.

Sources :

- [PostgreSQL · notes de version 18.7](https://www.postgresql.org/docs/release/18.7/)

### 07 · JAVASCRIPT · Node.js corrige seize failles, surtout dans HTTP/2 et TLS {#item-07}

Node.js 26.13.1, version à support long (LTS) baptisée « Lithium », publiée le 11 novembre, est une mise à jour de sécurité : seize failles, dont sept jugées élevées, six moyennes et trois faibles. La plupart touchent les modules `http2` et `tls`. L’une d’elles, CVE-2026-126051, permettait à un client distant de faire planter un serveur TLS. La version met aussi à jour des dépendances embarquées, dont undici, le client HTTP de Node, et llhttp, son analyseur de requêtes. Pourquoi c’est notable : tout serveur Node exposé en HTTPS ou HTTP/2 est concerné, et une faille qui fait tomber un serveur à distance ne demande pas d’accès particulier pour être exploitée.

Sources :

- [Node.js · notes de version 26.13.1](https://nodejs.org/en/blog/release/v26.13.1)

### 08 · LANGAGES · C++26 bute sur les contrats {#item-08}

Le projet de norme internationale C++26 a été rejeté en octobre lors du vote des organismes nationaux de normalisation, avant-dernière étape de l’ISO (l’Organisation internationale de normalisation) : neuf votes négatifs, au-delà du plafond de 25 % fixé par l’ISO, selon The Register et le blog Mond. En cause, les « contrats » (proposition P2900) : des préconditions, postconditions et assertions qui permettent de déclarer ce qu’une fonction attend et garantit, pour attraper des erreurs avant qu’elles ne mènent à un comportement indéfini. Le comité les avait adoptés, mais Bjarne Stroustrup, le créateur du langage, y voit avec ses coauteurs « une menace existentielle pour C++ », rapporte The Register. Pour Harry Bott, de la C++ Alliance, ce renvoi est au contraire « le processus qui fonctionne comme prévu ». Le groupe de travail WG21 se réunit du 16 au 21 novembre à Búzios, au Brésil, avec trois pistes : retirer les contrats, les isoler dans une spécification technique séparée, ou revoter un texte légèrement revu. Si la norme glisse à l’an prochain, elle s’appellera ISO/IEC 14882:2027.

Sources :

- [The Register](https://www.theregister.com/devops/2026/11/13/c26-stumbles-at-finish-line-over-contracts-dispute/5309526)
- [Mond’s Blog](https://buttondown.com/mond/archive/mond-for-the-first-time-a-c-standard-failed-to/)

### 09 · OCÉANS · Les espèces des grands fonds, plus fragiles qu’on ne le pensait {#item-09}

Une étude publiée le 12 novembre dans Nature Communications a suivi l’ADN de cinq espèces des profondeurs du golfe du Mexique, trois poissons-lanternes et deux crevettes, à partir de 486 spécimens prélevés entre 2011 et 2023 à plusieurs centaines de mètres de profondeur. Le poisson-lanterne _Diaphus dumerilii_ a perdu environ 8 % de sa diversité génétique en douze ans. Les cinq espèces présentent une petite « taille efficace de population » : peu d’individus transmettent réellement leurs gènes, ce qui ne veut pas dire qu’ils sont peu nombreux. Or la diversité génétique est la réserve de variations qui permet de s’adapter. Des modèles climatiques projettent, pour quatre espèces, une perte allant jusqu’à 70 % de leur habitat favorable dans le golfe d’ici 2050 ou 2100. « Cela remet en question l’idée que les espèces des grands fonds seraient naturellement plus résistantes parce qu’elles occupent des environnements si vastes », dit l’auteur principal, Pedro Peres, de l’Université internationale de Floride (FIU). Limites : les auteurs n’attribuent pas ces pertes à la marée noire de Deepwater Horizon (2010), et les deux comptes rendus disponibles reprennent le communiqué de l’université.

Sources :

- [EurekAlert · FIU](https://www.eurekalert.org/news-releases/1151718)
- [Phys.org](https://phys.org/news/2026-11-genetic-reveal-hidden-extinction-deep.html)

## Ça vaut un clic

### 10 · L’égalité, ça se pratique {#item-10}

Dans un essai publié par Aeon le 9 novembre (en anglais), Teresa M. Bejan, professeure de théorie politique à Oxford, explique pourquoi le mot « égalité » nous divise : il a accumulé des sens différents (similitude, équilibre, indifférence, parité), et c’est justement cette ambiguïté qui lui a donné sa force politique. On y croise John Lilburne, qui refusa en 1646 de s’agenouiller et d’ôter son chapeau devant la Chambre des lords. Sa thèse : l’égalité « n’est pas d’abord une idée à laquelle croire », mais une pratique, entretenue par des institutions comme le jury, où chacun doit agir en pair. Limite : une histoire très centrée sur l’Angleterre, et un remède esquissé plus que démontré.

Sources :

- [Aeon](https://aeon.co/essays/historical-ideas-of-equality-help-us-imagine-an-equal-world)

### 11 · Croire et penser, ce n’est pas la même chose {#item-11}

Le philosophe Neil Van Leeuwen et le juriste Jacob Eisler, tous deux à l’université d’État de Floride, défendent dans Aeon (3 novembre, en anglais) une idée surprenante : la séparation des Églises et de l’État repose sur une distinction psychologique. La croyance factuelle s’impose à nous et suit les preuves ; la « créance » religieuse, elle, se choisit, résiste aux preuves et se range dans un compartiment. Ils s’appuient sur l’ethnographie, sur des expériences montrant des comportements différents le dimanche, et sur des langues qui distinguent « croire » et « penser ». Limite : la thèse prolonge le livre de Van Leeuwen lui-même, et son passage au droit est rapide.

Sources :

- [Aeon](https://aeon.co/essays/the-psychology-of-separating-church-and-state)

### 12 · La révolte d’une génération {#item-12}

Dans Noema (12 novembre, en anglais), le journaliste John Last relie les mobilisations de jeunes en France et en Italie à une même cause : des générations plus âgées qui concentrent patrimoine et poids politique, pendant que les plus jeunes héritent d’emplois précaires, de logements inaccessibles et de services publics fragilisés. Il interroge politistes et philosophes, et met en garde contre le désespoir que les extrêmes savent exploiter. « Le désespoir est contagieux, et nous sommes en pleine pandémie », écrit-il. Limite : un cadrage générationnel large, qui gomme parfois les écarts de classe à l’intérieur d’une même génération.

Sources :

- [Noema](https://www.noemamag.com/a-generation-revolts)

### 13 · Un moniteur système qui sait se faire discret {#item-13}

ftop affiche, dans un unique panneau flottant redimensionnable, l’état d’un Mac à puce Apple : charge de chaque cœur, GPU, mémoire, réseau, consommation, température et applications les plus gourmandes. Il est pensé pour les moments de forte charge (modèles locaux, longues compilations) et ne montre que l’instant présent, sans historique. Libre (licence MIT), il consomme moins de 0,8 % d’un cœur, selon son auteur. Limites : macOS 15 minimum, puces Apple uniquement, et certaines mesures reposent sur des interfaces privées de macOS qui peuvent changer.

Sources :

- [ftop · GitHub](https://github.com/Nongfsq/ftop)

### 14 · Soixante-deux outils de développeur, sans connexion {#item-14}

DevTools rassemble dans une application de bureau 62 utilitaires du quotidien : visionneuse JSON, testeur d’expressions régulières, décodeur JWT et de certificats X.509, calculateur cron et CIDR, comparaison de textes, compteur de jetons et masquage des secrets et données personnelles avant d’envoyer un texte à une IA. Tout fonctionne hors ligne, sans compte, et le projet affirme n’embarquer aucune télémétrie. Libre (MIT), il tourne sur macOS, Windows et Linux. Pourquoi cliquer : remplacer une poignée de sites web à qui l’on colle parfois des jetons qui n’auraient jamais dû sortir de la machine.

Sources :

- [DevTools · GitHub](https://github.com/me-shaon/devtools)

### 15 · Trente expériences en trente jours {#item-15}

Chaque jour de novembre, le développeur connu sous le pseudonyme mrdoob, créateur de la bibliothèque 3D three.js, publie une expérience visuelle interactive sur un thème imposé : pliage, fonte, mousse, caustiques, labyrinthe… Le quinzième, « Mirage », vous fait traverser des dunes, à l’aube, en plein jour ou au coucher du soleil. Le dépôt décrit des expériences de « codage agentique », c’est-à-dire réalisées avec des agents d’IA, et le code est libre. Limite : il faut un navigateur compatible WebGPU, et une machine qui suit.

Sources :

- [(Vibe)Codevember 2026](https://mrdoob.github.io/codevember-2026/)
- [Code source · GitHub](https://github.com/mrdoob/codevember-2026)

### 16 · Les bus de San Francisco, version musée {#item-16}

Muni Gallery présente en 3D les publicités peintes sur les bus de San Francisco par des entreprises de la tech, de Cloudflare à Sentry en passant par Granola ou Ramp. On fait défiler les bus au clavier ou du doigt, on zoome sur chacun. Le site, réalisé par Luc Chaissac, précise n’avoir aucun lien avec la régie des transports de la ville. Pourquoi cliquer : un objet de design soigné, et un instantané de l’époque, quand des outils pour développeurs s’affichent en lettres géantes dans la rue.

Sources :

- [Muni Gallery](https://muni.gallery/)

## À surveiller

### 17 · BepiColombo arrive à Mercure, samedi 21 novembre {#item-17}

Après environ huit ans de voyage dans le Système solaire intérieur, la mission européano-japonaise BepiColombo (ESA et JAXA) doit s’insérer en orbite autour de Mercure samedi 21 novembre. À regarder : la réussite de la manœuvre, puis la séparation des deux orbiteurs, MPO et Mio, prévue les 9 et 10 décembre, avant une phase scientifique qui commence en avril 2027.

Sources :

- [ESA](https://www.esa.int/Science_Exploration/Space_Science/BepiColombo/Latest_updates_BepiColombo_s_arrival_at_Mercury)

### 18 · Le sort de C++26, d’ici samedi 21 novembre {#item-18}

La réunion du comité C++ à Búzios s’achève samedi. À regarder : si les contrats restent dans la norme, en sortent, ou si C++26 devient de fait C++27.

Sources :

- [Mond’s Blog](https://buttondown.com/mond/archive/mond-for-the-first-time-a-c-standard-failed-to/)

Bonne soirée, et à demain : d’ici là, Mercure n’aura plus que trois jours à attendre.
