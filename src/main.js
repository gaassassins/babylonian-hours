import { DEG, MS_DAY, frameFor, dayOfYear } from "./astronomy.js";
import { babylon } from "./babylon.js";
import { CAPITALS } from "./capitals.js";

// ---------- Dial ----------
const CX = 200,
  CY = 200,
  R = 170;
// Marker colours are derived from the CSS custom properties (styles.css :root),
// so the palette has a single source; the literals here are only a fallback.
const rootCSS = getComputedStyle(document.documentElement);
const DAY = rootCSS.getPropertyValue("--day").trim() || "#a8741a";
const NIGHT = rootCSS.getPropertyValue("--night").trim() || "#3a4064";
const $ = (id) => document.getElementById(id);
function pt(thetaDeg, r = R) {
  const a = thetaDeg * DEG;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
}
function arcPath(a0, a1, r = R) {
  const [x0, y0] = pt(a0, r),
    [x1, y1] = pt(a1, r);
  const large = (((a1 - a0) % 360) + 360) % 360 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function drawStatic(dayFrac) {
  const dayHalf = dayFrac * 180;
  const srA = -dayHalf,
    ssA = dayHalf;
  $("dayArc").setAttribute("d", arcPath(srA, ssA));
  $("nightArc").setAttribute("d", arcPath(ssA, srA + 360));
  const [, hy] = pt(ssA);
  $("horizon").setAttribute("y1", hy.toFixed(1));
  $("horizon").setAttribute("y2", hy.toFixed(1));
  $("sky").setAttribute("height", hy.toFixed(1));
  $("ground").setAttribute("y", hy.toFixed(1));
  $("ground").setAttribute("height", (400 - hy).toFixed(1));

  const ticks = $("ticks");
  ticks.innerHTML = "";
  const dayStep = (dayFrac * 360) / 12;
  const nightStep = ((1 - dayFrac) * 360) / 12;
  const addTick = (a, major) => {
    const [x1, y1] = pt(a, R - (major ? 14 : 8));
    const [x2, y2] = pt(a, R + 2);
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);
    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);
    l.setAttribute("stroke", major ? "rgba(34,32,27,0.55)" : "rgba(34,32,27,0.2)");
    l.setAttribute("stroke-width", major ? 2 : 1);
    ticks.appendChild(l);
  };
  for (let k = 0; k <= 12; k++) addTick(srA + k * dayStep, k === 0 || k === 12 || k === 6);
  for (let k = 1; k < 12; k++) addTick(ssA + k * nightStep, k === 6);

  const pl = $("partLabels");
  pl.innerHTML = "";
  const label = (txt, a, r) => {
    const [x, y] = pt(a, r);
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.textContent = txt;
    pl.appendChild(t);
  };
  label("ASR", srA + dayFrac * 90, R - 30);
  label("BST", ssA - dayFrac * 90, R - 30);
  label("AST", ssA + (1 - dayFrac) * 90, R - 30);
  label("BSR", srA + 360 - (1 - dayFrac) * 90, R - 30);
}

function placeMarker(f, b, now) {
  const dayHalf = b.dayFrac * 180;
  let theta;
  if (f.daytime) theta = -dayHalf + ((now - f.start) / (f.end - f.start)) * (b.dayFrac * 360);
  else theta = dayHalf + ((now - f.start) / (f.end - f.start)) * ((1 - b.dayFrac) * 360);
  const [x, y] = pt(theta);
  const m = $("marker"),
    g = $("glow");
  m.setAttribute("cx", x);
  m.setAttribute("cy", y);
  g.setAttribute("cx", x);
  g.setAttribute("cy", y);
  if (f.daytime) {
    m.setAttribute("fill", DAY);
    m.setAttribute("r", 8);
    g.style.opacity = 0;
  } else {
    m.setAttribute("fill", NIGHT);
    m.setAttribute("r", 7);
    g.style.opacity = 0;
  }
}

// ---------- App ----------
let LAT = 48.8566,
  LNG = 2.3522,
  LOCNAME = "Paris",
  LOCTZ = "Europe/Paris";
let currentFrac = null,
  animRAF = null,
  animating = false,
  animTarget = null,
  pendingAnimate = false;
