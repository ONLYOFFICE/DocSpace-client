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

import { describe, it, expect, vi, afterEach } from "vitest";
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
      getPlugins: vi.fn(async () => []),
      updatePlugin: vi.fn(async () => ({})),
      addPlugin: vi.fn(),
    },
  },
}));

import api from "@docspace/shared/api";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";

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

  it("removes the deleted plugin when another one was added during the request", async () => {
    const store = withLoadedPlugin(true);

    deletePlugin.mockImplementationOnce(async () => {
      runInAction(() => {
        store.plugins = [
          {
            name: "uploaded",
            pluginName: "Uploaded",
            enabled: true,
            personal: true,
            scopes: [],
          } as unknown as TPlugin,
          ...store.plugins,
        ];
      });
    });

    await store.uninstallPlugin(NAME, t, true);

    expect(store.plugins.map((p) => p.name)).toEqual(["uploaded"]);
  });

  it("drops the deleted plugin from the member's own list before it is read again", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.personalPlugins = [
        { name: NAME } as unknown as TAPIPlugin,
        { name: "other" } as unknown as TAPIPlugin,
      ];
    });

    vi.mocked(api.plugins.getPersonalPlugins).mockImplementationOnce(
      () => new Promise(() => {}),
    );

    await store.uninstallPlugin(NAME, t, true);

    expect(store.personalPlugins.map((p) => p.name)).toEqual(["other"]);
  });

  it("reads the member's own list again when the delete is refused", async () => {
    const store = withLoadedPlugin(true);

    deletePlugin.mockRejectedValueOnce(new Error("Plugin not found"));
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([]);

    await store.uninstallPlugin(NAME, t, true);

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(1);
    expect(store.personalPlugins).toEqual([]);
  });
});

describe("updatePlugin of a personal plugin refused after it was saved", () => {
  it("switches the plugin on when the member's own list says it is on", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.plugins[0].enabled = false;
    });

    vi.mocked(api.plugins.updatePlugin).mockRejectedValueOnce(
      new Error("CSP header size exceeds maximum allowed size of 15360 bytes."),
    );
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, enabled: true } as unknown as TAPIPlugin,
    ]);

    await store.updatePlugin(NAME, true);

    expect(store.plugins[0].enabled).toBe(true);
  });

  it("leaves the plugin off when the member's own list says it is off", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.plugins[0].enabled = false;
    });

    vi.mocked(api.plugins.updatePlugin).mockRejectedValueOnce(
      new Error("Access denied"),
    );
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, enabled: false } as unknown as TAPIPlugin,
    ]);

    await store.updatePlugin(NAME, true);

    expect(store.plugins[0].enabled).toBe(false);
  });
});

describe("updatePlugins", () => {
  it("keeps the list marked as not loaded until the plugins are read", async () => {
    const store = new PluginStore(
      { culture: "en", addAbortControllers: vi.fn() } as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      { isNotPaidPeriod: false } as unknown as CurrentTariffStatusStore,
    );
    let finishRead: (plugins: TAPIPlugin[]) => void = () => {};

    vi.mocked(api.plugins.getPlugins).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        }),
    );

    store.setIsLoaded(true);

    const reload = store.updatePlugins(true);

    expect(store.isLoaded).toBe(false);

    finishRead([]);
    await reload;

    expect(store.isLoaded).toBe(true);
  });
});

describe("updatePlugin", () => {
  it.each([true, false])(
    "sends the level of the loaded plugin (personal: %s)",
    async (personal) => {
      const store = withLoadedPlugin(personal);

      await store.updatePlugin(NAME, false);

      expect(api.plugins.updatePlugin).toHaveBeenCalledWith(
        NAME,
        false,
        "",
        personal,
      );
    },
  );
});

describe("a portal plugin loaded over a personal one", () => {
  const portalPlugin = (name: string, pluginName: string) =>
    ({
      name,
      pluginName,
      enabled: true,
      settings: "",
      scopes: "",
      url: `https://portal.test/plugins/${name}/plugin.js`,
      version: "1.0.0",
      runtime: "module",
    }) as unknown as TAPIPlugin;

  it("unloads the personal plugin of the same name", async () => {
    const store = withLoadedPlugin(true);
    store.setIsEmptyList(true);

    await store.initLoadedModulePlugin(portalPlugin(NAME, "Hello"), {
      onLoadCallback: async () => {},
    });

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].personal).toBeFalsy();
    expect(store.isEmptyList).toBe(false);
  });

  it("unloads the personal plugin that has its pluginName", async () => {
    const store = withLoadedPlugin(true);

    await store.initLoadedModulePlugin(portalPlugin("other", "Hello"), {
      onLoadCallback: async () => {},
    });

    expect(store.plugins.map((p) => p.name)).toEqual(["other"]);
  });
});

