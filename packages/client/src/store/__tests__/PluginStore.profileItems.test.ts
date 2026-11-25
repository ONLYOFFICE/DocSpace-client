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

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";

const Tab = () => null;

class ProfilePlugin {
  profileTabItems = new Map<string, Record<string, unknown>>();

  profileFieldItems = new Map<string, Record<string, unknown>>();

  enabled = true;

  constructor(public name: string) {}

  getProfileTabItems() {
    return this.profileTabItems;
  }

  getProfileFieldItems() {
    return this.profileFieldItems;
  }
}

const createStore = (plugins: ProfilePlugin[], device = "desktop") => {
  const store = new PluginStore(
    { culture: "en", currentDeviceType: device } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: { id: "user", isOwner: true } } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  runInAction(() => {
    store.plugins = plugins as unknown as TPlugin[];
  });

  return store;
};

describe("PluginStore profile tabs and fields", () => {
  it("reads the items through the plugin's own methods and tags them with its name", () => {
    const plugin = new ProfilePlugin("calendar");
    plugin.profileTabItems.set("calendar-sync", {
      key: "calendar-sync",
      label: "Calendar",
      component: Tab,
    });
    plugin.profileFieldItems.set("telegram", { key: "telegram", component: Tab });
    const store = createStore([plugin]);

    store.updateProfileTabItems(plugin.name);
    store.updateProfileFieldItems(plugin.name);

    expect(store.profileTabItemsList).toEqual([
      {
        key: "calendar-sync",
        value: {
          key: "calendar-sync",
          label: "Calendar",
          component: Tab,
          pluginName: "calendar",
        },
      },
    ]);
    expect(store.profileFieldItemsList[0]?.value.pluginName).toBe("calendar");
  });

  it("orders the items by plugin name, whatever order the plugins loaded in", () => {
    const later = new ProfilePlugin("b-plugin");
    later.profileFieldItems.set("b", { key: "b", component: Tab });
    const earlier = new ProfilePlugin("a-plugin");
    earlier.profileFieldItems.set("a", { key: "a", component: Tab });
    const store = createStore([later, earlier]);

    store.updateProfileFieldItems(later.name);
    store.updateProfileFieldItems(earlier.name);

    expect(store.profileFieldItemsList.map(({ key }) => key)).toEqual([
      "a",
      "b",
    ]);
  });

  it("leaves out the items whose role, device or people filters exclude the user", () => {
    const plugin = new ProfilePlugin("filters");
    plugin.profileTabItems.set("admins", {
      key: "admins",
      label: "Admins",
      component: Tab,
      usersTypes: ["FullAdmin"],
    });
    plugin.profileTabItems.set("phones", {
      key: "phones",
      label: "Phones",
      component: Tab,
      devices: ["mobile"],
    });
    plugin.profileTabItems.set("others", {
      key: "others",
      label: "Others",
      component: Tab,
      users: ["someone-else"],
    });
    plugin.profileTabItems.set("everyone", {
      key: "everyone",
      label: "Everyone",
      component: Tab,
    });
    const store = createStore([plugin]);

    store.updateProfileTabItems(plugin.name);

    expect(store.profileTabItemsList.map(({ key }) => key)).toEqual([
      "everyone",
    ]);
  });

  it("drops an item the plugin removed on the next update", () => {
    const plugin = new ProfilePlugin("removal");
    plugin.profileFieldItems.set("kept", { key: "kept", component: Tab });
    plugin.profileFieldItems.set("gone", { key: "gone", component: Tab });
    const store = createStore([plugin]);
    store.updateProfileFieldItems(plugin.name);

    plugin.profileFieldItems.delete("gone");
    store.updateProfileFieldItems(plugin.name);

    expect(store.profileFieldItemsList.map(({ key }) => key)).toEqual(["kept"]);
  });
});
