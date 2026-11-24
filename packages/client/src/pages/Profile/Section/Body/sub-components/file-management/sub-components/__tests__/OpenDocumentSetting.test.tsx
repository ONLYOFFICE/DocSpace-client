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

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeepLinkType } from "@docspace/shared/enums";

const device = vi.hoisted(() => ({ isMobile: true }));

vi.mock("react-device-detect", () => ({
  get isMobile() {
    return device.isMobile;
  },
}));

import { OpenDocumentSetting } from "../OpenDocumentSetting";

const renderSetting = (deepLinkSettings: number | null) => {
  const getDeepLinkSettings = vi.fn(async () => {});
  render(
    <Provider common={{ deepLinkSettings, getDeepLinkSettings }}>
      <OpenDocumentSetting />
    </Provider>,
  );
  return getDeepLinkSettings;
};

const radio = (name: string) => screen.getByRole("radio", { name });

afterEach(() => {
  localStorage.clear();
  device.isMobile = true;
});

describe("OpenDocumentSetting - Bug 73753", () => {
  it("shows the remembered choice and lets the user change it", async () => {
    localStorage.setItem("defaultOpenDocument", "app");
    renderSetting(DeepLinkType.Choice);

    expect(
      await screen.findByText("FilesSettings:OpenDocumentsOnMobile"),
    ).toBeInTheDocument();
    expect(radio("FilesSettings:OpenInMobileApp")).toBeChecked();

    fireEvent.click(radio("FilesSettings:OpenInMobileBrowser"));
    expect(localStorage.getItem("defaultOpenDocument")).toBe("web");

    fireEvent.click(radio("FilesSettings:AskEveryTime"));
    expect(localStorage.getItem("defaultOpenDocument")).toBeNull();
  });

  it("selects Ask every time while nothing is remembered", async () => {
    renderSetting(null);

    await screen.findByText("FilesSettings:OpenDocumentsOnMobile");
    expect(radio("FilesSettings:AskEveryTime")).toBeChecked();
  });

  it("is hidden when the portal opens documents only on the web", async () => {
    const getDeepLinkSettings = renderSetting(DeepLinkType.Web);

    await vi.waitFor(() => expect(getDeepLinkSettings).toHaveBeenCalled());
    expect(
      screen.queryByText("FilesSettings:OpenDocumentsOnMobile"),
    ).not.toBeInTheDocument();
  });

  it("is hidden on a desktop and does not ask for the portal setting", () => {
    device.isMobile = false;
    const getDeepLinkSettings = renderSetting(DeepLinkType.Choice);

    expect(
      screen.queryByText("FilesSettings:OpenDocumentsOnMobile"),
    ).not.toBeInTheDocument();
    expect(getDeepLinkSettings).not.toHaveBeenCalled();
  });
});
