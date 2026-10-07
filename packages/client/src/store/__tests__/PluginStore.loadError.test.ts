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
import { autorun, runInAction } from "mobx";

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
import type { TPlugin, TPluginError } from "../../helpers/plugins/types";
import type { TTranslation } from "@docspace/shared/types";

import api from "@docspace/shared/api";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import { PluginScopes } from "../../helpers/plugins/enums";

const PLUGIN = "article-navigation-sample";
const PLUGIN_URL = "https://portal.test/plugins/sample/plugin.js";
const SHIM_ERROR =
  'The bundle imports "@onlyoffice/apps-ui-kit", which the portal does not provide.';

const thrown = (message: string): TPluginError => ({ kind: "thrown", message });
const HTTP_404: TPluginError = { kind: "http", status: 404, url: PLUGIN_URL };
const SCRIPT_FAILED: TPluginError = { kind: "script", url: PLUGIN_URL };
const UNREGISTERED: TPluginError = { kind: "unregistered", pluginName: PLUGIN };

const apiPlugin = (overrides: Partial<TAPIPlugin> = {}): TAPIPlugin =>
  ({
    name: PLUGIN,
    pluginName: PLUGIN,
    enabled: true,
    settings: "",
    scopes: "Settings,ArticleNavigation",
    url: PLUGIN_URL,
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
      loadError: thrown(SHIM_ERROR),
      scopes: [PluginScopes.Settings, PluginScopes.ArticleNavigation],
    });
    expect(store.isEmptyList).toBe(false);
  });

  it("keeps a plugin whose bundle is missing on the server in the list", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(apiPlugin());

    expect(store.plugins[0].loadError).toEqual(HTTP_404);
  });

  it("shows a broken plugin under its localized name", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(
      apiPlugin({
        nameLocale: { en: "Sample plugin" },
        descriptionLocale: { en: "Loads nothing" },
      }),
    );

    expect(store.plugins[0]).toMatchObject({
      nameLocale: "Sample plugin",
      descriptionLocale: "Loads nothing",
    });
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
    expect(store.plugins[0].loadError).toEqual(HTTP_404);
    expect(store.articleNavigationItems.size).toBe(0);
  });

  it("does not publish a broken plugin that carries the settings scope", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();

    await store.initModulePlugin(
      apiPlugin({ enabled: false, scopes: "Settings,ArticleNavigation" }),
    );
    await store.activatePlugin(PLUGIN);

    expect(store.plugins[0].loadError).toEqual(HTTP_404);
    expect(store.plugins[0].status).toBeUndefined();
    expect(store.articleNavigationItems.size).toBe(0);
  });

  it("reports the load error to the uploader instead of a success", async () => {
    vi.stubGlobal("fetch", fetchNotFound());
    vi.mocked(api.plugins.addPlugin).mockResolvedValue(apiPlugin());

    const store = createStore();

    const result = await store.addPlugin(new FormData());

    expect(result?.loadError).toEqual(HTTP_404);
    expect(store.plugins[0].loadError).toEqual(HTTP_404);
  });

  it("keeps a plugin whose initialization fails in the list as a working one", async () => {
    const store = createStore();
    const exported = {
      onLoadCallback: async () => {
        throw new Error("settings request timed out");
      },
    };

    await expect(
      store.initLoadedModulePlugin(apiPlugin(), exported),
    ).rejects.toThrow("settings request timed out");

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0]).toMatchObject({
      name: PLUGIN,
      nameLocale: PLUGIN,
      enabled: true,
    });
    expect(store.plugins[0].loadError).toBeUndefined();
    expect(store.plugins[0].initError).toEqual(
      thrown("settings request timed out"),
    );
  });

  it("clears the initialization mark once the retry succeeds", async () => {
    const store = createStore();
    let attempt = 0;
    const exported = {
      onLoadCallback: async () => {
        attempt += 1;
        if (attempt === 1) throw new Error("settings request timed out");
      },
    };

    await expect(
      store.initLoadedModulePlugin(apiPlugin(), exported),
    ).rejects.toThrow("settings request timed out");

    await store.activatePlugin(PLUGIN);

    expect(attempt).toBe(2);
    expect(store.plugins[0].initError).toBeUndefined();
  });

  it("keeps the mark when the retry hits the same broken setLanguage", async () => {
    const store = createStore();
    const exported = {
      setLanguage: () => {
        throw new Error("locale bundle missing");
      },
    };

    await expect(
      store.initLoadedModulePlugin(apiPlugin(), exported),
    ).rejects.toThrow("locale bundle missing");

    await store.deactivatePlugin(PLUGIN);
    await store.activatePlugin(PLUGIN);

    expect(store.plugins[0].initError).toEqual(thrown("locale bundle missing"));
  });

  it("keeps the mark fresh when the retry fails with a new reason", async () => {
    const store = createStore();
    let attempt = 0;
    const exported = {
      onLoadCallback: async () => {
        attempt += 1;
        throw new Error(
          attempt === 1 ? "settings request timed out" : "portal unreachable",
        );
      },
    };

    await expect(
      store.initLoadedModulePlugin(apiPlugin(), exported),
    ).rejects.toThrow("settings request timed out");

    await store.activatePlugin(PLUGIN);

    expect(store.plugins[0].initError).toEqual(thrown("portal unreachable"));
  });

  it("shows and clears the mark on a plugin exported as a class instance", async () => {
    const store = createStore();
    let attempt = 0;

    class SamplePlugin {
      onLoadCallback = async () => {
        attempt += 1;
        if (attempt === 1) throw new Error("settings request timed out");
      };
    }

    let rendered: TPluginError | undefined;
    const dispose = autorun(() => {
      rendered = store.pluginList[0]?.initError;
    });

    await expect(
      store.initLoadedModulePlugin(apiPlugin(), new SamplePlugin()),
    ).rejects.toThrow("settings request timed out");

    expect(rendered).toEqual(thrown("settings request timed out"));

    await store.activatePlugin(PLUGIN);

    expect(rendered).toBeUndefined();

    dispose();
  });

  it("takes back the items of the version it replaces", async () => {
    vi.stubGlobal("fetch", fetchNotFound());

    const store = createStore();
    const itemKey = "sample-item";

    await store.initLoadedModulePlugin(apiPlugin({ scopes: "ContextMenu" }), {
      getContextMenuItems: () =>
        new Map([[itemKey, { key: itemKey, label: "Sample" }]]),
    } as Partial<TPlugin>);

    expect(store.contextMenuItems.has(itemKey)).toBe(true);

    await store.initModulePlugin(apiPlugin({ version: "1.0.1" }));

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].loadError).toEqual(HTTP_404);
    expect(store.contextMenuItems.has(itemKey)).toBe(false);
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

