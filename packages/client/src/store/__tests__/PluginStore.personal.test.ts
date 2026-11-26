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
      setPersonalPluginsEnabled: vi.fn(async () => undefined),
      getMembersPlugins: vi.fn(async () => []),
      updateMemberPlugin: vi.fn(async () => ({})),
      deleteMemberPlugin: vi.fn(async () => undefined),
    },
  },
}));

import api from "@docspace/shared/api";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import SocketHelper, {
  SocketEvents,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type {
  TAPIPlugin,
  TMemberPlugin,
} from "@docspace/shared/api/plugins/types";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";
import { PluginScopes } from "../../helpers/plugins/enums";
import { PLUGIN_WAIT_MS } from "../../helpers/plugins/utils";

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

  store.setIsInit(true);

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

  it("does not report a failed re-read of the member's list after a delete", async () => {
    const store = withLoadedPlugin(true);

    vi.mocked(api.plugins.getPersonalPlugins).mockRejectedValueOnce(
      new Error("timeout"),
    );

    await store.uninstallPlugin(NAME, t, true);
    await vi.waitFor(() => expect(store.isPersonalLoaded).toBe(true));

    expect(toastr.error).not.toHaveBeenCalled();
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

    runInAction(() => {
      store.personalPlugins = [{ name: "stale" } as unknown as TAPIPlugin];
    });
    deletePlugin.mockRejectedValueOnce(new Error("Plugin not found"));
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([]);

    await store.uninstallPlugin(NAME, t, true);

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(1);
    expect(store.personalPlugins).toEqual([]);
  });
});

describe("fetchPersonalPlugins", () => {
  it.each([true, false])(
    "marks the member's list as read once the request ends (succeeds: %s)",
    async (succeeds) => {
      const store = withLoadedPlugin(true);
      let finishRead: () => void = () => {};

      vi.mocked(api.plugins.getPersonalPlugins).mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            finishRead = () =>
              succeeds ? resolve([]) : reject(new Error("timeout"));
          }),
      );

      const read = store.fetchPersonalPlugins(false);

      expect(store.isPersonalLoaded).toBe(false);

      finishRead();
      await read;

      expect(store.isPersonalLoaded).toBe(true);
    },
  );

  it("keeps the newer list when an older read answers last", async () => {
    const store = withLoadedPlugin(true);
    let finishOlder: (plugins: TAPIPlugin[]) => void = () => {};

    vi.mocked(api.plugins.getPersonalPlugins)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishOlder = resolve;
          }),
      )
      .mockResolvedValueOnce([{ name: "newer" } as unknown as TAPIPlugin]);

    const older = store.fetchPersonalPlugins(false);

    await store.fetchPersonalPlugins(false);

    finishOlder([{ name: "older" } as unknown as TAPIPlugin]);
    await older;

    expect(store.personalPlugins.map((p) => p.name)).toEqual(["newer"]);
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

    await vi.waitFor(() => expect(api.plugins.getPlugins).toHaveBeenCalled());
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

  it("drops the reload mark of the personal plugin it unloads", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.reloadRequiredPlugins = [NAME];
    });

    await store.initLoadedModulePlugin(portalPlugin(NAME, "Hello"), {
      onLoadCallback: async () => {},
    });

    expect(store.reloadRequiredPlugins).toEqual([]);
  });

  it("adds no styles of a plugin switched off while it starts", async () => {
    const store = withLoadedPlugin(false);

    await store.initLoadedModulePlugin(portalPlugin("styled", "Styled"), {
      cssUrl: "https://portal.test/plugins/styled/plugin.css",
      onLoadCallback: async () => {
        await store.deactivatePlugin("styled");
      },
    });

    expect(document.getElementById("plugin-styles-Styled")).toBeNull();
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

  it("takes the settings saved in another tab, so a later switch keeps them", async () => {
    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.plugins[0].settings = "old";
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, enabled: true, settings: "new" } as unknown as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });
    await store.updatePlugin(NAME, false);

    expect(api.plugins.updatePlugin).toHaveBeenLastCalledWith(
      NAME,
      false,
      "new",
      true,
    );
  });

  it("leaves a change read during the tab's own upload to the end of that upload", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(true);
    const oldUrl = "https://portal.test/plugins/hello/plugin.js?hash=1.0.0";
    let finishRead: (plugins: TAPIPlugin[]) => void = () => {};

    runInAction(() => {
      store.plugins[0].url = oldUrl;
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        }),
    );

    const change = store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    await vi.waitFor(() =>
      expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(1),
    );
    store.pendingPersonalUploads = 1;
    finishRead([
      {
        ...ownModulePlugin(),
        name: NAME,
        pluginName: "Hello",
        url: "https://portal.test/plugins/hello/plugin.js?hash=2.0.0",
      } as TAPIPlugin,
    ]);
    await change;

    expect(store.plugins[0].url).toBe(oldUrl);
    expect(store.deferredPersonalChanges.has(NAME)).toBe(true);
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
    vi.mocked(api.plugins.getPersonalPlugins)
      .mockResolvedValueOnce([ownModulePlugin()])
      .mockImplementationOnce(async () => {
        uploadsAtRead = store.pendingPersonalUploads;

        return [ownModulePlugin()];
      });

    await store.addPlugin(new FormData(), true);
    await store.personalChanges;

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(2);
    expect(uploadsAtRead).toBe(0);
    expect(store.plugins.map((p) => p.name)).toContain("own");
    expect(store.personalPlugins.map((p) => p.name)).toEqual(["own"]);
  });
});