// Draw the dial at `target` day-fraction; tween the arcs when `animate` is set (a season jump).
function setDial(target, animate) {
  if (animate && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    animate = false;
  if (currentFrac === null) {
    drawStatic(target);
    currentFrac = target;
    return;
  }
  if (!animate) {
    if (animating && animTarget !== null && Math.abs(target - animTarget) < 0.01) return; // don't interrupt a tween to the same target
    if (animating) {
      if (animRAF) cancelAnimationFrame(animRAF);
      animating = false;
    }
    if (Math.abs(target - currentFrac) > 0.0005) {
      drawStatic(target);
      currentFrac = target;
    }
    return;
  }
  if (Math.abs(target - currentFrac) < 0.0015) return;
  if (animRAF) cancelAnimationFrame(animRAF);
  const from = currentFrac,
    to = target,
    t0 = performance.now(),
    dur = 520;
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  animating = true;
  animTarget = to;
  const stepFn = (nowT) => {
    const p = Math.min(1, (nowT - t0) / dur);
    const frac = from + (to - from) * ease(p);
    drawStatic(frac);
    currentFrac = frac;
    if (p < 1) animRAF = requestAnimationFrame(stepFn);
    else {
      animating = false;
      currentFrac = to;
    }
  };
  animRAF = requestAnimationFrame(stepFn);
}
const pad = (n) => String(n).padStart(2, "0");
function hhmm(d) {
  if (LOCTZ) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: LOCTZ,
      }).format(d);
    } catch {
      /* fall through */
    }
  }
  const s = new Date(d.getTime() + Math.round(LNG / 15) * 3600000);
  return pad(s.getUTCHours()) + ":" + pad(s.getUTCMinutes());
}
function dateLabel(d) {
  const opt = { day: "numeric", month: "long", year: "numeric" };
  if (LOCTZ) {
    try {
      return new Intl.DateTimeFormat("en-GB", { ...opt, timeZone: LOCTZ }).format(d);
    } catch {
      /* fall through */
    }
  }
  return new Intl.DateTimeFormat("en-GB", opt).format(d);
}

// ----- explore mode: season + latitude scrubber -----
let explore = { active: false, doy: 172, lat: 48 };
function seasonDate(doy) {
  return new Date(Date.UTC(new Date().getFullYear(), 0, doy, 12, 0, 0));
}
function seasonLabel(d, long) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: long ? "long" : "short",
    timeZone: "UTC",
  }).format(d);
}
function latLabel(lat) {
  const a = Math.abs(Math.round(lat));
  return a === 0 ? "0° (equator)" : a + "° " + (lat >= 0 ? "N" : "S");
}
function hm(ms) {
  return Math.floor(ms / 3600000) + " h " + pad(Math.round((ms % 3600000) / 60000)) + " m";
}
function liveCivil(now, f) {
  return (
    "Civil time <b>" +
    hhmm(now) +
    "</b> &nbsp;·&nbsp; sunrise <b>" +
    hhmm(f.sr) +
    "</b> &nbsp;·&nbsp; sunset <b>" +
    hhmm(f.ss) +
    "</b>"
  );
}
function exploreCivil(f) {
  const day = f.ss - f.sr;
  return "Day length <b>" + hm(day) + "</b> &nbsp;·&nbsp; night <b>" + hm(MS_DAY - day) + "</b>";
}
function currentSample() {
  if (explore.active) return { now: seasonDate(explore.doy), lat: explore.lat, lng: LNG };
  return { now: new Date(), lat: LAT, lng: LNG };
}

// Screen-reader announcement — only speaks when the sentence changes (about once
// per seasonal hour, or on a location / mode change), never on every tick.
let lastAnnounce = "";
function announce(text) {
  if (text === lastAnnounce) return;
  lastAnnounce = text;
  $("a11y").textContent = text;
}

