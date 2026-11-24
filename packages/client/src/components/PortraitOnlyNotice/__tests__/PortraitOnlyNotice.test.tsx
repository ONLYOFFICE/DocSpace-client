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

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mediaViewerDataStore = vi.hoisted(() => ({ visible: false }));

vi.mock("react-device-detect", () => ({ isMobileOnly: true }));
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: () => mediaViewerDataStore,
}));

import PortraitOnlyNotice from "../index";

const setOrientation = (type: string) => {
  Object.defineProperty(window.screen, "orientation", {
    configurable: true,
    value: { type, addEventListener: vi.fn(), removeEventListener: vi.fn() },
  });
};

describe("PortraitOnlyNotice", () => {
  beforeEach(() => {
    mediaViewerDataStore.visible = false;
  });

  afterEach(() => {
    Reflect.deleteProperty(window.screen, "orientation");
  });

  it("asks to turn a phone held sideways upright", () => {
    setOrientation("landscape-primary");

    render(<PortraitOnlyNotice />);

    expect(screen.getByTestId("portrait-only-notice")).toBeInTheDocument();
  });

  it("stays hidden on a phone held upright", () => {
    setOrientation("portrait-primary");

    render(<PortraitOnlyNotice />);

    expect(screen.queryByTestId("portrait-only-notice")).toBeNull();
  });

  it("lets the media viewer use a phone held sideways", () => {
    setOrientation("landscape-primary");
    mediaViewerDataStore.visible = true;

    render(<PortraitOnlyNotice />);

    expect(screen.queryByTestId("portrait-only-notice")).toBeNull();
  });
});
