import { describe, it, expect } from "vitest";
import { sunEvents, frameFor } from "../src/astronomy.js";
import { babylon } from "../src/babylon.js";

// Build a daytime frame straight from sunEvents (no "now" logic), then sample its midpoint.
function daytimeFrame(dayUTC, lat, lng) {
  const e = sunEvents(dayUTC, lat, lng);
  return { daytime: true, sr: e.sunrise, ss: e.sunset, start: e.sunrise, end: e.sunset };
}

describe("babylon — invariants across locations and dates", () => {
  const samples = [
    [Date.UTC(2026, 8, 8), 48.8566, 2.3522], // Paris, September
    [Date.UTC(2026, 5, 21), 60, 0], // 60°N, June solstice (long day)
    [Date.UTC(2026, 11, 21), 60, 0], // 60°N, December solstice (short day)
    [Date.UTC(2026, 2, 20), 0, 0], // equator, March equinox
    [Date.UTC(2026, 0, 15), -33.8688, 151.2], // Sydney, January
  ];

  for (const [day, lat, lng] of samples) {
    const f = daytimeFrame(day, lat, lng);
    const now = new Date((f.sr.getTime() + f.ss.getTime()) / 2); // solar midday
    const b = babylon(now, f);

    it(`day-hour and night-hour together span the 24h day (lat ${lat}, ${new Date(day).toISOString().slice(0, 10)})`, () => {
      expect(b.lDayMin * 12 + b.lNightMin * 12).toBeCloseTo(1440, 6);
    });
    it(`dayFrac is strictly between 0 and 1 (lat ${lat})`, () => {
      expect(b.dayFrac).toBeGreaterThan(0);
      expect(b.dayFrac).toBeLessThan(1);
    });
    it(`readout fields stay in range (lat ${lat})`, () => {
      expect(b.h).toBeGreaterThanOrEqual(0);
      expect(b.h).toBeLessThanOrEqual(11);
      expect(b.ush).toBeGreaterThanOrEqual(0);
      expect(b.ush).toBeLessThanOrEqual(b.ushMax - 1);
      expect(b.gar).toBeGreaterThanOrEqual(0);
      expect(b.gar).toBeLessThanOrEqual(59);
    });
  }
});

describe("babylon — seasonal behaviour", () => {
  it("makes a 60°N summer day-hour much longer than a winter one", () => {
    const summer = babylon(...midday(daytimeFrame(Date.UTC(2026, 5, 21), 60, 0)));
    const winter = babylon(...midday(daytimeFrame(Date.UTC(2026, 11, 21), 60, 0)));
    expect(summer.lDayMin).toBeGreaterThan(80); // ~94 min
    expect(winter.lDayMin).toBeLessThan(40); // ~29 min
    expect(summer.dayFrac).toBeGreaterThan(winter.dayFrac);
  });

  it("makes day and night roughly equal at the equator (dayFrac ~0.5)", () => {
    const b = babylon(...midday(daytimeFrame(Date.UTC(2026, 2, 20), 0, 0)));
    expect(b.dayFrac).toBeGreaterThan(0.49);
    expect(b.dayFrac).toBeLessThan(0.52);
    expect(Math.abs(b.lDayMin - b.lNightMin)).toBeLessThan(2);
  });

  it("labels a night reading AST or BSR", () => {
    const now = new Date(Date.UTC(2026, 8, 8, 2, 0, 0));
    const f = frameFor(now, 40, 0);
    const b = babylon(now, f);
    expect(["AST", "BSR"]).toContain(b.part);
  });
});

// helper: (frame) -> [midday Date, frame] for spreading into babylon(now, f)
function midday(f) {
  return [new Date((f.sr.getTime() + f.ss.getTime()) / 2), f];
}
