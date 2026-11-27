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

import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

vi.mock("SRC_DIR/helpers/utils", () => ({ setDocumentTitle: vi.fn() }));

vi.mock("../hooks/usePluginUpload", () => ({
  default: () => ({
    onDrop: vi.fn(),
    showCacheWarning: false,
    handleCloseCacheWarning: vi.fn(),
  }),
}));

vi.mock("../sub-components/ListLoader", () => ({
  default: () => <div data-testid="list-loader" />,
}));

vi.mock("../sub-components/PluginItem", () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid={`plugin_${name}`} />
  ),
}));

vi.mock("../sub-components/Dropzone", () => ({ default: () => null }));
vi.mock("../sub-components/UploadDescription", () => ({
  default: () => null,
}));
vi.mock("../sub-components/PluginCacheWarningDialog", () => ({
  default: () => null,
}));
vi.mock("../sub-components/EmptyScreen", () => ({ default: () => null }));

import PluginPageConnected from "../index";

const PluginPage = PluginPageConnected as unknown as React.ComponentType;

const renderPage = (isLoaded: boolean, names: string[]) =>
  render(
    <Provider
      settingsStore={{
        pluginOptions: { upload: true },
        currentColorScheme: {},
        theme: {},
        pluginsSdkUrl: "",
      }}
      pluginStore={{
        pluginList: names.map((name) => ({ name, version: "1.0.0" })),
        updatePlugin: vi.fn(),
        updatePlugins: vi.fn(),
        setCurrentSettingsDialogPlugin: vi.fn(),
        setSettingsPluginDialogVisible: vi.fn(),
        addPlugin: vi.fn(),
        isEmptyList: false,
        isLoaded,
      }}
      clientLoadingStore={{ showPortalSettingsLoader: false }}
    >
      <PluginPage />
    </Provider>,
  );

describe("Plugins settings page", () => {
  it("keeps the loader while plugins are still loading, even with some already in the list", () => {
    renderPage(false, ["alpha", "beta"]);

    expect(screen.getByTestId("list-loader")).toBeInTheDocument();
    expect(screen.queryByTestId("plugin_alpha")).not.toBeInTheDocument();
  });

  it("shows the whole list once every plugin has loaded", () => {
    renderPage(true, ["alpha", "beta", "gamma"]);

    expect(screen.queryByTestId("list-loader")).not.toBeInTheDocument();
    expect(screen.getByTestId("plugin_alpha")).toBeInTheDocument();
    expect(screen.getByTestId("plugin_beta")).toBeInTheDocument();
    expect(screen.getByTestId("plugin_gamma")).toBeInTheDocument();
  });
});