function tick() {
  const S = currentSample();
  const now = S.now,
    f = frameFor(now, S.lat, S.lng);
  $("err").textContent = "";
  $("locName").textContent = LOCNAME;
  $("capLoc").textContent = explore.active ? latLabel(S.lat) : LOCNAME;
  $("capDate").textContent = explore.active ? seasonLabel(now, true) : dateLabel(now);
  if (f.polar) {
    $("oHour").textContent = "--";
    $("oUsh").textContent = "--";
    $("oGar").textContent = "--";
    $("oPart").textContent = f.polar === "day" ? "MIDNIGHT SUN" : "POLAR NIGHT";
    $("oPartLong").textContent = "no sunrise or sunset at this latitude";
    $("civilLine").innerHTML = explore.active
      ? "The sun stays " + (f.polar === "day" ? "above" : "below") + " the horizon all day"
      : "";
    announce(
      (f.polar === "day" ? "Midnight sun" : "Polar night") +
        " at " +
        (explore.active ? latLabel(S.lat) : LOCNAME),
    );
    currentFrac = null;
    pendingAnimate = false;
    return;
  }
  const b = babylon(now, f);
  setDial(b.dayFrac, pendingAnimate);
  pendingAnimate = false;
  placeMarker(f, b, now);
  $("oHour").textContent = pad(b.h);
  $("oUsh").textContent = pad(b.ush);
  $("oGar").textContent = pad(b.gar);
  $("oPart").textContent = b.part;
  $("oPartLong").textContent = b.partLong;
  $("sDay").innerHTML = b.lDayMin.toFixed(1) + " <small>min</small>";
  $("sNight").innerHTML = b.lNightMin.toFixed(1) + " <small>min</small>";
  $("sUsh").textContent = b.ushMax;
  $("civilLine").innerHTML = explore.active ? exploreCivil(f) : liveCivil(now, f);
  announce(
    "Seasonal hour " +
      b.h +
      ", " +
      b.partLong +
      ", at " +
      (explore.active ? latLabel(S.lat) : LOCNAME),
  );
}

function setLocation(lat, lng, name, tz) {
  LAT = lat;
  LNG = lng;
  LOCNAME = name;
  LOCTZ = tz || null;
  explore.active = false;
  const er = document.getElementById("exploreReset");
  if (er) er.hidden = true;
  const ls = document.getElementById("latSlider");
  if (ls) ls.value = Math.round(lat);
  const ss = document.getElementById("seasonSlider");
  if (ss) ss.value = dayOfYear(new Date());
  updateExploreLabels();
  pendingAnimate = true;
  tick();
}

// ----- capital search combobox -----
const search = $("citySearch"),
  listEl = $("cityList");
let matches = [],
  active = -1;
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function filterCaps(q) {
  const nq = norm(q.trim());
  if (!nq)
    return CAPITALS.slice()
      .sort((a, b) => a.n.localeCompare(b.n))
      .slice(0, 60);
  const starts = [],
    has = [];
  for (const c of CAPITALS) {
    const n = norm(c.n),
      cc = norm(c.c);
    if (n.startsWith(nq) || cc.startsWith(nq)) starts.push(c);
    else if (n.includes(nq) || cc.includes(nq)) has.push(c);
  }
  return starts.concat(has).slice(0, 60);
}
function hi(text, q) {
  const nq = norm(q.trim());
  if (!nq) return esc(text);
  const i = norm(text).indexOf(nq);
  if (i < 0) return esc(text);
  return (
    esc(text.slice(0, i)) +
    "<mark>" +
    esc(text.slice(i, i + nq.length)) +
    "</mark>" +
    esc(text.slice(i + nq.length))
  );
}
function renderList() {
  const q = search.value;
  matches = filterCaps(q);
  active = -1;
  if (!matches.length) {
    listEl.innerHTML =
      '<li class="empty">No capital matches — try “Use my location” or coordinates.</li>';
  } else {
    listEl.innerHTML = matches
      .map(
        (c, i) =>
          `<li role="option" data-i="${i}"><span class="nm">${hi(c.n, q)}</span><span class="cty">${hi(c.c, q)}</span></li>`,
      )
      .join("");
  }
  openList();
}
function openList() {
  listEl.hidden = false;
  search.setAttribute("aria-expanded", "true");
}
function closeList() {
  listEl.hidden = true;
  search.setAttribute("aria-expanded", "false");
  active = -1;
}
function choose(i) {
  const c = matches[i];
  if (!c) return;
  setLocation(c.lat, c.lng, `${c.n}, ${c.c}`, c.tz);
  search.value = "";
  closeList();
  search.blur();
}
function setActive(i) {
  const items = listEl.querySelectorAll("li[data-i]");
  if (!items.length) return;
  active = (i + items.length) % items.length;
  items.forEach((el) => el.classList.remove("active"));
  const el = items[active];
  el.classList.add("active");
  el.scrollIntoView({ block: "nearest" });
}

