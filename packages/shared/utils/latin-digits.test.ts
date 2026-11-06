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

import { afterEach, describe, expect, it } from "vitest";
import { DateTime, Duration, Settings } from "luxon";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date";

import { installLatinDigits } from "./latin-digits";

const ARABIC_INDIC_DIGIT = /[٠-٩]/;
const ARABIC_LETTER = /[ء-ي]/;

const date = DateTime.fromISO("2026-11-06T14:05:00", { zone: "utc" });

describe("installLatinDigits", () => {
  afterEach(() => {
    Settings.defaultNumberingSystem = undefined as unknown as string;
  });

  it("leaves ar-SA dates in Arabic-Indic digits until it is installed", () => {
    expect(
      date.setLocale("ar-SA").toLocaleString(DateTime.DATETIME_MED),
    ).toMatch(ARABIC_INDIC_DIGIT);
  });

  it("formats ar-SA dates with Western digits and Arabic words", () => {
    installLatinDigits();

    const formatted = date
      .setLocale("ar-SA")
      .toLocaleString(DateTime.DATETIME_MED);

    expect(formatted).not.toMatch(ARABIC_INDIC_DIGIT);
    expect(formatted).toContain("2026");
    expect(formatted).toMatch(ARABIC_LETTER);
  });

  it("formats ar-SA durations with Western digits", () => {
    installLatinDigits();

    expect(
      Duration.fromObject({ days: 15 }, { locale: "ar-SA" }).toHuman(),
    ).toMatch(/^15 /);
  });

  it("reaches the ui-kit date helpers", () => {
    installLatinDigits();

    const formatted = getCorrectDate("ar-SA", "2026-11-06T14:05:00Z");

    expect(formatted).not.toMatch(ARABIC_INDIC_DIGIT);
    expect(formatted).toContain("2026");
  });

  it("keeps Western digits for languages that already use them", () => {
    installLatinDigits();

    expect(date.setLocale("ru").toLocaleString(DateTime.DATE_SHORT)).toBe(
      "06.11.2026",
    );
  });
});
