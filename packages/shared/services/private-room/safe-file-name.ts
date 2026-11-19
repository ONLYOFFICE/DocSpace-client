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

// Spec: private-rooms/file-operations, "Saved names are plain file names".

const MAX_BYTES = 255;
const MAX_EXTENSION_BYTES = 32;
const REJECTED = /[/\\:*?"<>|]/g;
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

const encoder = new TextEncoder();
const byteLength = (s: string) => encoder.encode(s).length;

/** C0 and C1 controls, DEL and the text-direction characters. */
const isLeftOut = (cp: number) =>
  cp <= 0x1f ||
  (cp >= 0x7f && cp <= 0x9f) ||
  cp === 0x200e ||
  cp === 0x200f ||
  (cp >= 0x202a && cp <= 0x202e) ||
  (cp >= 0x2066 && cp <= 0x2069);

const trimEnds = (s: string) => s.trimStart().replace(/[\s.]+$/, "");

const guardReserved = (s: string) =>
  RESERVED.test(s.split(".")[0].replace(/ +$/, "")) ? `_${s}` : s;

const shortenToFit = (s: string): string => {
  if (byteLength(s) <= MAX_BYTES) return s;
  const dot = s.lastIndexOf(".");
  const hasExtension =
    dot > 0 && byteLength(s.slice(dot)) <= MAX_EXTENSION_BYTES;
  const extension = hasExtension ? s.slice(dot) : "";
  const budget = MAX_BYTES - byteLength(extension);
  const chars = Array.from(hasExtension ? s.slice(0, dot) : s);
  let bytes = byteLength(chars.join(""));
  while (bytes > budget) bytes -= byteLength(chars.pop() ?? "");
  return guardReserved(trimEnds(chars.join("")) + extension);
};

const toPlain = (name: string) =>
  shortenToFit(
    guardReserved(
      trimEnds(
        Array.from(name)
          .filter((ch) => !isLeftOut(ch.codePointAt(0) ?? 0))
          .join("")
          .normalize("NFC")
          .replace(REJECTED, "_"),
      ),
    ),
  );

/**
 * The first candidate that is still a usable name once made a plain file
 * name, "_" when none is; callers end the list with an id.
 */
export function toSafeFileName(
  ...candidates: Array<string | number | null | undefined>
): string {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const name = toPlain(String(candidate));
    if (name) return name;
  }
  return "_";
}

/** The key two names in one folder are compared by. */
export const fileNameKey = (name: string) => name.toLowerCase();
