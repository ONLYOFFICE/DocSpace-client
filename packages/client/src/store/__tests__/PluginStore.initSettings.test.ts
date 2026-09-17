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

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: { emit: vi.fn(), on: vi.fn() },
  SocketCommands: { Subscribe: "subscribe" },
  SocketEvents: { ChangeWebPlugin: "s:change-web-plugin" },
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
import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import { PluginStatus } from "../../helpers/plugins/enums";

const PLUGIN = "Sample";
const ITEM_KEY = "convert-file-item";

class TokenGatedPlugin {
  status: PluginStatus = PluginStatus.hide;

  getStatus = () => this.status;

  updateStatus = (status: PluginStatus) => {
    this.status = status;
  };

  setAdminPluginSettingsValue = (token: string | null) => {
    this.updateStatus(token ? PluginStatus.active : PluginStatus.hide);
  };

  getContextMenuItems = () =>
    new Map([[ITEM_KEY, { key: ITEM_KEY, label: "Convert to PDF" }]]);
}

class TokenGatedPluginWithOnLoad extends TokenGatedPlugin {
  onLoadCallback = async () => {};
}

const apiPlugin = (settings: string | null): TAPIPlugin =>
  ({
    name: PLUGIN,
    pluginName: PLUGIN,
    enabled: true,
    settings,
    scopes: "Settings,ContextMenu",
    url: "https://portal.test/plugins/sample/plugin.js",
    version: "1.0.0",
  }) as unknown as TAPIPlugin;

const withFrame = (plugin: TokenGatedPlugin) => {
  const store = new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

  const script: { onload?: () => void; setAttribute: () => void } = {
    setAttribute: () => {},
  };

  runInAction(() => {
    store.pluginFrame = {
      contentWindow: { Plugins: { [PLUGIN]: plugin } },
      contentDocument: {
        createElement: () => script,
        body: { appendChild: () => script.onload?.() },
      },
    } as unknown as HTMLIFrameElement;
  });

  return store;
};

describe.each([
  ["with onLoadCallback", () => new TokenGatedPluginWithOnLoad()],
  ["without onLoadCallback", () => new TokenGatedPlugin()],
])("PluginStore initPlugin with stored settings, %s", (_, createPlugin) => {
  it("registers items of a plugin whose status depends on its settings", async () => {
    const store = withFrame(createPlugin());

    await store.initPlugin(apiPlugin("api-token"));

    expect(store.plugins[0].status).toBe(PluginStatus.active);
    expect(store.contextMenuItems.has(ITEM_KEY)).toBe(true);
  });

  it("keeps the items hidden while the plugin has no settings", async () => {
    const store = withFrame(createPlugin());

    await store.initPlugin(apiPlugin(null));

    expect(store.plugins[0].status).toBe(PluginStatus.hide);
    expect(store.contextMenuItems.has(ITEM_KEY)).toBe(false);
  });
});
