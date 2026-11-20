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
  default: {
    plugins: {
      deletePlugin: vi.fn(async () => undefined),
      getPersonalPlugins: vi.fn(async () => []),
    },
  },
}));

import api from "@docspace/shared/api";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";

const NAME = "hello";

const deletePlugin = api.plugins.deletePlugin as unknown as ReturnType<
  typeof vi.fn
>;

const t = ((key: string) => key) as never;

const withLoadedPlugin = (personal: boolean) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  runInAction(() => {
    store.plugins = [
      {
        name: NAME,
        pluginName: "Hello",
        enabled: true,
        personal,
        scopes: [],
      } as unknown as TPlugin,
    ];
  });

  return store;
};

describe("uninstallPlugin", () => {
  it("leaves the portal plugin of the same name loaded when a personal copy is deleted", async () => {
    const store = withLoadedPlugin(false);

    await store.uninstallPlugin(NAME, t, true);

    expect(deletePlugin).toHaveBeenCalledWith(NAME, true);
    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].enabled).toBe(true);
  });

  it("unloads the personal plugin it deletes", async () => {
    const store = withLoadedPlugin(true);

    await store.uninstallPlugin(NAME, t, true);

    expect(store.plugins).toHaveLength(0);
  });
});

describe("handlePluginStateChange", () => {
  it("does not switch a personal plugin on a portal event of the same name", () => {
    const store = withLoadedPlugin(true);

    store.handlePluginStateChange({ webPluginName: NAME, enabled: false });

    expect(store.plugins[0].enabled).toBe(true);
  });

  it("switches a portal plugin off on its portal event", () => {
    const store = withLoadedPlugin(false);

    store.handlePluginStateChange({ webPluginName: NAME, enabled: false });

    expect(store.plugins[0].enabled).toBe(false);
  });
});

describe("portalPluginList", () => {
  it("leaves personal plugins out", () => {
    const store = withLoadedPlugin(true);

    expect(store.portalPluginList).toHaveLength(0);
  });
});
