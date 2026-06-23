---
title: "referrals"
description: "All my referrals codes. Powered by next.js on @vercel and @makenotion as API. 🙌🏻"
---

A premium, animated referral codes platform that turns every click into cash! Built with [Next.js](https://nextjs.org) and powered by [Notion](https://notion.so) as a headless CMS.

## ✨ Features

- 💰 **Epic Money-Themed Hero**: Full-screen animated hero with ASCII art and floating money
- 🤑 **Custom Money Cursors**: Star-struck (🤩) default + money-face (🤑) on buttons
- 💸 **Floating Money Animation**: Gentle floating money bills across the screen
- 🎯 **Smart Filtering**: Active referrals first, disabled ones shown in grey
- 📋 **One-Click Copy & Redirect**: Copy codes instantly + 3-second countdown redirect
- 🎨 **Smooth Animations**: Cards rearrange fluidly when filtering
- 🌙 **Premium Dark Theme**: Sleek black design with gradient accents
- 📱 **Fully Responsive**: Optimized for all screen sizes
- 🔒 **Secure Server-Side API**: Environment variables protected from client exposure
- 📊 **Dynamic Stats**: Real-time counts of codes and categories

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.sample` to `.env` and fill in your Notion credentials:
   ```bash
   cp .env.sample .env
   ```
   
   Update the following variables in `.env`:
   - `NOTION_API_KEY`: Your Notion integration API key
   - `NOTION_DATABASE_ID`: Your Notion database ID

3. **Notion Database Setup:**
   Create a Notion database with these properties:
   - `name` (Title) - The service/platform name
   - `code` (Text) - The referral code (optional for direct links)
   - `url` (URL) - The referral link
   - `type` (Select) - Category (Finance, Food, Home, Tech, Travel, etc.)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the money-themed magic! 💰

## 🎮 How It Works

1. **Browse**: Scroll through categories or use "All" to see everything
2. **Filter**: Click the dropdown to focus on specific categories (Finance, Food, etc.)
3. **Click**: Tap any card to copy the code and start the 3-second redirect countdown
4. **Earn**: Get redirected to the platform and start earning cashback! 🤑

## 🎨 Design Highlights

- **Money Cursor System**: Different emoji cursors for different interactions
- **Floating Animations**: Subtle money bills float across the screen
- **Smart Card States**: Active vs disabled visual feedback
- **Premium Typography**: "MONEY" ASCII art + gradient text effects
- **Responsive Grid**: Adapts beautifully from mobile to desktop

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
