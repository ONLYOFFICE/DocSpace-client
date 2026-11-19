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

/** The part before the extension, and the extension when it is short. */
const splitExtension = (s: string): [string, string] => {
  const dot = s.lastIndexOf(".");
  return dot > 0 && byteLength(s.slice(dot)) <= MAX_EXTENSION_BYTES
    ? [s.slice(0, dot), s.slice(dot)]
    : [s, ""];
};

/** Cut at a code point boundary to at most `budget` bytes. */
const cutToBytes = (s: string, budget: number) => {
  const chars = Array.from(s);
  let bytes = byteLength(s);
  while (bytes > budget) bytes -= byteLength(chars.pop() ?? "");
  return chars.join("");
};

const shortenToFit = (s: string): string => {
  if (byteLength(s) <= MAX_BYTES) return s;
  const [base, extension] = splitExtension(s);
  const cut = cutToBytes(base, MAX_BYTES - byteLength(extension));
  return guardReserved(trimEnds(cut) + extension);
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

/**
 * A plain name with `suffix` before its extension, the part before the
 * suffix shortened so that the whole still fits in 255 bytes.
 */
export function addSuffix(name: string, suffix: string): string {
  const [base, extension] = splitExtension(name);
  const budget = MAX_BYTES - byteLength(suffix) - byteLength(extension);
  return cutToBytes(base, budget) + suffix + extension;
}

/** The key two names in one folder are compared by. */
export const fileNameKey = (name: string) => name.toLowerCase();
