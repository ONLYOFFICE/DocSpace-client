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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const ROOM_ID = 10;
const SECTION_ROOT_ID = 2;

const mocks = vi.hoisted(() => ({
  room: {} as Record<string, unknown>,
  currentFolder: null as { id: number } | null,
  updateRoomMemberRole: vi.fn(),
  openFolder: vi.fn(),
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { rooms: { updateRoomMemberRole: mocks.updateRoomMemberRole } },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const ModalDialog = Object.assign(Slot, {
    Header: Slot,
    Body: Slot,
    Footer: Slot,
  });
  return { ModalDialog, ModalDialogType: { modal: "modal" } };
});

vi.mock("@onlyoffice/apps-ui-kit/components/button", () => ({
  Button: ({ testId, onClick }: { testId: string; onClick: () => void }) => (
    <button type="button" data-testid={testId} onClick={onClick} />
  ),
  ButtonSize: { normal: "normal" },
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({
    currentFolder: mocks.currentFolder,
    pathParts: [{ id: SECTION_ROOT_ID }, { id: ROOM_ID }],
    removeItem: vi.fn(),
  }),
}));

vi.mock("@/app/(docspace)/_store/FilesSelectionStore", () => ({
  useFilesSelectionStore: () => ({
    selection: [mocks.room],
    bufferSelection: null,
    setSelection: vi.fn(),
    setBufferSelection: vi.fn(),
  }),
}));

vi.mock("@/app/(docspace)/_store/DialogsStore", () => ({
  useDialogsStore: () => ({ isDialogOpen: () => true, closeDialog: vi.fn() }),
}));

vi.mock("@/app/(docspace)/_hooks/useFolderActions", () => ({
  default: () => ({ openFolder: mocks.openFolder }),
}));

import LeaveRoomDialog from ".";

describe("LeaveRoomDialog", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;

  const leave = async (
    props: Partial<React.ComponentProps<typeof LeaveRoomDialog>> = {},
  ) => {
    container = document.createElement("div");
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <LeaveRoomDialog
          currentUserId="me"
          onTransferOwnership={vi.fn()}
          {...props}
        />,
      );
    });
    await act(async () => {
      container
        .querySelector<HTMLElement>('[data-testid="leave_room_dialog_submit"]')
        ?.click();
    });
  };

  beforeEach(() => {
    mocks.room = {
      id: ROOM_ID,
      isFolder: true,
      private: true,
      createdBy: { id: "owner" },
    };
    mocks.currentFolder = { id: ROOM_ID };
    mocks.updateRoomMemberRole.mockImplementation(async () => ({}));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Member leaves: the role is dropped, then the private rooms list opens", async () => {
    await leave();

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledWith(ROOM_ID, {
      invitations: [{ id: "me", access: 0 }],
      force: false,
    });
    expect(mocks.toastr.success).toHaveBeenCalledWith("Common:YouLeftTheRoom");
    expect(mocks.openFolder).toHaveBeenCalledWith(SECTION_ROOT_ID, "");
  });

  it("stays on the list when the room is left from the list", async () => {
    mocks.currentFolder = { id: SECTION_ROOT_ID };

    await leave();

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledTimes(1);
    expect(mocks.openFolder).not.toHaveBeenCalled();
  });

  it("leaves the room the private dialogs hand over and returns through their handler", async () => {
    const onLeftOpenRoom = vi.fn();
    const room = { ...mocks.room };
    mocks.room = {};

    await leave({ room: room as never, onClose: vi.fn(), onLeftOpenRoom });

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledWith(ROOM_ID, {
      invitations: [{ id: "me", access: 0 }],
      force: false,
    });
    expect(onLeftOpenRoom).toHaveBeenCalledTimes(1);
    expect(mocks.openFolder).not.toHaveBeenCalled();
  });

  it("Leave refused", async () => {
    mocks.updateRoomMemberRole.mockImplementation(async () => {
      throw Object.assign(new Error("The user does not have an encryption key"), {
        response: { status: 403 },
      });
    });
    const onClose = vi.fn();

    await leave({ room: mocks.room as never, onClose });

    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedAccessChangeRefused",
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.toastr.success).not.toHaveBeenCalled();
  });

  it("Leave fails for another reason", async () => {
    const failure = Object.assign(new Error("500"), {
      response: { status: 500 },
    });
    mocks.updateRoomMemberRole.mockImplementation(async () => {
      throw failure;
    });
    const onClose = vi.fn();

    await leave({ room: mocks.room as never, onClose });

    expect(mocks.toastr.error).toHaveBeenCalledWith(failure);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Refusal in an ordinary room", async () => {
    const forbidden = Object.assign(new Error("403"), {
      response: { status: 403 },
    });
    mocks.updateRoomMemberRole.mockImplementation(async () => {
      throw forbidden;
    });
    const onClose = vi.fn();

    await leave({
      room: { ...mocks.room, private: false } as never,
      onClose,
    });

    expect(mocks.toastr.error).toHaveBeenCalledWith(forbidden);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("leaves an ordinary room through the role update", async () => {
    mocks.room = { ...mocks.room, private: false };

    await leave();

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledTimes(1);
    expect(mocks.openFolder).not.toHaveBeenCalled();
  });
});
