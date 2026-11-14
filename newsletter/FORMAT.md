# Edition format

One Notion database row is one edition. The sync reads the row's properties
and its page body, and the validator rejects anything that does not follow
this structure exactly. Formatting freedom lives inside items, never in the
skeleton.

## Properties

| Property       | Type           | Meaning                                                                                  |
| -------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `Name`         | title          | `Newsletter · YYYY-MM-DD`                                                                |
| `Date`         | date           | The edition's date (Europe/London). One edition per date.                                |
| `Status`       | select         | `Draft` → `Ready` → `Published`, or `Failed`                                             |
| `Generated at` | date with time | When the editor finished writing                                                         |
| `Published at` | date with time | Set by the publication workflow once the edition is live                                 |
| `Run`          | text           | Optional run identifier                                                                  |
| `Error`        | text           | Last publication error, short, without secrets                                           |

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

### A rendition

- **Lede** (optional): one or two short paragraphs before the first heading 2.
- **Sections**: heading 2 blocks, only from this set, in this order. Both
  languages carry the same sections.

  | Key       | French                  | English                |
  | --------- | ----------------------- | ---------------------- |
  | `brief`   | L’essentiel             | The brief              |
  | `depth`   | En profondeur           | In depth               |
  | `techsci` | Technologie & science   | Technology & science   |
  | `inbrief` | En bref                 | In brief               |
  | `finds`   | Trouvailles             | Finds                  |
  | `watch`   | À surveiller            | Watch next             |

- **Items**: heading 3 blocks, `NN · Title`, where `NN` is two digits from
  `01` to `99`. Numbers run in ascending order through the whole rendition,
  without repeats, and the same number means the same subject in both
  languages. The separator is a space, a middle dot `·`, a space.
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
have the same sections in the same order, the same item numbers in the same
order and the same sections, and the same set of source URLs for each item.
URLs are compared after normalising: lowercase host, no trailing slash, no
`utm_*`, `fbclid` or `gclid` parameters, order ignored. Labels may differ.

## Example

```text
# 🇫🇷 Français

Le Conseil d’État tranche sur les zones à faibles émissions, et une étude
revoit à la hausse la fonte du Groenland.

## L’essentiel

### 01 · Le Conseil d’État valide le calendrier des zones à faibles émissions

Le Conseil d’État a rejeté mardi le recours contre…

Sources :
- [Conseil d’État · décision n° 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

## Trouvailles

### 02 · Un atlas des nuages pour débutants

Sources :
- [Cloud Atlas](https://example.org/cloud-atlas)

# 🇬🇧 English

France's top administrative court rules on low-emission zones, and a study
revises Greenland's ice loss upwards.

## The brief

### 01 · France's top court upholds the low-emission zone timetable

The Conseil d'État on Tuesday rejected the challenge to…

Sources:
- [Conseil d'État · decision no. 000000](https://www.conseil-etat.fr/…)
- [Le Monde](https://www.lemonde.fr/…)

## Finds

### 02 · A beginner's atlas of clouds

Sources:
- [Cloud Atlas](https://example.org/cloud-atlas)
```

(`#`, `##` and `###` stand for Notion's heading 1, 2 and 3 blocks. The
example's subjects and links are placeholders.)

## What the sync derives

For each published date, the sync writes `content/newsletter/YYYY-MM-DD/`:
`fr.md`, `en.md` and `edition.json`, the machine-readable item data (titles,
first-paragraph summaries, sections and sources) that drives the archive,
language switch and research prompt. These are build artefacts: fix an
edition in Notion, never in those files.
