# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project uses
[semantic versioning](https://semver.org/).

## [1.0.0] — 2026-09-10

First tagged release.

### Features

- Seasonal-hour clock computed in the browser from the sunrise equation — no
  runtime APIs, works offline.
- Sun-dial figure whose day and night arcs scale with the daylight fraction; a
  live readout in *simanu* / uš / gar with the four day-parts (ASR/BST/AST/BSR).
- **Explore the seasons**: a season slider (with detents at the solstices and
  equinoxes) and a latitude slider, with animated arc transitions.
- 241 world capitals bundled for offline search, plus device geolocation and
  manual coordinates; per-location timezones; polar day / night handled.
- Scholarly editorial design (Spectral typography, paper-and-ink palette) with
  Notes and Further-reading panels citing sources.

### Engineering

- Source split into `src/` modules; a single self-contained page built with esbuild.
- Unit tests (Vitest) for the astronomy and Babylonian math.
- CI on GitHub Actions: lint, format check, test, build, then deploy to Pages.
- ESLint + Prettier.

[1.0.0]: https://github.com/gaassassins/babylonian-hours/releases/tag/v1.0.0
