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

type TSelectorProps = {
  isChecked?: boolean;
  excludeItems?: string[];
  onSubmit: (
    users: { id: string; displayName?: string }[],
    access: unknown,
    fileName: string,
    isChecked: boolean,
  ) => Promise<void>;
};

const ROOM_ID = 10;

const mocks = vi.hoisted(() => ({
  selector: null as TSelectorProps | null,
  currentFolder: null as { id: number } | null,
  push: vi.fn(),
  leaveRoom: vi.fn(async () => {}),
  changeOwner: vi.fn(async () => true),
  validateMembersForEncryption: vi.fn(),
  getRoomMembers: vi.fn(),
  getUserList: vi.fn(),
  toastr: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Slot = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ModalDialog: Object.assign(Slot, { Body: Slot }),
    ModalDialogType: { aside: "aside" },
  };
});

vi.mock("@onlyoffice/apps-ui-kit/selectors/People", () => ({
  default: (props: TSelectorProps) => {
    mocks.selector = props;
    return null;
  },
}));

vi.mock("@docspace/shared/api/rooms", () => ({
  getRoomMembers: mocks.getRoomMembers,
}));
vi.mock("@docspace/shared/api/people", () => ({
  getUserList: mocks.getUserList,
}));
vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  validateMembersForEncryption: mocks.validateMembersForEncryption,
}));

vi.mock("@/app/(docspace)/_store/FilesListStore", () => ({
  useFilesListStore: () => ({ currentFolder: mocks.currentFolder }),
}));

vi.mock("../../_hooks/usePrivateRoute", () => ({
  usePrivateRoute: () => (path: string) => `${path}?privateRooms=true`,
}));

vi.mock("../../_hooks/usePrivateOwnerChangeFlow", () => ({
  usePrivateOwnerChangeFlow: () => ({
    changeOwner: mocks.changeOwner,
    leaveRoom: mocks.leaveRoom,
    isLoading: false,
  }),
}));

import PrivateChangeOwnerDialog from "./PrivateChangeOwnerDialog";

describe("PrivateChangeOwnerDialog", () => {
  let root: Root | null = null;

  const open = async () => {
    root = createRoot(document.createElement("div"));
    await act(async () => {
      root?.render(
        <PrivateChangeOwnerDialog
          visible
          onClose={vi.fn()}
          roomId={ROOM_ID}
          roomOwnerId="me"
          currentUserId="me"
        />,
      );
    });
  };

  const submit = (isLeaveChecked: boolean) =>
    act(() =>
      mocks.selector!.onSubmit([{ id: "bob" }], null, "", isLeaveChecked),
    );

  beforeEach(() => {
    mocks.selector = null;
    mocks.currentFolder = { id: ROOM_ID };
    mocks.getRoomMembers.mockImplementation(async () => ({
      items: [{ subjectType: 0, sharedTo: { id: "bob" } }],
    }));
    mocks.getUserList.mockImplementation(async () => ({
      items: [{ id: "bob" }, { id: "carol" }, { id: "me" }],
    }));
    mocks.validateMembersForEncryption.mockImplementation(async () => ({
      valid: [],
      skipped: [],
    }));
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Owner change from the header of an open room: only current members are candidates and a candidate without a verified key is refused", async () => {
    mocks.validateMembersForEncryption.mockImplementation(async () => ({
      valid: [],
      skipped: [{ id: "bob", reason: "no-key", displayName: "Bob" }],
    }));
    await open();

    expect(mocks.selector?.excludeItems).toEqual(["me", "carol"]);

    await submit(false);

    expect(mocks.validateMembersForEncryption).toHaveBeenCalledWith(
      ROOM_ID,
      ["bob"],
      "me",
      undefined,
      { bob: undefined },
    );
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedChangeOwnerNoKeys",
    );
    expect(mocks.changeOwner).not.toHaveBeenCalled();
  });

  it("offers the leave option checked by default to the owner", async () => {
    await open();

    expect(mocks.selector?.isChecked).toBe(true);
  });

  it("Member leaves: the owner leaves after the handoff and returns to the private rooms list", async () => {
    await open();

    await submit(true);

    expect(mocks.changeOwner).toHaveBeenCalledWith({
      roomId: ROOM_ID,
      newOwnerId: "bob",
    });
    expect(mocks.leaveRoom).toHaveBeenCalledWith({
      roomId: ROOM_ID,
      userId: "me",
    });
    expect(mocks.toastr.success).toHaveBeenCalledWith("Common:YouLeftTheRoom");
    expect(mocks.push).toHaveBeenCalledWith("/private?privateRooms=true");
  });

  it("stays in the room when the owner keeps the membership", async () => {
    await open();

    await submit(false);

    expect(mocks.leaveRoom).not.toHaveBeenCalled();
    expect(mocks.toastr.success).toHaveBeenCalledWith("Common:AppointNewOwner");
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
