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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: { emit: vi.fn(), on: vi.fn() },
  SocketCommands: { Subscribe: "subscribe" },
  SocketEvents: { ChangeWebPlugin: "change-web-plugin" },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    plugins: {
      updatePlugin: vi.fn(),
      deletePlugin: vi.fn().mockResolvedValue(undefined),
      addPlugin: vi.fn(),
    },
  },
}));

const rewritePluginImports = vi.fn();

vi.mock("../../helpers/plugins/react/shim", () => ({
  rewritePluginImports: (code: string) => rewritePluginImports(code),
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";
import type { TTranslation } from "@docspace/shared/types";

import api from "@docspace/shared/api";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import { PluginScopes } from "../../helpers/plugins/enums";

const PLUGIN = "article-navigation-sample";
const SHIM_ERROR =
  'The bundle imports "@docspace/ui-kit", which the portal does not provide.';

const apiPlugin = (overrides: Partial<TAPIPlugin> = {}): TAPIPlugin =>
  ({
    name: PLUGIN,
    pluginName: PLUGIN,
    enabled: true,
    settings: "",
    scopes: "Settings,ArticleNavigation",
    url: "https://portal.test/plugins/sample/plugin.js",
    version: "1.0.0",
    runtime: "module",
    ...overrides,
  }) as unknown as TAPIPlugin;

const createStore = () =>
  new PluginStore(
    {
      culture: "en",
      buildVersionInfo: { docspace: "4.0.0" },
    } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

const fetchOk = () =>
  vi.fn().mockResolvedValue({ ok: true, text: async () => "export {};" });

const fetchNotFound = () =>
  vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PluginStore module plugin load failure", () => {
  it("keeps a plugin whose bundle imports an unknown external in the list", async () => {
    vi.stubGlobal("fetch", fetchOk());
    rewritePluginImports.mockImplementation(() => {
      throw new Error(SHIM_ERROR);
    });

    const store = createStore();

    await store.initModulePlugin(apiPlugin());

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0]).toMatchObject({
      name: PLUGIN,
      nameLocale: PLUGIN,
      enabled: true,
      loadError: SHIM_ERROR,
      scopes: [PluginScopes.Settings, PluginScopes.ArticleNavigation],
    });
    expect(store.isEmptyList).toBe(false);
  });

  it("keeps a plugin whose bundle is missing on the server in the list", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(apiPlugin());

    expect(store.plugins[0].loadError).toContain("HTTP 404");
  });

  it("publishes nothing for a broken plugin", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(apiPlugin());

    expect(store.articleNavigationItems.size).toBe(0);
  });

  it("does not run a broken plugin when it is re-enabled", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(apiPlugin({ enabled: false }));
    await store.activatePlugin(PLUGIN);

    expect(store.plugins[0].enabled).toBe(true);
    expect(store.plugins[0].loadError).toContain("HTTP 404");
    expect(store.articleNavigationItems.size).toBe(0);
  });

  it("reports the load error to the uploader instead of a success", async () => {
    vi.stubGlobal("fetch", fetchNotFound());
    vi.mocked(api.plugins.addPlugin).mockResolvedValue(apiPlugin());

    const store = createStore();

    const result = await store.addPlugin(new FormData());

    expect(result?.loadError).toContain("HTTP 404");
    expect(store.plugins[0].loadError).toContain("HTTP 404");
  });

  it("lets the admin delete a broken plugin", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(apiPlugin());
    await store.uninstallPlugin(PLUGIN, ((key: string) => key) as TTranslation);

    expect(store.plugins).toHaveLength(0);
    expect(store.isEmptyList).toBe(true);
  });
});

describe("PluginStore legacy plugin load failure", () => {
  it("keeps a plugin whose script fails to load in the list", async () => {
    const store = createStore();

    const script: { onerror?: () => void; setAttribute: () => void } = {
      setAttribute: () => {},
    };

    runInAction(() => {
      store.pluginFrame = {
        contentWindow: { Plugins: {} },
        contentDocument: {
          createElement: () => script,
          body: { appendChild: () => script.onerror?.() },
        },
      } as unknown as HTMLIFrameElement;
    });

    await store.initPlugin(apiPlugin({ runtime: undefined }));

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].loadError).toContain("Failed to load script");
  });
});