search.addEventListener("focus", renderList);
search.addEventListener("input", renderList);
search.addEventListener("keydown", (e) => {
  if (listEl.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    renderList();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive(active + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive(active - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    choose(active >= 0 ? active : 0);
  } else if (e.key === "Escape") {
    closeList();
  }
});
listEl.addEventListener("mousedown", (e) => {
  const li = e.target.closest("li[data-i]");
  if (!li) return;
  e.preventDefault();
  choose(Number(li.dataset.i));
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".combo")) closeList();
});
$("useLoc").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("err").textContent = "Geolocation not available in this browser.";
    return;
  }
  $("err").textContent = "Locating…";
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  navigator.geolocation.getCurrentPosition(
    (p) => setLocation(p.coords.latitude, p.coords.longitude, "My location", browserTz),
    () => {
      $("err").textContent = "Location denied — pick a city or enter coordinates.";
    },
    { timeout: 8000 },
  );
});
$("setManual").addEventListener("click", () => {
  const lat = parseFloat($("latIn").value),
    lng = parseFloat($("lngIn").value);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    setLocation(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)} (~local)`, null);
  } else {
    $("err").textContent = "Enter a valid latitude (-90..90) and longitude (-180..180).";
  }
});

// ----- explore slider wiring -----
const seasonSlider = $("seasonSlider"),
  latSlider = $("latSlider"),
  exploreReset = $("exploreReset");
const SNAP = 3; // days of magnetic snap around each solstice/equinox
const DETENTS = [
  { m: 2, d: 20, name: "March equinox", lab: "Mar<br>equinox" },
  { m: 5, d: 21, name: "June solstice", lab: "Jun<br>solstice" },
  { m: 8, d: 22, name: "September equinox", lab: "Sep<br>equinox" },
  { m: 11, d: 21, name: "December solstice", lab: "Dec<br>solstice" },
].map((x) => ({ ...x, doy: dayOfYear(new Date(Date.UTC(new Date().getFullYear(), x.m, x.d))) }));

$("detents").innerHTML = DETENTS.map((d) => {
  const pct = ((d.doy - 1) / 364) * 100;
  return `<button type="button" class="detent" data-doy="${d.doy}" style="left:${pct.toFixed(1)}%" title="${d.name}"><span class="dtick"></span><span class="dlab">${d.lab}</span></button>`;
}).join("");

function highlightDetents() {
  const v = +seasonSlider.value;
  document
    .querySelectorAll("#detents .detent")
    .forEach((b) => b.classList.toggle("on", +b.dataset.doy === v));
}
function updateExploreLabels() {
  const hit = DETENTS.find((x) => x.doy === +seasonSlider.value);
  $("seasonVal").textContent =
    seasonLabel(seasonDate(+seasonSlider.value), false) + (hit ? " · " + hit.name : "");
  $("latVal").textContent = latLabel(+latSlider.value);
  highlightDetents();
}
function enterExplore(animate) {
  explore.active = true;
  explore.doy = +seasonSlider.value;
  explore.lat = +latSlider.value;
  exploreReset.hidden = false;
  pendingAnimate = !!animate;
  updateExploreLabels();
  tick();
}
function snapSeason() {
  const v = +seasonSlider.value;
  let best = null,
    bd = 999;
  for (const d of DETENTS) {
    const dist = Math.abs(v - d.doy);
    if (dist < bd) {
      bd = dist;
      best = d;
    }
  }
  if (best && bd <= SNAP) seasonSlider.value = best.doy;
}
seasonSlider.addEventListener("input", () => {
  snapSeason();
  enterExplore(false);
});
latSlider.addEventListener("input", () => enterExplore(false));
$("detents").addEventListener("click", (e) => {
  const b = e.target.closest(".detent");
  if (!b) return;
  seasonSlider.value = b.dataset.doy;
  enterExplore(true); // jump to a solstice/equinox — animate the arcs
});
exploreReset.addEventListener("click", () => {
  explore.active = false;
  exploreReset.hidden = true;
  seasonSlider.value = dayOfYear(new Date());
  latSlider.value = Math.round(LAT);
  pendingAnimate = true;
  updateExploreLabels();
  tick();
});
seasonSlider.value = dayOfYear(new Date());
latSlider.value = Math.round(LAT);
updateExploreLabels();

tick();
setInterval(tick, 250);
