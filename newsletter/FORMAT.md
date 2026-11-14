# Edition format

One Notion database row is one edition. The sync reads the row's properties
and its page body, and the validator rejects anything that does not follow
this structure exactly. Formatting freedom lives inside sections and items,
never in the skeleton.

## Properties

| Property       | Type           | Meaning                                                    |
| -------------- | -------------- | ---------------------------------------------------------- |
| `Name`         | title          | `Newsletter · YYYY-MM-DD`                                  |
| `Date`         | date           | The edition's date (Europe/London). One edition per date.  |
| `Status`       | select         | `Draft` → `Ready` → `Published`, or `Failed`               |
| `Generated at` | date with time | When the editor finished writing                           |
| `Published at` | date with time | Set by the publication workflow once the edition is live   |
| `Run`          | text           | Optional run identifier                                    |
| `Error`        | text           | Last publication error, short, without secrets             |

**Status is a hand-off, not a label.** The editor writes in `Draft` and moves
the row to `Ready` only once the edition is complete and checked. Only the
publication workflow sets `Published` (after the deployment is live) or
`Failed` (with `Error` filled in). A `Failed` edition is fixed in place and set
back to `Ready`.

## Body

Top-level blocks, in this order:

1. A heading 1, exactly `🇫🇷 Français`
2. The French rendition
3. A heading 1, exactly `🇬🇧 English`
4. The English rendition

Anything before the first heading 1 is ignored and never published. Keep it
empty.

### Sections

Each rendition is a sequence of heading 2 sections, only from this set and in
this order. Both languages carry the same sections. Only `overview` is
required. Nothing sits between the heading 1 and the first heading 2.

| Key         | French                | English              | Kind      |
| ----------- | --------------------- | -------------------- | --------- |
| `overview`  | L’essentiel du jour   | Today’s briefing     | narrative |
| `depth`     | Le sujet du jour      | Today’s focus        | items     |
| `brief`     | L’essentiel           | The essentials       | items     |
| `explainer` | C’est quoi ?          | Explainer            | items     |
| `analysis`  | Analyse               | Analysis             | narrative |
| `techsci`   | Technologie & science | Technology & science | items     |
| `timeline`  | Chronologie           | Timeline             | list      |
| `inbrief`   | En bref               | In brief             | list      |
| `finds`     | Ça vaut un clic       | Worth a click        | items     |
| `watch`     | À surveiller          | Watch next           | items     |
| `closing`   | Pour finir            | To close             | narrative |

Straight and curly apostrophes are both accepted in the headings. The
`overview` and `closing` headings are structural: the site shows the welcome
and the closing line without them.

### Narrative sections

- `overview` is the welcome: one paragraph, two at most. Links are optional.
- `analysis` holds paragraphs only (no headings, lists or quotes), with
  citations as inline links whose text is the source's short name
  (`Le Monde`, `Reuters`); the site renders them as ↗ citations.
- `closing` is one paragraph of one sentence, with no links.

Every link in `overview` or `analysis` must also appear among the sources of
some item in the same rendition: the narrative never carries provenance that
no selectable item carries.

### List sections

`timeline` and `inbrief` hold one bulleted list, one bullet per entry, each
with at least one link.

- `timeline` bullets start with an ISO date: `YYYY-MM-DD — event`.
- `inbrief` bullets are one sentence.

### Item sections

- **Items** are heading 3 blocks, either `NN · Title` or
  `NN · KICKER · Title`, where `NN` is two digits from `01` to `99` and
  `KICKER` a short uppercase topic (`CLIMAT` / `CLIMATE`). Stories in `brief`
  normally carry a kicker; kickers may differ between languages. Numbers run
  in ascending order through the whole rendition, across all item sections,
  without repeats, and the same number means the same subject in both
  languages. The separator is a space, a middle dot `·`, a space.
