# Writing a post

How posts for `/blog` get written. Erwann brings the thinking, an AI brings the
prose. This file exists so the second half stays consistent without the first
half having to say the same things every time.

Written 2026-09-04, from one post. **Revisit after post three: any section that
hasn't changed a draft in three posts gets cut.**

## Who supplies what

**Erwann supplies four things, and none of them can be delegated:**

- **The annoyance.** Why the post exists. A manufactured grievance reads as
  manufactured, every time.
- **The incident, with its real details.** The scene that opens a post works
  because it happened. An invented illustration is how a blog ends up sounding
  like a competent stranger.
- **The verdict.** What he actually thinks is true, including the unflattering
  or unfashionable part.
- **The correction to the argument.** Not style — reasoning. On the first post
  it was *"we're mostly talking about AI reading it, but also committing"*: a
  hole only the person holding the belief could see.

Everything else is the writer's: structure, transitions, rhythm, secondary
examples, length.

**The first draft exists to be argued with, not approved.** That last input
arrives by reading a draft, not by briefing one. Draft into the Notion `Blog`
database as `Status: Draft`; Erwann reads, corrects, and publishes.

## Voice

- **Contract.** He writes "don't", "it's", "isn't". A draft full of "do not"
  and "that is" reads starched and isn't him.
- **Poetic, subtle, minimalist.** His words. Warm and precise, not clever.
- **Open on a concrete scene, never a claim.** The grep that matched `.env`
  beats "secrets management is important".

## Tics to kill

Named literally, because "avoid AI-isms" changes nothing and a named tic does:

- **"It's not X, it's Y."** Appeared four times in one draft. Once is a
  sentence; twice is a mannerism.
- **The aphoristic closer.** The neat final line that sounds profound and says
  nothing.
- **The uncontracted register.** See above; it's the loudest single tell.

## Length and shape

**~2,000–2,500 words.** 1,200 was rejected as "not really enough".

Three structural moves that survived correction:

- **Name the competing routes before solving any.** Separating "reaches the
  agent" from "leaves the machine" was what made the argument tractable.
- **Name the mechanism, not the symptom.** *A generated commit message is
  written from the diff* is worth more than *be careful with commit messages*.
- **Admit what the tool can't do.** The section with no tool in it was the
  strongest part of the first post.

## Non-negotiables

- **British English** — see `CLAUDE.md` in this repo.
- **Run `/k-deslop`** on the draft before it's published.
- **No employer names, internal hostnames, or private URL shapes.** Load-bearing
  here rather than advisory: this blog is public and indexed. Restate any real
  case with a neutral vendor, then check the restatement still demonstrates the
  point.
