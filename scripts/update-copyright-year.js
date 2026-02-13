#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function parseArgs(argv) {
  const args = { check: false, year: new Date().getFullYear() };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") {
      args.check = true;
      continue;
    }
    if (arg === "--year") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --year");
      const year = Number.parseInt(value, 10);
      if (!Number.isFinite(year) || year < 1970 || year > 3000) {
        throw new Error(`Invalid year: ${value}`);
      }
      args.year = year;
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      "Usage:",
      "  node scripts/update-copyright-year.js [--year <YYYY>] [--check]",
      "",
      "Options:",
      "  --year  Set the target end year (default: current year).",
      "  --check Do not write files; exit non-zero if changes are needed.",
      "",
    ].join("\n"),
  );
}

function isProbablyBinary(buffer) {
  const length = Math.min(buffer.length, 8000);
  for (let i = 0; i < length; i += 1) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function getGitTrackedFiles(cwd) {
  const result = spawnSync("git", ["ls-files", "-z"], {
    cwd,
    encoding: "buffer",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (result.status !== 0) return null;
  const output = result.stdout;
  if (!output || output.length === 0) return [];

  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((p) => path.join(cwd, p));
}

function walkFiles(rootDir) {
  const queue = [rootDir];
  const files = [];
  const ignoredDirs = new Set([
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    "out",
  ]);

  while (queue.length) {
    const current = queue.pop();
    if (!current) continue;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) queue.push(entryPath);
        continue;
      }
      if (entry.isFile()) files.push(entryPath);
    }
  }

  return files;
}

function updateFile(filePath, endYear, check) {
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch {
    return { changed: false, skipped: true };
  }

  if (buffer.length > 5 * 1024 * 1024) return { changed: false, skipped: true };
  if (isProbablyBinary(buffer)) return { changed: false, skipped: true };

  const text = buffer.toString("utf8");

  const re =
    /(\(c\)\s*Copyright\s+Ascensio System SIA\s+\d{4}[-–])(\d{4})/g;
  const nextText = text.replace(re, (_, prefix, existingEndYear) => {
    if (existingEndYear === String(endYear)) return `${prefix}${existingEndYear}`;
    return `${prefix}${endYear}`;
  });

  if (nextText === text) return { changed: false, skipped: false };

  if (!check) fs.writeFileSync(filePath, nextText, "utf8");
  return { changed: true, skipped: false };
}

function main() {
  const { check, year } = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();

  const tracked = getGitTrackedFiles(cwd);
  const files = tracked ?? walkFiles(cwd);

  let changedCount = 0;
  let scannedCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    const result = updateFile(filePath, year, check);
    if (result.skipped) {
      skippedCount += 1;
      continue;
    }
    scannedCount += 1;
    if (result.changed) changedCount += 1;
  }

  const mode = check ? "check" : "write";
  process.stdout.write(
    `Copyright years (${mode}): updated ${changedCount}, scanned ${scannedCount}, skipped ${skippedCount}\n`,
  );

  if (check && changedCount > 0) process.exit(1);
}

main();
