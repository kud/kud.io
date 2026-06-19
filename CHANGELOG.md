# Changelog

All notable changes to this project are documented here.

---

## Unreleased — 2026-06-19

### Highlights

- **Apps showcase with a liquid-glass launcher.** Deployed web apps (Planning Poker, Globetrotter, Brit Ready) now lead the projects page as a dedicated "Apps" group — rendered as large, full-bleed squircle tiles with per-app accent colours and a glass-morphism finish. Each app has its own landing page featuring a hero icon, a prominent "Launch app" button to the live deployment, a why/how story, tech-stack chips, screenshots, and feature highlights. ([f404b0a](https://github.com/kud/website/commit/f404b0ae5ed5cf7e7b619404d52d0755a7ec8b5c))

- **Morph view-transitions for project navigation.** Navigating between the project list and a detail page now triggers a shared-element morph: the project icon smoothly morphs from its launcher tile into the detail-page hero, with incoming content held back until the morph reads as the lead animation. The transition degrades gracefully under `prefers-reduced-motion`. ([08c4f10](https://github.com/kud/website/commit/08c4f1097152101a4640548198230660b06b32d1))

### Fixes

- Eliminated a white background "blink" visible on the outgoing page during the morph transition. A `vt-content-hold` keyframe now keeps the outgoing page opaque through the first 55% of the animation, making the morph feel seamless. ([f404b0a](https://github.com/kud/website/commit/f404b0ae5ed5cf7e7b619404d52d0755a7ec8b5c))

<details>
<summary>Internal (1 commit)</summary>

- Optimised `globetrotter-shot.png` asset size. ([279e490](https://github.com/kud/website/commit/279e490b7fbc5f839b6243c5ed836191a12072f7))

</details>
