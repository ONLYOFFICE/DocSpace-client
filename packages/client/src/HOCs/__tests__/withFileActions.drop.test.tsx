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
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFolderPath } from "@docspace/shared/api/files";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type { TUploadTarget } from "SRC_DIR/store/uploadDataStore/helpers";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFolderPath: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { warning: vi.fn(), error: vi.fn() },
}));

const { default: withFileActions } = await import("../withFileActions");

const PRIVATE_ROOM_ID = 50;
const FOLDER_ID = 60;
const files = [{ name: "plan.txt" }];

const roomsListOpen: TUploadTarget = {
  folderId: 2002,
  isPrivate: false,
  roomType: null,
  encryptionRoomId: null,
};

const privateRoomOpen: TUploadTarget = {
  folderId: PRIVATE_ROOM_ID,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: PRIVATE_ROOM_ID,
};

const ordinaryRoomOpen: TUploadTarget = {
  folderId: 70,
  isPrivate: false,
  roomType: RoomsType.EditingRoom,
  encryptionRoomId: 70,
};

const privateRoomPath = [
  { id: 2002, title: "Rooms" },
  { id: PRIVATE_ROOM_ID, title: "Room", roomType: RoomsType.CustomRoom, private: true },
  { id: FOLDER_ID, title: "Reports" },
];

type TRowProps = {
  onDrop: (dropped: unknown[]) => void;
  onDropCapture: () => void;
};

/** Hands the wrapped row's handlers to the test, as the rows hand them to DragAndDrop. */
const renderFolderRow = (openAtFirst: TUploadTarget) => {
  let open = openAtFirst;
  let rowProps!: TRowProps;
  const Row = (props: TRowProps) => {
    rowProps = props;
    return <div data-testid="row" onDropCapture={props.onDropCapture} />;
  };
  const RowWithActions = withFileActions(Row) as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  const createFoldersTree = vi.fn(async () => files);
  const startUpload = vi.fn();

  render(
    <RowWithActions
      t={(key: string) => key}
      item={{
        id: FOLDER_ID,
        parentId: PRIVATE_ROOM_ID,
        isFolder: true,
        isRoom: false,
        rootFolderType: FolderType.Rooms,
        security: {},
      }}
      dragging={false}
      setDragging={vi.fn()}
      resolveOpenFolderTarget={() => open}
      createFoldersTree={createFoldersTree}
      startUpload={startUpload}
    />,
  );

  return {
    createFoldersTree,
    startUpload,
    openFolder: (next: TUploadTarget) => {
      open = next;
    },
    dropNatively: () => fireEvent.drop(screen.getByTestId("row")),
    directoriesRead: () => rowProps.onDrop(files),
  };
};

beforeEach(() => {
  vi.mocked(getFolderPath).mockReset();
});

describe("withFileActions — files dropped on a folder row", () => {
  it("Folder of a private room listed outside it", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(privateRoomPath as never);
    const row = renderFolderRow(roomsListOpen);

    row.dropNatively();
    row.directoriesRead();

    await vi.waitFor(() =>
      expect(toastr.warning).toHaveBeenCalledWith(
        "Common:OpenPrivateRoomToUpload",
      ),
    );
    expect(row.createFoldersTree).not.toHaveBeenCalled();
    expect(row.startUpload).not.toHaveBeenCalled();
  });

  it("Target room cannot be determined", async () => {
    vi.mocked(getFolderPath).mockRejectedValue(new Error("403"));
    const row = renderFolderRow(roomsListOpen);

    row.dropNatively();
    row.directoriesRead();

    await vi.waitFor(() => expect(toastr.error).toHaveBeenCalled());
    expect(toastr.warning).not.toHaveBeenCalled();
    expect(row.createFoldersTree).not.toHaveBeenCalled();
    expect(row.startUpload).not.toHaveBeenCalled();
  });

  it("Another room opened during the directory read", async () => {
    const row = renderFolderRow(privateRoomOpen);

    row.dropNatively();
    row.openFolder(ordinaryRoomOpen);
    row.directoriesRead();

    const privateFolder = { ...privateRoomOpen, folderId: FOLDER_ID };
    await vi.waitFor(() =>
      expect(row.startUpload).toHaveBeenCalledWith(
        files,
        privateFolder,
        expect.anything(),
      ),
    );
    expect(row.createFoldersTree).toHaveBeenCalledWith(
      expect.anything(),
      files,
      privateFolder,
      false,
    );
    expect(getFolderPath).not.toHaveBeenCalled();
  });
});