describe("personal events and the session", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const ownModulePlugin = (cspDomains?: string, enabled = true) =>
    ({
      name: "own",
      pluginName: "Own",
      enabled,
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

  it("has the workspace list sync the page's domains before it asks for a reload", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);
    const marksAtSync: number[] = [];

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin("https://api.example.com"),
    ]);
    vi.mocked(api.plugins.getPlugins).mockImplementationOnce(async () => {
      marksAtSync.push(store.reloadRequiredPlugins.length);

      return [];
    });

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    expect(api.plugins.getPlugins).toHaveBeenCalledWith(null);
    expect(marksAtSync).toEqual([0]);
    expect(store.reloadRequiredPlugins).toEqual(["own"]);
  });

  it("does not read the workspace list for a plugin without domains", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin(),
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    expect(api.plugins.getPlugins).not.toHaveBeenCalled();
  });

  it("does not read the workspace list again for the echo of its own upload", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);

    runInAction(() => {
      store.reloadRequiredPlugins = ["own"];
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin("https://api.example.com"),
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    expect(api.plugins.getPlugins).not.toHaveBeenCalled();
  });

  it("lists a switched-off plugin, so the member can switch it on without a reload", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin("https://api.example.com", false),
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: false,
    });

    expect(store.plugins.find((p) => p.name === "own")?.enabled).toBe(false);
    expect(store.reloadRequiredPlugins).toEqual([]);
  });

  it("does not start a plugin that failed to start again on the echo of that start", async () => {
    const store = withLoadedPlugin(true);
    let starts = 0;

    runInAction(() => {
      store.plugins[0].initError = { kind: "init", message: "failed" } as never;
      store.plugins[0].onLoadCallback = async () => {
        starts += 1;
      };
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, pluginName: "Hello", enabled: true } as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    expect(starts).toBe(0);
  });

  it("hands the settings saved in another tab to the running plugin", async () => {
    const store = withLoadedPlugin(true);
    const setAdminPluginSettingsValue = vi.fn();

    runInAction(() => {
      store.plugins[0].scopes = [PluginScopes.Settings];
      store.plugins[0].settings = "old";
      store.plugins[0].setAdminPluginSettingsValue = setAdminPluginSettingsValue;
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, enabled: true, settings: "new" } as unknown as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    expect(setAdminPluginSettingsValue).toHaveBeenCalledWith("new");
  });

  it("moves on to the next change when a plugin never finishes starting", async () => {
    vi.useFakeTimers();

    const store = withLoadedPlugin(true);

    runInAction(() => {
      store.plugins[0].enabled = false;
      store.plugins[0].onLoadCallback = () => new Promise<void>(() => {});
    });
    vi.mocked(api.plugins.getPersonalPlugins)
      .mockResolvedValueOnce([
        { name: NAME, pluginName: "Hello", enabled: true } as TAPIPlugin,
      ])
      .mockResolvedValueOnce([
        { name: NAME, pluginName: "Hello", enabled: false } as TAPIPlugin,
      ]);

    store.handlePersonalPluginStateChange({ webPluginName: NAME, enabled: true });
    const next = store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: false,
    });

    await vi.advanceTimersByTimeAsync(PLUGIN_WAIT_MS);
    await next;

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(2);
    expect(store.plugins[0].enabled).toBe(false);
  });

  it("finishes the plugin list when a plugin never finishes loading", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    const store = new PluginStore(
      { culture: "en", addAbortControllers: vi.fn() } as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      {} as unknown as CurrentTariffStatusStore,
    );

    vi.mocked(api.plugins.getPlugins).mockResolvedValueOnce([
      ownModulePlugin(),
    ]);

    const load = store.updatePlugins(true);

    await vi.advanceTimersByTimeAsync(PLUGIN_WAIT_MS - 1);
    expect(store.isLoaded).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await load;

    expect(api.plugins.getPlugins).toHaveBeenCalledTimes(1);
    expect(store.isLoaded).toBe(true);
  });

  it("applies the changes held back by two uploads only once both end", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);
    let finishFirst: () => void = () => {};
    let finishSecond: () => void = () => {};

    vi.mocked(api.plugins.addPlugin)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = () => resolve(ownModulePlugin());
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishSecond = () =>
              resolve({
                ...ownModulePlugin(),
                name: "second",
                pluginName: "Second",
              });
          }),
      );

    const first = store.addPlugin(new FormData(), true);
    const second = store.addPlugin(new FormData(), true);

    store.handlePersonalPluginStateChange({ webPluginName: "own", enabled: true });

    finishFirst();
    await first;

    expect([...store.deferredPersonalChanges]).toEqual(["own"]);

    finishSecond();
    await second;

    expect(store.deferredPersonalChanges.size).toBe(0);

    await store.personalChanges;

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(3);
  });

  const flush = async () => {
    for (let i = 0; i < 10; i += 1) await vi.advanceTimersByTimeAsync(20);
  };

  it("takes back a plugin whose load outlived the switch that turned personal plugins off", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});

    let finishScript: () => void = () => {};

    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            finishScript = () =>
              resolve({ ok: false, status: 404, text: async () => "" });
          }),
      ),
    );

    const settingsStore = {
      culture: "en",
      pluginOptions: { personal: true },
      setPersonalPluginsEnabled(personal: boolean) {
        this.pluginOptions = { personal };
      },
    };
    const store = new PluginStore(
      settingsStore as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      {} as unknown as CurrentTariffStatusStore,
    );

    store.setIsInit(true);
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      ownModulePlugin(),
    ]);

    store.handlePersonalPluginsSwitch({ enabled: true });
    await vi.advanceTimersByTimeAsync(PLUGIN_WAIT_MS);
    await store.handlePersonalPluginsSwitch({ enabled: false });

    vi.mocked(api.plugins.getPersonalPlugins).mockRejectedValue(
      new Error("Forbidden"),
    );

    try {
      finishScript();
      await flush();
      await store.personalChanges;

      expect(store.plugins.filter((p) => p.personal)).toEqual([]);
    } finally {
      vi.mocked(api.plugins.getPersonalPlugins).mockReset();
    }
  });

  it("loads the member's other plugins while one of them still loads", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url.includes("/stuck/")
          ? new Promise(() => {})
          : Promise.resolve({ ok: false, status: 404, text: async () => "" }),
      ),
    );

    const store = withLoadedPlugin(false);
    const plugin = (name: string) =>
      ({
        ...ownModulePlugin(),
        name,
        pluginName: name,
        url: `https://portal.test/plugins/${name}/plugin.js`,
      }) as TAPIPlugin;

    store.setIsInit(true);
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      plugin("stuck"),
      plugin("quick"),
    ]);

    (
      store as unknown as {
        settingsStore: { setPersonalPluginsEnabled: () => void };
      }
    ).settingsStore.setPersonalPluginsEnabled = vi.fn();

    store.handlePersonalPluginsSwitch({ enabled: true });
    await flush();

    expect(store.plugins.map((p) => p.name)).toContain("quick");
  });

  it("starts a plugin switched back on while its first start was still running", async () => {
    vi.useFakeTimers();

    const store = withLoadedPlugin(true);
    let finishStart: () => void = () => {};
    let starts = 0;

    runInAction(() => {
      store.plugins[0].enabled = false;
      store.plugins[0].onLoadCallback = () => {
        starts += 1;

        return starts === 1
          ? new Promise<void>((resolve) => {
              finishStart = resolve;
            })
          : Promise.resolve();
      };
    });

    const on = { name: NAME, pluginName: "Hello", enabled: true } as TAPIPlugin;
    const off = { ...on, enabled: false };

    vi.mocked(api.plugins.getPersonalPlugins)
      .mockResolvedValueOnce([on])
      .mockResolvedValueOnce([off])
      .mockResolvedValueOnce([on])
      .mockResolvedValueOnce([on]);

    store.handlePersonalPluginStateChange({ webPluginName: NAME, enabled: true });
    await vi.advanceTimersByTimeAsync(PLUGIN_WAIT_MS);
    store.handlePersonalPluginStateChange({ webPluginName: NAME, enabled: false });
    await store.handlePersonalPluginStateChange({
      webPluginName: NAME,
      enabled: true,
    });

    finishStart();
    await flush();
    await store.personalChanges;

    expect(starts).toBe(2);
    expect(store.plugins[0].enabled).toBe(true);
  });

  it("takes the styles of a copy off the page when another copy of the plugin replaces it", async () => {
    const store = withLoadedPlugin(false);
    const own = {
      ...ownModulePlugin(),
      name: "styled",
      pluginName: "Styled",
      settings: "",
    } as TAPIPlugin;
    const cssUrl = "https://portal.test/plugins/styled/plugin.css";

    await store.initLoadedModulePlugin(own, {
      cssUrl,
      onLoadCallback: async () => {},
    });

    expect(document.getElementById("plugin-styles-Styled")).not.toBeNull();

    await store.initLoadedModulePlugin(
      { ...own, enabled: false },
      { cssUrl, onLoadCallback: async () => {} },
    );

    expect(document.getElementById("plugin-styles-Styled")).toBeNull();
  });

  it("has the workspace list sync the domains of a new version that adds them", async () => {
    withoutPluginScripts();

    const store = withLoadedPlugin(false);

    runInAction(() => {
      store.plugins = [
        ...store.plugins,
        {
          name: "own",
          pluginName: "Own",
          enabled: true,
          personal: true,
          scopes: [],
          url: "https://portal.test/plugins/own/plugin.js?hash=1.0.0",
        } as unknown as TPlugin,
      ];
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      {
        ...ownModulePlugin("https://api.example.com"),
        url: "https://portal.test/plugins/own/plugin.js?hash=2.0.0",
        version: "2.0.0",
      } as TAPIPlugin,
    ]);

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    expect(api.plugins.getPlugins).toHaveBeenCalledWith(null);
  });
});

