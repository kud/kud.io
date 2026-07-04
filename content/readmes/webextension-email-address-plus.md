---
title: "webextension-email-address-plus"
description: "Get a shiny email address with a ✌️ label ✌️ depending on the hostname"
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
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build extension
npm run build

# Lint code
npm run lint
```

## 📄 License

MIT License - see [LICENSE](https://github.com/kud/webextension-email-address-plus/blob/HEAD/LICENSE) file for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/kud/webextension-email-address-plus/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/kud/webextension-email-address-plus/discussions)

---

Made with ❤️ by [kud](https://github.com/kud)
