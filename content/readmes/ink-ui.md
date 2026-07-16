---
title: "ink-ui"
description: "🧱 Opinionated design system for Ink CLIs — pre-styled components and tokens for consistent TUIs"
---

## Features

- **27 ready-made components**, pre-styled and ready to drop in:
  - **Inputs** — `TextInput`, `EmailInput` (domain completion), `PasswordInput` (masked), `ConfirmInput`
  - **Lists** — `UnorderedList`, `OrderedList` (both nestable), `Table`
  - **Selection & navigation** — `Select`, `MultiSelect`, `Tabs`, `Switch`, `Toggle`, `SelectableRow`
  - **Status & feedback** — `Spinner`, `ProgressBar`, `StatusMessage`, `Alert`, `Badge`, `Toast`
  - **Layout & chrome** — `Banner`, `Header`, `Panel` (bordered pane, optional focus state), `Columns`, `FooterHints`, `KeyValue`, `LoadingScreen`, `ScrollView`
- **Full [@inkjs/ui](https://github.com/vadimdemedes/ink-ui) parity** — every upstream component has an equivalent, plus a dozen more the design system adds on top
- **Colourblind-safe by design** — state is signalled by shape, case, and glyph, never colour alone
- **Design tokens included** — a shared colour palette (`colors`) and spacing scale (`spacing`) to keep every screen consistent
- **Full TypeScript support** — ships compiled output with `.d.ts` declarations for every component and token type
- **ESM only, zero config** — no runtime bundling step; just import and render
- **Peer-dependency light** — only requires `ink ≥ 7` and `react ≥ 19`

## Install

```sh
npm install @kud/ink-ui
```

`ink` and `react` are peer dependencies and must be installed separately:

```sh
npm install ink react
```

## Usage

```tsx
import React from "react"
import { render } from "ink"
import { Banner, Header, Badge, Spinner, colors } from "@kud/ink-ui"

const App = () => (
  <>
    <Banner title="my-tool" subtitle="v1.0.0" />
    <Header subtitle="Synchronising files…">Status</Header>
    <Badge variant="success">done</Badge>
    <Spinner label="Loading…" />
  </>
)

render(<App />)
```

Inputs report their value through `onChange`/`onSubmit`, and lists nest with a shape-distinct marker per level:

```tsx
import { Text } from "ink"
import { EmailInput, PasswordInput, UnorderedList } from "@kud/ink-ui"

const SignUp = () => (
  <>
    <EmailInput placeholder="you@example.com" onSubmit={setEmail} />
    <PasswordInput placeholder="Password" onSubmit={setPassword} />
    <UnorderedList>
      <UnorderedList.Item>
        <Text>Choose a plan</Text>
        <UnorderedList>
          <UnorderedList.Item>
            <Text>Free</Text>
          </UnorderedList.Item>
          <UnorderedList.Item>
            <Text>Pro</Text>
          </UnorderedList.Item>
        </UnorderedList>
      </UnorderedList.Item>
    </UnorderedList>
  </>
)
```

All components accept only the props they need — no theme provider or context required. Design tokens are plain objects:

```ts
import { colors, spacing } from "@kud/ink-ui"

// colors.accent   → "#FF8C00"
// colors.success  → "green"
// spacing.md      → 3
```

## Development

```sh
git clone https://github.com/kud/ink-ui.git
cd ink-ui
npm install
npm run dev
```

`npm run build` compiles TypeScript to `dist/`. `npm run dev` runs the compiler in watch mode.
