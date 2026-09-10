// Sun position math — the sunrise equation (Wikipedia / NOAA), pure and side-effect-free.
// Extracted verbatim from index.html so tests guard the shipping logic.

export const DEG = Math.PI / 180;
export const MS_DAY = 86400000;

// Sunrise, sunset and solar transit for the UTC day containing `dateUTCday` (ms).
// Returns { sunrise, sunset, transit } as Date objects, or { polar: "day" | "night" }
// when the sun never sets / never rises at that latitude and date.
export function sunEvents(dateUTCday, lat, lng) {
  const Jdate = dateUTCday / MS_DAY + 2440587.5;
  const n = Math.round(Jdate - 2451545.0 + 0.0008);
  const Jstar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * Jstar) % 360;
  const C =
    1.9148 * Math.sin(M * DEG) + 0.02 * Math.sin(2 * M * DEG) + 0.0003 * Math.sin(3 * M * DEG);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const Jtransit =
    2451545.0 + Jstar + 0.0053 * Math.sin(M * DEG) - 0.0069 * Math.sin(2 * lambda * DEG);
  const delta = Math.asin(Math.sin(lambda * DEG) * Math.sin(23.44 * DEG));
  const cosw =
    (Math.sin(-0.833 * DEG) - Math.sin(lat * DEG) * Math.sin(delta)) /
    (Math.cos(lat * DEG) * Math.cos(delta));
  if (cosw >= 1) return { polar: "night" };
  if (cosw <= -1) return { polar: "day" };
  const w = Math.acos(cosw) / DEG;
  const toDate = (J) => new Date((J - 2440587.5) * MS_DAY);
  return {
    sunrise: toDate(Jtransit - w / 360),
    sunset: toDate(Jtransit + w / 360),
    transit: toDate(Jtransit),
  };
}

// Pick the day/night interval that contains `now`, looking at yesterday/today/tomorrow
// so a night that straddles midnight is framed correctly.
// Returns { daytime, start, end, sr, ss } or { polar }.
export function frameFor(now, lat, lng) {
  const day = Math.floor(now.getTime() / MS_DAY) * MS_DAY;
  const y = sunEvents(day - MS_DAY, lat, lng);
  const t = sunEvents(day, lat, lng);
  const m = sunEvents(day + MS_DAY, lat, lng);
  if (t.polar) return { polar: t.polar };
  if (now >= t.sunrise && now < t.sunset) {
    return { daytime: true, start: t.sunrise, end: t.sunset, sr: t.sunrise, ss: t.sunset };
  }
  if (now >= t.sunset) {
    const end = m.polar
      ? new Date(t.sunset.getTime() + (MS_DAY - (t.sunset - t.sunrise)))
      : m.sunrise;
    return { daytime: false, start: t.sunset, end, sr: t.sunrise, ss: t.sunset };
  }
  const start = y.polar
    ? new Date(t.sunrise.getTime() - (MS_DAY - (t.sunset - t.sunrise)))
    : y.sunset;
  return { daytime: false, start, end: t.sunrise, sr: t.sunrise, ss: t.sunset };
}

// Day of the year (1 = Jan 1) for the local date of `d`.
export function dayOfYear(d) {
  return Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) /
      MS_DAY,
  );
}
