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

import { describe, it, expect, beforeAll } from "vitest";
const fs = require("fs");
const path = require("path");
const {
  LICENSE_MARKER,
  scanLicenseHeaders,
  BASE_DIR,
} = require("../utils/license");

const loadAllowlist = (fileName) =>
  new Set(
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, fileName), "utf8"),
    ),
  );

// Files that lack the header today (no AGPL marker at all).
const missingAllowlist = loadAllowlist("license-header-allowlist.json");
// Files that carry a header whose wording differs from the canonical one
// (older revisions of the text, single-line `//` style, etc.).
const contentAllowlist = loadAllowlist("license-content-allowlist.json");

// Each baseline freezes pre-existing debt so the test only catches NEW
// regressions. Both lists must only ever shrink: when a file is fixed or
// deleted, remove it from the JSON (the stale-baseline tests enforce this).

let missing = [];
let mismatch = [];

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);
  const result = scanLicenseHeaders();
  missing = result.missing;
  mismatch = result.mismatch;
  console.log(
    `Files missing header = ${missing.length}, ` +
      `wrong header wording = ${mismatch.length}.`,
  );
});

const numbered = (list) =>
  list.map((relPath, i) => `${i + 1}. ${relPath}`).join("\n");

describe("License Header Tests", () => {
  it("MissingLicenseHeader: every new source file starts with the AGPL header", () => {
    const offenders = missing.filter((relPath) => !missingAllowlist.has(relPath));

    const message =
      `The following source files are missing the license header ` +
      `("${LICENSE_MARKER}").\r\n` +
      `Prepend the standard AGPL header block used by every sibling ` +
      `source file (VS Code + the "licenser" extension inserts it ` +
      `automatically).\r\n\r\n${numbered(offenders)}`;

    expect(offenders.length, message).toBe(0);
  });

  it("WrongLicenseHeader: every new header matches the canonical wording from frontend.code-workspace", () => {
    const offenders = mismatch.filter(
      (relPath) => !contentAllowlist.has(relPath),
    );

    const message =
      `The following files have a license header whose wording does not ` +
      `match the canonical one defined by "licenser.customHeader" in ` +
      `frontend.code-workspace.\r\n` +
      `Replace it with the exact block header (any 4-digit copyright year ` +
      `is accepted).\r\n\r\n${numbered(offenders)}`;

    expect(offenders.length, message).toBe(0);
  });

  it("StaleMissingAllowlist: the missing-header baseline only lists files that still lack a header", () => {
    const current = new Set(missing);
    const stale = [...missingAllowlist].filter((relPath) => !current.has(relPath));

    const message =
      `These entries in license-header-allowlist.json got a header or were ` +
      `removed. Delete them from the baseline (it must only shrink).` +
      `\r\n\r\n${numbered(stale)}`;

    expect(stale.length, message).toBe(0);
  });

  it("StaleContentAllowlist: the wrong-wording baseline only lists files that still mismatch", () => {
    const current = new Set(mismatch);
    const stale = [...contentAllowlist].filter((relPath) => !current.has(relPath));

    const message =
      `These entries in license-content-allowlist.json now match the ` +
      `canonical header, lost their header entirely, or were removed. ` +
      `Delete them from the baseline (it must only shrink).` +
      `\r\n\r\n${numbered(stale)}`;

    expect(stale.length, message).toBe(0);
  });
});
