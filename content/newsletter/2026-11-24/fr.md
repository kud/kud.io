---
title: "Newsletter · 24 novembre 2026"
date: "2026-11-24"
lang: "fr"
lede: "Ce soir, on regarde ce que font des agents d’IA quand on leur confie un piratage avec une seule consigne, d’après deux enquêtes d’Amazon et de Palo Alto Networks. Ensuite, un satellite nucléaire russe dont parle la presse allemande, Tidal contre la musique générée par IA et le report européen sur le méthane importé. On explique aussi le « Code Mode » des agents, avant quatre trouvailles, dont une montre mécanique à faire tourner du doigt."
generatedAt: "2026-11-24T18:37:00.000+00:00"
readingMinutes: 11
wordCount: 2287
---

Ce soir, on regarde ce que font des agents d’IA quand on leur confie un piratage avec une seule consigne, d’après deux enquêtes d’Amazon et de Palo Alto Networks. Ensuite, un satellite nucléaire russe dont parle la presse allemande, Tidal contre la musique générée par IA et le report européen sur le méthane importé. On explique aussi le « Code Mode » des agents, avant quatre trouvailles, dont une montre mécanique à faire tourner du doigt.

## Le sujet du jour

### 01 · CYBERSÉCURITÉ · Des agents d’IA qui piratent seuls : ce que montrent les journaux d’une campagne {#item-01}

**Le concept.** Un « agent » d’IA est un modèle de langage branché sur des outils : il planifie une tâche, l’exécute par étapes, lit les résultats et décide de la suite. Cairn est un cadriciel open source qui orchestre plusieurs de ces agents, conçu pour les tests d’intrusion défensifs : on lui donne une cible et un objectif en langage courant, il se débrouille. Vendredi 20 novembre, l’équipe de renseignement sur les menaces d’Amazon a publié l’analyse d’une instance de Cairn laissée en ligne sans authentification, ce qui a exposé tout son historique : consignes, configurations et sorties des modèles. Les consignes étaient rédigées en chinois simplifié et Amazon attribue l’opération, avec une confiance qu’il qualifie de modérée, à un acteur lié à la Chine. L’objectif donné aux agents tenait en trois mots : « obtenir un shell », c’est-à-dire un accès en ligne de commande au serveur visé.

Les résultats sont contrastés. Contre une base de données Redis d’une université, les agents ont enchaîné 148 actions pendant environ seize heures, sans succès. Contre un serveur de calcul, ils ont reconstitué environ 80 noms d’utilisateurs réels à partir de pages publiques et testé plus de 30 000 combinaisons d’identifiants, sans succès non plus. Mais face à une application open source d’imagerie médicale, ils ont trouvé en onze minutes une faille de type « path traversal » (un nom de fichier piégé qui permet d’écrire hors du dossier prévu), puis s’en sont servis pour obtenir un accès administrateur. Amazon estime « avec une confiance élevée » qu’il s’agissait d’une faille inconnue jusque-là, une « zero-day » : aucun correctif ni signalement n’existait. Les mainteneurs, prévenus, ont publié un correctif.

**Les dates clés**

- **Août-septembre 2026** : selon Unit 42, l’équipe de recherche de Palo Alto Networks, des attaquants sinophones utilisent Cairn avec les modèles chinois Zhipu GLM et DeepSeek pour 25 opérations contre au moins 19 organisations (semi-conducteurs, défense, société civile) ; dix sont compromises.
- **8-10 septembre 2026** : la campagne observée par Amazon vise des universités d’Asie de l’Est, hors Chine continentale, puis Amazon découvre l’instance exposée.
- **Octobre 2026** : d’après 404 Media, l’auteur d’ARTEX, un autre outil open source de piratage par agents, le retire de GitHub ; il circule toujours.
- **20 novembre 2026** : publication du rapport d’Amazon.

**Le saviez-vous ?** Pour passer de l’écriture de fichier à l’exécution de code, les agents ont déposé leur charge dans le module « sitecustomize », un fichier que Python importe automatiquement à chaque démarrage, puis ont déclenché un nouveau processus Python via l’interface d’entraînement de l’application.

