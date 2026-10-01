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

import { describe, it, expect, vi } from "vitest";
import { runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  default: { emit: vi.fn(), on: vi.fn() },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { plugins: { updatePlugin: vi.fn() } },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";

const PLUGIN = "Sample";

class FakeSelectedFolderStore {
  id: number | null = null;
}

const withMainButtonMenu = () => {
  const selectedFolderStore = new FakeSelectedFolderStore();
  const onItemClick = vi.fn();

  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    selectedFolderStore as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  const plugin = {
    name: PLUGIN,
    enabled: true,
    version: "1.0.0",
    iconUrl: "https://portal.test/plugins/sample",
    getMainButtonItems: () =>
      new Map([
        [
          "sample-menu",
          {
            key: "sample-menu",
            label: "Menu",
            icon: "menu.svg",
            items: [
              { key: "sample-a", label: "A", icon: "a.svg", onItemClick },
            ],
          },
        ],
      ]),
  };

  runInAction(() => {
    store.plugins = [plugin as unknown as TPlugin];
  });

  store.updateMainButtonItems(PLUGIN);

  const subItems = store.mainButtonItems.get("sample-menu")?.items;

  return { selectedFolderStore, onItemClick, subItems };
};

describe("PluginStore main button items", () => {
  it("builds the sub-items while no folder is open", () => {
    const { subItems } = withMainButtonMenu();

    expect(subItems?.map((item) => item.key)).toEqual(["sample-a"]);
  });

  it("hands a sub-item the folder that is open when it is clicked", async () => {
    const { selectedFolderStore, onItemClick, subItems } = withMainButtonMenu();

    selectedFolderStore.id = 7;
    await subItems?.[0].onClick?.(1);

    expect(onItemClick).toHaveBeenCalledWith(7);
  });
});
