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

import {
  INFO_PANEL_WIDTH_KEY,
  clampInfoPanelWidth,
  readInfoPanelWidth,
  saveInfoPanelWidth,
} from "../info-panel/width";

describe("info panel width", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("keeps a width between the default and the cap, in whole pixels", () => {
    expect(clampInfoPanelWidth(612.6)).toBe(613);
    expect(clampInfoPanelWidth(120)).toBe(400);
    expect(clampInfoPanelWidth(5000)).toBe(800);
  });

  it("falls back to the default for anything that is not a width", () => {
    expect(clampInfoPanelWidth(null)).toBe(400);
    expect(clampInfoPanelWidth("wide")).toBe(400);
    expect(clampInfoPanelWidth(Number.NaN)).toBe(400);
  });

  it("remembers the width between visits", () => {
    expect(readInfoPanelWidth()).toBe(400);

    saveInfoPanelWidth(640);

    expect(localStorage.getItem(INFO_PANEL_WIDTH_KEY)).toBe("640");
    expect(readInfoPanelWidth()).toBe(640);
  });

  it("brings an out-of-range saved width back into range", () => {
    localStorage.setItem(INFO_PANEL_WIDTH_KEY, "1500");

    expect(readInfoPanelWidth()).toBe(800);
  });
});
