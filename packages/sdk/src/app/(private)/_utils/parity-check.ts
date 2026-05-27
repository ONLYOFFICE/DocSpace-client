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

/* eslint-disable no-console */

// CI helper: scan (private)/** for PARITY-SOURCE annotations and verify the
// referenced source file has not been modified since the last review date.
// Run via: `node --experimental-strip-types packages/sdk/src/app/(private)/_utils/parity-check.ts`
// or compile via tsc and invoke from lefthook / CI.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(__dirname, "../../../../../..");
const PRIVATE_ROOT = resolve(__dirname, "..");

const PARITY_SOURCE_RE = /PARITY-SOURCE:\s*(\S+)/;
const PARITY_REVIEW_RE = /PARITY-REVIEW:.*?Last reviewed:\s*(\d{4}-\d{2}-\d{2})/;

type ParityRecord = {
  forkPath: string;
  sourcePath: string;
  reviewDate: string;
};

function isCandidateFile(name: string): boolean {
  return /\.(tsx?|jsx?)$/.test(name);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (isCandidateFile(entry)) {
      out.push(full);
    }
  }
  return out;
}

function extractRecord(forkPath: string): ParityRecord | null {
  const text = readFileSync(forkPath, "utf8");
  const src = text.match(PARITY_SOURCE_RE);
  const rev = text.match(PARITY_REVIEW_RE);
  if (!src) return null;
  if (!rev) {
    throw new Error(
      `${relative(REPO_ROOT, forkPath)}: PARITY-SOURCE present without PARITY-REVIEW date`,
    );
  }
  return { forkPath, sourcePath: src[1], reviewDate: rev[1] };
}

function gitLastCommitDate(sourcePath: string): string {
  // ISO 8601, committer date of last commit touching the file.
  const out = execFileSync(
    "git",
    ["log", "-1", "--format=%cI", "--", sourcePath],
    { cwd: REPO_ROOT, encoding: "utf8" },
  ).trim();
  if (!out) {
    throw new Error(
      `PARITY-SOURCE points to ${sourcePath} but git has no commits touching it.`,
    );
  }
  return out;
}

export function runParityCheck(): void {
  const files = walk(PRIVATE_ROOT);
  const records: ParityRecord[] = [];
  for (const f of files) {
    const r = extractRecord(f);
    if (r) records.push(r);
  }

  const failures: string[] = [];
  for (const r of records) {
    const sourceAbs = resolve(REPO_ROOT, r.sourcePath);
    const lastCommit = gitLastCommitDate(sourceAbs);
    const lastCommitDay = lastCommit.slice(0, 10);
    if (lastCommitDay > r.reviewDate) {
      failures.push(
        `${relative(REPO_ROOT, r.forkPath)}\n` +
          `  source: ${r.sourcePath}\n` +
          `  last-commit: ${lastCommitDay} > review-date: ${r.reviewDate}\n` +
          `  → re-review the fork and bump PARITY-REVIEW.`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(
      `\n[parity-check] ${failures.length} drift(s) detected:\n\n` +
        `${failures.join("\n\n")}\n`,
    );
    process.exit(1);
  }

  console.log(
    `[parity-check] OK — verified ${records.length} fork(s) against their sources.`,
  );
}

// Allow direct invocation: `tsx parity-check.ts` or compiled equivalent.
if (
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module
) {
  runParityCheck();
}
