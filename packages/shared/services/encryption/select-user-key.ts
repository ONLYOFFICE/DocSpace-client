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

/** Unparsable or missing dates rank below every real date. */
const toTime = (date: string | null | undefined): number => {
  const time = date ? Date.parse(date) : Number.NaN;
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
};

/**
 * The one key the client works with for a user: the envelope with the newest
 * server-set date, ties going to the last one listed, `null` for none.
 * Spec: private-rooms/encryption-core, "One selected key per user".
 */
export function selectUserKey<T extends { date?: string | null }>(
  keys: readonly T[] | null | undefined,
): T | null {
  if (!keys || keys.length === 0) return null;
  let selected = keys[0];
  let selectedTime = toTime(selected.date);
  for (let i = 1; i < keys.length; i++) {
    const time = toTime(keys[i].date);
    if (time >= selectedTime) {
      selected = keys[i];
      selectedTime = time;
    }
  }
  return selected;
}
