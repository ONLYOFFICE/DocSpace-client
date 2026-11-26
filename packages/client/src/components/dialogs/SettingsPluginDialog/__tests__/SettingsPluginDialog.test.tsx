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

vi.mock("../sub-components/Header", () => ({ default: () => null }));
vi.mock("../sub-components/Info", () => ({ default: () => null }));
vi.mock("../sub-components/Footer", () => ({ default: () => null }));

const SettingsPluginDialog = (await import("../index"))
  .default as unknown as React.ComponentType;

const renderDialog = (personal: boolean) => {
  const pluginStore = {
    pluginList: [{ name: "own", nameLocale: "Own", personal }],
    settingsPluginDialogVisible: true,
    setSettingsPluginDialogVisible: vi.fn(),
    currentSettingsDialogPlugin: { pluginName: "own" },
    setCurrentSettingsDialogPlugin: vi.fn(),
    setDeletePluginDialogVisible: vi.fn(),
    setDeletePluginDialogProps: vi.fn(),
    reactSettingsSaveButtonState: null,
  };

  render(
    <Provider
      pluginStore={pluginStore}
      settingsStore={{ pluginOptions: { delete: false }, standalone: false }}
    >
      <SettingsPluginDialog />
    </Provider>,
  );

  return pluginStore;
};

describe("SettingsPluginDialog", () => {
  it("lets the member delete their own plugin while workspace deletion is off", () => {
    const pluginStore = renderDialog(true);

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
    renderDialog(false);

    expect(screen.queryByTestId("settings_delete_plugin_button")).toBeNull();
  });
});
