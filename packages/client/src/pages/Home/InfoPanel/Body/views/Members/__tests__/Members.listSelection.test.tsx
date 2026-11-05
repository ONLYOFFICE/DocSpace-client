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
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  listItemOf,
  privateRoomDto,
  roomDto,
} from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

import type { TInfoPanelMembers } from "../Members.types";

const mocks = vi.hoisted(() => ({
  updateRoomMemberRole: vi.fn(),
  revokeMemberFromEncryptedRoom: vi.fn(),
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      updateRoomMemberRole: mocks.updateRoomMemberRole,
      resendEmailInvitations: vi.fn(),
    },
  },
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  revokeMemberFromEncryptedRoom: mocks.revokeMemberFromEncryptedRoom,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/components/share/sub-components/List", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@docspace/shared/components/share/sub-components/User", () => ({
  User: ({
    user,
    options,
    onSelectOption,
  }: {
    user: { id: string };
    options: { key: string }[];
    onSelectOption: (option: unknown) => void;
  }) => (
    <button
      type="button"
      data-testid={`member_${user.id}_remove`}
      onClick={() =>
        onSelectOption(options.find((option) => option.key === "remove"))
      }
    />
  ),
}));

const { default: Members } = await import("../index");

const members = (): TInfoPanelMembers =>
  ({
    administrators: [
      {
        id: "admin",
        displayName: "Administrator",
        email: "admin@example.com",
        access: ShareAccessRights.FullAccess,
        canEditAccess: false,
        isOwner: true,
      },
    ],
    users: [
      {
        id: "bob",
        displayName: "bob tester",
        email: "bob@example.com",
        access: ShareAccessRights.Collaborator,
        canEditAccess: true,
        isAdmin: false,
        isOwner: false,
        isRoomAdmin: true,
      },
    ],
    groups: [],
    guests: [],
    expected: [],
  }) as unknown as TInfoPanelMembers;

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
        total={2}
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

describe("Members tab of a room selected in a list", () => {
  beforeEach(() => {
    mocks.updateRoomMemberRole.mockImplementation(async () => ({}));
    mocks.revokeMemberFromEncryptedRoom.mockImplementation(async () => [
      { success: true },
    ]);
  });

  it("offers the links of an ordinary room selected in a list", () => {
    renderMembersOf(listItemOf(roomDto()));

    expect(
      screen.getByTestId("info_panel_members_links_block"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("info_panel_members_create_additional_link"),
    ).toBeInTheDocument();
  });

  it("Members view of a room selected in a list", () => {
    renderMembersOf(listItemOf(privateRoomDto()));

    expect(screen.queryByTestId("info_panel_members_links_block")).toBeNull();
    expect(
      screen.queryByTestId("info_panel_members_create_additional_link"),
    ).toBeNull();
  });

  it("Remove member of a room selected in a list", () => {
    const { setRemoveUserConfirmation } = renderMembersOf(
      listItemOf(privateRoomDto()),
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));

    expect(setRemoveUserConfirmation).toHaveBeenCalledWith(
      true,
      expect.any(Function),
      true,
    );
    expect(mocks.updateRoomMemberRole).not.toHaveBeenCalled();
  });

  it("Removal from a room selected in a list", async () => {
    const { setRemoveUserConfirmation } = renderMembersOf(
      listItemOf(privateRoomDto()),
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));
    const [, confirm] = setRemoveUserConfirmation.mock.calls[0];
    await confirm();

    expect(mocks.updateRoomMemberRole).toHaveBeenCalledWith(
      14,
      expect.objectContaining({
        invitations: [{ id: "bob", access: ShareAccessRights.None }],
      }),
    );
    expect(mocks.revokeMemberFromEncryptedRoom).toHaveBeenCalledWith(
      14,
      ["bob"],
      {},
    );
    expect(
      mocks.updateRoomMemberRole.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mocks.revokeMemberFromEncryptedRoom.mock.invocationCallOrder[0],
    );
  });
});