type FakeScript = {
  onload?: () => void;
  onerror?: () => void;
  setAttribute: () => void;
};

type FakeFrame = {
  script: FakeScript;
  errorListeners: Array<(event: ErrorEvent) => void>;
  frame: HTMLIFrameElement;
};

const legacyPlugin = () => apiPlugin({ runtime: undefined });

const fakeFrame = (
  plugins: Record<string, unknown>,
  onAppend: (frame: FakeFrame) => void,
): FakeFrame => {
  const script: FakeScript = { setAttribute: () => {} };
  const errorListeners: Array<(event: ErrorEvent) => void> = [];

  const fake: FakeFrame = {
    script,
    errorListeners,
    frame: {
      contentWindow: {
        Plugins: plugins,
        addEventListener: (_: string, listener: (event: ErrorEvent) => void) =>
          errorListeners.push(listener),
        removeEventListener: () => {},
      },
      contentDocument: {
        createElement: () => script,
        body: { appendChild: () => onAppend(fake) },
      },
    } as unknown as HTMLIFrameElement,
  };

  return fake;
};

const withFrame = (fake: FakeFrame) => {
  const store = createStore();

  runInAction(() => {
    store.pluginFrame = fake.frame;
  });

  fake.frame = store.pluginFrame as HTMLIFrameElement;

  return store;
};

