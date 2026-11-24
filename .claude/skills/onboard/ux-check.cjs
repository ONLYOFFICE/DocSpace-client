#!/usr/bin/env node
/**
 * UX check for onboarding pages: renders the embedded page headless with the
 * repo's Playwright (desktop light + dark, phone 375px and 320px) and measures
 * what readers meet. Language-neutral — nothing here reads the words.
 *
 * Must fix (exit 1): text contrast below WCAG AA, horizontal scroll on a
 * phone, click targets under 24px, a screenshot that failed to load, shows
 * at under MIN_SHOT_SCALE of its real size on desktop, or is stretched above
 * its real size (pixels blur).
 * Report only: line length, the longest text run without a visual, text
 * hidden behind tabs, the number of font sizes, the smallest prose size, a
 * screenshot that is mostly flat background (crop it), a card grid whose last
 * row is short (an orphan), a screenshot pair of very different heights.
 *
 * Usage: node ux-check.cjs <page.html>
 */

const { join } = require("node:path");
const { readFileSync } = require("node:fs");
const { chromium } = require(join(__dirname, "../../../packages/client/node_modules/@playwright/test"));

const MIN_SHOT_SCALE = 0.6; // below this, ~13px product UI text renders under ~8px
const MAX_SHOT_SCALE = 1.0; // above real size a raster screenshot only blurs
const FLAT_SHARE = 0.5; // rows identical to the row above: an empty list area or a blank canvas; dialogs sit near 0.4
const PAIR_RATIO = 1.5; // taller frame of a pair over the shorter one
const MEASURE_MAX = 75; // characters per line
const MAX_FONT_SIZES = 7;

