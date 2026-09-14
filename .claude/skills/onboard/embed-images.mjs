#!/usr/bin/env node
/**
 * Replace @@IMG:key@@ markers in an onboarding page with data URIs.
 *
 * Enforces a hard per-image budget: very large data URIs have rendered as
 * blank boxes in the artifact viewer, so any PNG over the cap fails the
 * embed with a pointer to quantize-png.py (256-color PNG, visually lossless
 * for flat UI screenshots).
 *
 * Usage:
 *   node embed-images.mjs <source.html> <out.html> key=path/to.png ...
 *
 * Fails on: a marker with no mapping, a mapping with no marker, an image
 * over the cap, or a total page size over 4MB.
 */

import { readFileSync, writeFileSync } from "node:fs";

const IMAGE_CAP = 50 * 1024; // bytes of PNG; ~66K base64 chars
const PAGE_CAP = 4 * 1024 * 1024;

const [src, out, ...pairs] = process.argv.slice(2);
if (!src || !out || pairs.length === 0) {
  console.error("Usage: node embed-images.mjs <source.html> <out.html> key=path.png ...");
  process.exit(2);
}

const map = Object.fromEntries(pairs.map((p) => p.split(/=(.+)/).slice(0, 2)));
const used = new Set();
const problems = [];

let html = readFileSync(src, "utf8");
html = html.replace(/@@IMG:([a-z0-9-]+)@@/g, (m, key) => {
  if (!map[key]) {
    problems.push(`marker @@IMG:${key}@@ has no key=path mapping`);
    return m;
  }
  used.add(key);
  const buf = readFileSync(map[key]);
  if (buf.length > IMAGE_CAP) {
    problems.push(
      `${map[key]} is ${Math.round(buf.length / 1024)}KB (cap ${IMAGE_CAP / 1024}KB) - ` +
        `quantize it first: python3 .claude/skills/onboard/quantize-png.py ${map[key]}`,
    );
  }
  return "data:image/png;base64," + buf.toString("base64");
});

for (const key of Object.keys(map))
  if (!used.has(key)) problems.push(`key "${key}" matches no @@IMG:${key}@@ marker`);
if (html.length > PAGE_CAP)
  problems.push(`page is ${(html.length / 1024 / 1024).toFixed(1)}MB (cap 4MB) - drop or shrink images`);

if (problems.length) {
  problems.forEach((p) => console.error("ERROR: " + p));
  process.exit(1);
}

writeFileSync(out, html);
console.log(`ok: ${out} (${Math.round(html.length / 1024)}KB, ${used.size} images)`);
