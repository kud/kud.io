---
title: "webext-email-address-plus"
description: "Get a shiny email address with a ✌️ label ✌️ depending on the hostname"
hasDocs: false
---

🚀 **Automatically generate labeled email addresses for better organization and spam protection.**

Email Address Plus adds website-specific labels to your email address when filling forms, making it easy to track where emails come from and organize your inbox.

## ✨ Features

- **🏷️ Smart Email Labeling**: Automatically adds "+website" labels to your email (e.g., `user+amazon@example.com`)
- **🎯 Multiple Fill Methods**:
  - Floating 📧 icon next to email inputs
  - Right-click context menu
  - Keyboard shortcut (Ctrl+Shift+Y / Cmd+Shift+Y)
- **🎨 Visual Feedback**: Elegant blue glow animations confirm when fields are filled
- **🌙 Theme Support**: Works seamlessly across light and dark browser themes
- **🔒 Privacy Focused**: All processing happens locally - no data sent to external servers
- **💡 Smart Guidance**: Helpful tooltips when extension needs configuration
- **⚙️ Easy Setup**: Simple one-time configuration in extension settings

## 🚀 How It Works

1. **Configure**: Set your email address in the extension settings
2. **Browse**: Visit any website with email input fields
3. **Fill**: Use the floating 📧 icon, right-click menu, or keyboard shortcut
4. **Organized**: Your email gets automatically labeled with the website name

Perfect for organizing newsletters, shopping accounts, and identifying spam sources.

## 🔧 Installation

Install from your browser's extension store:

- **Firefox**: [Mozilla Add-ons](https://addons.mozilla.org/firefox/addon/email-address-plus/)
- **Chrome**: Chrome Web Store (coming soon)

## 🎮 Usage

### Method 1: Floating Icon

- Focus on any email input field
- Click the 📧 icon that appears
- Your labeled email is automatically filled

### Method 2: Context Menu

- Right-click on any email input field
- Select "Fill with labeled email"
- Field is filled instantly

### Method 3: Keyboard Shortcut

- Focus on any email input field
- Press `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac)
- Email is filled with website label

## ⚙️ Configuration

1. Click the extension icon in your browser toolbar
2. Enter your email address
3. Choose labeling mode:
   - **Full**: Uses complete domain (e.g., `user+sub.example.com@domain.com`)
   - **Main**: Uses main domain only (e.g., `user+example.com@domain.com`)
   - **Short**: Uses domain name only (e.g., `user+example@domain.com`)

## 🤝 Compatibility

- **Email Providers**: Gmail, Outlook, Yahoo, and any provider supporting plus-addressing
- **Browsers**: Firefox, Chrome, Edge, and other Chromium-based browsers
- **Websites**: Works with virtually all email input forms

## 🛠️ Development

```bash
# Install the exact locked dependencies (Node 22 or later)
npm ci

# Run in development mode
npm run dev

# Build extension into .output/firefox-mv2
npm run build

# Lint the built extension (run after build)
npm run lint
```

## 🖼️ Web demo

`preview/` is the live demo: the real popup and options pages, exactly as they
ship, side by side on one realistic set of invented `example.*` data, running
against a fake `browser` API shim. Generating an address, the Recent list and
the settings all work; changes live in the tab's session storage and vanish when
it closes. The popup stays open instead of closing after four seconds, and its
timer bar is hidden for that reason. It is excluded from the extension build and
the AMO source zip, and `vercel.json` deploys it.

```bash
# Run the demo locally
npm run preview

# Static output in preview-dist/ (also what vercel.json deploys)
npm run build:preview
```

The colour scheme follows the OS. `preview/fixtures/demo.json` holds the data.

## 🏪 Updating the AMO listing

The public add-on page (name, summary, description, categories and screenshots) lives in this repo: `amo/listing.json` for the text, `amo/screenshots/` for the previews (name-sorted, with an optional same-named `.txt` as the caption). The repo is the source of truth, so anything edited by hand on the AMO dashboard gets overwritten on the next push.

```bash
# Dry run: diff against the live listing, send nothing
npx -y @kud/amo-cli@0.1.1 listing push --listing amo/listing.json --guid email-address-plus@kud.io --screenshots amo/screenshots --only=listing,previews

# Send the changes to AMO
npx -y @kud/amo-cli@0.1.1 listing push --listing amo/listing.json --guid email-address-plus@kud.io --screenshots amo/screenshots --only=listing,previews --apply
```

Sending needs `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` in the environment (the JWT issuer and secret from [AMO's API credentials page](https://addons.mozilla.org/en-US/developers/addon/api/key/)). The description is Markdown, which AMO renders on the page. The work is done by [`@kud/amo-cli`](https://kud.io/projects/amo-cli).

## 📄 License

MIT License - see [LICENSE](https://github.com/kud/webext-email-address-plus/blob/HEAD/LICENSE) file for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/kud/webextension-email-address-plus/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/kud/webextension-email-address-plus/discussions)

---

Made with ❤️ by [kud](https://github.com/kud)
