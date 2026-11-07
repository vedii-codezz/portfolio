# Responsive Tech Stack and portfolio review

## Changes

- `components/tech-stack.css`: four columns from 1200px, two from 650px through 1199px, one below 650px. The desktop grid fills the existing section width; the tablet grid is capped at 820px and the mobile grid at 380px. Adjusted title sizing, desktop pill spacing, and shared minimum content height to 400px. Kept the framed card's text inside its double border and masked ornament strokes directly under its flip cue.
- `components/PortfolioMotion.tsx`: one grid-triggered entrance with 20px rise and 0.08-second left-to-right stagger. Only outer category wrappers are animated; internal flip rotors are untouched. The existing matchMedia cleanup and reduced-motion exclusion remain.
- `components/TechStackAlpona.tsx`: retained paisley, semicircle, radial, lotus and curl paths. Made the double border follow the card dimensions independently of the lotus artwork. Nested viewBoxes keep the corner artwork undistorted. Slightly softened semicircle visibility near narrow-card titles through CSS.
- `components/TechStack.tsx`: wrapped each existing flip cue in an inline span so only its text area masks underlying decoration on the framed card.
- `scripts/verify-responsive-toolkit.mjs`: browser regression coverage, with optional `--matrix-only` and `--controls-only` modes. Requires `PORTFOLIO_REVIEW_OUTPUT`; optional `PORTFOLIO_REVIEW_URL` defaults to port 3001.

The shared FlipCard implementation, palette, fonts, project data, technology data, loader, hero, carousel, navigation, Pengu, journey, contact and footer were not changed.

## Measured card dimensions

Rounded CSS pixels; includes borders. Measurements matched in Bloom and After Dark.

| Viewport | Columns | Card width × height |
| --- | ---: | ---: |
| 320 × 640 | 1 | 282 × 402 |
| 390 × 844 | 1 | 343 × 402 |
| 768 × 1024 | 2 | 319 × 402 |
| 1024 × 768 | 2 | 398 × 402 |
| 1280 × 800 | 4 | 258 × 402 |
| 1440 × 900 | 4 | 290 × 402 |
| 1920 × 1080 | 4 | 345 × 402 |

The existing portfolio container limits width at large viewports. No global container changes were made. Cards retain their 22px radius.

## Verification and findings

- All 19 technology names remain unchanged and in the original category order. Verified both against the data and with the existing semantic rendering test.
- Inspected desktop, tablet and mobile front/back captures in both themes. Four distinct compositions remain, with fainter back decoration. SVG layers remain `aria-hidden` and pointer-transparent.
- Every requested viewport/theme combination: correct column count, equal heights, no horizontal page overflow, readable headings, and pill content above the flip cue without internal overflow.
- Independent card flips, native Enter activation, visible focus outline, hidden-face `inert` state, pointer tilt, glare and reduced-motion behavior passed. Hover scaling, Y rotation, spring timing and shadows retain the existing implementation.
- Hero browser regression passed in both themes: loader/entrance completes before automatic name scrambling; correct resolution; independent hover restart/interruption; stable word widths; unchanged decorative period and accessible name; reduced motion produces no scrambling.
- Existing navigation browser regression passed: six destinations, focus trap and restoration, Escape, loader gating, scrolling lock/restoration, live theme switching, short-screen menu scrolling, rapid toggles, reduced motion, and responsive fit at 320, 390, 768, 1024 and 1440px.
- Current carousel structure passed direct browser checks: five projects, exact Demo/Source URLs, cylindrical artwork-strip curvature, selected-art sharpness, neighboring blur, forward/reverse wraparound, physical dragging and snapping, hover preview and restoration of selected details. Its animation reports paused while offscreen.
- Pengu image loading and click reaction, journey SVG and education content, contact reveal completion and mail link passed. Desktop/mobile screenshots of the surrounding sections were reviewed in both themes.
- No production browser exceptions, console errors or hydration warnings were recorded in the final matrix/control checks.
- Source review: GSAP media contexts revert on cleanup; repeated reveal events are gated; tilt updates DOM styles rather than React state; artwork has no animation loops; hidden card faces are inert; the carousel cancels its requestAnimationFrame work when offscreen or the document is hidden.

## Executed checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `node --test scripts/tech-stack.test.mjs scripts/carousel.test.mjs scripts/luma.test.mjs`: nine tests passed.
- `node scripts/verify-theme.mjs`
- `node scripts/verify-journey.mjs`
- `node scripts/verify-lotus.mjs`
- `node scripts/verify-floral-coverage.mjs`
- `node scripts/verify-loader-viewport.mjs`
- Existing hero and navigation browser scripts, executed against the production preview with output redirected outside the repository.
- New responsive browser checks: full-site interactions, 14 viewport/theme combinations, front/back captures and control/reduced-motion checks. The test's initial Enter simulation was corrected to include the character event required for native button activation; no keyboard implementation change was needed.

## Known limitations and existing test debt

- `verify-ring-carousel.mjs` failed its old expectation of ten links inside the carousel. The current artwork-only carousel instead uses one separate project-details panel. The new browser checks validate this current structure and all five destination pairs. The older script was left unchanged; it still needs maintenance.
- A separate development server could not start because an existing `next dev` process owns the workspace. The existing port-3000 preview did not finish the browser readiness check. Development refresh/Fast Refresh was therefore not verified in a live browser; existing lotus Strict Mode lifecycle tests passed. Production checks used a fresh successful build on port 3001. The user's existing process was not stopped.
- Browser coverage used Chromium with emulated viewport/media settings, not physical devices or Safari/Firefox. Accessibility checks covered DOM semantics, focus and keyboard behavior, not a manual screen-reader session. External destination URLs were checked for correctness, not service uptime. No numerical CPU/memory benchmark was performed.

Screenshots and measurements are stored outside Git at:

`C:/Users/monda/.codex/visualizations/2026/11/07/01a1b6bb-3b21-7891-b723-62fd85133d8c/toolkit/`

No screenshot artifacts were added to the repository.
