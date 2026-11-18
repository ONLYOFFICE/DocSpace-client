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

import { formatDurationSince } from "../formatDuration";

const NOW = Date.UTC(2026, 10, 11, 12, 0, 0);
const SECOND = 1000;
const DAY = 24 * 60 * 60 * SECOND;

// Some languages put a no-break space between the number and the unit.
const since = (ms: number, locale = "en") =>
  formatDurationSince(NOW - ms, locale, NOW).replace(/\s/g, " ");

describe("Key-change dialog speaks the interface language", () => {
  it("Duration in the interface language: English", () => {
    expect(since(45 * SECOND)).toBe("45 seconds");
    expect(since(5 * 60 * SECOND)).toBe("5 minutes");
    expect(since(3 * 60 * 60 * SECOND)).toBe("3 hours");
    expect(since(5 * DAY)).toBe("5 days");
    expect(since(1 * DAY)).toBe("1 day");
    expect(since(90 * DAY)).toBe("3 months");
    expect(since(800 * DAY)).toBe("2 years");
  });

  it("Duration in the interface language: other languages", () => {
    expect(since(5 * DAY, "de")).toBe("5 Tage");
    expect(since(5 * DAY, "fr")).toBe("5 jours");
    expect(since(5 * DAY, "ru")).toBe("5 дней");
  });

  it("keeps Latin digits where the language has its own", () => {
    expect(since(5 * DAY, "ar-SA")).toMatch(/^5\s/);
  });

  it("never uses the fixed suffixes", () => {
    for (const span of [45 * SECOND, 5 * DAY, 90 * DAY, 800 * DAY]) {
      expect(since(span)).not.toMatch(/^\d+(s|m|h|d|mo|y)$/);
    }
  });

  it("reads a date in the future as no time passed", () => {
    expect(since(-5 * DAY)).toBe("0 seconds");
  });
});
