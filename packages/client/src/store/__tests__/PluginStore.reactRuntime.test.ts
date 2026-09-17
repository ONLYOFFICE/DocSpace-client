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
import { autorun, runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: { emit: vi.fn(), on: vi.fn() },
  SocketCommands: { Subscribe: "subscribe" },
  SocketEvents: { ChangeWebPlugin: "change-web-plugin" },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { plugins: { updatePlugin: vi.fn() } },
}));

import api from "@docspace/shared/api";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";
import { PluginScopes, PluginStatus } from "../../helpers/plugins/enums";

const PLUGIN = "Sample";
const ITEM_KEY = "convert-file-item";

const updatePlugin = api.plugins.updatePlugin as unknown as ReturnType<
  typeof vi.fn
>;

const createStore = () =>
  new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user: null } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

// A module plugin exports an instance, not a literal, and MobX leaves it
// unproxied — which is what the reactivity cases at the bottom turn on.
class PluginInstance {
  name = PLUGIN;

  pluginName = PLUGIN;

  enabled = true;

  settings: string | null = null;

  scopes: string[] = [];

  setAdminPluginSettingsValue = vi.fn();
}

const withPlugin = (overrides: Partial<PluginInstance> = {}) => {
  const store = createStore();
  const plugin = Object.assign(new PluginInstance(), overrides);

  runInAction(() => {
    store.plugins = [plugin as unknown as TPlugin];
  });

  return { store, plugin };
};

// The settings gate: the plugin hides itself until its settings say otherwise,
// and the portal has to follow that with the item it publishes.
class ItemPlugin extends PluginInstance {
  scopes: string[] = [PluginScopes.ContextMenu];

  status: PluginStatus = PluginStatus.hide;

  getStatus = () => this.status;

  getContextMenuItems = () =>
    new Map([[ITEM_KEY, { key: ITEM_KEY, label: "Convert" }]]);
}

const withItemPlugin = () => {
  const store = createStore();
  const plugin = new ItemPlugin();

  runInAction(() => {
    store.plugins = [plugin as unknown as TPlugin];
  });

  return { store, plugin };
};

