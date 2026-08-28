# Visual thesis — The Listening Room

## Direction and purpose

Local Live Captions uses **surreal editorial scenery**: a quiet lecture room becomes a paper landscape where spoken sound turns into visible ribbon. The image explains the product without showing a fake transcript or a person being watched. Large cream fields feel calm during long use. Dense ink, tomato capture signals, and cobalt controls stay legible under classroom light. The result should feel like an independent accessibility tool, not a meeting dashboard.

## Tokens

- `--paper: #f3eddf` — warm canvas and main background.
- `--paper-deep: #e5dcc9` — secondary ground.
- `--ink: #14241f` — primary text (13.7:1 on paper).
- `--ink-soft: #40534b` — secondary text (7.0:1 on paper).
- `--night: #0b1714` — overlay and footer.
- `--cream: #fffaf0` — text on night.
- `--tomato: #d94b32` — capture state and emphasis; paired with labels, never used alone.
- `--cobalt: #174d8c` — actions and focus.
- `--acid: #d9ed7b` — small editorial highlights.
- `--success: #176a4b`, `--warning: #8b5316`, `--danger: #a52d25`.

Dark mode swaps paper for `#0b1714`, surface for `#14241f`, text for `#fffaf0`, and muted text for `#c8d4cc`. Cobalt lifts to `#88baff`.

## Type and spacing

Display text uses self-hosted Fraunces Variable, with soft, editorial curves that echo caption ribbons. Interface and body text use self-hosted Atkinson Hyperlegible, chosen for distinct letterforms and long reading sessions. Fonts ship as WOFF2 files with `font-display: swap`. The scale is 16, 18, 24, 36, and a fluid 48–72 px display. Body leading is 1.55; captions use 1.35. Layout follows an 8 px scale with 4 px only for tight optical spacing. Reading measures stop at 68 characters.

## Shape, layout, and interaction grammar

The page is an asymmetric editorial spread. Copy sits against a tall illustrated “listening window,” and section numbers run like margin notes. The signature shape is the **caption ribbon**: horizontal bands with a clipped or folded corner. Controls are rounded 8 px, while scenes and panels use broad 24–40 px arcs. A red capture lamp always includes the words “Capturing” or “Stopped.” Primary actions are cobalt blocks with a small arrow shift on hover.

The desktop overlay keeps chrome quiet: transcript first, controls grouped below, and the capture state visible at every size. All targets are at least 44 px. Focus uses a 3 px acid/cobalt double ring. Mobile drops decorative margin notes, stacks all controls, and keeps the primary action before the artwork.

## Motion policy

Caption ribbons enter from the audio source with a 220 ms translate-and-fade. The hero’s paper ribbon makes one slow 8 px settling movement after load; it never loops. Buttons shift 2 px in 160 ms. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes use instant opacity only.

## Asset plan and prompt sheet

One original hero scene is generated, then cropped into responsive WebP and AVIF assets and a 1200×630 social preview. Interface icons are hand-authored SVG strokes. Product screenshots are real HTML UI captures, not generated UI.

**Generation prompt (2026-08-28):**

> Use case: stylized-concept. Asset type: wide landing-page hero for an offline Linux live-caption desktop app. Scene: a surreal empty university lecture room built as a tactile paper diorama; a small cobalt laptop on a desk; translucent tomato-red sound waves enter from the left and fold into broad cream paper caption ribbons above the desk. Editorial magazine illustration, cut paper, dry pastel, subtle grain, hand-built shadows, slightly uncanny scale. Wide landscape composition with the main objects on the right and calm negative space on the left. Warm window light, quiet and reassuring, deep forest ink, parchment cream, cobalt blue, tomato red, tiny acid-yellow accents. No people, no faces, no brands, no logos, no readable text, no letters, no watermark, no generic gradients, no glossy 3D.

Generated with the factory image model deployment (`factory-image`) through `/opt/fleet/lib/gen-image.sh`. Original work commissioned for this product. Source PNG and prompt sidecar live under `assets/src/`; optimized derivatives live under `public/assets/`.

## Accessibility notes

The artwork is explanatory but non-essential; alt text describes sound becoming captions. Decorative texture is ignored by assistive technology. Text never sits directly on the image. Both color treatments meet WCAG AA, and state always combines color, text, and shape.