describe("addPlugin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("installs for the caller alone and reads the personal list once the plugin is in the list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const store = withLoadedPlugin(false);
    let ownPluginsLoadedAtRead = -1;

    vi.mocked(api.plugins.addPlugin).mockResolvedValueOnce({
      name: "own",
      pluginName: "Own",
      enabled: true,
      personal: true,
      scopes: "",
      url: "https://portal.test/plugins/own/plugin.js",
      version: "1.0.0",
      runtime: "module",
    } as unknown as TAPIPlugin);

    vi.mocked(api.plugins.getPersonalPlugins).mockImplementationOnce(async () => {
      ownPluginsLoadedAtRead = store.plugins.filter(
        (p) => p.name === "own",
      ).length;

      return [];
    });

    const data = new FormData();

    await store.addPlugin(data, true);

    expect(api.plugins.addPlugin).toHaveBeenCalledWith(data, true);
    expect(ownPluginsLoadedAtRead).toBe(1);
  });

  it.each([
    ["https://api.example.com", true],
    [undefined, false],
  ])(
    "asks for a reload after a personal upload only with domains (%s)",
    async (cspDomains, needsReload) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }),
      );
      vi.spyOn(console, "error").mockImplementation(() => {});

      const store = withLoadedPlugin(false);

      vi.mocked(api.plugins.addPlugin).mockResolvedValueOnce({
        name: "own",
        pluginName: "Own",
        enabled: true,
        personal: true,
        scopes: "",
        url: "https://portal.test/plugins/own/plugin.js",
        version: "1.0.0",
        runtime: "module",
        cspDomains,
      } as unknown as TAPIPlugin);

      const result = await store.addPlugin(new FormData(), true);

      expect(result?.needsReload).toBe(needsReload);
      expect(store.needPageReload).toBe(false);
    },
  );
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

describe("handlePersonalPluginStateChange", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const switchedOff = (store: PluginStore, cspDomains?: string) =>
    runInAction(() => {
      store.plugins[0].enabled = false;
      store.plugins[0].cspDomains = cspDomains;
    });

  const ownModulePlugin = (cspDomains?: string) =>
    ({
      name: "own",
      pluginName: "Own",
      enabled: true,
      personal: true,
      scopes: "",
      url: "https://portal.test/plugins/own/plugin.js",
      version: "1.0.0",
      runtime: "module",
      cspDomains,
    }) as unknown as TAPIPlugin;

  const withoutPluginScripts = () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
  };

  it("switches the plugin off and clears its reload mark while the member keeps it", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.reloadRequiredPlugins = [NAME];
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, enabled: false } as unknown as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: false,
    });

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].enabled).toBe(false);
    expect(store.reloadRequiredPlugins).toEqual([]);
  });

  it.each([true, false])(
    "unloads the plugin deleted in another tab (on here: %s)",
    async (enabled) => {
      const store = withLoadedPlugin(true);

      if (!enabled) switchedOff(store);
      vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([]);

      await store.handlePersonalPluginStateChange({
        webPluginName: NAME,
        enabled: false,
      });

      expect(store.plugins).toHaveLength(0);
    },
  );

  it.each([
    ["https://api.example.com", [NAME]],
    [",", []],
    [undefined, []],
  ])(
    "switches the plugin on, marked for a reload only with domains (%s)",
    async (cspDomains, marked) => {
      const store = withLoadedPlugin(true);

      switchedOff(store, cspDomains);
      vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
        { name: NAME, enabled: true, cspDomains } as unknown as TAPIPlugin,
      ]);

      await store.handlePersonalPluginStateChange({
        webPluginName: NAME,
        enabled: true,
      });

      expect(store.plugins[0].enabled).toBe(true);
      expect(store.reloadRequiredPlugins).toEqual(marked);
    },
  );

  it("ends in the state of the last change when two arrive at once", async () => {
    const store = withLoadedPlugin(true);
    let finishFirstRead: (plugins: TAPIPlugin[]) => void = () => {};

    vi.mocked(api.plugins.getPersonalPlugins)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirstRead = resolve;
          }),
      )
      .mockResolvedValueOnce([
        { name: NAME, enabled: true } as unknown as TAPIPlugin,
      ]);

    const switchOff = store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: false,
    });
    const switchOn = store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    await vi.waitFor(() =>
      expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(1),
    );
    finishFirstRead([{ name: NAME, enabled: false } as unknown as TAPIPlugin]);
    await Promise.all([switchOff, switchOn]);

    expect(store.plugins[0].enabled).toBe(true);
  });

  it("loads a plugin added in another tab and marks its domains for a reload", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin("https://api.example.com"),
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    expect(store.plugins.map((p) => p.name)).toContain("own");
    expect(store.reloadRequiredPlugins).toEqual(["own"]);
  });

  it("loads the new version uploaded in another tab", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(true);
    const newVersion = {
      ...ownModulePlugin(),
      name: NAME,
      pluginName: "Hello",
      url: "https://portal.test/plugins/hello/plugin.js?hash=2.0.0",
    } as TAPIPlugin;

    runInAction(() => {
      store.plugins[0].url =
        "https://portal.test/plugins/hello/plugin.js?hash=1.0.0";
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      newVersion,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].url).toBe(newVersion.url);
  });

  it("leaves a plugin a portal plugin shadows unloaded", async () => {
    const store = withLoadedPlugin(false);

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, pluginName: "Hello", enabled: true } as unknown as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].personal).toBe(false);
    expect(store.plugins[0].initError).toBeUndefined();
  });

  it("loads its own upload that the server kept while refusing it with 403", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);
    let uploadsAtRead = -1;

    vi.mocked(api.plugins.addPlugin).mockImplementationOnce(async () => {
      store.handlePersonalPluginStateChange({
        webPluginName: "own",
        enabled: true,
      });

      await Promise.resolve();

      throw new Error(
        "CSP header size exceeds maximum allowed size of 15360 bytes.",
      );
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockImplementationOnce(
      async () => {
        uploadsAtRead = store.pendingPersonalUploads;

        return [ownModulePlugin()];
      },
    );

    await store.addPlugin(new FormData(), true);
    await store.personalChanges;

    expect(uploadsAtRead).toBe(0);
    expect(store.plugins.map((p) => p.name)).toContain("own");
  });
});

