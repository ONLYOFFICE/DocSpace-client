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

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/selectors/Room", () => ({
  default: ({ excludeItems }: { excludeItems?: number[] }) => (
    <div data-testid="room-selector" data-exclude={excludeItems?.join(",")} />
  ),
}));

const { default: AddRoomToGroupDialog } = await import("../index");

const renderDialog = (getPrivateSectionRoomIds: () => Promise<number[]>) => {
  const setAddRoomToGroupDialogVisible = vi.fn();
  const Dialog = AddRoomToGroupDialog as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Dialog
      visible
      groupId="group-1"
      setAddRoomToGroupDialogVisible={setAddRoomToGroupDialogVisible}
      getGroupById={vi.fn(async () => ({ rooms: [], name: "Finance" }))}
      getPrivateSectionRoomIds={getPrivateSectionRoomIds}
    />,
  );

  return { setAddRoomToGroupDialogVisible };
};

describe("AddRoomToGroupDialog — the private rooms of the Private section", () => {
  it("closes with an error toast when their ids cannot be loaded", async () => {
    const error = new Error("Rooms list failed");
    const { setAddRoomToGroupDialogVisible } = renderDialog(async () => {
      throw error;
    });

    await waitFor(() =>
      expect(setAddRoomToGroupDialogVisible).toHaveBeenCalledWith(false),
    );
    expect(toastr.error).toHaveBeenCalledWith(error);
    expect(screen.queryByTestId("room-selector")).toBeNull();
  });

  it("lists rooms only once their ids are known, leaving them out", async () => {
    const { setAddRoomToGroupDialogVisible } = renderDialog(async () => [
      14, 19,
    ]);

    expect(await screen.findByTestId("room-selector")).toHaveAttribute(
      "data-exclude",
      "14,19",
    );
    expect(setAddRoomToGroupDialogVisible).not.toHaveBeenCalled();
  });
});
