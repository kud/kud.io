---
title: "gamme"
description: "🎛️ One Material design system for kud's Android apps: shared rows, marks, motion and rules, each app's own colours."
hasDocs: false
---

The Material design system for kud's Android apps ([tutti](https://github.com/kud/tutti), [pastille](https://github.com/kud/pastille), and the ones to come).

Gamme is a source-only kit: each app copies it into its own `:design` module and compiles it with its own toolchain, so apps on different Android Gradle Plugin and Kotlin versions can share it, and F-Droid builds stay reproducible from source. Colour schemes stay with each app; Gamme shares the roles, shape, spacing, motion, and the components that carry the accessibility rules.

- [`docs/spec.md`](https://github.com/kud/gamme/blob/HEAD/docs/spec.md): the v0.1 specification, its rulings, and the rules drawn from reviewing the apps on a real phone.

The code arrives after pastille's first F-Droid release. MIT licensed.