describe("socket subscriptions", () => {
  it("listens to the personal plugin events of the member and of the workspace", () => {
    const store = withLoadedPlugin(false);

    expect(SocketHelper?.on).toHaveBeenCalledWith(
      SocketEvents.ChangePersonalWebPlugin,
      store.handlePersonalPluginStateChange,
    );
    expect(SocketHelper?.on).toHaveBeenCalledWith(
      SocketEvents.ChangePersonalWebPlugins,
      store.handlePersonalPluginsSwitch,
    );
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

describe("handlePersonalPluginsSwitch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const withPortalAndPersonalPlugin = () => {
    const settingsStore = {
      culture: "en",
      setPersonalPluginsEnabled: vi.fn(),
    };

    const store = new PluginStore(
      settingsStore as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      {} as unknown as CurrentTariffStatusStore,
    );

    runInAction(() => {
      store.plugins = [
        {
          name: "portal",
          pluginName: "Portal",
          enabled: true,
          personal: false,
          scopes: [],
        } as unknown as TPlugin,
        {
          name: NAME,
          pluginName: "Hello",
          enabled: true,
          personal: true,
          scopes: [],
        } as unknown as TPlugin,
      ];
      store.personalPlugins = [
        { name: NAME, enabled: true } as unknown as TAPIPlugin,
      ];
    });

    store.setIsInit(true);

    return { store, settingsStore };
  };

  it("unloads the personal plugins and keeps the portal ones when switched off", async () => {
    const { store, settingsStore } = withPortalAndPersonalPlugin();
    const personal = store.plugins.find((p) => p.personal);

    await store.handlePersonalPluginsSwitch({ enabled: false });

    expect(personal?.enabled).toBe(false);

    expect(settingsStore.setPersonalPluginsEnabled).toHaveBeenCalledWith(
      false,
    );
    expect(store.plugins.map((p) => p.name)).toEqual(["portal"]);
    expect(store.personalPlugins).toEqual([]);
  });

  it("loads the member's own plugins when switched on", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { store, settingsStore } = withPortalAndPersonalPlugin();

    runInAction(() => {
      store.plugins = store.plugins.filter((p) => !p.personal);
      store.personalPlugins = [];
    });
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      {
        name: "own",
        pluginName: "Own",
        enabled: true,
        personal: true,
        scopes: "",
        url: "https://portal.test/plugins/own/plugin.js",
        version: "1.0.0",
        runtime: "module",
      } as unknown as TAPIPlugin,
    ]);

    await store.handlePersonalPluginsSwitch({ enabled: true });

    expect(settingsStore.setPersonalPluginsEnabled).toHaveBeenCalledWith(true);
    expect(store.plugins.map((p) => p.name).sort()).toEqual(["own", "portal"]);
  });
});

