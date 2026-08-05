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

import {
  getFlagAssetByCode,
  isKnownCountryCode,
  lookupCountryByAlias,
} from "./countriesCatalog";

// Bracketed prefix: "[US] United States", "[us]Foo".
const BRACKET_PREFIX_RE = /^\[([A-Za-z]{2})\]/;
// Separator-prefix: "US - United States", "US - Foo", "US: Foo", "US | Foo".
// Requires a real separator (em dash, en dash, hyphen, colon, pipe) followed by whitespace
// to avoid false positives on natural-language titles like "It is what it is".
const SEPARATOR_PREFIX_RE = /^([A-Za-z]{2})\s*[\u2014\-\u2013:|]\s+/;
// Whole-string country code: "US", "us".
const WHOLE_STRING_RE = /^([A-Za-z]{2})$/;

/**
 * Resolves a folder title to an ISO 3166-1 alpha-2 country code.
 *
 * Strategy chain (first match wins):
 *   1. Bracketed prefix `[XX]` - explicit override, robust to renames.
 *   2. Inline prefix `XX - ...` (with separator+space) - admin-friendly.
 *   3. Whole-string code (`"US"`).
 *   4. Alias match against the catalog (case-insensitive, trimmed).
 *
 * Returns `undefined` when no rule matches.
 */
export function resolveCountryCode(
  title: string | undefined | null,
): string | undefined {
  if (!title) return undefined;
  const trimmed = title.trim();
  if (!trimmed) return undefined;

  const bracket = trimmed.match(BRACKET_PREFIX_RE);
  if (bracket) {
    const code = bracket[1].toUpperCase();
    if (isKnownCountryCode(code)) return code;
  }

  const inline = trimmed.match(SEPARATOR_PREFIX_RE);
  if (inline) {
    const code = inline[1].toUpperCase();
    if (isKnownCountryCode(code)) return code;
  }

  const whole = trimmed.match(WHOLE_STRING_RE);
  if (whole) {
    const code = whole[1].toUpperCase();
    if (isKnownCountryCode(code)) return code;
  }

  return lookupCountryByAlias(trimmed);
}

/** Returns the flag asset URL for a known country code, or undefined. */
export function getFlagUrl(code: string | undefined): string | undefined {
  return getFlagAssetByCode(code);
}

/** Resolves a folder to its flag URL via {@link resolveCountryCode}. */
export function getFlagUrlForFolder(
  folder: { title: string } | undefined | null,
): string | undefined {
  if (!folder) return undefined;
  const code = resolveCountryCode(folder.title);
  return getFlagAssetByCode(code);
}
