#!/usr/bin/env node
/**
 * Coverage of the OpenSpec main specs by tests, read from the text of the
 * specs. Read-only: never edits a file.
 *
 * Four reports:
 *   counts   per capability: requirements, scenarios and the rows of each
 *            verification.md status (E2E-CONFIRMED, UNIT-CONFIRMED,
 *            CODE-ONLY, SERVER-SPEC, MATRIX-ONLY); the CODE-ONLY column is
 *            the backlog of missing tests
 *   uncited  Playwright spec files and Vitest test files that no
 *            verification.md cites, so a spec may be missing a row or a
 *            capability may be missing altogether; the AI tests (owned by
 *            the change ai-chat-agents-design) and the private rooms tests
 *            (their own workflow) are expected and only counted
 *   stale    `file:line` citations of E2E-CONFIRMED and UNIT-CONFIRMED rows
 *            whose line no longer opens a test (`test(`, `it(`, `describe(`
 *            on that line or the next) or lies past the end of the file;
 *            a citation through a shorthand of the file's header that does
 *            not resolve to one test file is only counted as unchecked
 *   lint     requirement bodies of 500 characters or more, and control
 *            characters in any openspec Markdown file (a PowerShell
 *            "`f" inside double quotes writes a form feed), and a literal
 *            "\n" before a word (a line break written as text by a script)
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
 *   node .claude/scripts/openspec/coverage.mjs stale
 *   node .claude/scripts/openspec/coverage.mjs lint
 *   node .claude/scripts/openspec/coverage.mjs --json
 *
 * Exit code: 0 clean, 1 a lint or stale finding, 2 script error.
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
const LITERAL_NEWLINE = /\\n(?=[a-z])/;
const EXPECTED_UNCITED = [
  { pattern: /^ai-/, owner: "change ai-chat-agents-design" },
  {
    pattern: /^(private-rooms?-|keys-management|key-flow-|encrypted-)/,
    owner: "private-rooms",
  },
];
const TEST_FILE = /\.(spec|test)\.(ts|tsx|js|jsx|mts)$/;
const TEST_DECLARATION = /\b(test|it|describe)(\.\w+)*\s*\(/;
const CONFIRMED_ROW = /\| (E2E|UNIT)-CONFIRMED \|\s*$/;

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

const allTestFiles = () =>
  walk(PACKAGES_DIR, (path) => TEST_FILE.test(path)).map((path) =>
    toPosix(relative(ROOT, path)),
  );

const testFiles = () =>
  allTestFiles()
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

const expectedOwner = (path) =>
  EXPECTED_UNCITED.find(({ pattern }) => pattern.test(basename(path)))?.owner;

const getUncited = () => {
  const texts = capabilityDirs().map((dir) => readIf(join(dir, "verification.md")));
  const uncited = testFiles().filter(({ path }) => !isCited(path, texts));
  return {
    unexpected: uncited.filter(({ path }) => !expectedOwner(path)),
    expected: uncited
      .filter(({ path }) => expectedOwner(path))
      .map((file) => ({ ...file, owner: expectedOwner(file.path) })),
  };
};

const opensTest = (path, line) => {
  const lines = readFileSync(join(ROOT, path), "utf8").split("\n");
  return (
    line <= lines.length &&
    TEST_DECLARATION.test(lines.slice(line - 1, line + 1).join("\n"))
  );
};

const resolveCitation = (cited, files) => {
  if (cited.startsWith("packages/"))
    return { paths: files.includes(cited) ? [cited] : [], direct: true };
  const direct = files.filter(
    (path) => path.includes("/__tests__/") && path.endsWith(`/${cited}`),
  );
  if (direct.length) return { paths: direct, direct: true };
  const shortened = cited.split("/").slice(1).join("/");
  return {
    paths: shortened
      ? files.filter((path) => path.endsWith(`/${shortened}`))
      : [],
    direct: false,
  };
};

const getStale = () => {
  const files = allTestFiles();
  const findings = [];
  let checked = 0;
  let unchecked = 0;

  for (const dir of capabilityDirs()) {
    const rows = readIf(join(dir, "verification.md"))
      .split("\n")
      .filter((line) => CONFIRMED_ROW.test(line));

    for (const row of rows) {
      for (const [, cited, numbers] of row.matchAll(/`([^`\s]+?):([\d, -]+)`/g)) {
        if (!TEST_FILE.test(cited)) continue;
        const lines = numbers
          .split(/[, ]+/)
          .filter(Boolean)
          .map((part) => Number(part.split("-")[0]));
        const { paths, direct } = resolveCitation(cited, files);
        const fitting = paths.find((path) =>
          lines.every((line) => opensTest(path, line)),
        );

        if (fitting) {
          checked += lines.length;
        } else if (direct && paths.length) {
          checked += lines.length;
          const missed = lines.filter((line) => !opensTest(paths[0], line));
          findings.push({
            capability: capabilityName(dir),
            citation: `${cited}:${missed.join(", ")}`,
            problem: "the line opens no test",
          });
        } else if (direct) {
          findings.push({
            capability: capabilityName(dir),
            citation: cited,
            problem: "no such test file",
          });
        } else {
          unchecked += lines.length;
        }
      }
    }
  }

  return { checked, unchecked, findings };
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
        if (LITERAL_NEWLINE.test(line))
          findings.push({
            file: `${toPosix(relative(ROOT, file))}:${index + 1}`,
            problem: "literal \\n",
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
  if (report === "all" || report === "stale") result.stale = getStale();
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
      const { unexpected, expected } = result.uncited;
      console.log(`## Test files no verification.md cites (${unexpected.length})\n`);
      for (const { path, kind } of unexpected) console.log(`- [${kind}] ${path}`);
      const owners = [...new Set(expected.map(({ owner }) => owner))];
      console.log(
        `\nExpected and left out: ${expected.length} (${owners.join(", ") || "none"})\n`,
      );
    }
    if (result.stale) {
      const { checked, unchecked, findings } = result.stale;
      console.log(`## Stale citations (${findings.length})\n`);
      for (const { capability, citation, problem } of findings)
        console.log(`- ${capability}: ${citation}: ${problem}`);
      console.log(
        `\nChecked ${checked} cited lines; ${unchecked} cited through a shorthand were not checked\n`,
      );
    }
    if (result.lint) {
      console.log(`## Lint (${result.lint.length})\n`);
      for (const { file, problem } of result.lint) console.log(`- ${file}: ${problem}`);
    }
  }

  process.exit(result.lint?.length || result.stale?.findings.length ? 1 : 0);
} catch (error) {
  console.error(error);
  process.exit(2);
}
