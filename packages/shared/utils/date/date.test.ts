// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DateTime, Settings } from "luxon";

import {
  formatDate,
  formatDateLocalized,
  convertMomentFormatToLuxon,
  getWeekdays,
  getMonths,
} from "./formatDate";

import {
  addToDate,
  subtractFromDate,
  startOf,
  endOf,
  fromNowPlus,
  fromNowMinus,
  daysInMonth,
} from "./dateArithmetic";

import {
  dateDiff,
  dateDiffAbs,
  isBefore,
  isAfter,
  isSame,
  isBetween,
  isValidDate,
  isPast,
  isFuture,
} from "./dateComparison";

import { humanizeDuration, fromNow, createDuration } from "./duration";

import {
  parseToDateTime,
  parseISO,
  parseWithFormat,
  createDateTime,
  today,
  now,
} from "./parse";

import {
  toTimezone,
  isValidTimezone,
  toUnixTimestamp,
  fromUnixTimestamp,
  toISOString,
} from "./timezone";

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("formats Date object correctly", () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      expect(formatDate(date, "yyyy-MM-dd")).toBe("2024-01-15");
      expect(formatDate(date, "dd MMM yyyy")).toBe("15 Jan 2024");
      expect(formatDate(date, "HH:mm")).toBe("10:30");
    });

    it("formats ISO string correctly", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      expect(formatDate(isoString, "yyyy-MM-dd")).toBe("2024-01-15");
    });

    it("formats DateTime object correctly", () => {
      const dt = DateTime.fromObject({ year: 2024, month: 1, day: 15 });
      expect(formatDate(dt, "yyyy-MM-dd")).toBe("2024-01-15");
    });

    it("returns empty string for null/undefined", () => {
      expect(formatDate(null, "yyyy-MM-dd")).toBe("");
      expect(formatDate(undefined, "yyyy-MM-dd")).toBe("");
    });

    it("applies locale correctly", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date, "MMMM", { locale: "en" });
      expect(result).toBe("January");
    });
  });

  describe("convertMomentFormatToLuxon", () => {
    it("converts basic tokens", () => {
      expect(convertMomentFormatToLuxon("YYYY-MM-DD")).toBe("yyyy-MM-dd");
      expect(convertMomentFormatToLuxon("DD MMM YYYY")).toBe("dd MMM yyyy");
      expect(convertMomentFormatToLuxon("HH:mm:ss")).toBe("HH:mm:ss");
    });

    it("converts locale-aware tokens", () => {
      expect(convertMomentFormatToLuxon("LL")).toBe("DDD");
      expect(convertMomentFormatToLuxon("LT")).toBe("t");
    });
  });

  describe("formatDateLocalized", () => {
    it("formats with preset correctly", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateLocalized(date, "DATE_SHORT", { locale: "en" });
      expect(result).toContain("2024");
    });
  });

  describe("getWeekdays and getMonths", () => {
    it("returns weekday names", () => {
      const weekdays = getWeekdays("long", "en");
      expect(weekdays).toHaveLength(7);
      expect(weekdays).toContain("Monday");
    });

    it("returns month names", () => {
      const months = getMonths("long", "en");
      expect(months).toHaveLength(12);
      expect(months).toContain("January");
    });
  });

  describe("dateArithmetic", () => {
    it("adds days correctly", () => {
      const date = new Date(2024, 0, 15);
      const result = addToDate(date, 7, "days");
      expect(result?.day).toBe(22);
    });

    it("subtracts months correctly", () => {
      const date = new Date(2024, 5, 15);
      const result = subtractFromDate(date, 2, "months");
      expect(result?.month).toBe(4);
    });

    it("gets start of day", () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const result = startOf(date, "day");
      expect(result?.hour).toBe(0);
      expect(result?.minute).toBe(0);
      expect(result?.second).toBe(0);
    });

    it("gets end of day", () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      const result = endOf(date, "day");
      expect(result?.hour).toBe(23);
      expect(result?.minute).toBe(59);
      expect(result?.second).toBe(59);
    });

    it("now returns current time", () => {
      const result = now();
      expect(result.isValid).toBe(true);
    });

    it("fromNowPlus adds correctly", () => {
      const result = fromNowPlus(7, "days");
      const expected = DateTime.now().plus({ days: 7 });
      expect(result.day).toBe(expected.day);
    });

    it("fromNowMinus subtracts correctly", () => {
      const result = fromNowMinus(1, "months");
      const expected = DateTime.now().minus({ months: 1 });
      expect(result.month).toBe(expected.month);
    });

    it("daysInMonth returns correct count", () => {
      expect(daysInMonth(new Date(2024, 1, 1))).toBe(29); // Feb 2024 is leap year
      expect(daysInMonth(new Date(2024, 0, 1))).toBe(31); // January
    });
  });

  describe("dateComparison", () => {
    it("calculates diff correctly", () => {
      const date1 = new Date(2024, 0, 20);
      const date2 = new Date(2024, 0, 15);
      expect(dateDiff(date1, date2, "days")).toBe(5);
    });

    it("calculates absolute diff", () => {
      const date1 = new Date(2024, 0, 10);
      const date2 = new Date(2024, 0, 15);
      expect(dateDiffAbs(date1, date2, "days")).toBe(5);
    });

    it("isBefore works correctly", () => {
      const date1 = new Date(2024, 0, 10);
      const date2 = new Date(2024, 0, 15);
      expect(isBefore(date1, date2)).toBe(true);
      expect(isBefore(date2, date1)).toBe(false);
    });

    it("isAfter works correctly", () => {
      const date1 = new Date(2024, 0, 20);
      const date2 = new Date(2024, 0, 15);
      expect(isAfter(date1, date2)).toBe(true);
      expect(isAfter(date2, date1)).toBe(false);
    });

    it("isSame works correctly", () => {
      const date1 = new Date(2024, 0, 15, 10, 30);
      const date2 = new Date(2024, 0, 15, 14, 45);
      expect(isSame(date1, date2, "day")).toBe(true);
      expect(isSame(date1, date2, "hour")).toBe(false);
    });

    it("isBetween works correctly", () => {
      const date = new Date(2024, 0, 15);
      const start = new Date(2024, 0, 10);
      const end = new Date(2024, 0, 20);
      expect(isBetween(date, start, end)).toBe(true);
      expect(isBetween(start, date, end)).toBe(false);
    });

    it("isValidDate works correctly", () => {
      expect(isValidDate(new Date(2024, 0, 15))).toBe(true);
      expect(isValidDate("2024-01-15")).toBe(true);
      expect(isValidDate("invalid")).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });

    it("isPast and isFuture work correctly", () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = new Date(2030, 0, 1);
      expect(isPast(pastDate)).toBe(true);
      expect(isFuture(pastDate)).toBe(false);
      expect(isPast(futureDate)).toBe(false);
      expect(isFuture(futureDate)).toBe(true);
    });
  });

  describe("duration", () => {
    it("creates duration correctly", () => {
      const duration = createDuration(5, "days");
      expect(duration.as("days")).toBe(5);
    });

    it("humanizes duration", () => {
      expect(humanizeDuration(1, "days")).toBe("1 day");
      expect(humanizeDuration(5, "days")).toBe("5 days");
      expect(humanizeDuration(1, "hours")).toBe("1 hour");
      expect(humanizeDuration(2, "hours")).toBe("2 hours");
    });

    it("humanizes with suffix", () => {
      expect(humanizeDuration(2, "days", { addSuffix: true })).toBe("in 2 days");
      expect(humanizeDuration(-2, "days", { addSuffix: true })).toBe(
        "2 days ago",
      );
    });
  });

  describe("parse", () => {
    it("parses ISO strings", () => {
      const result = parseISO("2024-01-15T10:30:00.000Z");
      expect(result?.year).toBe(2024);
      expect(result?.month).toBe(1);
      expect(result?.day).toBe(15);
    });

    it("parses Date objects", () => {
      const date = new Date(2024, 0, 15);
      const result = parseToDateTime(date);
      expect(result?.year).toBe(2024);
    });

    it("parses various string formats", () => {
      expect(parseToDateTime("2024-01-15")?.day).toBe(15);
      expect(parseToDateTime("2024/01/15")?.day).toBe(15);
    });

    it("returns null for invalid dates", () => {
      expect(parseToDateTime(null)).toBeNull();
      expect(parseToDateTime("")).toBeNull();
      expect(parseToDateTime("0001-01-01T00:00:00.0000000Z")).toBeNull();
    });

    it("parseWithFormat works correctly", () => {
      const result = parseWithFormat("15 Jan 2024", "dd MMM yyyy");
      expect(result?.year).toBe(2024);
      expect(result?.month).toBe(1);
      expect(result?.day).toBe(15);
    });

    it("createDateTime creates correct date", () => {
      const result = createDateTime(2024, 1, 15, 10, 30, 45);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(10);
      expect(result.minute).toBe(30);
      expect(result.second).toBe(45);
    });

    it("today returns start of current day", () => {
      const result = today();
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
    });
  });

  describe("timezone", () => {
    it("converts to timezone correctly", () => {
      const date = DateTime.fromISO("2024-01-15T10:00:00.000Z");
      const result = toTimezone(date, "America/New_York");
      expect(result?.zoneName).toBe("America/New_York");
    });

    it("validates timezone correctly", () => {
      expect(isValidTimezone("America/New_York")).toBe(true);
      expect(isValidTimezone("Invalid/Timezone")).toBe(false);
    });

    it("converts to/from Unix timestamp", () => {
      const date = new Date(2024, 0, 15, 0, 0, 0);
      const timestamp = toUnixTimestamp(date);
      expect(timestamp).toBeGreaterThan(0);

      const backToDate = fromUnixTimestamp(timestamp);
      expect(backToDate.year).toBe(2024);
    });

    it("converts to ISO string", () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      const result = toISOString(date);
      expect(result).toContain("2024-01-15");
    });
  });
});
