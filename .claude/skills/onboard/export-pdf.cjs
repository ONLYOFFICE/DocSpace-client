#!/usr/bin/env node
/**
 * Print an onboarding page to PDF with the repo's Playwright (headless, print
 * media, backgrounds on). The page's print styles do the rest: every tab panel
 * expands under its title, the role filter shows every row, the contents list
 * sits at the top.
 *
 * Usage: node export-pdf.cjs <embedded page.html> <out.pdf>
 *
 * Reports the page count and every block that is taller than one printed page
 * (break-inside: avoid cannot keep such a block whole) — recapture or split it.
 *
 * Bookmarks: Chromium's own outline lists every heading, card titles included,
 * and drops the space at a line break; when PyMuPDF is installed
 * (python3 -m pip install --user pymupdf) the outline is rebuilt from the page
 * title, the numbered sections and their sub-headings only.
 */

const { join, resolve } = require("node:path");
const { readFileSync, writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { chromium } = require(join(__dirname, "../../../packages/client/node_modules/@playwright/test"));

const [file, out] = process.argv.slice(2);
if (!file || !out) {
  console.error("Usage: node export-pdf.cjs <page.html> <out.pdf>");
  process.exit(2);
}
let html = readFileSync(file, "utf8");
if (!/<!doctype/i.test(html))
  html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}img{max-width:100%}</style></head><body>${html}</body></html>`;

// A4 at 96dpi with 15mm margins; printed at SCALE so the desktop layout (three-card
// rows, the five-column flow strip, side-by-side shots) survives instead of folding
// into one column at the phone breakpoints.
const SCALE = 0.8;
const A4 = { width: Math.round(794 / SCALE), printable: Math.round((1123 - 2 * 57) / SCALE) };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: A4.width, height: Math.round(1123 / SCALE) } });
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(500);
  const tall = await page.evaluate((max) =>
    [...document.querySelectorAll(".panel, .card, figure, .diagram, .dia")]
      .filter((e) => !e.querySelector(".card, figure"))
      .map((e) => ({ h: Math.round(e.getBoundingClientRect().height), name: e.textContent.replace(/\s+/g, " ").trim().slice(0, 60) }))
      .filter((b) => b.h > max), A4.printable);
  const headings = await page.evaluate(() => {
    const clean = (e) => e.textContent.replace(/\s+/g, " ").trim();
    const out = [];
    const h1 = document.querySelector("h1");
    if (h1) out.push({ level: 1, title: clean(h1) });
    for (const sec of document.querySelectorAll("main section")) {
      const h2 = sec.querySelector("h2");
      if (!h2) continue;
      out.push({ level: 2, title: `${sec.querySelector(".sec-num")?.textContent.trim() || ""} ${clean(h2)}`.trim() });
      for (const h3 of sec.querySelectorAll(":scope > h3")) out.push({ level: 3, title: clean(h3) });
    }
    return out;
  });
  const pdf = await page.pdf({ format: "A4", scale: SCALE, printBackground: true, outline: true, tagged: true, margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" } });
  await browser.close();
  writeFileSync(resolve(out), pdf);
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`ok: ${resolve(out)} (${Math.round(pdf.length / 1024)}KB, ${pages} pages)`);
  for (const b of tall) console.log(`  block taller than a page (${b.h}px) will be cut ⚠ — "${b.name}"`);

  // rebuild the outline from the page's own headings; each is searched from the page the previous one sat on
  const py = `
import json, sys, warnings
warnings.filterwarnings("ignore")
try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        print("outline: PyMuPDF not installed, Chromium's own outline kept"); sys.exit(0)
path, heads = sys.argv[1], json.loads(sys.argv[2])
doc = fitz.open(path); toc = []; start = 0
for h in heads:
    page = next((i for i in range(start, len(doc)) if doc[i].search_for(h["title"][:40])), None)
    if page is None: page = start
    toc.append([h["level"], h["title"], page + 1]); start = page
doc.set_toc(toc); doc.save(path, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
print(f"outline: {len(toc)} bookmarks")
`;
  const r = spawnSync("python3", ["-c", py, resolve(out), JSON.stringify(headings)], { encoding: "utf8" });
  process.stdout.write(r.stdout || "");
  if (r.status) process.stderr.write(r.stderr || "");
})();
