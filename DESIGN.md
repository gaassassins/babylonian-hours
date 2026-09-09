# Babylonian Hours — Design System

**Memorable thing:** This is a real explanation of how the Babylonians told time — a scholarly object, not an app.

**Aesthetic thesis:** An editorial, museum-label / scholarly-figure treatment. Warm paper and ink, one old-style serif throughout, the sun-dial presented as an annotated figure with a caption, data shown as a typeset table. Restrained, quiet, printed-page calm. Reference: Tufte CSS (ink-on-cream, meaningful italics and small-caps, figures with captions).

## Typography

One superfamily: **Spectral** (Google Fonts), with **Spectral SC** for real small-caps.

- **Body / prose / captions:** Spectral 400, line-height 1.6.
- **Titles / headings:** Spectral 500–600.
- **Numeric readout:** Spectral with `font-variant-numeric: tabular-nums lining-nums` so ticking digits do not jitter. Medium weight, no negative tracking (not a flip-clock).
- **Akkadian terms** (*simanu*, *bēru*, *simanu*): italic.
- **Sumerian terms** (ᴜš, ɢᴀʀ) and small labels: small-caps (Spectral SC), letter-spacing ~0.04em.
- No system-sans anywhere. Serif is the whole voice.

## Color — paper & ink

```
--paper:  #f7f3e8   /* warm ivory ground */
--panel:  #fcf9f1   /* slightly lighter for the dial disc */
--ink:    #22201b   /* warm near-black, primary text */
--muted:  #6f665a   /* secondary text, captions */
--faint:  #a89e8d   /* tertiary, placeholders */
--rule:   #d8cfbc   /* hairline rules */
--day:    #a8741a   /* ochre — daylight arc, sun marker */
--night:  #3a4064   /* slate-indigo — night arc, moon marker */
--accent: #8a3b1e   /* terracotta — sparing emphasis, links */
```

Flat fills only. No gradients, no glossy drop-shadows, no rounded "card" surfaces.

## Layout & components

- **Masthead:** title in Spectral 600 + a one-line italic subtitle. Location shown as small-caps "at {city}".
- **Lede:** one foregrounded scholarly sentence under the masthead (the explanation is not buried).
- **The dial is a figure:** thin ink strokes, flat ochre day-arc / slate night-arc, fine tick rules, small-caps part labels, a hairline horizon and disc boundary. No sky gradient. A **caption** sits beneath: *Fig. 1. Seasonal hours at {city}, {date}.*
- **Readout:** typeset serif value centered in the disc, tabular figures, units as muted small-caps, day-part as small-caps + an italic gloss.
- **Data table:** the three figures (daylight hour, night hour, uš per hour) as a ruled table with hairline top/bottom rules and small-caps row labels — not cards.
- **Controls:** flat ink-outline buttons (no fill gradient), a ruled underline-style search field. 44px min touch targets retained.
- **About:** stays a collapsible apparatus, styled as footnotes/references; Willis Monroe credit + sources preserved.

## Motion

Minimal. No decorative animation. `prefers-reduced-motion` respected.

## Anti-slop guardrails

No gradients, no glossy shadows, no rounded card grids, no system-sans body, no centered-everything, no emoji as UI. Every ornament must teach or it is removed.
