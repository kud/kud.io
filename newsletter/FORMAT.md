# Edition format

One Notion database row is one edition. The sync reads the row's properties
and its page body, and the validator rejects anything that does not follow
this structure exactly. Formatting freedom lives inside sections and items,
never in the skeleton.

## Properties

| Property       | Type           | Meaning                                                   |
| -------------- | -------------- | --------------------------------------------------------- |
| `Name`         | title          | `Newsletter · YYYY-MM-DD`                                 |
| `Date`         | date           | The edition's date (Europe/London). One edition per date. |
| `Status`       | select         | `Draft` → `Ready` → `Published`, or `Failed`              |
| `Generated at` | date with time | When the editor finished writing                          |
| `Published at` | date with time | Set by the publication workflow once the edition is live  |
| `Run`          | text           | Optional run identifier                                   |
| `Error`        | text           | Last publication error, short, without secrets            |

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

Any other heading 1, either one missing or repeated, or English before French
rejects the edition (`UNKNOWN_LANGUAGE_HEADING`, `MISSING_LANGUAGE`,
`DUPLICATE_LANGUAGE`, `LANGUAGE_ORDER`). Anything before the first heading 1
is the editor's scratch space: it is never published, nor scanned. Keep it
empty.

### Sections

Each rendition is a sequence of heading 2 sections, only from this set and in
this order. Both languages carry the same sections. Only `overview` is
required, and every rendition holds at least one numbered item
(`EDITION_EMPTY`).

| Key         | French                | English              | Kind      | Limits                   |
| ----------- | --------------------- | -------------------- | --------- | ------------------------ |
| `overview`  | Ce soir               | Tonight              | narrative | 1–2 paragraphs, required |
| `depth`     | Le sujet du jour      | Today’s focus        | items     | at most 1 item           |
| `brief`     | L’essentiel           | The essentials       | items     |                          |
| `explainer` | C’est quoi ?          | Explainer            | items     | at most 1 item           |
| `analysis`  | Analyse               | Analysis             | narrative | 2–3 paragraphs (warning) |
| `techsci`   | Technologie & science | Technology & science | items     |                          |
| `timeline`  | Chronologie           | Timeline             | bullets   |                          |
| `inbrief`   | En bref               | In brief             | bullets   |                          |
| `finds`     | Ça vaut un clic       | Worth a click        | items     |                          |
| `watch`     | À surveiller          | Watch next           | items     | sources optional         |
| `closing`   | Pour finir            | To close             | narrative | 1 paragraph, no links    |

Headings are compared exactly, after trimming and folding whitespace; straight
and curly apostrophes are the same. A heading outside the set is
`UNKNOWN_SECTION` (an old name such as `The stories` included), a repeat is
`SECTION_DUPLICATE`, a section out of order is `SECTION_ORDER`, a section with
nothing in it is `SECTION_EMPTY`, a missing intro is `SECTION_MISSING`, and an
items section past its limit is `SECTION_TOO_MANY`. The `overview` and
`closing` headings are structural: the site shows the intro and the closing
line without them.

**The intro.** The `overview` section is written either under its heading
(`Ce soir` / `Tonight`) or as the paragraphs before the first heading 2, with
no heading at all; never both (`OVERVIEW_TWICE`). Before the first heading 2,
only paragraphs are allowed: a heading 3 there is `ITEM_OUTSIDE_SECTION`, any
other block `UNEXPECTED_BLOCK`.

### Allowed blocks

Inside sections: paragraphs, bulleted and numbered lists, and quotes, with
bold, italic and links in their text. Lists nest at most three deep
(`NESTING_TOO_DEEP`). Images, tables, embeds, toggles, callouts, code and
dividers are `UNSUPPORTED_BLOCK`. A mention of a Notion page or person is
`PRIVATE_MENTION` (write it out as plain text); a date mention is fine.

### Narrative sections

`overview`, `analysis` and `closing` have no numbered items: a heading 3 in
one is `ITEM_IN_UNNUMBERED_SECTION`. Paragraph counts outside the limits
above reject the intro and the closing (`NARRATIVE_LENGTH`) and only warn on
the analysis.

- `overview` is the intro: one paragraph, two at most, saying what tonight's
  edition holds. An intro longer than four sentences warns (`INTRO_LONG`).
  Links are optional.
- `analysis` cites with inline links whose text is the source's short name
  (`Le Monde`, `Reuters`); the site renders them as ↗ citations.
- `closing` is one paragraph with no links (`NARRATIVE_LINK_FORBIDDEN`).

Every link in `overview` or `analysis` must also be among the sources of some
item in the same rendition (`NARRATIVE_LINK_UNSOURCED`): the narrative never
carries provenance that no selectable item carries.

### Bullet sections

