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

import { getCountTilesInGrid } from "./getCountTilesInRow";

type TKind = "rooms" | "templates" | "files";

const PADDING_START = 24;
const PADDING_END = 8;

const getContentWidth = (width: number) => {
  if (width <= 600) return width - 32;
  if (width < 1024) return width - 276;
  return width - 292;
};

const setLayout = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
  });

  let section = document.querySelector<HTMLElement>(
    ".section-wrapper-content",
  );

  if (!section) {
    section = document.createElement("div");
    section.className = "section-wrapper-content";
    section.style.padding = `0px ${PADDING_END}px 16px ${PADDING_START}px`;
    document.body.appendChild(section);
  }

  Object.defineProperty(section, "clientWidth", {
    value: getContentWidth(width) + PADDING_START + PADDING_END,
    configurable: true,
  });
};

const getCount = (kind: TKind) =>
  getCountTilesInGrid(kind === "rooms", kind === "templates");

const getCssGridColumns = (width: number, kind: TKind) => {
  const isDesktop = width >= 1024;
  const gridWidth = getContentWidth(width) + (isDesktop ? -1 : 1);
  const gap = isDesktop || kind === "rooms" ? 16 : 14;
  const [min, max] = kind === "files" ? [216, 360] : [275, 350];
  const preferred = Math.max(min, Math.min(width * 0.134, max));
  const track = Math.floor(preferred * 64) / 64;

  let columns = 1;
  while ((columns + 1) * track + columns * gap <= gridWidth) columns += 1;
  return columns;
};

const measuredColumns: Record<TKind, Record<number, number>> = {
  rooms: {
    500: 1,
    596: 1,
    597: 2,
    600: 2,
    601: 1,
    840: 1,
    841: 2,
    1000: 2,
    1149: 2,
    1150: 3,
    1440: 3,
    1441: 4,
    1731: 4,
    1732: 5,
    2022: 5,
    2023: 6,
    2560: 6,
  },
  templates: {
    594: 1,
    595: 2,
    600: 2,
    601: 1,
    838: 1,
    839: 2,
    1149: 2,
    1150: 3,
    1440: 3,
    1441: 4,
    1731: 4,
    1732: 5,
    2022: 5,
    2023: 6,
    2560: 6,
  },
  files: {
    400: 1,
    476: 1,
    477: 2,
    600: 2,
    601: 1,
    720: 1,
    721: 2,
    950: 2,
    951: 3,
    1204: 3,
    1205: 4,
    1436: 4,
    1437: 5,
    1902: 5,
    1903: 6,
    1904: 6,
    2560: 6,
  },
};

describe("getCountTilesInGrid", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe.each(Object.keys(measuredColumns) as TKind[])("%s", (kind) => {
    it.each(Object.entries(measuredColumns[kind]))(
      "matches the columns the browser draws at %spx",
      (width, columns) => {
        setLayout(Number(width));

        expect(getCount(kind)).toBe(columns);
      },
    );

    it("matches the CSS auto-fill grid at every width from 320 to 2560px", () => {
      const mismatches: string[] = [];

      for (let width = 320; width <= 2560; width += 1) {
        setLayout(width);

        const expected = getCssGridColumns(width, kind);
        const actual = getCount(kind);

        if (actual !== expected) {
          mismatches.push(`${width}px: ${actual} instead of ${expected}`);
        }
      }

      expect(mismatches).toEqual([]);
    });
  });

  it("counts room tiles when templates are on the same list", () => {
    setLayout(1440);

    expect(getCountTilesInGrid(true, true)).toBe(3);
  });

  it("returns a single column without a section to measure", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1440,
      configurable: true,
    });

    expect(getCountTilesInGrid(false, false)).toBe(1);
  });
});