const file = process.argv[2];
if (!file) {
  console.error("Usage: node ux-check.cjs <page.html>");
  process.exit(2);
}
let html = readFileSync(file, "utf8");
// artifact-wrapper content has no doctype; without one the page renders in quirks mode
if (!/<!doctype/i.test(html))
  html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}img{max-width:100%}</style></head><body>${html}</body></html>`;

function measure() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return [0, 0, 0, 0];
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] ?? 1];
  };
  const over = (top, bottom) => [0, 1, 2].map((i) => top[i] * top[3] + bottom[i] * (1 - top[3])).concat(1);
  const lum = (c) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const bgOf = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) stack.push(c);
      if (c[3] === 1) break;
    }
    let bg = [255, 255, 255, 1];
    for (const c of stack.reverse()) bg = over(c, bg);
    return bg;
  };
  const opacityOf = (el) => {
    let o = 1;
    for (let e = el; e; e = e.parentElement) o *= +getComputedStyle(e).opacity;
    return o;
  };
  const snip = (el) => el.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
  const main = document.querySelector("main") || document.body;

  const contrast = [];
  for (const el of document.querySelectorAll("body *")) {
    if (["SCRIPT", "STYLE"].includes(el.tagName) || !vis(el) || !ownText(el)) continue;
    const cs = getComputedStyle(el);
    const bg = bgOf(el);
    const fg = parse(cs.color);
    fg[3] *= opacityOf(el);
    const r = ratio(over(fg, bg), bg);
    const size = parseFloat(cs.fontSize);
    const need = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
    if (r < need) contrast.push(`${el.className || el.tagName.toLowerCase()} ${r.toFixed(2)}:1 < ${need} — "${snip(el)}"`);
  }

  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const offenders = overflow > 0
    ? [...main.querySelectorAll("*")].filter((e) => vis(e) && e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".crop"))
        .filter((e, _, all) => !all.includes(e.parentElement)).slice(0, 4)
        .map((e) => `${e.tagName.toLowerCase()}.${e.className} reaches ${Math.round(e.getBoundingClientRect().right)}px`)
    : [];

  // share of rows identical to the previous one inside the visible region of the shot
  const flatShare = (img) => {
    if (!img.naturalWidth) return 0;
    const cs = getComputedStyle(img.closest(".crop") || img);
    const v = (n) => parseFloat(cs.getPropertyValue(n));
    const [sx, sy, sw, sh] = img.closest(".crop")
      ? [v("--cx"), v("--cy"), v("--cw"), v("--ch")]
      : [0, 0, img.naturalWidth, img.naturalHeight];
    const step = 4;
    const c = document.createElement("canvas");
    c.width = Math.ceil(sw / step); c.height = Math.ceil(sh / step);
    const ctx = c.getContext("2d");
    try { ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height); } catch { return 0; }
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const row = c.width * 4;
    let flat = 0;
    for (let y = 1; y < c.height; y++) {
      let same = true;
      for (let i = y * row; same && i < (y + 1) * row; i += 4)
        if (Math.abs(d[i] - d[i - row]) > 6 || Math.abs(d[i + 1] - d[i - row + 1]) > 6 || Math.abs(d[i + 2] - d[i - row + 2]) > 6) same = false;
      if (same) flat++;
    }
    return +(flat / (c.height - 1)).toFixed(2);
  };
  const shots = [...document.querySelectorAll(".frame img, figure img")].filter(vis).map((img) => ({
    loaded: img.naturalWidth > 0,
    scale: img.naturalWidth ? +(img.getBoundingClientRect().width / img.naturalWidth).toFixed(2) : 0,
    flat: flatShare(img),
    name: (img.alt || img.closest("figure")?.querySelector(".bar")?.textContent || "").trim().slice(0, 50),
  }));

  // a card grid whose last row is short: four cards on three columns leave an orphan
  const orphans = [...main.querySelectorAll(".compare, .roles")].filter(vis).map((g) => {
    const cols = getComputedStyle(g).gridTemplateColumns.split(" ").length;
    const n = g.children.length;
    return n > cols && n % cols ? `${n} cards on ${cols} columns near "${snip(g.children[0])}"` : null;
  }).filter(Boolean);

  // a screenshot pair of very different heights leaves the shorter frame mostly empty
  const pairs = [...main.querySelectorAll(".shots-2, .shots-3")].filter(vis).map((g) => {
    const hs = [...g.querySelectorAll(".frame")].map((f) => f.querySelector("img")?.getBoundingClientRect().height || 0).filter(Boolean);
    const ratio = hs.length > 1 ? Math.max(...hs) / Math.min(...hs) : 1;
    return { ratio: +ratio.toFixed(2), name: snip(g.querySelector(".bar") || g) };
  });

  const targets = [...document.querySelectorAll("button, a.fact, nav.toc a, [role=button], [role=tab]")].filter(vis)
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ r }) => r.height < 24 || r.width < 24)
    .map(({ e, r }) => `"${snip(e)}" ${Math.round(r.width)}×${Math.round(r.height)}`);

  // characters per line: line boxes are clusters of rect tops half a line apart
  const cpl = [];
  for (const el of main.querySelectorAll("p, li, figcaption, .callout, .note")) {
    if (!vis(el) || el.querySelector("p, li")) continue;
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = [...range.getClientRects()].map((r) => r.top).sort((a, b) => a - b);
    let lines = 0, last = -Infinity;
    for (const t of tops) if (t - last > lh * 0.5) { lines++; last = t; }
    const chars = el.textContent.replace(/\s+/g, " ").trim().length;
    if (lines >= 2) cpl.push({ cpl: Math.round(chars / (lines - 0.5)), text: snip(el) });
  }
  cpl.sort((a, b) => a.cpl - b.cpl);
  const q = (p) => cpl[Math.min(cpl.length - 1, Math.floor(p * cpl.length))]?.cpl ?? 0;

  const visualSel = "figure, .frame, .diagram, .dia, svg, .roles, .compare, ul.actions, .fsteps, .shots-2, .shots-3, table";
  const visuals = [...main.querySelectorAll(visualSel)].filter(vis)
    .map((e) => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; })
    .sort((a, b) => a[0] - b[0]);
  const mainR = main.getBoundingClientRect();
  const headingAt = (y) => [...main.querySelectorAll("h2")].filter((h) => h.getBoundingClientRect().top + scrollY <= y).pop()?.textContent.trim() || "";
  let edge = mainR.top + scrollY, run = { gap: 0, at: "" };
  for (const [t, b] of [...visuals, [mainR.bottom + scrollY, mainR.bottom + scrollY]]) {
    if (t - edge > run.gap) run = { gap: t - edge, at: headingAt(t) };
    edge = Math.max(edge, b);
  }

  const allText = main.textContent.replace(/\s+/g, "").length || 1;
  const hiddenText = [...main.querySelectorAll("[hidden]")].reduce((s, e) => s + e.textContent.replace(/\s+/g, "").length, 0);

  // inline code and UI strings scale with their parent (em) — not steps of the scale
  const sizes = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!vis(el) || !ownText(el) || el.closest(".ui, code, kbd")) continue;
    sizes.add(Math.round(parseFloat(getComputedStyle(el).fontSize) * 2) / 2);
  }
  const prose = [...main.querySelectorAll("p, li, figcaption")].filter(vis).map((p) => parseFloat(getComputedStyle(p).fontSize));

  return {
    contrast, overflow, offenders, shots, targets, orphans, pairs,
    cpl: { median: q(0.5), p90: q(0.9), over: cpl.filter((c) => c.cpl > 75).length, total: cpl.length, widest: cpl.at(-1) },
    run: { screens: +(run.gap / innerHeight).toFixed(2), at: run.at },
    hidden: Math.round((hiddenText / allText) * 100),
    sizes: [...sizes].sort((a, b) => a - b),
    proseMin: prose.length ? Math.min(...prose) : 0,
  };
}

(async () => {
  const browser = await chromium.launch();
  const must = [];
  const report = [];
  const runs = [
    { w: 1440, h: 900, scheme: "light", desktop: true },
    { w: 1440, h: 900, scheme: "dark", desktop: true },
    { w: 375, h: 812, scheme: "light" },
    { w: 320, h: 700, scheme: "light" },
  ];
  for (const run of runs) {
    const page = await browser.newPage({ viewport: { width: run.w, height: run.h } });
    await page.emulateMedia({ colorScheme: run.scheme });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(500);
    const m = await page.evaluate(measure);
    const tag = `${run.w}px ${run.scheme}`;
    for (const c of new Set(m.contrast)) must.push(`[${tag}] contrast: ${c}`);
    if (m.overflow > 0) must.push(`[${tag}] horizontal scroll ${m.overflow}px: ${m.offenders.join("; ")}`);
    for (const t of m.targets) must.push(`[${tag}] click target under 24px: ${t}`);
    for (const s of m.shots.filter((s) => !s.loaded)) must.push(`[${tag}] screenshot did not load: ${s.name}`);
    if (run.scheme === "light")
      for (const s of m.shots.filter((s) => s.loaded && s.scale > MAX_SHOT_SCALE + 0.02))
        must.push(`[${tag}] screenshot stretched to ${s.scale} of real size (max ${MAX_SHOT_SCALE}) — show it at real size or recapture it larger: ${s.name}`);
    if (run.desktop && run.scheme === "light") {
      for (const s of m.shots.filter((s) => s.loaded && s.scale < MIN_SHOT_SCALE))
        must.push(`[${tag}] screenshot at ${s.scale} of real size (min ${MIN_SHOT_SCALE}) — crop it or give it a full row: ${s.name}`);
      const sc = m.shots.map((s) => s.scale).sort((a, b) => a - b);
      if (sc.length) report.push(`screenshot scale on desktop: min ${sc[0]} · median ${sc[Math.floor(sc.length / 2)]} · max ${sc.at(-1)}`);
      for (const s of m.shots.filter((s) => s.flat > FLAT_SHARE))
        report.push(`screenshot is ${Math.round(s.flat * 100)}% flat background ⚠ — crop it to its content: ${s.name}`);
      for (const o of m.orphans) report.push(`card grid leaves an orphan ⚠ — ${o}`);
      for (const p of m.pairs.filter((p) => p.ratio > PAIR_RATIO))
        report.push(`screenshot pair heights differ ${p.ratio}× ⚠ — give each its own row: ${p.name}`);
      report.push(`line length: median ${m.cpl.median} · p90 ${m.cpl.p90}${m.cpl.p90 > MEASURE_MAX ? " ⚠" : ""} characters · over ${MEASURE_MAX}: ${m.cpl.over}/${m.cpl.total}${m.cpl.over ? ` — widest: "${m.cpl.widest.text}"` : ""}`);
      report.push(`longest text without a visual: ${m.run.screens} screens${m.run.screens > 1 ? " ⚠" : ""}${m.run.at ? ` (near "${m.run.at}")` : ""}`);
      report.push(`text behind tabs: ${m.hidden}%`);
      report.push(`font sizes: ${m.sizes.length}${m.sizes.length > MAX_FONT_SIZES ? " ⚠" : ""} (${m.sizes.join(", ")}) · smallest prose ${m.proseMin}px${m.proseMin < 16 ? " ⚠" : ""}`);
    }
    if (run.w === 375) {
      const sc = m.shots.map((s) => s.scale).sort((a, b) => a - b);
      if (sc.length) report.push(`screenshot scale on a phone: median ${sc[Math.floor(sc.length / 2)]} (the lightbox carries detail there)`);
      report.push(`longest text without a visual on a phone: ${m.run.screens} screens`);
    }
    await page.close();
  }
  await browser.close();
  console.log(`UX check — ${file.split("/").pop()}`);
  console.log(must.length ? `\nMust fix (${must.length}):\n  ${must.join("\n  ")}` : "\nMust fix: none");
  console.log(`\nReport:\n  ${report.join("\n  ")}`);
  process.exit(must.length ? 1 : 0);
})();
