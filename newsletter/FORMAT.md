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

| Key        | French                | English              | Kind      |
| ---------- | --------------------- | -------------------- | --------- |
| `overview` | L’essentiel du jour   | Today’s briefing     | narrative |
| `brief`    | Les sujets            | The stories          | items     |
| `depth`    | En profondeur         | In depth             | items     |
| `analysis` | Analyse               | Analysis             | narrative |
| `techsci`  | Technologie & science | Technology & science | items     |
| `timeline` | Chronologie           | Timeline             | list      |
| `inbrief`  | En bref               | In brief             | list      |
| `finds`    | Trouvailles           | Finds                | items     |
| `watch`    | À surveiller          | Watch next           | items     |

Straight and curly apostrophes are both accepted in the headings.

### Narrative sections

`overview` and `analysis` hold paragraphs only (no headings, lists or
quotes). Citations are inline links whose text is the source's short name
(`Le Monde`, `Reuters`); the site renders them as ↗ citations. The first
paragraph or two of `overview` serve as the edition's teaser.

Every link in a narrative section must also appear among the sources of some
item in the same rendition: the narrative never carries provenance that no
selectable story carries.

### List sections

`timeline` and `inbrief` hold one bulleted list, one bullet per entry, each
with at least one link.

- `timeline` bullets start with an ISO date: `YYYY-MM-DD — event`.
- `inbrief` bullets are one sentence.

### Item sections

- **Items** are heading 3 blocks, `NN · Title`, where `NN` is two digits from
  `01` to `99`. Numbers run in ascending order through the whole rendition,
  across all item sections, without repeats, and the same number means the
  same subject in both languages. The separator is a space, a middle dot `·`,
  a space.
- **Item body**: paragraphs, bulleted or numbered lists and quotes. Bold,
  italic and links are fine. No images, tables, embeds, toggles, callouts or
  mentions of Notion pages or people.
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

Le Conseil d’État a validé mardi le calendrier des zones à faibles émissions
[Conseil d’État](https://www.conseil-etat.fr/…), le jour même où une étude
revoit à la hausse la fonte du Groenland [Nature](https://www.nature.com/…)…

## Les sujets

### 01 · Le Conseil d’État valide le calendrier des zones à faibles émissions

Le Conseil d’État a rejeté mardi le recours contre…

Sources :
- [Conseil d’État · décision n° 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

### 02 · Le Groenland fond plus vite que prévu

…

Sources :
- [Nature](https://www.nature.com/…)

## Chronologie

- 2019-12-24 — La loi d’orientation des mobilités crée les ZFE [Légifrance](https://www.legifrance.gouv.fr/…)

## Trouvailles

### 03 · Un atlas des nuages pour débutants

Sources :
- [Cloud Atlas](https://example.org/cloud-atlas)

# 🇬🇧 English

## Today’s briefing

France's top administrative court upheld the low-emission zone timetable on
Tuesday [Conseil d'État](https://www.conseil-etat.fr/…), the same day a study
revised Greenland's ice loss upwards [Nature](https://www.nature.com/…)…

## The stories

### 01 · France's top court upholds the low-emission zone timetable

The Conseil d'État on Tuesday rejected the challenge to…

Sources:
- [Conseil d'État · decision no. 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

### 02 · Greenland is melting faster than expected

…

Sources:
- [Nature](https://www.nature.com/…)

## Timeline

- 2019-12-24 — The mobility act creates low-emission zones [Légifrance](https://www.legifrance.gouv.fr/…)

## Finds

### 03 · A beginner's atlas of clouds

Sources:
- [Cloud Atlas](https://example.org/cloud-atlas)
```

(`#`, `##` and `###` stand for Notion's heading 1, 2 and 3 blocks. The
example's subjects and links are placeholders.)

## What the sync derives

For each published date, the sync writes `content/newsletter/YYYY-MM-DD/`:
`fr.md`, `en.md` and `edition.json`, the machine-readable data (the
narrative sections, the stories with their summaries and sources, the
timeline, the in-brief facts, reading time and word count) that drives the
archive, language switch and research prompt. These are build artefacts: fix
an edition in Notion, never in those files.