- **Item body**: paragraphs, bulleted or numbered lists and quotes. Bold,
  italic and links are fine. No images, tables, embeds, toggles, callouts or
  mentions of Notion pages or people.
  - A `depth` item uses bold paragraph labels, in this order where present:
    **Le concept** / **The idea**, **Les dates clés** / **Key dates** (then a
    bulleted list, each bullet starting with a bold year or date),
    **Le saviez-vous ?** / **Did you know?**, **Pour aller plus loin** /
    **Further reading**.
  - An `explainer` item opens two paragraphs with bold lead-ins:
    **Pourquoi on en parle.** / **Why it's in the news.** and
    **En quoi ça consiste.** / **What it is.**
  - Any item may end its body with a **Pour aller plus loin** / **Further
    reading** paragraph before its sources.
- **Item sources**: a paragraph that reads exactly `Sources:` (`Sources :` is
  also accepted in French), followed by a bulleted list. Each bullet holds
  exactly one link; the link text is the label (publication or document name).
  Sources are required for every item except in `watch`, where they are
  optional but checked when present.

### Parity

The validator compares the two renditions and rejects the edition unless they
have:

- the same sections in the same order;
- the same item numbers in the same order and the same sections;
- the same set of source URLs for each item;
- the same set of link URLs in each narrative and list section;
- the same number of timeline and in-brief bullets.

URLs are compared after normalising: lowercase host, no trailing slash, no
`utm_*`, `fbclid` or `gclid` parameters, order ignored. Labels and link texts
may differ.

## Example

```text
# 🇫🇷 Français

## L’essentiel du jour

Ce soir, on revient sur la décision du Conseil d’État sur les zones à faibles
émissions. Après le tour de l’actualité, on vous explique ce qu’est un puits
de carbone. Et trois trouvailles qui méritent un clic.

## L’essentiel

### 01 · CLIMAT · Le Conseil d’État valide le calendrier des ZFE

Le Conseil d’État, la plus haute juridiction administrative française, a
rejeté mardi 12 novembre le recours contre le calendrier des zones à faibles
émissions (ZFE), ces périmètres urbains interdits aux véhicules les plus
polluants. Selon la décision, …

Sources :
- [Conseil d’État · décision n° 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

## C’est quoi ?

### 02 · Un puits de carbone

**Pourquoi on en parle.** …

**En quoi ça consiste.** …

Sources :
- [Ademe](https://www.ademe.fr/…)

## Ça vaut un clic

### 03 · Des nuages à la carte

Sources :
- [Cloud Atlas](https://example.org/cloud-atlas)

## Pour finir

Bonne soirée, et à demain.

# 🇬🇧 English

## Today’s briefing

Tonight, we look at the French court ruling on low-emission zones. After the
day's news, we explain what a carbon sink is. And three finds worth a click.

## The essentials

### 01 · CLIMATE · France's top court upholds the low-emission zone timetable

The Conseil d'État, France's highest administrative court, on Tuesday
12 November rejected the challenge to the timetable for low-emission zones,
urban areas closed to the most polluting vehicles. According to the
ruling, …

Sources:
- [Conseil d'État · decision no. 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

## Explainer

### 02 · A carbon sink

**Why it's in the news.** …

**What it is.** …

Sources:
- [Ademe](https://www.ademe.fr/…)

## Worth a click

### 03 · Clouds, catalogued

Sources:
- [Cloud Atlas](https://example.org/cloud-atlas)

## To close

Have a good evening, and see you tomorrow.
```

(`#`, `##` and `###` stand for Notion's heading 1, 2 and 3 blocks. The
example's subjects and links are placeholders.)

## What the sync derives

For each published date, the sync writes `content/newsletter/YYYY-MM-DD/`:
`fr.md`, `en.md` and `edition.json`, the machine-readable data (the
welcome and other narrative sections, the items with their kickers,
summaries and sources, the timeline, the in-brief facts, reading time and word count) that drives the
archive, language switch and research prompt. These are build artefacts: fix
an edition in Notion, never in those files.
