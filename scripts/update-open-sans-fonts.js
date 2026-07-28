#!/usr/bin/env node
/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const fs = require("node:fs");
const path = require("node:path");

// A modern desktop-browser User-Agent is required so that the Google Fonts
// CSS API returns woff2 sources. Older / generic agents fall back to ttf.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const rootDir = path.resolve(__dirname, "..");

const defaults = {
  family: "Open Sans",
  // Styles and weights currently used across DocSpace (see public/css/fonts.css).
  styles: ["normal", "italic"],
  weights: [300, 400, 500, 600, 700, 800],
  // Unicode subsets actually needed by DocSpace UI languages. The CDN also
  // offers "math" and "symbols" subsets — excluded, system fonts cover them.
  subsets: [
    "cyrillic-ext",
    "cyrillic",
    "greek-ext",
    "greek",
    "hebrew",
    "vietnamese",
    "latin-ext",
    "latin",
  ],
  display: "swap",
  cssOut: path.join(rootDir, "public/css/fonts.css"),
  fontsRoot: path.join(rootDir, "public/fonts"),
  cleanOld: false,
};

function printHelp() {
  process.stdout.write(
    [
      "Download the latest Open Sans woff2 sources from the Google Fonts CDN",
      "and regenerate public/css/fonts.css to reference the local copies.",
      "",
      "Usage:",
      "  node scripts/update-open-sans-fonts.js [options]",
      "",
      "Options:",
      '  --family <name>     Font family (default: "Open Sans").',
      "  --weights <list>    Comma-separated weights (default: 300,400,500,600,700,800).",
      "  --styles <list>     Comma-separated styles (default: normal,italic).",
      "  --subsets <list>    Comma-separated unicode subsets to keep, or \"all\"",
      "                      (default: cyrillic-ext,cyrillic,greek-ext,greek,",
      "                      hebrew,vietnamese,latin-ext,latin).",
      "  --display <value>   font-display value (default: swap).",
      "  --css-out <path>    Output CSS path (default: public/css/fonts.css).",
      "  --fonts-root <path> Root fonts directory (default: public/fonts).",
      "  --clean-old         Remove previous v* directories after a successful update.",
      "  --dry-run           Report what would change without writing anything.",
      "  --help, -h          Show this help.",
      "",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const args = { ...defaults, dryRun: false };

  const takeValue = (i, name) => {
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`Missing value for ${name}`);
    return value;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--family":
        args.family = takeValue(i, arg);
        i += 1;
        break;
      case "--weights":
        args.weights = takeValue(i, arg)
          .split(",")
          .map((w) => Number.parseInt(w.trim(), 10))
          .filter((w) => Number.isFinite(w));
        i += 1;
        break;
      case "--styles":
        args.styles = takeValue(i, arg)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        i += 1;
        break;
      case "--subsets":
        args.subsets = takeValue(i, arg)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        i += 1;
        break;
      case "--display":
        args.display = takeValue(i, arg);
        i += 1;
        break;
      case "--css-out":
        args.cssOut = path.resolve(takeValue(i, arg));
        i += 1;
        break;
      case "--fonts-root":
        args.fontsRoot = path.resolve(takeValue(i, arg));
        i += 1;
        break;
      case "--clean-old":
        args.cleanOld = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function buildCssApiUrl({ family, styles, weights, display }) {
  const hasItalic = styles.includes("italic");
  const hasNormal = styles.includes("normal");

  const sorted = [...weights].sort((a, b) => a - b);
  const tuples = [];
  if (hasNormal) for (const w of sorted) tuples.push(`0,${w}`);
  if (hasItalic) for (const w of sorted) tuples.push(`1,${w}`);

  const axis = hasItalic
    ? `:ital,wght@${tuples.join(";")}`
    : `:wght@${sorted.join(";")}`;

  const params = new URLSearchParams();
  params.set("family", `${family}${axis}`);
  params.set("display", display);
  return `https://fonts.googleapis.com/css2?${params.toString()}`;
}

async function fetchText(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.text();
}

async function fetchBinary(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Download of ${url} failed with status ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function filterSubsets(css, subsets) {
  if (subsets.includes("all")) return css;

  const allowed = new Set(subsets);
  const found = new Set();
  const dropped = new Set();

  // The CSS API precedes every @font-face block with a "/* subset */" comment.
  const filtered = css.replace(
    /\/\* ([\w-]+) \*\/\s*@font-face \{[^}]*\}\n?/g,
    (block, subset) => {
      found.add(subset);
      if (allowed.has(subset)) return block;
      dropped.add(subset);
      return "";
    },
  );

  const missing = subsets.filter((s) => !found.has(s));
  if (missing.length > 0) {
    throw new Error(
      `Requested subsets not present in the CDN response: ${missing.join(", ")}`,
    );
  }
  if (dropped.size > 0) {
    process.stdout.write(`Skipped subsets: ${[...dropped].join(", ")}\n`);
  }
  return filtered;
}

async function formatCss(css, cssOutPath) {
  // The committed fonts.css is Prettier-formatted (double quotes, 80-column
  // wrapping), while the Google Fonts CDN emits single quotes and long lines.
  // Formatting the output keeps re-runs of this script diff-minimal.
  let prettier;
  try {
    prettier = require("prettier");
  } catch {
    process.stderr.write(
      "Warning: prettier is not installed, writing unformatted CSS.\n",
    );
    return css;
  }
  const config = (await prettier.resolveConfig(cssOutPath)) ?? {};
  return prettier.format(css, {
    ...config,
    parser: "css",
    // The committed fonts.css uses LF regardless of the repo-wide CRLF setting.
    endOfLine: "lf",
  });
}

function extractLicenseHeader(cssOutPath) {
  // Reuse the header already present in fonts.css to avoid churn; fall back to
  // this script's own AGPL header if the file does not exist yet.
  if (fs.existsSync(cssOutPath)) {
    const existing = fs.readFileSync(cssOutPath, "utf8");
    const match = existing.match(/^\s*\/\*[\s\S]*?\*\//);
    if (match) return match[0].trim();
  }
  const self = fs.readFileSync(__filename, "utf8");
  return self.match(/\/\*[\s\S]*?\*\//)[0];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const headers = { "User-Agent": BROWSER_UA };

  const apiUrl = buildCssApiUrl(args);
  process.stdout.write(`Fetching CSS from Google Fonts:\n  ${apiUrl}\n`);
  const remoteCss = filterSubsets(
    await fetchText(apiUrl, headers),
    args.subsets,
  );

  const urlMatches = [...remoteCss.matchAll(/url\((https:\/\/[^)]+)\)/g)];
  if (urlMatches.length === 0) {
    throw new Error("No font URLs found in the CSS API response.");
  }

  const remoteUrls = urlMatches.map((m) => m[1]);
  if (!remoteUrls.every((u) => u.endsWith(".woff2"))) {
    throw new Error(
      "The CSS API returned non-woff2 sources. Check the User-Agent string.",
    );
  }

  const versions = new Set(
    remoteUrls.map((u) => {
      const m = u.match(/\/([^/]+)\/[^/]+\.woff2$/);
      return m ? m[1] : "unknown";
    }),
  );
  if (versions.size !== 1) {
    throw new Error(
      `Expected a single font version, found: ${[...versions].join(", ")}`,
    );
  }
  const version = [...versions][0];

  const targetDir = path.join(args.fontsRoot, version);
  const relFromCss = path
    .relative(path.dirname(args.cssOut), targetDir)
    .split(path.sep)
    .join("/");

  // Map each unique remote URL to a local relative path and download once.
  const localByUrl = new Map();
  for (const remoteUrl of remoteUrls) {
    if (localByUrl.has(remoteUrl)) continue;
    const fileName = remoteUrl.split("/").pop();
    localByUrl.set(remoteUrl, {
      fileName,
      relPath: `${relFromCss}/${fileName}`,
    });
  }

  process.stdout.write(
    `Version: ${version}\n` +
      `Unique files: ${localByUrl.size}\n` +
      `Fonts directory: ${targetDir}\n` +
      `CSS output: ${args.cssOut}\n`,
  );

  if (args.dryRun) {
    process.stdout.write("\n[dry-run] No files written.\n");
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });
  let downloaded = 0;
  for (const [remoteUrl, { fileName }] of localByUrl) {
    const buffer = await fetchBinary(remoteUrl, headers);
    fs.writeFileSync(path.join(targetDir, fileName), buffer);
    downloaded += 1;
    process.stdout.write(`  downloaded ${fileName} (${buffer.length} bytes)\n`);
  }

  // Rewrite remote URLs to local relative paths, keeping the CDN's structure
  // and subset comments intact.
  let localCss = remoteCss;
  for (const [remoteUrl, { relPath }] of localByUrl) {
    localCss = localCss.split(remoteUrl).join(relPath);
  }

  const header = extractLicenseHeader(args.cssOut);
  const finalCss = await formatCss(
    `${header}\n\n${localCss.trim()}\n`,
    args.cssOut,
  );
  fs.writeFileSync(args.cssOut, finalCss, "utf8");

  // Remove files of the current version that the CSS no longer references
  // (e.g. subsets excluded via --subsets on a re-run).
  const referenced = new Set(
    [...localByUrl.values()].map(({ fileName }) => fileName),
  );
  for (const entry of fs.readdirSync(targetDir)) {
    if (!referenced.has(entry)) {
      fs.rmSync(path.join(targetDir, entry));
      process.stdout.write(`  removed unreferenced file ${entry}\n`);
    }
  }

  // Optionally remove previous versions.
  if (args.cleanOld && fs.existsSync(args.fontsRoot)) {
    for (const entry of fs.readdirSync(args.fontsRoot, {
      withFileTypes: true,
    })) {
      if (
        entry.isDirectory() &&
        /^v\d+$/.test(entry.name) &&
        entry.name !== version
      ) {
        fs.rmSync(path.join(args.fontsRoot, entry.name), {
          recursive: true,
          force: true,
        });
        process.stdout.write(`  removed old directory ${entry.name}\n`);
      }
    }
  }

  process.stdout.write(
    `\nDone. Downloaded ${downloaded} file(s) and regenerated ${path.basename(
      args.cssOut,
    )}.\n`,
  );
  if (!args.cleanOld) {
    process.stdout.write(
      "Note: previous v* directories were kept. Re-run with --clean-old to remove them.\n",
    );
  }
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});

