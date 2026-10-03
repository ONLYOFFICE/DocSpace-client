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

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Settings } from "luxon";

import { MetadataFieldType } from "../enums";
import type { TMetadataField } from "../api/metadata/types";
import {
  getMetadataDate,
  getMetadataInput,
  isMetadataNumber,
  toMetadataValue,
} from "./metadata";

const field = (type: MetadataFieldType): TMetadataField => ({
  id: 7,
  templateId: 1,
  name: "Field",
  type,
  options: null,
  order: 0,
});

describe("getMetadataDate", () => {
  beforeAll(() => {
    Settings.defaultZone = "America/New_York";
  });

  afterAll(() => {
    Settings.defaultZone = "system";
  });

  it("keeps the stored UTC day whatever the tenant offset", () => {
    expect(getMetadataDate("2026-09-15T03:00:00.0000000+03:00")).toBe(
      "2026-09-15",
    );
    expect(getMetadataDate("2026-09-14T19:00:00.0000000-05:00")).toBe(
      "2026-09-15",
    );
    expect(getMetadataDate("2026-09-15T00:00:00.000Z")).toBe("2026-09-15");
  });

  it("returns an empty string for a missing date", () => {
    expect(getMetadataDate(null)).toBe("");
    expect(getMetadataDate(undefined)).toBe("");
  });
});

describe("isMetadataNumber", () => {
  it("accepts safe integers only", () => {
    expect(isMetadataNumber("1250000")).toBe(true);
    expect(isMetadataNumber("-5")).toBe(true);
    expect(isMetadataNumber("1.5")).toBe(false);
    expect(isMetadataNumber("1e3")).toBe(false);
    expect(isMetadataNumber("abc")).toBe(false);
    expect(isMetadataNumber("")).toBe(false);
    expect(isMetadataNumber("9007199254740993")).toBe(false);
  });
});

describe("toMetadataValue / getMetadataInput", () => {
  it("round-trips a date through the server time zone", () => {
    const date = field(MetadataFieldType.Date);

    expect(toMetadataValue(date, "2026-09-15")).toEqual({
      fieldId: 7,
      dateValue: "2026-09-15T00:00:00.000Z",
    });
    expect(
      getMetadataInput(date, {
        fieldId: 7,
        dateValue: "2026-09-15T03:00:00.0000000+03:00",
      }),
    ).toBe("2026-09-15");
  });

  it("converts numbers and text", () => {
    const number = field(MetadataFieldType.Number);

    expect(toMetadataValue(number, "1250000")).toEqual({
      fieldId: 7,
      numberValue: 1250000,
    });
    expect(getMetadataInput(number, { fieldId: 7, numberValue: 42 })).toBe(
      "42",
    );
    expect(toMetadataValue(field(MetadataFieldType.String), "ACME")).toEqual({
      fieldId: 7,
      stringValue: "ACME",
    });
  });

  it("sends only the field id to clear an empty scalar", () => {
    for (const type of [
      MetadataFieldType.String,
      MetadataFieldType.Number,
      MetadataFieldType.Date,
    ]) {
      expect(toMetadataValue(field(type), "")).toEqual({ fieldId: 7 });
      expect(toMetadataValue(field(type), "  ")).toEqual({ fieldId: 7 });
    }
  });

  it("passes option ids through for choice fields", () => {
    const multi = field(MetadataFieldType.MultiChoice);

    expect(toMetadataValue(multi, ["a", "b"])).toEqual({
      fieldId: 7,
      optionIds: ["a", "b"],
    });
    expect(toMetadataValue(multi, [])).toEqual({ fieldId: 7, optionIds: [] });
    expect(
      getMetadataInput(field(MetadataFieldType.SingleChoice), {
        fieldId: 7,
        optionIds: null,
      }),
    ).toEqual([]);
  });

  it("reads missing values as empty inputs", () => {
    expect(getMetadataInput(field(MetadataFieldType.String))).toBe("");
    expect(getMetadataInput(field(MetadataFieldType.Number))).toBe("");
    expect(getMetadataInput(field(MetadataFieldType.Date))).toBe("");
  });
});