describe("PluginStore legacy plugin load failure", () => {
  it("keeps a plugin whose script fails to load in the list", async () => {
    const store = withFrame(fakeFrame({}, ({ script }) => script.onerror?.()));

    await store.initPlugin(legacyPlugin());

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0].loadError).toEqual(SCRIPT_FAILED);
  });

  it("marks a script that ran but never registered itself as broken", async () => {
    const store = withFrame(fakeFrame({}, ({ script }) => script.onload?.()));

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(UNREGISTERED);
    expect(store.plugins[0].enabled).toBe(true);
  });

  it("reports the exception the script threw before registering", async () => {
    const store = withFrame(
      fakeFrame({}, ({ script, errorListeners }) => {
        errorListeners.forEach((listener) =>
          listener({
            filename: legacyPlugin().url,
            error: new Error("setAdminPluginSettings exploded"),
            message: "Uncaught Error: setAdminPluginSettings exploded",
          } as ErrorEvent),
        );
        script.onload?.();
      }),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(
      thrown("setAdminPluginSettings exploded"),
    );
  });

  it("keeps a plugin broken when its script threw an error without a message", async () => {
    const store = withFrame(
      fakeFrame({}, ({ script, errorListeners }) => {
        errorListeners.forEach((listener) =>
          listener({
            filename: legacyPlugin().url,
            error: new Error(),
            message: "Uncaught Error",
          } as ErrorEvent),
        );
        script.onload?.();
      }),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(thrown(""));
    expect(store.plugins[0].status).toBeUndefined();
  });

  it("ignores errors thrown by other scripts in the shared frame", async () => {
    const store = withFrame(
      fakeFrame({}, ({ script, errorListeners }) => {
        errorListeners.forEach((listener) =>
          listener({
            filename: "https://portal.test/plugins/other/plugin.js",
            error: new Error("someone else"),
            message: "Uncaught Error: someone else",
          } as ErrorEvent),
        );
        script.onload?.();
      }),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(UNREGISTERED);
  });

  it("ignores an opaque error a cross-origin script reports without a filename", async () => {
    const store = withFrame(
      fakeFrame({}, ({ script, errorListeners }) => {
        errorListeners.forEach((listener) =>
          listener({
            filename: "",
            error: null,
            message: "Script error.",
          } as unknown as ErrorEvent),
        );
        script.onload?.();
      }),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(UNREGISTERED);
  });

  it("does not trust a registration left behind by the previous version", async () => {
    const stale = { status: "active", getContextMenuItems: () => new Map() };
    const store = withFrame(
      fakeFrame({ [PLUGIN]: stale }, ({ script }) => script.onload?.()),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toEqual(UNREGISTERED);
  });

  it("loads a script that registers itself as before", async () => {
    const registered = {
      status: "active",
      getContextMenuItems: () => new Map(),
    };
    const store = withFrame(
      fakeFrame({}, ({ script, frame }) => {
        (
          frame.contentWindow as unknown as { Plugins: Record<string, unknown> }
        ).Plugins[PLUGIN] = registered;
        script.onload?.();
      }),
    );

    await store.initPlugin(legacyPlugin());

    expect(store.plugins[0].loadError).toBeUndefined();
  });

  it("keeps a plugin whose initialization fails in the list as a working one", async () => {
    const registered = {
      status: "active",
      setLanguage: () => {
        throw new Error("locale bundle missing");
      },
    };
    const store = withFrame(
      fakeFrame({}, ({ script, frame }) => {
        (
          frame.contentWindow as unknown as { Plugins: Record<string, unknown> }
        ).Plugins[PLUGIN] = registered;
        script.onload?.();
      }),
    );

    await expect(store.initPlugin(legacyPlugin())).rejects.toThrow(
      "locale bundle missing",
    );

    expect(store.plugins).toHaveLength(1);
    expect(store.plugins[0]).toMatchObject({
      name: PLUGIN,
      nameLocale: PLUGIN,
      enabled: true,
      scopes: [PluginScopes.Settings, PluginScopes.ArticleNavigation],
    });
    expect(store.plugins[0].loadError).toBeUndefined();
    expect(store.plugins[0].initError).toEqual(thrown("locale bundle missing"));
    expect(store.isEmptyList).toBe(false);
  });

  it("reports an initialization failure without losing the upload result", async () => {
    const registered = {
      status: "active",
      setLanguage: () => {
        throw new Error("locale bundle missing");
      },
    };
    const store = withFrame(
      fakeFrame({}, ({ script, frame }) => {
        (
          frame.contentWindow as unknown as { Plugins: Record<string, unknown> }
        ).Plugins[PLUGIN] = registered;
        script.onload?.();
      }),
    );

    vi.mocked(api.plugins.addPlugin).mockResolvedValue(legacyPlugin());

    const result = await store.addPlugin(new FormData());

    expect(result).toMatchObject({
      isPluginCompatible: false,
      isPluginInCache: false,
      loadError: undefined,
      initError: thrown("locale bundle missing"),
    });
  });
});
