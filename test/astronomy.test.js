import { describe, it, expect } from "vitest";
import { sunEvents, frameFor, dayOfYear, MS_DAY } from "../src/astronomy.js";

// Minutes since UTC midnight of a Date's own day.
const utcMinutes = d => d.getUTCHours() * 60 + d.getUTCMinutes();

describe("sunEvents — known ephemeris", () => {
  // Reference: sunrise-sunset.org for Paris (48.8566, 2.3522) on 2026-09-08 (UTC):
  //   sunrise 05:15:50Z, sunset 18:20:41Z. The sunrise equation is approximate,
  //   so allow a few minutes of slack.
  const e = sunEvents(Date.UTC(2026, 8, 8), 48.8566, 2.3522);

  it("returns Date objects, not a polar result, for Paris in September", () => {
    expect(e.polar).toBeUndefined();
    expect(e.sunrise).toBeInstanceOf(Date);
    expect(e.sunset).toBeInstanceOf(Date);
  });

  it("matches the reference sunrise within 6 minutes", () => {
    expect(Math.abs(utcMinutes(e.sunrise) - (5 * 60 + 16))).toBeLessThanOrEqual(6);
  });

  it("matches the reference sunset within 6 minutes", () => {
    expect(Math.abs(utcMinutes(e.sunset) - (18 * 60 + 21))).toBeLessThanOrEqual(6);
  });

  it("puts sunset after sunrise", () => {
    expect(e.sunset.getTime()).toBeGreaterThan(e.sunrise.getTime());
  });
});

describe("sunEvents — polar day and night", () => {
  it("reports polar day at 80°N on the June solstice", () => {
    expect(sunEvents(Date.UTC(2026, 5, 21), 80, 0).polar).toBe("day");
  });
  it("reports polar night at 80°N on the December solstice", () => {
    expect(sunEvents(Date.UTC(2026, 11, 21), 80, 0).polar).toBe("night");
  });
  it("flips for the southern hemisphere on the June solstice", () => {
    expect(sunEvents(Date.UTC(2026, 5, 21), -80, 0).polar).toBe("night");
  });
});

describe("frameFor — daytime", () => {
  it("frames midday as daytime with the sun between sunrise and sunset", () => {
    const now = new Date(Date.UTC(2026, 8, 8, 12, 0, 0)); // ~noon UTC, lng 0
    const f = frameFor(now, 45, 0);
    expect(f.polar).toBeUndefined();
    expect(f.daytime).toBe(true);
    expect(now >= f.start && now < f.end).toBe(true);
    expect(f.start.getTime()).toBe(f.sr.getTime());
    expect(f.end.getTime()).toBe(f.ss.getTime());
  });
});

describe("frameFor — night that straddles midnight", () => {
  // 02:00 UTC is before today's sunrise, so the current night began at
  // yesterday's sunset. This is the tricky path most likely to regress.
  const now = new Date(Date.UTC(2026, 8, 8, 2, 0, 0));
  const f = frameFor(now, 40, 0);

  it("is a night frame containing the instant", () => {
    expect(f.polar).toBeUndefined();
    expect(f.daytime).toBe(false);
    expect(now >= f.start && now < f.end).toBe(true);
  });
  it("starts at yesterday's sunset and ends at today's sunrise", () => {
    expect(f.start.getTime()).toBeLessThan(now.getTime());
    expect(f.end.getTime()).toBe(f.sr.getTime());          // ends at today's sunrise
    expect(f.start.getTime()).toBeLessThan(f.sr.getTime()); // started the previous evening
  });
  it("has a night length close to 24h minus the daylight length", () => {
    // The real night (yesterday's sunset -> today's sunrise) is only *close* to
    // 24h - today's daylight: day length drifts a couple of minutes per day near
    // the equinox, so allow 10 minutes of slack rather than asserting equality.
    const dayMs = f.ss - f.sr;
    expect(Math.abs((f.end - f.start) - (MS_DAY - dayMs))).toBeLessThan(10 * 60 * 1000);
  });
});

describe("dayOfYear", () => {
  it("is 1 on Jan 1 and 365 on Dec 31 (non-leap year)", () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
  });
  it("lands on the June solstice near day 172 in 2026", () => {
    expect(dayOfYear(new Date(2026, 5, 21))).toBe(172);
  });
});
