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

// Shared parser for JSON files with locale-suffix overrides.
//
// Format:
//   "ProviderApple": "Apple"        — default for all languages
//   "ProviderApple-si": "..."       — override for Sinhala
//
// Returns a lookup function: (key, locale?) => string

type Entry = { defaultValue: string; overrides: Record<string, string> };

export function parseLocaleConstants(rawData: Record<string, string>) {
  const parsed: Record<string, Entry> = {};

  for (const [rawKey, value] of Object.entries(rawData)) {
    const match = rawKey.match(
      /^(.+?)-((?:[a-z]{2,3})(?:-[A-Z][a-zA-Z]+-[A-Z]{2}|-[A-Z]{2})?)$/,
    );

    if (match) {
      const [, baseKey, locale] = match;
      if (!parsed[baseKey]) {
        parsed[baseKey] = { defaultValue: "", overrides: {} };
      }
      parsed[baseKey].overrides[locale] = value;
    } else {
      if (!parsed[rawKey]) {
        parsed[rawKey] = { defaultValue: value, overrides: {} };
      } else {
        parsed[rawKey].defaultValue = value;
      }
    }
  }

  const keys = new Set(Object.keys(parsed));

  function get(key: string, locale?: string): string {
    const entry = parsed[key];
    if (!entry) return key;

    if (!locale && typeof window !== "undefined") {
      // `window?.` alone is not enough: referencing an undeclared global still
      // throws on the server, so guard with `typeof` for SSR safety.
      locale = window?.i18n?.instance?.language || undefined;
    }

    if (locale && entry.overrides[locale]) return entry.overrides[locale];
    return entry.defaultValue;
  }

  return { get, keys, parsed };
}