describe("users' plugins for an administrator", () => {
  const usersPlugin = (name: string, userId: string, enabled = true) =>
    ({ name, enabled, createBy: { id: userId } }) as unknown as TMemberPlugin;

  const withUsersPlugins = () => {
    const settingsStore = {
      culture: "en",
      setPersonalPluginsEnabled: vi.fn(),
    };

    const store = new PluginStore(
      settingsStore as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      {} as unknown as CurrentTariffStatusStore,
    );

    runInAction(() => {
      store.usersPlugins = [
        usersPlugin(NAME, "u1"),
        usersPlugin(NAME, "u2"),
      ];
    });

    return { store, settingsStore };
  };

  it("reads the plugins of all users and marks them read", async () => {
    const { store } = withUsersPlugins();

    vi.mocked(api.plugins.getMembersPlugins).mockResolvedValueOnce([
      usersPlugin("other", "u3"),
    ]);

    await store.fetchUsersPlugins();

    expect(store.usersPlugins.map((p) => p.name)).toEqual(["other"]);
    expect(store.isUsersPluginsLoaded).toBe(true);
  });

  it("switches off the plugin of one user and leaves the same name of another", async () => {
    const { store } = withUsersPlugins();

    await store.updateUserPlugin("u1", NAME, false);

    expect(api.plugins.updateMemberPlugin).toHaveBeenCalledWith(
      "u1",
      NAME,
      false,
    );
    expect(store.usersPlugins.map((p) => p.enabled)).toEqual([false, true]);
  });

  it("drops the deleted plugin of one user from the list", async () => {
    const { store } = withUsersPlugins();

    await store.deleteUserPlugin("u2", NAME, t);

    expect(api.plugins.deleteMemberPlugin).toHaveBeenCalledWith("u2", NAME);
    expect(store.usersPlugins.map((p) => p.createBy.id)).toEqual(["u1"]);
  });

  it("shows the list the server has when a deletion is refused", async () => {
    const { store } = withUsersPlugins();

    vi.mocked(api.plugins.deleteMemberPlugin).mockRejectedValueOnce(
      new Error("Access denied"),
    );
    vi.mocked(api.plugins.getMembersPlugins).mockResolvedValueOnce([
      usersPlugin(NAME, "u1"),
      usersPlugin(NAME, "u2"),
    ]);

    await store.deleteUserPlugin("u2", NAME, t);

    expect(store.usersPlugins).toHaveLength(2);
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it("drops the row of a plugin another administrator has already deleted", async () => {
    const { store } = withUsersPlugins();

    vi.mocked(api.plugins.deleteMemberPlugin).mockRejectedValueOnce(
      new Error("Not found"),
    );
    vi.mocked(api.plugins.getMembersPlugins).mockResolvedValueOnce([
      usersPlugin(NAME, "u1"),
    ]);

    await store.deleteUserPlugin("u2", NAME, t);

    expect(store.usersPlugins.map((p) => p.createBy.id)).toEqual(["u1"]);
  });

  it("shows the state the server has when switching is refused", async () => {
    const { store } = withUsersPlugins();

    vi.mocked(api.plugins.updateMemberPlugin).mockRejectedValueOnce(
      new Error("Access denied"),
    );
    vi.mocked(api.plugins.getMembersPlugins).mockResolvedValueOnce([
      usersPlugin(NAME, "u1"),
      usersPlugin(NAME, "u2", false),
    ]);

    await store.updateUserPlugin("u1", NAME, false);

    expect(store.usersPlugins.map((p) => p.enabled)).toEqual([true, false]);
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it("does not show an empty list when reading the list fails", async () => {
    const { store } = withUsersPlugins();

    vi.mocked(api.plugins.getMembersPlugins).mockRejectedValueOnce(
      new Error("Server error"),
    );

    await store.fetchUsersPlugins();

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(store.isUsersPluginsLoaded).toBe(true);
    expect(store.isUsersPluginsFailed).toBe(true);
    expect(store.usersPlugins).toHaveLength(2);
  });

  it("applies a change to the administrator's own plugin in the session at once", async () => {
    const settingsStore = { culture: "en", setPersonalPluginsEnabled: vi.fn() };
    const store = new PluginStore(
      settingsStore as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: { id: "me" } } as unknown as UserStore,
      {} as unknown as CurrentTariffStatusStore,
    );

    runInAction(() => {
      store.plugins = [
        {
          name: NAME,
          pluginName: "Hello",
          enabled: true,
          personal: true,
          scopes: [],
        } as unknown as TPlugin,
      ];
      store.usersPlugins = [usersPlugin(NAME, "me")];
    });
    store.setIsInit(true);

    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([
      { name: NAME, pluginName: "Hello", enabled: false } as TAPIPlugin,
    ]);

    await store.updateUserPlugin("me", NAME, false);
    await store.personalChanges;

    expect(store.plugins[0].enabled).toBe(false);
  });

  it("leaves the session alone when the plugin of another user changes", async () => {
    const { store } = withUsersPlugins();

    store.setIsInit(true);

    await store.updateUserPlugin("u1", NAME, false);
    await store.personalChanges;

    expect(api.plugins.getPersonalPlugins).not.toHaveBeenCalled();
  });

  it("switches personal plugins for the workspace and shows the new state at once", async () => {
    const { store, settingsStore } = withUsersPlugins();

    await store.switchPersonalPlugins(false);

    expect(api.plugins.setPersonalPluginsEnabled).toHaveBeenCalledWith(false);
    expect(settingsStore.setPersonalPluginsEnabled).toHaveBeenCalledWith(
      false,
    );
  });

  it("keeps the state shown when the switch is refused", async () => {
    const { store, settingsStore } = withUsersPlugins();

    vi.mocked(api.plugins.setPersonalPluginsEnabled).mockRejectedValueOnce(
      new Error("Access denied"),
    );

    await store.switchPersonalPlugins(false);

    expect(settingsStore.setPersonalPluginsEnabled).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
  });
});

describe("personal changes and the plugin list", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const ownPlugin = {
    name: "own",
    pluginName: "Own",
    enabled: true,
    personal: true,
    scopes: "",
    url: "https://portal.test/plugins/own/plugin.js",
    version: "1.0.0",
    runtime: "module",
  } as unknown as TAPIPlugin;

  const newStore = () => {
    const settingsStore = {
      culture: "en",
      addAbortControllers: vi.fn(),
      setPersonalPluginsEnabled: vi.fn(),
    };

    const store = new PluginStore(
      settingsStore as unknown as SettingsStore,
      {} as unknown as SelectedFolderStore,
      { user: null } as unknown as UserStore,
      { isNotPaidPeriod: false } as unknown as CurrentTariffStatusStore,
    );

    return { store, settingsStore };
  };

  const withoutPluginScripts = () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
  };

  it("ignores personal events until the plugins are initialized", async () => {
    const { store, settingsStore } = newStore();

    await store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });
    await store.handlePersonalPluginsSwitch({ enabled: true });

    expect(settingsStore.setPersonalPluginsEnabled).toHaveBeenCalledWith(true);
    expect(api.plugins.getPersonalPlugins).not.toHaveBeenCalled();
    expect(store.plugins).toEqual([]);
  });

  it("applies a personal event that arrives while the plugin list loads after the list", async () => {
    withoutPluginScripts();

    const { store } = newStore();
    let finishRead: (plugins: TAPIPlugin[]) => void = () => {};

    vi.mocked(api.plugins.getPlugins).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        }),
    );
    vi.mocked(api.plugins.getPersonalPlugins).mockResolvedValueOnce([ownPlugin]);

    store.setIsInit(true);

    const load = store.updatePlugins(true);
    const change = store.handlePersonalPluginStateChange({
      webPluginName: "own",
      enabled: true,
    });

    await vi.waitFor(() => expect(api.plugins.getPlugins).toHaveBeenCalled());
    expect(api.plugins.getPersonalPlugins).not.toHaveBeenCalled();

    finishRead([]);
    await load;
    await change;

    expect(api.plugins.getPersonalPlugins).toHaveBeenCalledTimes(1);
    expect(store.plugins.map((p) => p.name)).toEqual(["own"]);
  });

  it("marks the workspace list empty when only personal plugins come back", async () => {
    withoutPluginScripts();

    const { store } = newStore();

    vi.mocked(api.plugins.getPlugins).mockResolvedValueOnce([ownPlugin]);

    await store.updatePlugins(true);

    expect(store.isEmptyList).toBe(true);
  });

  it("marks the workspace list empty when its last plugin is deleted while a personal one stays", async () => {
    const store = withLoadedPlugin(false);

    runInAction(() => {
      store.plugins = [
        ...store.plugins,
        {
          name: "own",
          pluginName: "Own",
          enabled: true,
          personal: true,
          scopes: [],
        } as unknown as TPlugin,
      ];
    });

    await store.uninstallPlugin(NAME, t, false);

    expect(store.plugins.map((p) => p.name)).toEqual(["own"]);
    expect(store.isEmptyList).toBe(true);
  });

  it("keeps the workspace list empty after a personal upload", async () => {
    withoutPluginScripts();

    const { store } = newStore();

    store.setIsEmptyList(true);
    vi.mocked(api.plugins.addPlugin).mockResolvedValueOnce(ownPlugin);

    await store.addPlugin(new FormData(), true);

    expect(store.isEmptyList).toBe(true);
  });
});
