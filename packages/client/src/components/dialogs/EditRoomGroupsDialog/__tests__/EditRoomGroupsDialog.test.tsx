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
import { RoomSearchArea } from "@docspace/shared/enums";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/portal", () => ({
  Portal: ({ element }: { element: React.ReactNode }) => <>{element}</>,
}));

vi.mock("../sub-components/RoomListPanel", () => ({
  default: ({ excludeItems }: { excludeItems?: number[] }) => (
    <div data-testid="room-list" data-exclude={excludeItems?.join(",")} />
  ),
}));
vi.mock("../sub-components/GroupIconDialog", () => ({ default: () => null }));
vi.mock("../sub-components/DeleteGroupDialog", () => ({ default: () => null }));
vi.mock("../sub-components/GroupItem", () => ({ default: () => null }));

const { default: EditRoomGroupsDialog } = await import("../index");

const renderDialog = (getPrivateSectionRoomIds: () => Promise<number[]>) => {
  const setEditRoomGroupsDialogVisible = vi.fn();
  const Dialog = EditRoomGroupsDialog as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Dialog
      setEditRoomGroupsDialogVisible={setEditRoomGroupsDialogVisible}
      roomGroups={[]}
      getAllRoomGroups={vi.fn(async () => {})}
      getCovers={vi.fn()}
      covers={[]}
      openInCreateMode
      organizeRoomsGrouping
      searchArea={RoomSearchArea.Active}
      getPrivateSectionRoomIds={getPrivateSectionRoomIds}
    />,
  );

  return { setEditRoomGroupsDialogVisible };
};

describe("EditRoomGroupsDialog — the private rooms of the Private section", () => {
  it("closes with an error toast when their ids cannot be loaded", async () => {
    const error = new Error("Rooms list failed");
    const { setEditRoomGroupsDialogVisible } = renderDialog(async () => {
      throw error;
    });

    await waitFor(() =>
      expect(setEditRoomGroupsDialogVisible).toHaveBeenCalledWith(false),
    );
    expect(toastr.error).toHaveBeenCalledWith(error);
    expect(screen.queryByTestId("room-list")).toBeNull();
  });

  it("opens the room list only once their ids are known, leaving them out", async () => {
    const { setEditRoomGroupsDialogVisible } = renderDialog(async () => [14]);

    expect(await screen.findByTestId("room-list")).toHaveAttribute(
      "data-exclude",
      "14",
    );
    expect(setEditRoomGroupsDialogVisible).not.toHaveBeenCalled();
  });
});
