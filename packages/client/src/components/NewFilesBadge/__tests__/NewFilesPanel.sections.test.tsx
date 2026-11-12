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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";
import type { TNewFiles } from "@docspace/shared/api/rooms/types";

const getNewFiles = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api", () => ({
  default: { files: { getNewFiles, getNewFolderFiles: vi.fn() } },
}));

// Each day group is shown as the titles of its rooms.
vi.mock("../sub-components/NewFilesPanelItem", () => ({
  NewFilesPanelItem: ({ items }: { items: { room?: { title: string } }[] }) => (
    <ul>
      {items.map((item) => (
        <li key={item.room?.title} data-testid="news-room">
          {item.room?.title}
        </li>
      ))}
    </ul>
  ),
}));

vi.mock("../sub-components/NewFilesPanelLoader", () => ({
  NewFilesPanelLoader: () => null,
}));

import { NewFilesPanelComponent } from "../sub-components/NewFilesPanel";

const room = (
  id: number,
  title: string,
  roomType: RoomsType,
  isPrivate = false,
) => ({
  room: { id, title, roomType, private: isPrivate },
  items: [{ id: id * 10, title: "file.docx" }],
});

// `rooms/news` answers every room under the Rooms root in one listing.
const NEWS = [
  {
    date: "2026-11-12T10:00:00.0000000+00:00",
    items: [
      room(1, "Team", RoomsType.CustomRoom),
      room(2, "Secret", RoomsType.CustomRoom, true),
      room(3, "Survey", RoomsType.FormRoom),
    ],
  },
  {
    date: "2026-11-11T10:00:00.0000000+00:00",
    items: [room(4, "Vault", RoomsType.EditingRoom, true)],
  },
] as unknown as TNewFiles[];

const renderPanel = (folderId: string, markAsRead = vi.fn()) => {
  const onClose = vi.fn();
  render(
    <NewFilesPanelComponent
      position={{ top: 0, left: 0, maxHeight: 400 }}
      folderId={folderId}
      onClose={onClose}
      culture="en"
      markAsRead={markAsRead}
      openRoomId={null}
    />,
  );
  return { markAsRead, onClose };
};

const listedRooms = async () => {
  await waitFor(() => expect(screen.queryAllByTestId("news-room")).not.toEqual([]));
  return screen.getAllByTestId("news-room").map((node) => node.textContent);
};

describe("NewFilesPanel: one rooms news, a panel per section", () => {
  beforeEach(() => {
    getNewFiles.mockReset();
    getNewFiles.mockResolvedValue(NEWS);
  });

  it("New file in a private room: the Private panel lists the private rooms only", async () => {
    renderPanel("private");

    expect(await listedRooms()).toEqual(["Secret", "Vault"]);
    expect(getNewFiles).toHaveBeenCalledWith("rooms");
  });

  it("New file in a private room: the Rooms panel leaves private and form rooms out", async () => {
    renderPanel("rooms");

    expect(await listedRooms()).toEqual(["Team"]);
  });

  it("keeps the Forms panel to form rooms", async () => {
    renderPanel("forms");

    expect(await listedRooms()).toEqual(["Survey"]);
  });

  it("Mark all as read: marks the private rooms by id", async () => {
    const { markAsRead, onClose } = renderPanel("private");
    await listedRooms();

    fireEvent.click(screen.getByTestId("mark_as_read_button"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(markAsRead).toHaveBeenCalledWith([2, 4], []);
  });
});
