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

import { describe, expect, it } from "vitest";

import { fileNameKey, toSafeFileName } from "../safe-file-name";

const bytes = (s: string) => new TextEncoder().encode(s).length;
const repeat = (s: string, n: number) => s.repeat(n);

const ordinary: [string, string][] = [
  ["Report 2026.docx", "Report 2026.docx"],
  ["README", "README"],
  [".gitignore", ".gitignore"],
  ["archive.tar.gz", "archive.tar.gz"],
  ["\u041e\u0442\u0447\u0451\u0442.pdf", "\u041e\u0442\u0447\u0451\u0442.pdf"],
  ["\u65e5\u672c\u8a9e.xlsx", "\u65e5\u672c\u8a9e.xlsx"],
  ["Cafe\u0301.txt", "Caf\u00e9.txt"],
];

const separators: [string, string][] = [
  ["a/b.txt", "a_b.txt"],
  [String.raw`a\b.txt`, "a_b.txt"],
  ["/a.txt", "_a.txt"],
  [String.raw`\a.txt`, "_a.txt"],
  ["a.txt/", "a.txt_"],
  ["dir/sub/a.txt", "dir_sub_a.txt"],
  [String.raw`\\server\share\a.txt`, "__server_share_a.txt"],
];

const parentReferences: [string, string][] = [
  ["../a.txt", ".._a.txt"],
  [String.raw`..\a.txt`, ".._a.txt"],
  ["../../etc/passwd", ".._.._etc_passwd"],
  ["./a.txt", "._a.txt"],
  ["a/../b.txt", "a_.._b.txt"],
];

const drivePrefixes: [string, string][] = [
  [String.raw`C:\a.txt`, "C__a.txt"],
  ["c:/a.txt", "c__a.txt"],
  ["C:a.txt", "C_a.txt"],
];

const rejected: [string, string][] = [":", "*", "?", '"', "<", ">", "|"].map(
  (ch) => [`a${ch}b.txt`, "a_b.txt"],
);

const leftOut = [
  "\u0000",
  "\u0009",
  "\u000a",
  "\u001f",
  "\u007f",
  "\u0080",
  "\u009f",
  "\u200e",
  "\u200f",
  "\u202a",
  "\u202e",
  "\u2066",
  "\u2069",
];
const controls: [string, string][] = [
  ...leftOut.map((ch): [string, string] => [`a${ch}b.txt`, "ab.txt"]),
  ["invoice\u202Efdp.exe", "invoicefdp.exe"],
  ["e\u0007\u0301.txt", "\u00e9.txt"],
];

const trailing: [string, string][] = [
  ["a.txt.", "a.txt"],
  ["a.txt...", "a.txt"],
  ["a.txt ", "a.txt"],
  ["  a.txt", "a.txt"],
  ["a. . .", "a"],
  ["a\u00a0.", "a"],
  ["\u3000a.txt\u3000", "a.txt"],
];

const reserved: [string, string][] = [
  ...[
    "CON",
    "con",
    "Prn",
    "aUx",
    "NUL",
    "COM1",
    "com9",
    "LPT1",
    "lpt9",
  ].map((n): [string, string] => [n, `_${n}`]),
  ["con.txt", "_con.txt"],
  ["Com1.tar.gz", "_Com1.tar.gz"],
  ["nul .txt", "_nul .txt"],
  ["CONSOLE.txt", "CONSOLE.txt"],
  ["COM10", "COM10"],
  ["LPT0", "LPT0"],
  ["xCON", "xCON"],
];

const emoji = "\u{1F600}";
const overlong: [string, string][] = [
  [`${repeat("a", 251)}.txt`, `${repeat("a", 251)}.txt`],
  [`${repeat("a", 252)}.txt`, `${repeat("a", 251)}.txt`],
  [`${repeat("\u00e9", 126)}.txt`, `${repeat("\u00e9", 125)}.txt`],
  [`${repeat("\u20ac", 84)}.txt`, `${repeat("\u20ac", 83)}.txt`],
  [`${repeat(emoji, 63)}.txt`, `${repeat(emoji, 62)}.txt`],
  [`a.${repeat("b", 300)}`, `a.${repeat("b", 253)}`],
  [`a${repeat(" ", 300)}b.txt`, "a.txt"],
  [`CON${repeat(" ", 300)}x.txt`, "_CON.txt"],
];

const allTables = [
  ordinary,
  separators,
  parentReferences,
  drivePrefixes,
  rejected,
  controls,
  trailing,
  reserved,
  overlong,
];

describe("Saved names are plain file names", () => {
  it.each(ordinary)("Ordinary name: %j", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  it.each(separators)("Name with separators: %j", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  it.each(parentReferences)(
    "Name with a parent reference: %j",
    (input, expected) => {
      expect(toSafeFileName(input)).toBe(expected);
    },
  );

  it.each(drivePrefixes)("Name with a drive prefix: %j", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  it.each(rejected)(
    "Name with characters file systems reject: %j",
    (input, expected) => {
      expect(toSafeFileName(input)).toBe(expected);
    },
  );

  it.each(controls)("Name with control characters: %j", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  it.each(trailing)(
    "Name with trailing dots or spaces: %j",
    (input, expected) => {
      expect(toSafeFileName(input)).toBe(expected);
    },
  );

  it.each(reserved)("Reserved device name: %j", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  it.each(overlong.map(([input, expected], i) => [i, input, expected]))(
    "Overlong name: case %i",
    (_, input, expected) => {
      const out = toSafeFileName(input);
      expect(out).toBe(expected);
      expect(bytes(out)).toBeLessThanOrEqual(255);
    },
  );

  it.each([
    [["...", "Title.docx", 42], "Title.docx"],
    [["", "..", 42], "42"],
    [["\u0007", " ", 7], "7"],
    [[".", "\u202e", "file-7"], "file-7"],
    [[null, undefined, 8], "8"],
    [["..", ".."], "_"],
    [[], "_"],
  ] as [Array<string | number | null | undefined>, string][])(
    "Nothing left of the name: %j",
    (candidates, expected) => {
      expect(toSafeFileName(...candidates)).toBe(expected);
    },
  );

  it("A plain name comes back unchanged from a second pass", () => {
    for (const [, out] of allTables.flat()) {
      expect(toSafeFileName(out)).toBe(out);
    }
  });

  it("Names that differ only in case share a key", () => {
    expect(fileNameKey("Budget.XLSX")).toBe(fileNameKey("budget.xlsx"));
    expect(fileNameKey("Plans")).toBe("plans");
    expect(fileNameKey("Plans")).not.toBe(fileNameKey("Plans (1)"));
  });
});
