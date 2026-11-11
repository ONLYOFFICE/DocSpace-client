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
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@docspace/shared/api";
import { ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { privateRoomDto } from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

import type { TInfoPanelMembers } from "../Members.types";

const mocks = vi.hoisted(() => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
    ready: true,
  }),
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      updateRoomMemberRole: vi.fn(),
      resendEmailInvitations: vi.fn(),
    },
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@docspace/shared/components/share/sub-components/List", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@docspace/shared/components/share/sub-components/User", () => ({
  User: ({
    user,
    onSelectOption,
  }: {
    user: { id: string };
    onSelectOption?: (option: {
      key: string;
      access: ShareAccessRights;
    }) => void;
  }) => (
    <>
      <button
        type="button"
        data-testid={`member_${user.id}_remove`}
        onClick={() =>
          onSelectOption?.({ key: "remove", access: ShareAccessRights.None })
        }
      />
      <button
        type="button"
        data-testid={`member_${user.id}_role`}
        onClick={() =>
          onSelectOption?.({
            key: "manager",
            access: ShareAccessRights.RoomManager,
          })
        }
      />
    </>
  ),
}));

const { default: Members } = await import("../index");

const ROOM_ID = 14;

const members = (): TInfoPanelMembers =>
  ({
    administrators: [],
    users: [
      {
        id: "bob",
        displayName: "bob tester",
        email: "bob@example.com",
        access: ShareAccessRights.Editing,
        canEditAccess: true,
      },
    ],
    groups: [],
    guests: [],
    expected: [],
  }) as unknown as TInfoPanelMembers;

const refusal = (status: number) =>
  Object.assign(new Error("The user does not have an encryption key"), {
    response: { status },
  });

const renderMembersOf = (room: TRoom) => {
  const setRemoveUserConfirmation = vi.fn();
  const changeUserRole = vi.fn(async () => {});

  render(
    <Provider
      userStore={{ user: { id: "admin" } }}
      filesStore={{
        filesSettingsStore: {
          isExternalShareRestricted: false,
          externalShareApplyToRooms: false,
          defaultShareLinkInternal: false,
        },
        getPrimaryLink: vi.fn(),
      }}
      selectedFolderStore={{ id: 2, isRootFolder: true }}
      publicRoomStore={{
        primaryLink: null,
        additionalLinks: [],
        setExternalLink: vi.fn(),
        hasExternalLinks: false,
      }}
      treeFoldersStore={{
        isArchiveFolderRoot: false,
        isAIAgentsFolderRoot: false,
      }}
      dialogsStore={{
        setTemplateAccessSettingsVisible: vi.fn(),
        setEditMembersGroup: vi.fn(),
        setEditGroupMembersDialogVisible: vi.fn(),
        setRemoveUserConfirmation,
      }}
      infoPanelStore={{
        infoPanelRoomSelection: room,
        templateAvailableToEveryone: false,
        isMembersPanelUpdating: false,
        setIsMembersPanelUpdating: vi.fn(),
        updateInfoPanelMembers: vi.fn(),
      }}
      uploadDataStore={{
        getActiveUploadCountForRoom: () => 0,
        secondaryProgressDataStore: { setSecondaryProgressBarData: vi.fn() },
      }}
    >
      <Members
        members={members()}
        total={1}
        searchValue=""
        isFirstLoading={false}
        fetchMoreMembers={vi.fn(async () => {})}
        changeUserRole={changeUserRole}
        scrollToTop={vi.fn()}
      />
    </Provider>,
  );

  return { setRemoveUserConfirmation, changeUserRole };
};

describe("Refused access change in a private room is explained", () => {
  beforeEach(() => {
    vi.mocked(api.rooms.updateRoomMemberRole).mockRejectedValue(refusal(403));
  });

  it("Removal refused", async () => {
    const { setRemoveUserConfirmation, changeUserRole } = renderMembersOf(
      privateRoomDto({ id: ROOM_ID }),
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));
    const confirm = setRemoveUserConfirmation.mock.calls[0][1] as () => unknown;
    await confirm();

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:EncryptedAccessChangeRefused",
      ),
    );
    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(changeUserRole).not.toHaveBeenCalled();
  });

  it("Role change refused", async () => {
    const { changeUserRole } = renderMembersOf(privateRoomDto({ id: ROOM_ID }));

    fireEvent.click(screen.getByTestId("member_bob_role"));

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:EncryptedAccessChangeRefused",
      ),
    );
    expect(mocks.toastr.error).toHaveBeenCalledTimes(1);
    expect(changeUserRole).not.toHaveBeenCalled();
  });

  it("Refusal in an ordinary room", async () => {
    const forbidden = refusal(403);
    vi.mocked(api.rooms.updateRoomMemberRole).mockRejectedValue(forbidden);
    renderMembersOf({
      ...privateRoomDto({ id: ROOM_ID }),
      private: false,
    } as TRoom);

    fireEvent.click(screen.getByTestId("member_bob_role"));

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(forbidden),
    );
    expect(mocks.toastr.error).not.toHaveBeenCalledWith(
      "Common:EncryptedAccessChangeRefused",
    );
  });

  it("Failure that is not a refusal", async () => {
    const failure = refusal(500);
    vi.mocked(api.rooms.updateRoomMemberRole).mockRejectedValue(failure);
    renderMembersOf(privateRoomDto({ id: ROOM_ID }));

    fireEvent.click(screen.getByTestId("member_bob_role"));

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(failure),
    );
  });
});