const settingsOf = (store: PluginStore) =>
  store.buildReactPluginRuntime(PLUGIN, null, null).settings;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PluginStore react runtime settings", () => {
  describe("load", () => {
    it("hands the plugin its stored settings", () => {
      const { store } = withPlugin({
        settings: JSON.stringify({ enabled: true, tries: 3 }),
      });

      expect(settingsOf(store).load()).toEqual({ enabled: true, tries: 3 });
    });

    // The settings are already in the store by the time a plugin component
    // renders, so a component can read them in a state initialiser.
    it("reads the settings synchronously", () => {
      const { store } = withPlugin({ settings: JSON.stringify({ tries: 3 }) });

      expect(settingsOf(store).load()).not.toBeInstanceOf(Promise);
    });

    // The portal keeps whatever the plugin wrote, and an earlier version of a
    // plugin may well have written something else.
    it("answers null instead of throwing on settings that are not JSON", () => {
      const { store } = withPlugin({ settings: "{not json" });

      expect(settingsOf(store).load()).toBeNull();
    });

    it("answers null when nothing is stored", () => {
      const { store } = withPlugin();

      expect(settingsOf(store).load()).toBeNull();
    });

    it("answers null when the plugin is not installed", () => {
      const store = createStore();

      expect(settingsOf(store).load()).toBeNull();
    });
  });

  describe("save", () => {
    it("writes to the portal under the plugin's current enabled state", async () => {
      const { store } = withPlugin({ enabled: false });

      await settingsOf(store).save({ tries: 3 });

      expect(updatePlugin).toHaveBeenCalledWith(
        PLUGIN,
        false,
        JSON.stringify({ tries: 3 }),
      );
    });

    it("mirrors what it wrote into the store and back into the plugin", async () => {
      const { store, plugin } = withPlugin();

      await settingsOf(store).save({ tries: 3 });

      expect(store.plugins[0].settings).toBe(JSON.stringify({ tries: 3 }));
      expect(plugin.setAdminPluginSettingsValue).toHaveBeenCalledWith(
        JSON.stringify({ tries: 3 }),
      );
    });

    // The plugin has to hear about a rejected write, and the store must not
    // hold a value the portal never took.
    it("keeps the stored settings when the portal rejects the write", async () => {
      const { store, plugin } = withPlugin({
        settings: JSON.stringify({ tries: 1 }),
      });

      updatePlugin.mockRejectedValueOnce(new Error("403"));

      await expect(settingsOf(store).save({ tries: 3 })).rejects.toThrow("403");

      expect(store.plugins[0].settings).toBe(JSON.stringify({ tries: 1 }));
      expect(plugin.setAdminPluginSettingsValue).not.toHaveBeenCalled();
    });

    it("does not reach the portal for a plugin that is not installed", async () => {
      const store = createStore();

      await settingsOf(store).save({ tries: 3 });

      expect(updatePlugin).not.toHaveBeenCalled();
    });

    // A plugin gated on its settings decides in setAdminPluginSettingsValue
    // whether it has anything to show, and nothing else asks it afterwards.
    it("re-reads the status the plugin took from the settings", async () => {
      const { store, plugin } = withItemPlugin();

      plugin.setAdminPluginSettingsValue.mockImplementation(() => {
        plugin.status = PluginStatus.active;
      });

      await settingsOf(store).save({ apiKey: "token" });

      expect(store.plugins[0].status).toBe(PluginStatus.active);
      expect(store.contextMenuItems.has(ITEM_KEY)).toBe(true);
    });

    it("takes the items back when the saved settings hide the plugin", async () => {
      const { store, plugin } = withItemPlugin();

      plugin.status = PluginStatus.active;
      store.updatePluginStatus(PLUGIN);

      plugin.setAdminPluginSettingsValue.mockImplementation(() => {
        plugin.status = PluginStatus.hide;
      });

      await settingsOf(store).save({ apiKey: "" });

      expect(store.plugins[0].status).toBe(PluginStatus.hide);
      expect(store.contextMenuItems.has(ITEM_KEY)).toBe(false);
    });
  });

  describe("setSaveButton", () => {
    it("keeps the button under the plugin that supplied it", () => {
      const { store } = withPlugin();
      const button = { saveButtonLabel: "Save" };

      settingsOf(store).setSaveButton(button as never);

      expect(store.reactSettingsSaveButtonState).toEqual({
        pluginName: PLUGIN,
        button,
      });
    });

    // Two plugins share the one dialog, so a button left behind would be shown
    // for the next plugin opened.
    it("is dropped when another plugin's settings dialog opens", () => {
      const { store } = withPlugin();

      settingsOf(store).setSaveButton({ saveButtonLabel: "Save" } as never);
      store.setCurrentSettingsDialogPlugin({ pluginName: "Other" });

      expect(store.reactSettingsSaveButtonState).toBeNull();
    });

    it("reaches an observer of the state", () => {
      const { store } = withPlugin();
      const seen: unknown[] = [];

      const dispose = autorun(() => {
        seen.push(store.reactSettingsSaveButtonState);
      });

      settingsOf(store).setSaveButton({ saveButtonLabel: "Save" } as never);
      dispose();

      expect(seen).toHaveLength(2);
    });

    // observable.ref: the button is the plugin's own object, and the dialog gets
    // it back as it was rather than as a MobX proxy of it.
    it("hands the dialog the very object the plugin passed", () => {
      const { store } = withPlugin();
      const button = { saveButtonLabel: "Save" };

      settingsOf(store).setSaveButton(button as never);

      expect(store.reactSettingsSaveButtonState?.button).toBe(button);
    });
  });
});

describe("PluginStore enabled state", () => {
  it("notifies observers when a plugin is activated", () => {
    const { store } = withPlugin({ enabled: false });
    const seen: boolean[] = [];

    const dispose = autorun(() => {
      seen.push(store.plugins[0].enabled);
    });

    store.activatePlugin(PLUGIN);
    dispose();

    expect(seen).toEqual([false, true]);
  });

  it("notifies observers when a plugin is deactivated", () => {
    const { store } = withPlugin();
    const seen: boolean[] = [];

    const dispose = autorun(() => {
      seen.push(store.plugins[0].enabled);
    });

    store.deactivatePlugin(PLUGIN);
    dispose();

    expect(seen).toEqual([true, false]);
  });

  it("leaves an unknown plugin alone", () => {
    const { store } = withPlugin();

    store.deactivatePlugin("Other");

    expect(store.plugins[0].enabled).toBe(true);
  });
});
