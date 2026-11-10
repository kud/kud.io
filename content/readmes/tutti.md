---
title: "tutti"
description: "A remote for BRAVIA TVs and Theatre Bars"
hasDocs: true
---

An Android remote for one living room: a **Sony BRAVIA TV on Google TV** and a **BRAVIA Theatre Bar**, plus the computer shown on the TV. Built to replace BRAVIA Connect for everyday use, and tested with a BRAVIA 8 and a Theatre Bar 9.

It speaks Sony's and Google TV's own local protocols, so it **won't work with other brands**, nor with older BRAVIAs that don't run Google TV. Everything stays on your local network: no Sony account, no cloud service.

Setup, room calibration and speaker placement stay in BRAVIA Connect, and tutti opens it when you need it.

<p align="center">
  <img src="https://raw.githubusercontent.com/kud/tutti/HEAD/fastlane/metadata/android/en-US/images/phoneScreenshots/1.png" width="270" alt="The remote: scenes, the pad with the volume rail, and the dock">
  <img src="https://raw.githubusercontent.com/kud/tutti/HEAD/fastlane/metadata/android/en-US/images/phoneScreenshots/3.png" width="270" alt="The soundbar's sound sheet: input, effects, DRC and IMAX">
</p>

Screenshots are rendered from invented fixtures, never captured from a phone: `TUTTI_SHOWCASE=<dir> ./gradlew --offline :app:testGithubDebugUnitTest --tests '*Showcase*'` (see `ShowcaseRenders`).

## 🌟 Features

- 🕹️ **Google TV–grade remote** — touchpad or D-pad, with a strip under the pad to switch between them
- ⌨️ **Live keyboard** — type into the TV's text fields from the phone, mirrored as you go
- 🎙️ **Voice** — hold the mic to talk to the TV's Assistant
- 🔊 **Soundbar controls** — volume, sound field, night mode, bass and rear level on the Theatre Bar, over its IP control
- 🎬 **Scenes and shortcuts** — one tap sets the TV input or app, the picture mode and a volume cap; pinned keys and apps on the remote
- 📱 **Widget, Quick Settings tile and media notification** — the essentials without opening the app
- 🔄 **Settings sync** — your layout, scenes and settings in one file, in a folder you choose on your own Drive (or any storage app), so every phone shares them (*Settings › Sync*)
- 🔒 **Local and private** — LAN only, devices pinned on first use, pairing material encrypted with an Android Keystore key
- 🩺 **Developer mode** — redacted, copyable details on every error, and a diagnostic of the TV and bar connections

## 🚀 Quick Start

Install it from [GitHub Releases](https://github.com/kud/tutti/releases): download the latest `tutti-<version>.apk` on the phone and open it (allow installs from your browser or file manager once). The app tells you when a newer release is out and installs it over the last. F-Droid is coming. Then set up the devices:

1. **Soundbar.** In BRAVIA Connect, enable **External control** (IP control) for the Bar 9. The app talks to it on TCP port 33336.
2. **TV, remote.** Nothing to enable. On first launch the app pairs with the TV: the TV shows a 6-character code, type it in the app.
3. **TV, settings (picture, sound output, inputs).** On the TV: *Settings → Network & Internet → Remote device settings → Control remotely* on, *IP control → Authentication* set to **Normal and Pre-Shared Key**, and choose a Pre-Shared Key. Enter the same key in the app.
4. Give the TV and the bar fixed IP addresses on your router (recommended).