describe("activatePlugin", () => {
  it("does not start a plugin again that an event has already switched on", async () => {
    const store = withLoadedPlugin(true);
    let starts = 0;

    runInAction(() => {
      store.plugins[0].onLoadCallback = async () => {
        starts += 1;
      };
    });

    await store.activatePlugin(NAME);

    expect(starts).toBe(0);
  });

  it("starts a plugin that failed to start once when asked twice at a time", async () => {
    const store = withLoadedPlugin(true);
    let starts = 0;
    let finishStart = () => {};

    runInAction(() => {
      store.plugins[0].initError = {
        kind: "thrown",
        message: "timeout",
      } as never;
      store.plugins[0].onLoadCallback = () => {
        starts += 1;

        return new Promise<void>((resolve) => {
          finishStart = resolve;
        });
      };
    });

    const first = store.activatePlugin(NAME);
    const second = store.activatePlugin(NAME);

    await vi.waitFor(() => expect(starts).toBe(1));
    finishStart();
    await Promise.all([first, second]);

    expect(starts).toBe(1);
    expect(store.plugins[0].initError).toBeUndefined();
  });

  it.each([
    [true, false],
    [false, true],
  ])(
    "asks the portal settings to reload only for a portal plugin (personal: %s)",
    async (personal, needPageReload) => {
      const store = withLoadedPlugin(personal);

      runInAction(() => {
        store.plugins[0].enabled = false;
      });

      await store.activatePlugin(NAME);

      expect(store.needPageReload).toBe(needPageReload);
    },
  );
});

describe("portalPluginList", () => {
  it("leaves personal plugins out", () => {
    const store = withLoadedPlugin(true);

    expect(store.portalPluginList).toHaveLength(0);
  });
});

describe("checkPluginCacheWarning", () => {
  it("warns about a plugin of the same level, name and version", () => {
    const store = withLoadedPlugin(true);

    expect(
      store.checkPluginCacheWarning({
        name: NAME,
        version: "1.0.0",
        personal: true,
      } as never),
    ).toBe(false);

    runInAction(() => {
      store.plugins[0].version = "1.0.0";
    });

    expect(
      store.checkPluginCacheWarning({
        name: NAME,
        version: "1.0.0",
        personal: true,
      } as never),
    ).toBe(true);
  });

  it("does not warn about a plugin of the other level", () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.plugins[0].version = "1.0.0";
    });

    expect(
      store.checkPluginCacheWarning({ name: NAME, version: "1.0.0" } as never),
    ).toBe(false);
  });
});
