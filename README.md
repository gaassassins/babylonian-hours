# Babylonian Hours

A clock that shows the time in seasonal hours as reckoned in ancient Babylonia.

**Live:** https://gaassassins.github.io/babylonian-hours/

## What a seasonal hour is

Daylight is divided into twelve equal hours and the night into twelve equal
hours. Because the length of daylight changes through the year, the hours change
with it: a daytime hour is longer than a nighttime hour in summer and shorter in
winter, and the difference grows with latitude. Only at the equinoxes, or at the
equator, are the two roughly equal (about 60 minutes each). A fixed 60-minute
hour, by contrast, is reckoned independently of daylight. Seasonal hours were
used by many ancient and medieval cultures; the units below are the Babylonian
ones.

## The units

The readout is `Hh UU:GG` with a day-part:

- **H** (*simanu*) — the seasonal hour, 0–11, counted from sunrise (day) or sunset (night).
- **uš** — a Sumerian unit of about 4 minutes, equal to 1° of the sun's apparent
  motion (360° over 1440 minutes). The number of uš in a seasonal hour changes
  with that hour's length.
- **gar** — about 4 seconds; sixty gar to one uš.
- **day-part** — ASR (after sunrise), BST (before sunset), AST (after sunset), BSR (before sunrise).

The Babylonians tracked the day with water clocks and by the rising and
culmination of stars (as listed in MUL.APIN), and used a double-hour, the *bēru*
(twelve to a day, = 30° of celestial rotation), alongside seasonal hours. The
sub-hour uš and gar shown here are an anachronistic addition for a readable
display.

## How it is computed

Sunrise and sunset are computed in the browser from the
[sunrise equation](https://en.wikipedia.org/wiki/Sunrise_equation) from your
latitude and the date; no network requests are made. Day length is
(sunset − sunrise); the daytime hour is that divided by twelve, and the nighttime
hour is the rest of the 24 hours divided by twelve.

## Controls

- **Location** — search 241 world capitals (bundled, offline), use device
  geolocation, or enter coordinates. Times use each location's timezone.
- **Explore the seasons** — set a date (with detents at the solstices and
  equinoxes) and a latitude to see the seasonal hours for any day and place. The
  dial's day and night arcs are sized by the daylight fraction.
- Beyond the polar circles (about ±66.5°) a day can have no sunrise or sunset; the
  clock reports polar day or polar night.

## Running

The site is built from `src/` with esbuild into a single self-contained page
with no runtime dependencies. Build it, then open or serve `dist/`:

    npm install
    npm run build                    # writes dist/index.html

    python3 -m http.server -d dist 8000
    # then open http://localhost:8000

Run the unit tests with `npm test`.

## Design

Typography, palette, and the treatment of the dial as a labelled figure are in
[DESIGN.md](DESIGN.md).

## Credits and license

A rebuild of the seasonal-hours clock by **M. Willis Monroe**
([original project](https://github.com/willismonroe/babylonian-hours)); the units
and day-parts follow his work. Rebuild by
[gaassassins](https://github.com/gaassassins).

MIT licensed — see [LICENSE](LICENSE).
