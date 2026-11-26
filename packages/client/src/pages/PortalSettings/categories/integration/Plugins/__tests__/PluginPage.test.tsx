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

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ search: "" }));

vi.mock("react-router", () => ({
  useSearchParams: () => [new URLSearchParams(router.search), vi.fn()],
}));

vi.mock("@onlyoffice/apps-ui-kit/components/tabs", () => ({
  Tabs: ({
    items,
    selectedItemId,
    onSelect,
  }: {
    items: { id: string; content: React.ReactNode; onClick?: () => void }[];
    selectedItemId: string;
    onSelect: (item: { id: string }) => void;
  }) => (
    <div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          data-testid={`${item.id}_tab`}
          onClick={() => {
            item.onClick?.();
            onSelect(item);
          }}
        />
      ))}
      {items.find((item) => item.id === selectedItemId)?.content}
    </div>
  ),
}));

vi.mock("../sub-components/PluginItem", () => ({
  default: ({ dataTestId }: { dataTestId?: string }) => (
    <div data-testid={dataTestId} />
  ),
}));
vi.mock("../sub-components/EmptyScreen", () => ({
  default: () => <div data-testid="empty-screen" />,
}));
vi.mock("../sub-components/ListLoader", () => ({
  default: () => <div data-testid="list-loader" />,
}));
vi.mock("../sub-components/Dropzone", () => ({ default: () => null }));
vi.mock("../sub-components/UploadDescription", () => ({ default: () => null }));
vi.mock("../sub-components/PluginCacheWarningDialog", () => ({
  default: () => null,
}));
vi.mock("../sub-components/UsersPlugins", () => ({
  default: () => <div data-testid="users-plugins" />,
}));
vi.mock("../hooks/usePluginUpload", () => ({
  default: () => ({
    onDrop: vi.fn(),
    showCacheWarning: false,
    handleCloseCacheWarning: vi.fn(),
  }),
}));

const PluginPage = (await import("../index"))
  .default as unknown as React.ComponentType;

const portalPlugin = { name: "portal", version: "1.0.0", personal: false };
const ownPlugin = { name: "own", version: "1.0.0", personal: true };

const renderPage = (
  pluginStore: Record<string, unknown>,
  personalAvailable = true,
) =>
  render(
    <Provider
      settingsStore={{
        pluginOptions: { upload: true, personalAvailable },
        currentColorScheme: {},
        theme: {},
        pluginsSdkUrl: "",
      }}
      clientLoadingStore={{ showPortalSettingsLoader: false }}
      pluginStore={{
        portalPluginList: [],
        pluginList: [],
        isEmptyList: false,
        updatePlugin: vi.fn(),
        updatePlugins: vi.fn(),
        addPlugin: vi.fn(),
        setCurrentSettingsDialogPlugin: vi.fn(),
        setSettingsPluginDialogVisible: vi.fn(),
        fetchUsersPlugins: vi.fn(async () => {}),
        ...pluginStore,
      }}
    >
      <PluginPage />
    </Provider>,
  );

describe("Plugins page", () => {
  afterEach(() => {
    router.search = "";
    window.history.replaceState(null, "", "/");
  });

  it("lists only the workspace plugins, not the administrator's own", () => {
    renderPage({
      portalPluginList: [portalPlugin],
      pluginList: [portalPlugin, ownPlugin],
    });

    expect(screen.getByTestId("plugin_portal")).toBeInTheDocument();
    expect(screen.queryByTestId("plugin_own")).toBeNull();
  });

  it("shows the empty workspace list, not a skeleton, while its list is empty", () => {
    renderPage({ portalPluginList: [], isEmptyList: true });

    expect(screen.getByTestId("empty-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("list-loader")).toBeNull();
  });

  it("opens the Users' plugins tab the address names", () => {
    router.search = "tab=users";

    renderPage({ portalPluginList: [portalPlugin] });

    expect(screen.getByTestId("users-plugins")).toBeInTheDocument();
  });

  it("reads the users' plugins before it shows their tab", () => {
    const fetchUsersPlugins = vi.fn(async () => {});

    renderPage({ portalPluginList: [portalPlugin], fetchUsersPlugins });

    fireEvent.click(screen.getByTestId("users_tab"));

    expect(fetchUsersPlugins).toHaveBeenCalledTimes(1);
  });

  it("puts the chosen tab into the address without a router navigation", () => {
    window.history.replaceState({ idx: 3 }, "", "/plugins?from=menu");
    renderPage({ portalPluginList: [portalPlugin] });

    fireEvent.click(screen.getByTestId("users_tab"));

    expect(window.location.search).toBe("?from=menu&tab=users");
    expect(window.history.state).toEqual({ idx: 3 });
    expect(screen.getByTestId("users-plugins")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("portal_tab"));

    expect(window.location.search).toBe("?from=menu");
  });
});
