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

const Widget = () => null;

const plugin = (name: string, filters: Record<string, unknown> = {}) => {
  let item: Record<string, unknown> | null = { component: Widget, ...filters };

  return {
    name,
    enabled: true,
    getArticleWidgetItem: () => item,
    clearWidget: () => {
      item = null;
    },
  };
};

const createStore = (plugins: ReturnType<typeof plugin>[]) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: { id: "user", isOwner: true } } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  runInAction(() => {
    store.plugins = plugins as unknown as TPlugin[];
  });

  for (const { name } of plugins) store.updateArticleWidgetItem(name);

  return store;
};

describe("PluginStore sidebar widget", () => {
  it("shows the widget of the first plugin by name, whatever order they loaded in", () => {
    const store = createStore([plugin("search10"), plugin("search2")]);

    expect(store.articleWidgetItem).toEqual({
      component: Widget,
      pluginName: "search2",
    });
  });

  it("gives the slot to the next plugin when the first one's filters leave the user out", () => {
    const store = createStore([
      plugin("a-role", { usersTypes: ["FullAdmin"] }),
      plugin("b-people", { users: ["someone-else"], groups: [] }),
      plugin("c-everyone"),
    ]);

    expect(store.articleWidgetItem?.pluginName).toBe("c-everyone");
  });

  it("gives the slot to the next plugin once the first clears its widget", () => {
    const first = plugin("a-search");
    const store = createStore([first, plugin("b-search")]);

    first.clearWidget();
    store.updateArticleWidgetItem(first.name);

    expect(store.articleWidgetItem?.pluginName).toBe("b-search");
  });
});