`timeline` and `inbrief` hold one bulleted list and nothing else
(`BULLETS_ONLY`): one top-level bullet per entry, without sub-items
(`BULLET_NESTED`), each with at least one link (`BULLET_LINK_MISSING`).

- `timeline` bullets read `YYYY-MM-DD — event`, a real calendar date then an
  em dash (an en dash or a hyphen is accepted); otherwise
  `TIMELINE_DATE_MALFORMED`.
- `inbrief` bullets are one sentence.

### Item sections

- **Item headings** are heading 3 blocks, `NN · Title`, where `NN` is two
  digits from `01` to `99` (`ITEM_ID_MALFORMED` otherwise). The separator is a
  space, a middle dot `·`, a space; `-` is accepted and normalised. Numbers
  ascend through the whole rendition, across every items section, without
  repeats (`ITEM_ID_ORDER`, `ITEM_ID_DUPLICATE`). Nothing sits between a
  section heading and its first item (`UNEXPECTED_BLOCK`).
- **Kickers**: `NN · KICKER · Title`, or `NN · KICKER` alone. The first part
  after the number is a kicker only when it has no lower-case letter (capitals,
  digits, spaces and `& ' ’ . - /`, up to 40 characters): `CLIMAT`, `IA`,
  `COP30`. Anything with a lower-case letter is a plain title, as in the finds.
  Stories in `brief` normally carry one. The kicker's words may differ between
  languages, but an item has a kicker in both or in neither
  (`KICKER_MISMATCH`). Mind a plain title that opens with a capitalised
  acronym on its own (`NASA · …`): it reads as a kicker.
- **Item body**: at least one block of text (`ITEM_EMPTY`), from the allowed
  blocks above.
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
- **Item sources**: a paragraph that reads exactly `Sources:` in English, or
  `Sources :` / `Sources:` in French, then a bulleted list that ends the item
  (`SOURCES_NOT_LAST`). Each bullet holds exactly one link
  (`SOURCE_LINK_COUNT`) whose text is the label, the publication or document
  name (`SOURCE_LABEL_MISSING`), and no sub-items (`SOURCE_NESTED`). One
  Sources list per item (`SOURCES_DUPLICATE`), not empty (`SOURCES_EMPTY`),
  with no URL listed twice (`SOURCE_DUPLICATE`). Sources are required in every
  items section except `watch` (`MISSING_SOURCES`), where they are optional
  but checked when present.

### Links and text

Every link anywhere in the body must be a public `https` page. Rejected:
anything not a URL or not `https` (`URL_INVALID`, `URL_NOT_HTTPS`), embedded
credentials (`URL_CREDENTIALS`), IP-address hosts (`URL_IP_HOST`), local or
intranet hosts such as `localhost`, single-label names, `.local`, `.internal`,
`.corp` (`URL_PRIVATE_HOST`), links into private workspaces, mailboxes,
drives, chat, task trackers, design files and preview deployments
(`URL_PRIVATE_SERVICE`), and signed or tokenised URLs, whose query carries a
token, signature, key, credential, session or expiry
(`URL_SECRET_PARAM`).

The text is scanned too, and rejects email addresses (`TEXT_EMAIL`), phone
numbers (`TEXT_PHONE`), bank account numbers (`TEXT_IBAN`), API-key-shaped
strings (`TEXT_API_KEY`) and long opaque tokens (`TEXT_TOKEN`).

### Parity

The validator compares the two renditions and rejects the edition unless they
have:

- the same sections in the same order (`SECTION_MISMATCH`);
- the same item numbers in the same order (`ITEM_MISMATCH`), each in the same
  section (`ITEM_SECTION_MISMATCH`);
- the same set of source URLs for each item (`SOURCE_MISMATCH`);
- the same set of link URLs in each narrative section (`LINK_MISMATCH`);
- in `timeline` and `inbrief`, the same number of bullets
  (`BULLET_COUNT_MISMATCH`), paired by position: the nth French bullet and the
  nth English one carry the same links (`LINK_MISMATCH`) and, in the timeline,
  the same date (`TIMELINE_DATE_MISMATCH`).

URLs are compared after normalising: lowercase host, no trailing slash, no
`utm_*`, `fbclid` or `gclid` parameters, order ignored. Labels, link texts and
kicker words may differ.

## Example

```text
# 🇫🇷 Français

## Ce soir

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

Un atlas en ligne classe les nuages par forme et par altitude. …

Sources :
- [Cloud Atlas](https://example.org/cloud-atlas)

## Pour finir

Bonne soirée, et à demain.

# 🇬🇧 English

## Tonight

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

An online atlas sorts clouds by shape and height. …

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
intro and other narrative sections, the items with their kickers,
summaries and sources, the timeline, the in-brief facts, reading time and word count) that drives the
archive, language switch and research prompt. These are build artefacts: fix
an edition in Notion, never in those files.
