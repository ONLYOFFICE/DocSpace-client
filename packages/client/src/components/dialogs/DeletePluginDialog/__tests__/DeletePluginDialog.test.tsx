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

import { act, fireEvent, render, screen } from "@testing-library/react";
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
  };
});

const DeletePluginDialog = (await import("../index")).default;

const renderDialog = (props: Record<string, unknown>) => {
  const pluginStore = {
    deletePluginDialogProps: { pluginName: "hello", ...props },
    setDeletePluginDialogVisible: vi.fn(),
    setDeletePluginDialogProps: vi.fn(),
    uninstallPlugin: vi.fn(async () => {}),
    deleteUserPlugin: vi.fn(async () => {}),
  };

  render(
    <Provider pluginStore={pluginStore}>
      <DeletePluginDialog isVisible />
    </Provider>,
  );

  return pluginStore;
};

const confirm = () =>
  act(async () => {
    fireEvent.click(screen.getByTestId("confirm_delete_plugin_button"));
  });

describe("DeletePluginDialog", () => {
  it("deletes a member's plugin and says whose it is", async () => {
    const pluginStore = renderDialog({
      member: true,
      userId: "u1",
      userName: "Anna",
      pluginTitle: "Hello",
    });

    expect(screen.getByText("DeleteUserPluginDescription")).toBeInTheDocument();

    await confirm();

    expect(pluginStore.deleteUserPlugin).toHaveBeenCalledWith(
      "u1",
      "hello",
      expect.any(Function),
    );
    expect(pluginStore.uninstallPlugin).not.toHaveBeenCalled();
  });

  it("keeps the member text when the member has no name", () => {
    renderDialog({ member: true, userId: "u1", userName: "" });

    expect(screen.getByText("DeleteUserPluginDescription")).toBeInTheDocument();
  });

  it("deletes nothing of the workspace for a member's plugin without a member", async () => {
    const pluginStore = renderDialog({ member: true });

    await confirm();

    expect(pluginStore.uninstallPlugin).not.toHaveBeenCalled();
    expect(pluginStore.deleteUserPlugin).not.toHaveBeenCalled();
  });

  it("deletes a workspace plugin for everyone", async () => {
    const pluginStore = renderDialog({});

    expect(screen.getByText("DeletePluginDescription")).toBeInTheDocument();

    await confirm();

    expect(pluginStore.uninstallPlugin).toHaveBeenCalledWith(
      "hello",
      expect.any(Function),
      undefined,
    );
    expect(pluginStore.deleteUserPlugin).not.toHaveBeenCalled();
  });

  it("deletes the caller's own plugin at the personal level", async () => {
    const pluginStore = renderDialog({ personal: true });

    expect(
      screen.getByText("DeletePersonalPluginDescription"),
    ).toBeInTheDocument();

    await confirm();

    expect(pluginStore.uninstallPlugin).toHaveBeenCalledWith(
      "hello",
      expect.any(Function),
      true,
    );
  });
});
