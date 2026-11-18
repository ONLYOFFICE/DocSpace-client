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


import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  default: { emit: vi.fn(), on: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { plugins: { updatePlugin: vi.fn() } },
}));

import { DeviceType } from "@docspace/shared/enums";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import { PluginActions } from "../../helpers/plugins/enums";

const navigateFrom = (currentDeviceType: DeviceType) => {
  const settingsStore = {
    culture: "en",
    currentDeviceType,
    setArticleOpen: vi.fn(),
  };

  const store = new PluginStore(
    settingsStore as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  store.dispatchMessage({
    message: { actions: [PluginActions.navigate], navigatePath: "/p/results" },
    pluginName: "search",
  });

  return settingsStore.setArticleOpen;
};

const navigate = vi.fn();

describe("PluginStore plugin navigation", () => {
  beforeEach(() => {
    navigate.mockClear();
    (window as unknown as { DocSpace: unknown }).DocSpace = { navigate };
  });

  it("closes the sidebar drawer on a phone, as the portal's own entries do", () => {
    expect(navigateFrom(DeviceType.mobile)).toHaveBeenCalledWith(false);
    expect(navigate).toHaveBeenCalledWith("/p/results", { replace: false });
  });

  it("leaves the sidebar alone where it is not a drawer", () => {
    expect(navigateFrom(DeviceType.desktop)).not.toHaveBeenCalled();
    expect(navigateFrom(DeviceType.tablet)).not.toHaveBeenCalled();
  });
});