Ce qui est en jeu n’est pas une IA qui inventerait des attaques inédites : Unit 42 souligne que les failles exploitées dans sa campagne étaient connues et que l’IA autonome « augmente le volume et la couverture de l’exploitation, pas sa complexité ». Le changement porte sur l’échelle et le tempo : une seule personne, ou une petite équipe selon Unit 42, peut lancer des intrusions simultanées contre une vingtaine de cibles, et un agent qui exploite une faille en quelques minutes va plus vite qu’un centre de sécurité qui trie ses alertes à la main. Pour ces attaques, Unit 42 décrit un contournement des garde-fous des modèles qui tient en une phrase ajoutée aux consignes, affirmant que les tests sont autorisés. Les chiffres reposent sur des journaux reconstitués par deux entreprises qui vendent aussi des services de sécurité, et les victimes ne sont pas nommées, ce qui interdit toute vérification extérieure. La défense, elle, reste classique : correctifs, surface d’exposition réduite, identifiants protégés.

**Pour aller plus loin** : le rapport d’Unit 42 détaille la boucle « raisonner, puis agir » de Cairn et les étapes de chaque opération.

Sources :

- [Amazon · AWS Security Blog](https://aws.amazon.com/blogs/security/chinese-nexus-actors-cairn-ai-agents-found-a-zero-day-on-their-own/)
- [Unit 42 · Palo Alto Networks](https://unit42.paloaltonetworks.com/cairn-framework-ai-autonomous-attacks/)
- [Ars Technica](https://arstechnica.com/security/2026/11/amazon-says-hackers-ai-agents-found-and-exploited-0-day-with-little-human-input/)
- [404 Media](https://www.404media.co/the-code-is-already-copied-everywhere-the-ai-hacking-tool-causing-havoc-around-the-world-artex-github/)

## L’essentiel

### 02 · ESPACE · Un satellite nucléaire russe ? L’Otan prend au sérieux des informations allemandes {#item-02}

Lundi 23 novembre, la _Süddeutsche Zeitung_ et les radios-télévisions publiques NDR et WDR ont rapporté, en citant des sources militaires et du renseignement allemands non nommées, que la Russie préparait le lancement d’un satellite équipé d’une charge nucléaire, baptisé « Spoutnik-S ». Selon ces médias, cités par la BBC, des rapports évoquant un lancement possible dans les soixante jours ont circulé ce mois-ci entre pays de l’Otan, sans que l’on sache quel pays les a rédigés. Le chancelier allemand Friedrich Merz n’a ni confirmé ni démenti, jugeant ces informations « pas nouvelles, mais pas moins choquantes ». Le secrétaire général de l’Otan, Mark Rutte, a promis de défendre « chaque centimètre » du territoire de l’Alliance, espace compris. Le Kremlin a jugé ces récits anonymes peu dignes d’intérêt et l’ambassade russe à Berlin parle d’« allégations infondées ». Le traité de l’espace de 1967, que la Russie a signé, interdit les armes de destruction massive en orbite. Une explosion nucléaire en orbite basse frapperait sans distinction : lors des essais américains et soviétiques de 1961-1962, une explosion américaine a provoqué une vaste coupure de courant à Hawaï. Le chercheur Bleddyn Bowen rappelle à la BBC qu’il y a aujourd’hui plus de 15 000 satellites actifs, dont ceux de la Russie elle-même.

Sources :

- [BBC News](https://www.bbc.co.uk/news/articles/c9x2er1ry2mzo)
- [franceinfo](https://www.franceinfo.fr/societe/armee-securite-defense/nucleaire-militaire/la-russie-soupconnee-de-vouloir-placer-une-arme-nucleaire-dans-l-espace_8297916.html)

### 03 · MUSIQUE · Tidal va supprimer la musique entièrement générée par IA {#item-03}

Le service de streaming musical Tidal a annoncé qu’à partir du 9 décembre, il n’accepterait plus les morceaux entièrement générés par IA et supprimerait ceux qu’il héberge. Selon Ars Technica, 27 millions de titres sont étiquetés comme IA sur la plateforme, soit 6,3 % du catalogue ; The Verge, citant le responsable musique de Tidal, Robert Andersen, évoque environ 29 millions de suppressions et 80 000 à 85 000 envois rejetés par jour. Tidal justifie la mesure par l’ampleur du flux : 43 % des nouveaux titres reçus en 90 jours étaient entièrement générés, et 96 % des morceaux étiquetés IA n’ont eu aucune écoute sur cette période. Le problème n’est pas seulement esthétique : ces titres détournent une partie des écoutes et des droits versés aux artistes, et Tidal dit avoir déjà retiré environ 66 000 morceaux qui usurpaient l’identité d’artistes. La musique composée avec l’aide d’outils d’IA reste autorisée tant que l’IA n’en est pas l’unique auteur. La détection reposera, selon The Verge, sur l’outil Ircam Amplify et des contrôles de métadonnées ; Ars Technica souligne que des modèles locaux sans filigrane y échapperont en partie. Bandcamp avait déjà banni la musique générée par IA cette année ; Spotify, Deezer ou YouTube préfèrent l’étiquetage ou le filtrage.

Sources :

- [The Verge](https://www.theverge.com/entertainment/1041362/tidal-ai-music-ban)
- [Ars Technica](https://arstechnica.com/ai/2026/11/tidal-will-ban-fully-ai-generated-music-on-december-9/)

### 04 · CLIMAT · Méthane importé : l’Europe repousse ses contrôles à 2029 {#item-04}

Dans la nuit du 19 novembre, les gouvernements de l’UE et le Parlement européen se sont accordés provisoirement pour repousser de deux ans les obligations du règlement européen sur le méthane qui visent les importateurs de pétrole, de gaz et de charbon : elles s’appliqueront au 1er janvier 2029 au lieu du 1er janvier 2027. La déclaration de « l’intensité méthane » des combustibles vendus dans l’UE glisse, elle, au 5 août 2030. Le compromis se situe entre la Commission et les États, qui voulaient un an, et le Parlement, qui avait voté trois ans en octobre ; l’accord doit encore être formellement adopté par les deux institutions. Le méthane, qui s’échappe des puits, des gazoducs et des mines, réchauffe environ 80 fois plus que le CO₂ sur vingt ans, mais ne reste qu’une douzaine d’années dans l’atmosphère : le réduire agit vite. Les gouvernements invoquent les risques d’approvisionnement et la flambée des prix après les perturbations des livraisons du Golfe. L’ONG Environmental Defense Fund estime que le report laissera fuir 24 milliards de mètres cubes de méthane. Un nouveau report exigerait une nouvelle loi ; la Commission fera un bilan début 2028.

Sources :

- [EUobserver](https://euobserver.com/250022/eu-gives-oil-and-gas-importers-until-2029-on-methane-checks-rules-out-more-delay/)
- [The Conversation France](https://theconversation.com/leurope-reporte-le-controle-des-emissions-de-methane-de-ses-importations-au-risque-de-ne-pas-tenir-ses-promesses-climatiques-296607)

## C’est quoi ?

### 05 · Le « Code Mode » des agents d’IA {#item-05}

**Pourquoi c’est intéressant.** Les agents d’IA se connectent de plus en plus à des dizaines d’outils : un calendrier, une base de données, une API (interface de programmation). La façon dont ils les appellent détermine leur coût, leur vitesse et ce qu’on peut leur confier.

**En quoi ça consiste.** Dans l’appel d’outils classique, le modèle demande une opération, attend le résultat, le relit, puis demande la suivante : chaque résultat intermédiaire passe par sa « fenêtre de contexte », la mémoire de travail qu’il facture en jetons. Le Code Mode, décrit par Cloudflare en septembre 2025 et désormais documenté dans son kit pour agents, inverse la logique : les outils sont présentés comme une bibliothèque de fonctions typées, et le modèle écrit un petit programme qui les appelle, enchaîne, filtre et boucle, exécuté dans un bac à sable isolé. Seul le résultat final revient au modèle. Exemple : pour trouver les dix clients dont les factures sont en retard, plutôt que de lire mille factures une à une, l’agent écrit une boucle qui les filtre et ne lit que la liste. Anthropic a décrit la même idée pour le protocole MCP, le standard qui relie les agents à leurs outils. Limites : Cloudflare présente la fonction comme expérimentale, susceptible de changer, et la juge superflue pour une tâche simple à quelques outils ; exécuter du code généré suppose aussi un bac à sable bien fermé.

Sources :

- [Cloudflare · documentation Agents](https://developers.cloudflare.com/agents/tools/codemode/)
- [Cloudflare Blog](https://blog.cloudflare.com/code-mode/)
- [Anthropic](https://www.anthropic.com/research/code-execution-with-mcp)

## Technologie & science

### 06 · PALÉOANTHROPOLOGIE · Homo erectus a vécu bien plus tard en Chine, et en forêt tropicale {#item-06}

Des travaux publiés dans la revue _Nature_ décrivent neuf dents d’hominines trouvées dans les grottes de Baxian et Naxian, dans le Guangxi, au sud de la Chine, datées d’entre 324 000 et 184 000 ans. Huit sont attribuées à Homo erectus, l’espèce apparue il y a environ deux millions d’années et la première à quitter l’Afrique. Sur le continent asiatique, on la croyait disparue vers 400 000 ans. L’ADN ne survit pas si longtemps sous ce climat chaud et humide, mais les protéines de l’émail, oui : leurs séquences ont permis l’attribution. Les isotopes de l’émail indiquent un mode de vie en forêt tropicale dense, un milieu qu’on pensait réservé à notre espèce. La neuvième dent ne correspond pas à Homo erectus ; elle pourrait appartenir à un Dénisovien, mais ses protéines ne correspondent exactement à aucune séquence connue, et les chercheurs restent prudents.

Sources :

- [Ars Technica](https://arstechnica.com/science/2026/11/homo-erectus-lived-in-the-rainforest-alongside-denisovans/)
- [EurekAlert! · Université de Copenhague](https://www.eurekalert.org/news-releases/1152475)

### 07 · WEB · Firefox 161 apporte le hasard dans les CSS {#item-07}

Firefox 161, sorti mardi 24 novembre, prend en charge la fonction CSS random(), qui tire une valeur aléatoire dans un intervalle, avec un pas optionnel, là où les fonctions mathématiques sont permises : de quoi décaler des étoiles ou varier des rotations sans JavaScript. Il ajoute aussi le CSS Typed Object Model, qui permet aux scripts de lire et d’écrire des valeurs CSS comme des objets typés plutôt que des chaînes de caractères (sans les couleurs, pour l’instant). Côté utilisateur : un raccourci configurable pour copier l’adresse de l’onglet, le retour du thème Proton parmi des thèmes « classiques », et un VPN intégré activable site par site.

Sources :

- [Firefox · notes de version 161.0](https://www.firefox.com/en-US/firefox/161.0/releasenotes/)

## En bref

- La Cour de cassation a rejeté mardi le pourvoi d’Éric Zemmour, désormais définitivement condamné pour « contestation de crime contre l’humanité » après avoir affirmé que Pétain « avait sauvé les juifs français » ([franceinfo](https://www.franceinfo.fr/politique/eric-zemmour/eric-zemmour-definitivement-condamne-pour-contestation-de-l-existence-de-crime-contre-l-humanite-apres-avoir-affirme-que-le-marechal-petain-avait-sauve-les-juifs-francais_8297988.html)).
- Selon France Télévisions, qui cite une source proche du dossier, Nicolas Sarkozy et Carla Bruni sont renvoyés devant le tribunal correctionnel dans l’affaire de la fausse rétractation de Ziad Takieddine, avec un procès prévu fin 2027 ([franceinfo](https://www.franceinfo.fr/societe/justice/nicolas-sarkozy-et-carla-bruni-sont-renvoyes-en-proces-dans-l-affaire-de-la-fausse-retractation-de-ziad-takieddine-notamment-pour-association-de-malfaiteurs_8297655.html)).
- La cour d’appel de Versailles a confirmé le renvoi devant les assises, pour meurtre, du policier qui a tué Nahel Merzouk à Nanterre en juin 2023 ; son avocat dénonce « un manque de courage judiciaire » ([franceinfo](https://www.franceinfo.fr/faits-divers/adolescent-tue-par-un-policier-a-nanterre/la-mere-de-nahel-merzouk-se-dit-soulagee-et-contente-alors-que-la-justice-confirme-en-appel-le-renvoi-du-policier-pour-meurtre_8297925.html)).
- Le département américain du Commerce a inscrit la société singapourienne Megaspeed et ses filiales en Malaisie et en Thaïlande sur sa liste noire commerciale, en invoquant un risque de détournement de puces d’IA avancées ([The Verge](https://www.theverge.com/policy/1041270/nvidia-megaspeed-commerce-dept-entity-list)).

## Ça vaut un clic

### 08 · La folie a-t-elle un passeport ? {#item-08}

Dans un essai d’Aeon finaliste du premier prix de philosophie de la revue, Alexander Pereira demande si les troubles mentaux sont universels. Son point de départ : à Hong Kong, avant 1994, les femmes anorexiques que suivait le psychiatre Sing Lee ne disaient presque jamais craindre de grossir ; en 2007, plus des trois quarts invoquaient cette peur. Sa thèse, le « façonnement profond », va plus loin que l’idée que la culture colore l’expression d’un trouble : dans certains cas, elle pourrait en modifier les mécanismes mêmes, parce que le cerveau est plastique. Il le présente comme une hypothèse à tester, pas comme un résultat.

Sources :

- [Aeon](https://aeon.co/essays/are-mental-illnesses-universal-or-are-they-culturally-specific)

### 09 · Des places comme des pièces à vivre {#item-09}

En 1889, l’architecte autrichien Camillo Sitte publiait _L’Art de bâtir les villes_, un manifeste contre les grilles répétitives et les boulevards interminables. Works in Progress résume ses principes : des places petites et fermées, comme des « pièces à ciel ouvert », des monuments poussés en bordure plutôt qu’au centre, des bâtiments publics imbriqués dans l’habitat ordinaire. Une lecture stimulante pour comprendre pourquoi une rue d’Osaka peut charmer autant qu’une ruelle de Bruges, même si l’article défend un point de vue plus qu’il ne le démontre.

Sources :

- [Works in Progress](https://www.worksinprogress.news/p/how-to-make-a-lovable-city)

### 10 · Une montre à démonter du bout du doigt {#item-10}

Une page explique pièce par pièce le fonctionnement d’une montre mécanique, en commençant par le spiral, inventé par Christiaan Huygens en 1675, qui bat la mesure. Chaque schéma est un modèle 3D qu’on fait pivoter pour voir les engrenages de profil. Elle se présente comme une introduction plus simple à la page de Bartosz Ciechanowski sur le même sujet.

Sources :

- [How a Mechanical Watch Keeps Time](https://martincmartin.github.io/slidev-stem/watches/article/1/)

### 11 · Deux frères, un canal pollué et la mafia russe {#item-11}

_Paper Tiger_, de James Gray, présenté en compétition à Cannes en 2026, suit Irwin (Miles Teller), un père de famille ingénieur, que son frère aîné Gary (Adam Driver) entraîne dans un projet immobilier au bord d’un canal pollué, contrôlé par des mafieux russes. Sight and Sound y voit un drame criminel à hauteur d’homme, dans la veine de _Little Odessa_ et de _The Yards_, où personne ne règle ses problèmes à coups de fusil. Un film de tension plus que d’action.

Sources :

- [BFI · Sight and Sound](https://www.bfi.org.uk/sight-and-sound/reviews/paper-tiger-adam-driver-brings-dangerous-charm-james-grays-tense-crime-thriller)

Bonne soirée, et à demain.
