# 👨‍💻 kud.io - Personal Portfolio

> A minimalist, performant personal website built with modern web technologies

[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Licence: MIT code, CC BY-NC-ND writing](https://img.shields.io/badge/licence-MIT%20code%20%C2%B7%20CC%20BY--NC--ND%20writing-blue.svg)](LICENSE)

**Live at:** [kud.io](https://kud.io)

## ✨ Features

- 🚀 **Blazing Fast** - Built with Parcel for optimal bundling and performance
- 📱 **Responsive Design** - Looks great on all devices
- 🎨 **Minimalist UI** - Clean, focused design that puts content first
- ⚡ **Modern Stack** - Leverages latest web standards and tooling
- 🔧 **Developer Friendly** - Hot reloading and simple build process

## 🛠️ Tech Stack

- **Build Tool:** [Parcel](https://parceljs.org/) v2.16.3
- **Transpiler:** Babel v7.28.5
- **Styling:** Custom CSS with normalize.css
- **Node:** ≥20.0.0

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0.0 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/kud/kud.github.io.git

# Navigate to the project
cd kud.github.io

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

Open [http://localhost:1234](http://localhost:1234) in your browser.

### Production Build

```bash
# Create optimized production build
npm run build
```

The built files will be in the `dist/` directory.

### Clean Build Artifacts

```bash
# Remove dist folder
npm run clean
```

## 📁 Project Structure

```
kud.github.io/
├── src/
│   ├── index.html          # Main HTML file
│   ├── public/             # Static assets (favicon, images)
│   ├── scripts/            # JavaScript files
│   └── styles/             # CSS stylesheets
├── dist/                   # Production build output
├── .htmlnanorc.js         # HTML minification config
├── package.json           # Project dependencies and scripts
└── README.md              # You are here!
```

## 📰 Newsletter

`/newsletter` is a bilingual (French and British English) evening edition. Its
pipeline has three parts, each with one job:

- **Notion** is the source of truth: one database, one row per edition, the
  edition written in the page body to the format in `newsletter/FORMAT.md`.
- **`scripts/sync-newsletter.js`** turns a Ready edition into
  `content/newsletter/<date>/{fr.md,en.md,edition.json}`. `lib/newsletter/`
  parses and validates it first (sections, item ids, French and English
  matching, every link public and safe) and refuses the edition otherwise.
  Those files are derived: never edit them by hand.
- **`.github/workflows/newsletter.yml`** publishes: sync, build, commit,
  deploy, wait until the page is live, mark the edition Published in Notion,
  then mail the teaser once. It runs when dispatched and as a safety net at
  19:30 London time.

Statuses in Notion: **Draft** (being written, never published), **Ready**
(publish it), **Published** (live; set by the workflow, with *Published at*),
**Failed** (not published; the reason is in *Error*, and setting it back to
Ready retries).

```bash
# Every Ready edition, without writing anything
NOTION_TOKEN=… NOTION_NEWSLETTER_DATABASE_ID=… node scripts/sync-newsletter.js --dry-run

# Check one edition, exit 1 on any error (writes nothing)
node scripts/sync-newsletter.js --validate-only --date=2026-11-14

# Sync one date and keep a JSON report
node scripts/sync-newsletter.js --date=2026-11-14 --report=report.json
```

The script needs Node 22.18 or later: it imports `lib/newsletter/*.ts` through
Node's own type stripping.

Email is optional and off until configured. Sign-up is double opt-in: the
subscribe route mails a signed link that expires after three days, and the
reader is added only when they click it. Each edition is mailed once per
language, with an unsubscribe link.

| Name                            | Kind            | Where                       | Purpose                                                      |
| ------------------------------- | --------------- | --------------------------- | ------------------------------------------------------------ |
| `NOTION_TOKEN`                  | secret          | Actions                     | Read editions, set their status                              |
| `NOTION_NEWSLETTER_DATABASE_ID` | variable        | Actions                     | The newsletter database                                      |
| `RESEND_API_KEY`                | secret          | Actions, Vercel             | Email provider                                               |
| `NEWSLETTER_SIGNING_SECRET`     | secret          | Actions, Vercel             | Signs confirm links (any long random string)                 |
| `RESEND_SEGMENT_FR`, `_EN`      | variable        | Actions, Vercel             | One Resend segment per language                              |
| `NEWSLETTER_FROM`               | variable        | Actions, Vercel             | Sender, e.g. `kud.io <newsletter@your-domain>`               |
| `NEXT_PUBLIC_NEWSLETTER_EMAIL`  | variable (`1`)  | Vercel                      | Shows the sign-up form; set it once the values above exist   |

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Licence

The code is MIT: learn from it, borrow pieces. The writing is CC BY-NC-ND 4.0: share it with credit, not commercially and not edited. The illustrations, photos, logos and the site's design are all rights reserved, so please don't redeploy the site as your own. Details in [LICENSE](LICENSE).

## 👤 Author

**Erwann Mest**

- Website: [kud.io](https://kud.io)
- GitHub: [@kud](https://github.com/kud)

## 🌟 Show Your Support

Give a ⭐️ if you like this project!

---

<p align="center">Made with ❤️ by Erwann Mest</p>
