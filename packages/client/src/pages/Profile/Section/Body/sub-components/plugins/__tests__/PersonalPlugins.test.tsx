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

import { act, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, describe, expect, it, vi } from "vitest";

const upload = vi.hoisted(() => ({
  addPlugin: (async () => undefined) as (data: FormData) => Promise<unknown>,
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/Dropzone",
  () => ({ default: () => null }),
);

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/PluginCacheWarningDialog",
  () => ({ default: () => null }),
);

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/ListLoader",
  () => ({ default: () => <div data-testid="list-loader" /> }),
);

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/PluginItem",
  () => ({
    default: ({
      dataTestId,
      name,
      enabled,
      isNotLoaded,
      updatePlugin,
    }: {
      dataTestId?: string;
      name: string;
      enabled: boolean;
      isNotLoaded?: boolean;
      updatePlugin?: (name: string, status: boolean) => Promise<unknown>;
    }) => (
      <div
        data-testid={dataTestId}
        data-not-loaded={String(!!isNotLoaded)}
      >
        {updatePlugin ? (
          <button
            type="button"
            data-testid={`${dataTestId}_switch`}
            onClick={() => updatePlugin(name, !enabled)}
          />
        ) : null}
      </div>
    ),
  }),
);

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/hooks/usePluginUpload",
  () => ({
    default: ({
      addPlugin,
    }: {
      addPlugin: (data: FormData) => Promise<unknown>;
    }) => {
      upload.addPlugin = addPlugin;

      return {
        onDrop: vi.fn(),
        showCacheWarning: false,
        handleCloseCacheWarning: vi.fn(),
      };
    },
  }),
);

const PersonalPlugins = (await import("../index")).default;

const ownPlugin = (name: string) => ({
  name,
  pluginName: name.toUpperCase(),
  version: "1.0.0",
  enabled: true,
  description: "",
  url: `https://portal.test/plugins/${name}/plugin.js`,
});

const loadedPlugin = (name: string, personal: boolean) => ({
  ...ownPlugin(name),
  nameLocale: name,
  personal,
});

type TTabState = {
  isAdmin?: boolean;
  isUploadAllowed?: boolean;
  addPlugin?: (data: FormData, personal: boolean) => Promise<unknown>;
  updatePlugin?: (name: string, status: boolean) => Promise<unknown>;
  fetchPersonalPlugins?: () => Promise<unknown>;
  isPersonalLoaded?: boolean;
  personalPlugins?: ReturnType<typeof ownPlugin>[];
  pluginList?: ReturnType<typeof loadedPlugin>[];
  reloadRequiredPlugins?: string[];
};

const renderTab = ({
  isAdmin = false,
  isUploadAllowed = true,
  addPlugin = vi.fn(async () => undefined),
  updatePlugin = vi.fn(async () => undefined),
  fetchPersonalPlugins = vi.fn(async () => true),
  isPersonalLoaded = true,
  personalPlugins = [],
  pluginList = [],
  reloadRequiredPlugins = [],
}: TTabState = {}) =>
  render(
    <Provider
      pluginStore={{
        personalPlugins,
        pluginList,
        reloadRequiredPlugins,
        fetchPersonalPlugins,
        addPlugin,
        updatePlugin,
        setSettingsPluginDialogVisible: vi.fn(),
        setCurrentSettingsDialogPlugin: vi.fn(),
        setDeletePluginDialogVisible: vi.fn(),
        setDeletePluginDialogProps: vi.fn(),
        checkPluginCompatibility: () => true,
        isLoaded: true,
        isPersonalLoaded,
      }}
      userStore={{ user: { isAdmin, isOwner: false } }}
      settingsStore={{
        pluginOptions: { upload: isUploadAllowed },
        theme: {},
        culture: "en",
      }}
    >
      <PersonalPlugins />
    </Provider>,
  );

