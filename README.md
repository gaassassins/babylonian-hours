# babylonian-hours

A digital clock that tells the time in **seasonal hours**, the way the ancient
Babylonians reckoned the day.

Daylight is split into 12 equal hours and night into 12 equal hours, so the
length of an "hour" is not fixed at 60 minutes — it stretches in summer and
shrinks in winter, and day-hours differ from night-hours. The clock draws a
sun-dial whose gold day-arc and indigo night-arc resize with the real daylight
fraction for your location, with a marker tracking the sun (or moon) across it.

The readout is `Hh UU:GG` plus a day-part:

- **H** — the seasonal hour (*simanu*), 0–11 since sunrise or sunset
- **uš** — about 4 minutes (one degree of the sun's motion)
- **gar** — about 4 seconds; 60 to an uš
- **part** — ASR (after sunrise), BST (before sunset), AST (after sunset), BSR (before sunrise)

## Features

- Sunrise and sunset computed in the browser from the sunrise equation — no
  external APIs, works offline
- Location from your device (geolocation), a city picker, or manual coordinates
- Each location's times shown in its own timezone
- Handles polar day / night gracefully

## Running

It is a single self-contained `index.html`. Open it in a browser directly, or
serve the folder:

    python3 -m http.server 8000

then visit `http://localhost:8000`.

## Background

This is a modern rebuild of the seasonal-hours clock concept created by
**M. Willis Monroe** — see the
[original project](https://github.com/willismonroe/babylonian-hours). The
Babylonian units and day-parts follow his work.

MIT licensed. See [LICENSE](LICENSE).
