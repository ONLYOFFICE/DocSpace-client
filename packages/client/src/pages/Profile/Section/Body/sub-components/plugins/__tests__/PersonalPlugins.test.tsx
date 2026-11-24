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
import { describe, expect, it, vi } from "vitest";

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
      isNotLoaded,
    }: {
      dataTestId?: string;
      isNotLoaded?: boolean;
    }) => (
      <div
        data-testid={dataTestId}
        data-not-loaded={String(!!isNotLoaded)}
      />
    ),
  }),
);

vi.mock(
  "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/hooks/usePluginUpload",
  () => ({
    default: () => ({
      onDrop: vi.fn(),
      showCacheWarning: false,
      handleCloseCacheWarning: vi.fn(),
    }),
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
  fetchPersonalPlugins?: () => Promise<void>;
  personalPlugins?: ReturnType<typeof ownPlugin>[];
  pluginList?: ReturnType<typeof loadedPlugin>[];
};

const renderTab = ({
  isAdmin = false,
  fetchPersonalPlugins = vi.fn(async () => {}),
  personalPlugins = [],
  pluginList = [],
}: TTabState = {}) =>
  render(
    <Provider
      pluginStore={{
        personalPlugins,
        pluginList,
        fetchPersonalPlugins,
        addPlugin: vi.fn(),
        updatePlugin: vi.fn(),
        setSettingsPluginDialogVisible: vi.fn(),
        setCurrentSettingsDialogPlugin: vi.fn(),
        setDeletePluginDialogVisible: vi.fn(),
        setDeletePluginDialogProps: vi.fn(),
        checkPluginCompatibility: () => true,
        isLoaded: true,
      }}
      userStore={{ user: { isAdmin, isOwner: false } }}
      settingsStore={{
        pluginOptions: { upload: true },
        theme: {},
        culture: "en",
      }}
    >
      <PersonalPlugins />
    </Provider>,
  );

describe("Personal plugins tab", () => {
  it("shows the skeleton until the member's plugins are read", async () => {
    let finishRead = () => {};
    const fetchPersonalPlugins = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRead = resolve;
        }),
    );

    renderTab({
      fetchPersonalPlugins,
      personalPlugins: [ownPlugin("own")],
      pluginList: [loadedPlugin("own", true)],
    });

    expect(screen.getByTestId("list-loader")).toBeInTheDocument();
    expect(screen.queryByTestId("personal_plugin_own")).toBeNull();
    expect(
      screen.queryByText("WebPlugins:PersonalPluginsDescription"),
    ).toBeNull();

    await act(async () => finishRead());

    expect(screen.queryByTestId("list-loader")).toBeNull();
    expect(screen.getByTestId("personal_plugin_own")).toBeInTheDocument();
    expect(
      screen.getByText("WebPlugins:PersonalPluginsDescription"),
    ).toBeInTheDocument();
  });

  it("marks a plugin that this page has not loaded", async () => {
    renderTab({ personalPlugins: [ownPlugin("other")] });

    expect(await screen.findByTestId("personal_plugin_other")).toHaveAttribute(
      "data-not-loaded",
      "true",
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