describe("Personal plugins tab", () => {
  it("shows the skeleton until the member's plugins are first read", () => {
    renderTab({
      isPersonalLoaded: false,
      personalPlugins: [ownPlugin("own")],
      pluginList: [loadedPlugin("own", true)],
    });

    expect(screen.getByTestId("list-loader")).toBeInTheDocument();
    expect(screen.queryByTestId("personal_plugin_own")).toBeNull();
    expect(
      screen.queryByText("WebPlugins:PersonalPluginsDescription"),
    ).toBeNull();
  });

  it("shows the list it has at once when opened again and reads it in the background", () => {
    const fetchPersonalPlugins = vi.fn(() => new Promise(() => {}));

    renderTab({
      fetchPersonalPlugins,
      personalPlugins: [ownPlugin("own")],
      pluginList: [loadedPlugin("own", true)],
    });

    expect(fetchPersonalPlugins).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("list-loader")).toBeNull();
    expect(screen.getByTestId("personal_plugin_own")).toBeInTheDocument();
  });

  it("marks a plugin that this page has not loaded", async () => {
    renderTab({ personalPlugins: [ownPlugin("other")] });

    expect(await screen.findByTestId("personal_plugin_other")).toHaveAttribute(
      "data-not-loaded",
      "true",
    );
  });

  it("marks a loaded plugin whose domains need a reload", async () => {
    renderTab({
      personalPlugins: [ownPlugin("own"), ownPlugin("plain")],
      pluginList: [loadedPlugin("own", true), loadedPlugin("plain", true)],
      reloadRequiredPlugins: ["own"],
    });

    expect(await screen.findByTestId("personal_plugin_own")).toHaveAttribute(
      "data-not-loaded",
      "true",
    );
    expect(screen.getByTestId("personal_plugin_plain")).toHaveAttribute(
      "data-not-loaded",
      "false",
    );
  });

  it("does not mark a plugin that a portal plugin shadows", async () => {
    renderTab({
      personalPlugins: [ownPlugin("shared")],
      pluginList: [loadedPlugin("shared", false)],
    });

    expect(await screen.findByTestId("personal_plugin_shared")).toHaveAttribute(
      "data-not-loaded",
      "false",
    );
  });

  it("points an administrator to the plugins of the whole workspace", async () => {
    renderTab({ isAdmin: true });

    expect(
      await screen.findByText("PersonalPluginsAdminDescription"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("WebPlugins:PersonalPluginsDescription"),
    ).toBeNull();
  });

  it("gives a member who is not an administrator no link", async () => {
    renderTab();

    expect(
      await screen.findByText("WebPlugins:PersonalPluginsDescription"),
    ).toBeInTheDocument();
    expect(screen.queryByText("PersonalPluginsAdminDescription")).toBeNull();
  });
});

describe("Personal plugins tab, reading the list", () => {
  it("leaves reading the list to the profile while uploads are off", () => {
    const fetchPersonalPlugins = vi.fn(async () => true);

    renderTab({ isUploadAllowed: false, fetchPersonalPlugins });

    expect(fetchPersonalPlugins).not.toHaveBeenCalled();
  });
});

describe("Personal plugins tab, page reload for new domains", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubReload = () => {
    const reload = vi.fn();

    vi.stubGlobal("location", { ...window.location, reload });

    return reload;
  };

  it("reloads the page once the member leaves the tab after an upload that needs it", async () => {
    const reload = stubReload();
    const { unmount } = renderTab({
      addPlugin: vi.fn(async () => ({ needsReload: true })),
      reloadRequiredPlugins: ["own"],
    });

    await act(() => upload.addPlugin(new FormData()));

    expect(reload).not.toHaveBeenCalled();

    unmount();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads at once when such an upload ends after the member left the tab", async () => {
    const reload = stubReload();
    let finish: (result: unknown) => void = () => {};
    const { unmount } = renderTab({
      addPlugin: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    });

    const adding = upload.addPlugin(new FormData());

    unmount();

    expect(reload).not.toHaveBeenCalled();

    finish({ needsReload: true });
    await adding;

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload for an upload that needs no reload", async () => {
    const reload = stubReload();
    const { unmount } = renderTab({
      addPlugin: vi.fn(async () => ({ needsReload: false })),
      reloadRequiredPlugins: ["other"],
    });

    await act(() => upload.addPlugin(new FormData()));

    unmount();

    expect(reload).not.toHaveBeenCalled();
  });
});

describe("Personal plugins tab, switching a plugin on", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubReload = () => {
    const reload = vi.fn();

    vi.stubGlobal("location", { ...window.location, reload });

    return reload;
  };

  const ownOff = { ...ownPlugin("own"), enabled: false };
  const loadedOff = { ...loadedPlugin("own", true), enabled: false };

  it("reloads the page once the member leaves after switching on a plugin with domains", async () => {
    const reload = stubReload();
    const { unmount } = renderTab({
      personalPlugins: [ownOff],
      pluginList: [loadedOff],
      reloadRequiredPlugins: ["own"],
    });

    await act(async () => {
      screen.getByTestId("personal_plugin_own_switch").click();
    });

    expect(reload).not.toHaveBeenCalled();

    unmount();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload after switching a plugin off", async () => {
    const reload = stubReload();
    const { unmount } = renderTab({
      personalPlugins: [ownPlugin("own")],
      pluginList: [loadedPlugin("own", true)],
      reloadRequiredPlugins: ["own"],
    });

    await act(async () => {
      screen.getByTestId("personal_plugin_own_switch").click();
    });

    unmount();

    expect(reload).not.toHaveBeenCalled();
  });
});
