#!/usr/bin/env node
/**
 * Coverage of the OpenSpec main specs by tests, read from the text of the
 * specs. Read-only: never edits a file.
 *
 * Three reports:
 *   counts   per capability: requirements, scenarios and the rows of each
 *            verification.md status (E2E-CONFIRMED, UNIT-CONFIRMED,
 *            CODE-ONLY, SERVER-SPEC, MATRIX-ONLY); the CODE-ONLY column is
 *            the backlog of missing tests
 *   uncited  Playwright spec files and Vitest test files that no
 *            verification.md cites, so a spec may be missing a row or a
 *            capability may be missing altogether
 *   lint     requirement bodies of 500 characters or more, and control
 *            characters in any openspec Markdown file (a PowerShell
 *            "`f" inside double quotes writes a form feed)
 *
 * A file counts as cited when a verification.md holds its repository path,
 * its path below `packages/<app>/__tests__/`, or its file name together with
 * the name of the folder above it (the shorthand form, e.g. `tpl/` plus
 * `__tests__/utils.test.ts`). It is a text scan: a shared file name can count
 * a file as cited that no row really names, so read the row before relying
 * on it.
 *
 * Usage (from the repo root):
 *   node .claude/scripts/openspec/coverage.mjs                 all reports
 *   node .claude/scripts/openspec/coverage.mjs counts
 *   node .claude/scripts/openspec/coverage.mjs uncited --e2e   Playwright only
 *   node .claude/scripts/openspec/coverage.mjs uncited --unit  Vitest only
 *   node .claude/scripts/openspec/coverage.mjs lint
 *   node .claude/scripts/openspec/coverage.mjs --json
 *
 * Exit code: 0 clean, 1 a lint finding, 2 script error.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SPECS_DIR = join(ROOT, "openspec", "specs");
const OPENSPEC_DIR = join(ROOT, "openspec");
const PACKAGES_DIR = join(ROOT, "packages");
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "screenshots",
  "playwright-report",
  "test-results",
]);
const STATUSES = [
  "E2E-CONFIRMED",
  "UNIT-CONFIRMED",
  "CODE-ONLY",
  "SERVER-SPEC",
  "MATRIX-ONLY",
];
const MAX_REQUIREMENT_LENGTH = 500;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

const args = process.argv.slice(2);
const report = args.find((arg) => !arg.startsWith("--")) ?? "all";
const asJson = args.includes("--json");
const onlyE2e = args.includes("--e2e");
const onlyUnit = args.includes("--unit");

const toPosix = (path) => path.split(sep).join("/");

const walk = (dir, match, found = []) => {
  if (!existsSync(dir)) return found;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, match, found);
    else if (match(path)) found.push(path);
  }
  return found;
};

const capabilityDirs = () =>
  walk(SPECS_DIR, (path) => basename(path) === "spec.md").map(dirname);

const capabilityName = (dir) => toPosix(relative(SPECS_DIR, dir));

const readIf = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");

const countRows = (text, status) =>
  text.split("\n").filter((line) => line.includes(`| ${status} |`)).length;

const getCounts = () =>
  capabilityDirs()
    .map((dir) => {
      const spec = readIf(join(dir, "spec.md"));
      const verification = readIf(join(dir, "verification.md"));
      const row = {
        capability: capabilityName(dir),
        requirements: (spec.match(/^### Requirement:/gm) ?? []).length,
        scenarios: (spec.match(/^#### Scenario:/gm) ?? []).length,
        verification: verification ? "yes" : "no",
      };
      for (const status of STATUSES) row[status] = countRows(verification, status);
      return row;
    })
    .sort((a, b) => a.capability.localeCompare(b.capability));

const testFiles = () => {
  const files = walk(PACKAGES_DIR, (path) =>
    /\.(spec|test)\.(ts|tsx|js|jsx|mts)$/.test(path),
  ).map((path) => toPosix(relative(ROOT, path)));

  return files
    .map((path) => ({
      path,
      kind: /\/__tests__\/.*\.spec\.(ts|tsx)$/.test(path) &&
        !/\/src\//.test(path)
        ? "e2e"
        : "unit",
    }))
    .filter(({ kind }) =>
      onlyE2e ? kind === "e2e" : onlyUnit ? kind === "unit" : true,
    );
};

const isCited = (path, texts) => {
  const belowTests = path.replace(/^packages\/[^/]+\/__tests__\//, "");
  const name = basename(path);
  const parts = path.split("/");
  const folder = parts[parts.length - 2] === "__tests__"
    ? parts[parts.length - 3]
    : parts[parts.length - 2];

  return texts.some(
    (text) =>
      text.includes(path) ||
      (belowTests !== path && text.includes(belowTests)) ||
      (text.includes(name) && text.includes(folder)),
  );
};

const getUncited = () => {
  const texts = capabilityDirs().map((dir) => readIf(join(dir, "verification.md")));
  return testFiles().filter(({ path }) => !isCited(path, texts));
};

const getLint = () => {
  const findings = [];

  for (const dir of capabilityDirs()) {
    const lines = readIf(join(dir, "spec.md")).split("\n");
    let name = null;
    let body = [];

    const flush = () => {
      if (name === null) return;
      const length = body.join(" ").trim().length;
      if (length >= MAX_REQUIREMENT_LENGTH)
        findings.push({
          file: toPosix(relative(ROOT, join(dir, "spec.md"))),
          problem: `requirement "${name}" is ${length} characters`,
        });
    };

    for (const line of lines) {
      if (line.startsWith("### Requirement:")) {
        flush();
        name = line.slice("### Requirement:".length).trim();
        body = [];
      } else if (line.startsWith("#")) {
        flush();
        name = null;
      } else if (name !== null && line.trim()) {
        body.push(line.trim());
      }
    }
    flush();
  }

  for (const file of walk(OPENSPEC_DIR, (path) => path.endsWith(".md"))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (CONTROL_CHARS.test(line))
          findings.push({
            file: `${toPosix(relative(ROOT, file))}:${index + 1}`,
            problem: "control character",
          });
      });
  }

  return findings;
};

const printTable = (rows, columns) => {
  console.log(`| ${columns.join(" | ")} |`);
  console.log(`|${columns.map(() => "---").join("|")}|`);
  for (const row of rows)
    console.log(`| ${columns.map((column) => row[column]).join(" | ")} |`);
};

try {
  const result = {};
  if (report === "all" || report === "counts") result.counts = getCounts();
  if (report === "all" || report === "uncited") result.uncited = getUncited();
  if (report === "all" || report === "lint") result.lint = getLint();

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.counts) {
      console.log("## Counts\n");
      printTable(result.counts, [
        "capability",
        "requirements",
        "scenarios",
        "verification",
        ...STATUSES,
      ]);
      const total = (status) =>
        result.counts.reduce((sum, row) => sum + row[status], 0);
      console.log(
        `\nTotal: ${STATUSES.map((status) => `${status} ${total(status)}`).join(", ")}\n`,
      );
    }
    if (result.uncited) {
      console.log(`## Test files no verification.md cites (${result.uncited.length})\n`);
      for (const { path, kind } of result.uncited) console.log(`- [${kind}] ${path}`);
      console.log("");
    }
    if (result.lint) {
      console.log(`## Lint (${result.lint.length})\n`);
      for (const { file, problem } of result.lint) console.log(`- ${file}: ${problem}`);
    }
  }

  process.exit(result.lint?.length ? 1 : 0);
} catch (error) {
  console.error(error);
  process.exit(2);
}
