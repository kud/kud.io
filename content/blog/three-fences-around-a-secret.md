---
title: "Three fences around a secret"
description: "Coding agents read files for a living. Permission rules, hooks and a scanner each catch a leak the other two miss."
date: "2026-09-04"
slug: "three-fences-around-a-secret"
tags: ["engineering","tools"]
updated: "2026-09-04T12:47:00.000Z"
---

You're three hours into an auth bug. Something's clearing the session and you can't work out what, so you do the obvious thing and sweep the repo:

```bash
grep -rn -iE "login|token|session|auth" .
```

Good pattern. It matches in the middleware, in two components, in a test helper. It also matches in `.env`, in `.env.local`, and in the `.env.shadow` somebody committed in 2022 and everyone forgot. All of it goes into the agent's context, and none of it announced itself — because from the outside, a sweep that reads twelve files looks exactly like a sweep that reads ten.

That's the reading half of the problem, and it's the half everyone thinks about.

The other half is that the same agent stages, commits, writes the message, and opens the pull request. Reading a secret is a bad afternoon. **Publishing one is a different category, and an agent gets there without you looking at it.**

## Two directions, four routes

Worth separating these, because a defence against one does nothing for the others.

**Inbound — a credential reaches the agent.** A key lands in a context window. Depending on your setup that's a transcript on disk, a log line, possibly a provider's servers. Embarrassing. You won't know which until you check, and by the time you've checked you've decided to rotate anyway.

**Outbound — a credential leaves your machine.** A `.env` gets committed. This one has a clock on it: scanners crawl public GitHub continuously, and the window between push and exploitation is minutes. evnx's own site opens with a founder's account of it — a `git add .` that meant `git add src/`, a live key for twenty-two minutes, crypto mining in three AWS regions before he woke up.

**Outbound — private context leaves your machine.** Not a credential at all. An internal hostname in a PR body, a service name in a comment, a queue name in the repro steps. Nothing to scan for, nothing to rotate, permanently indexed.

**Outbound — the agent writes it for you.** The one that gets skipped, and the reason this post isn't only about reading.

## The write side

An agent that can edit files can run `git`. That's not a misconfiguration, it's the point — you asked it to do the work, and committing is part of the work.

But `git add .` in an agent's hands is `git add .` with nobody glancing at the staged list. The founder's story above is a human making that mistake once, at midnight, tired. An agent makes it at ordinary speed, repeatedly, and reports success each time, because from where it sits the commit did succeed.

Then there's the part that catches people who are otherwise careful.

**A generated commit message is written from the diff.** That's the whole mechanism — the tool reads what changed and describes it. So if the diff contains an internal hostname, a private package name, a customer identifier, the message will faithfully lift it into the commit text. You reviewed the _code_. Nobody reviewed the _message_, because the message was the automated bit.

And a commit message is worse than a file for this. You can amend a file in the next commit. The message is in the history, in every clone, in the GitHub API, in whatever mirrors your CI made.

The same applies one level up. An agent that writes your PR description writes it from the branch. If the bug reproduced against an internal service, the description explains that — accurately, helpfully, in public.

**So the write side needs its own thinking, and deny rules don't cover it.** `Read(.env*)` has no opinion about `git push`. If you want a gate here, it has to be on the writing action, not the reading one:

```json
"Bash(git push*)",
"Bash(gh pr create*)",
"Bash(gh issue comment*)"
```

That's a blunt instrument and it will annoy you. The alternative is deciding, once, that anything leaving the machine gets a human look — and then actually looking, including at the parts that were generated.

## Deny rules, and the hole in them

Back to the inbound side, because it's the cheapest thing you'll configure all year. It goes in `settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(.env*)",
      "Read(~/.config/**/secrets*)",
      "Read(**/credentials*)"
    ]
  }
}
```

The important bit isn't the paths, it's the glob. `Read(.env*)` covers `.env.local`, `.env.production` and the `.env.shadow` you've forgotten about. `Read(.env)` covers one file and gives you the warm feeling of having dealt with it.

Now the hole: **a deny rule on the read tool says nothing about the shell.**

```bash
sed -n '1,20p' .env
```

That's the file, on stdout, and no rule about reading files was consulted. Same for `cat`, `head`, `tail`, `awk`, `xxd`. So the shell needs its own entries:

```json
"Bash(sed *.env*)",
"Bash(cat *.env*)"
```

And the moment you write those you can see the problem: you're enumerating commands, and there are more commands than you can enumerate.

**The one people miss entirely is the Keychain.** You did the right thing — the secret isn't in a file, it's in macOS Keychain, which is where it belongs. But it's one command from stdout:

```bash
security find-generic-password -w -s "my-service"
```

No file, so nothing path-based fires. Same for whatever CLI fronts your secret manager — `op`, `vault`, `aws secretsmanager get-secret-value`, your own wrapper. **Moving a secret out of a file doesn't move it out of reach. It changes which command reaches it.**

```json
"Bash(security find-generic-password*)",
"Bash(security *-generic-password*)",
"Bash(op read*)"
```

Cheap, catches the common case, and it's a list you'll never finish.

## Hooks: code, not patterns

A deny rule is a pattern matched against a call. A hook is code that runs before the call, gets the real arguments, and can say no.

