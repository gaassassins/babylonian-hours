// Convert an instant + its day/night frame into a Babylonian seasonal-hour reading.
// Pure; extracted verbatim from index.html so tests guard the shipping logic.

import { MS_DAY } from "./astronomy.js";

// `now` is a Date (or ms); `f` is a non-polar frame from frameFor().
// Returns { h, ush, gar, part, partLong, lDayMin, lNightMin, ushMax, dayFrac }.
//   h        seasonal hour, 0–11, counted from sunrise (day) or sunset (night)
//   ush      Sumerian unit (~4 min = 1° of the sun's motion) within the hour
//   gar      ~4 s; sixty to an uš
//   dayFrac  fraction of the 24h that is daylight (drives the dial arcs)
export function babylon(now, f) {
  const lDay = f.ss - f.sr;
  const lNight = MS_DAY - lDay;
  const hourLen = f.daytime ? lDay / 12 : lNight / 12;
  const ushMax = Math.max(1, Math.floor(hourLen / 240000));
  const garPerHour = ushMax * 60;
  const into = now - f.start;
  let h = Math.min(11, Math.max(0, Math.floor(into / hourLen)));
  const intoHour = into - h * hourLen;
  const ush = Math.min(ushMax - 1, Math.floor(intoHour / (hourLen / ushMax)));
  const gar = Math.min(
    59,
    Math.floor((intoHour - ush * (hourLen / ushMax)) / (hourLen / garPerHour)),
  );
  let part, partLong;
  if (f.daytime) {
    part = h < 6 ? "ASR" : "BST";
    partLong = h < 6 ? "after sunrise" : "before sunset";
  } else {
    part = h < 6 ? "AST" : "BSR";
    partLong = h < 6 ? "after sunset" : "before sunrise";
  }
  return {
    h,
    ush,
    gar,
    part,
    partLong,
    lDayMin: lDay / 12 / 60000,
    lNightMin: lNight / 12 / 60000,
    ushMax,
    dayFrac: lDay / MS_DAY,
  };
}
