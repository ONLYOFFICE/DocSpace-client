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

import { LATIN_NUMBERING_SYSTEM } from "../../utils/latin-digits";

type TDurationUnit = "second" | "minute" | "hour" | "day" | "month" | "year";

/** The largest whole unit of a span; months and years are approximate. */
const toLargestUnit = (ms: number): [number, TDurationUnit] => {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  if (seconds < 60) return [seconds, "second"];
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return [minutes, "minute"];
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return [hours, "hour"];
  const days = Math.floor(hours / 24);
  if (days < 30) return [days, "day"];
  const months = Math.floor(days / 30);
  if (months < 12) return [months, "month"];
  return [Math.floor(months / 12), "year"];
};

/**
 * The time passed since `ts` as a number with a unit word of the interface
 * language, such as "5 days".
 * Spec: private-rooms/key-management, "Key-change dialog speaks the interface language"
 */
export function formatDurationSince(
  ts: number,
  locale: string,
  now: number = Date.now(),
): string {
  const [value, unit] = toLargestUnit(now - ts);

  try {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
      numberingSystem: LATIN_NUMBERING_SYSTEM,
    }).format(value);
  } catch {
    return String(value);
  }
}
