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
import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Part = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    ModalDialog: Object.assign(Part, {
      Header: Part,
      Body: Part,
      Footer: Part,
    }),
    ModalDialogType: { aside: "aside" },
  };
});

vi.mock("../sub-components/Header", () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid="dialog-header">{name}</div>
  ),
}));
vi.mock("../sub-components/Info", () => ({
  default: ({ statusText }: { statusText?: string }) => (
    <div data-testid="dialog-status">{statusText}</div>
  ),
}));
vi.mock("../sub-components/Footer", () => ({ default: () => null }));

const SettingsPluginDialog = (await import("../index"))
  .default as unknown as React.ComponentType;

type TDialogState = {
  pluginList: object[];
  personalPlugins?: object[];
  request: { pluginName: string; personal?: boolean };
};

const loadedOwn = (personal: boolean): TDialogState => ({
  pluginList: [{ name: "own", nameLocale: "Own", personal }],
  request: { pluginName: "own" },
});

const ownRecord = {
  name: "own",
  pluginName: "OWN",
  nameLocale: { en: "My own" },
  version: "1.0.0",
  description: "",
  createBy: { displayName: "Member" },
};

const workspaceCopy = {
  name: "own",
  pluginName: "OWN",
  nameLocale: "Workspace own",
  version: "2.0.0",
  enabled: true,
  personal: false,
};

const renderDialog = ({
  pluginList,
  personalPlugins = [],
  request,
}: TDialogState) => {
  const pluginStore = {
    pluginList,
    personalPlugins,
    checkPluginCompatibility: () => true,
    settingsPluginDialogVisible: true,
    setSettingsPluginDialogVisible: vi.fn(),
    currentSettingsDialogPlugin: request,
    setCurrentSettingsDialogPlugin: vi.fn(),
    setDeletePluginDialogVisible: vi.fn(),
    setDeletePluginDialogProps: vi.fn(),
    reactSettingsSaveButtonState: null,
  };

  render(
    <Provider
      pluginStore={pluginStore}
      settingsStore={{
        pluginOptions: { delete: false },
        standalone: false,
        culture: "en",
      }}
    >
      <SettingsPluginDialog />
    </Provider>,
  );

  return pluginStore;
};

describe("SettingsPluginDialog", () => {
  it("lets the member delete their own plugin while workspace deletion is off", () => {
    const pluginStore = renderDialog(loadedOwn(true));

    fireEvent.click(screen.getByTestId("settings_delete_plugin_button"));

    expect(pluginStore.setDeletePluginDialogProps).toHaveBeenCalledWith({
      pluginName: "own",
      personal: true,
    });
    expect(pluginStore.setDeletePluginDialogVisible).toHaveBeenCalledWith(true);
    expect(pluginStore.setSettingsPluginDialogVisible).toHaveBeenCalledWith(
      false,
    );
  });

  it("offers no deletion of a workspace plugin while deletion is off", () => {
    renderDialog(loadedOwn(false));

    expect(screen.queryByTestId("settings_delete_plugin_button")).toBeNull();
  });

  it("opens one's own copy that a workspace plugin shadows and deletes that copy", () => {
    const pluginStore = renderDialog({
      pluginList: [workspaceCopy],
      personalPlugins: [ownRecord],
      request: { pluginName: "own", personal: true },
    });

    expect(screen.getByTestId("dialog-header")).toHaveTextContent("My own");
    expect(screen.getByTestId("dialog-status")).toHaveTextContent(
      "WebPlugins:PersonalPluginShadowed",
    );

    fireEvent.click(screen.getByTestId("settings_delete_plugin_button"));

    expect(pluginStore.setDeletePluginDialogProps).toHaveBeenCalledWith({
      pluginName: "own",
      personal: true,
    });
  });

  it("opens one's own plugin this page has not loaded and offers to delete it", () => {
    renderDialog({
      pluginList: [],
      personalPlugins: [ownRecord],
      request: { pluginName: "own", personal: true },
    });

    expect(screen.getByTestId("dialog-status")).toHaveTextContent(
      "WebPlugins:PersonalPluginNotLoaded",
    );
    expect(
      screen.getByTestId("settings_delete_plugin_button"),
    ).toBeInTheDocument();
  });
});