The gain isn't strength — a deny rule blocks just as hard. It's coverage. A pattern only matches what you thought of in advance. A hook sees the command as it'll actually run: the one with the pipe, the one where the path arrived in a variable, the one whose glob hasn't expanded.

A `PreToolUse` hook gets the tool call as JSON on stdin, and a non-zero exit blocks it:

```bash
#!/usr/bin/env bash
# Deliberately over-broad. A false positive costs one rephrased command.
call=$(cat)

secrets='\.env|secrets?\.|credentials|find-generic-password|op read|vault kv'

if grep -qiE "$secrets" <<< "$call"; then
  echo "blocked: touches a secrets-shaped path or command" >&2
  exit 1
fi
```

Blunt on purpose. The asymmetry justifies it: a false positive costs one rephrased command, a false negative costs a rotation and a conversation you'd rather not have.

**A hook is also where the write side gets interesting**, because it can inspect what's about to be committed rather than just what's about to be read:

```bash
if grep -qE '^git (add|commit|push)' <<< "$call"; then
  git diff --cached --name-only | grep -qE '(^|/)\.env' && {
    echo "blocked: .env is staged" >&2
    exit 1
  }
fi
```

That's the check no static deny list can express, because the answer depends on the state of the index at that moment.

What hooks don't buy: anything outside the session. Yours has no opinion about what your editor did, or what a script did at 2am.

## The commit gate

Which is the third fence, and the only one that runs when there's no agent in the room — and, more usefully here, the one that doesn't care _who_ ran `git commit`.

[evnx](https://www.evnx.dev/) is a Rust CLI for this job: scan `.env` files for credentials, validate them for the usual traps, run as a pre-commit hook and a CI gate. Single static binary, MIT, no runtime.

```bash
evnx doctor
```

checks the things that are only boring until they're false: whether `.env` is genuinely in `.gitignore`, whether the permissions are sane, whether `.env.example` has drifted. Then:

```bash
evnx scan --exit-code
```

exits non-zero on a finding, which is what makes it a gate rather than a report you read once. It knows the shapes — AWS keys, Stripe secrets, GitHub tokens — and flags high-entropy strings matching no known shape, which is how it catches your internal ones.

`validate` earns its place separately, because it catches the class that isn't a leak: a placeholder that shipped, `localhost` in production config, a boolean that's the string `"false"` and therefore truthy.

**A pre-commit hook matters more with an agent than without one**, and it's worth being explicit about why. Without an agent, there's a human between the mistake and the push, and that human occasionally notices. With an agent, that step is gone by design — the whole value proposition is not watching. So the gate stops being a safety net and becomes the only thing standing there.

## The one with no tool

Here's the leak that walks past all three, because there's nothing in it to detect.

You fix a bug. It reproduced on an internal service, so the pull request pastes the case that shows it — the hostname, the queue name, the service that misbehaved. No credential anywhere. All of it your employer's private topology, in a public repo, under your name, indexed within the hour.

Nobody types out an internal hostname deliberately. **It arrives as the example.** The file you happened to be fixing becomes the illustration, and the illustration ships. A scanner can't help: `internal-billing-svc-3` isn't high-entropy, isn't a token, matches no rule. It's a string that's fine everywhere except where you just put it.

And this is exactly where the write side compounds it. When you write the PR yourself, there's a moment — brief, unreliable, but real — where you read your own sentence and something itches. A generated description skips that moment. It's _more_ likely to include the identifier, because it's summarising accurately from a diff that contains it, and it has no idea which strings are yours to publish.

The defence is a habit with two halves, and people skip the second.

**Restate the case with a neutral one** — `example.com`, a vendor everyone's heard of — and check the restatement still demonstrates the bug. Half the time it doesn't, which is worth knowing, because it means the specific thing was load-bearing and you were about to publish it.

**Then grep the diff and the description before you publish**, with your employer's names and hostnames as a literal list. This feels redundant and isn't: the reflex that dropped the hostname in won't flag it on the way out. That's the whole problem — you didn't notice putting it there.

Do this before handing the diff to anything that writes from it, not after. A generated message can't unsee what's in the diff.

It reaches further than PR bodies, too. Commit messages, issue comments, README examples, CHANGELOG entries, source comments. A doc comment is the worst of them: it ships in every installed copy and nobody reads it again.

## When it's already out

Assume it will be, occasionally. Worth knowing what actually undoes it, which is less than you'd hope.

Rotate first. Everything else is tidying, and tidying while a live key is out is the wrong order.

Then understand what GitHub keeps. PR body edits sit behind a visible dropdown, so an edited description still shows the original to anyone who clicks. `refs/pull/<n>/head` is retained permanently — closing the PR, force-pushing over the branch and deleting it all leave the original fetchable by anyone with the ref. Editing is mitigation. Removal needs Support.

Say that plainly when you report it. "I've edited it and closed the PR" reads as resolved and isn't, and someone downstream will make a decision on that sentence.

## Why three

Each is blind exactly where the others see.

Deny rules are exact, free, and know only the patterns you wrote. Hooks see the real command — and the real index — and stop at the edge of the session. A scanner watches the commit and doesn't care who ran it, which is the property that matters once the committer isn't you. And the habit covers the case where nothing is technically a secret and the damage is real regardless.

The setup is about an afternoon, most of it spent deciding what goes in the regex. A poor trade, only if nothing ever goes wrong.