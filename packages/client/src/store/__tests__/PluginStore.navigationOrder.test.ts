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

const navigationPlugin = (name: string, keys: string[]) => ({
  name,
  enabled: true,
  version: "1.0.0",
  iconUrl: `https://portal.test/plugins/${name}`,
  getArticleNavigationItems: () =>
    new Map(
      keys.map((key) => [key, { key, label: key, icon: `${key}.svg` }]),
    ),
});

// The plugins in the order their bundles finished loading, which is not the order they were installed in.
const withLoadedPlugins = (loaded: ReturnType<typeof navigationPlugin>[]) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  runInAction(() => {
    store.plugins = loaded as unknown as TPlugin[];
  });

  for (const plugin of loaded) store.updateArticleNavigationItems(plugin.name);

  return store.articleNavigationItemsList?.map(({ key }) => key);
};

describe("PluginStore article navigation order", () => {
  it("lists the items by plugin name, not by the order the plugins loaded in", () => {
    const keys = withLoadedPlugins([
      navigationPlugin("cws-03-mail", ["mail"]),
      navigationPlugin("cws-01-chat", ["chat"]),
      navigationPlugin("cws-02-projects", ["projects"]),
    ]);

    expect(keys).toEqual(["chat", "projects", "mail"]);
  });

  it("compares the numbers in plugin names as numbers", () => {
    const keys = withLoadedPlugins([
      navigationPlugin("cws-10-wiki", ["wiki"]),
      navigationPlugin("cws-9-crm", ["crm"]),
    ]);

    expect(keys).toEqual(["crm", "wiki"]);
  });

  it("keeps the items of one plugin in the order the plugin gave them", () => {
    const keys = withLoadedPlugins([
      navigationPlugin("b-plugin", ["search", "my-day"]),
      navigationPlugin("a-plugin", ["chat"]),
    ]);

    expect(keys).toEqual(["chat", "search", "my-day"]);
  });
});
