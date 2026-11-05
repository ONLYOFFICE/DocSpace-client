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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import { pendingAccessStore } from "@docspace/shared/services/private-room/pending-access";

import {
  listItemOf,
  privateRoomDto,
  roomDto,
} from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

import type { TInfoPanelMembers } from "../Members.types";

const identity = { publicKey: new Uint8Array(32) };

const mocks = vi.hoisted(() => ({
  rewrapMissingFilesForMember: vi.fn(),
  addMembersToEncryptedRoom: vi.fn(),
  requireUnlock: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      updateRoomMemberRole: vi.fn(),
      resendEmailInvitations: vi.fn(),
    },
  },
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  rewrapMissingFilesForMember: mocks.rewrapMissingFilesForMember,
  addMembersToEncryptedRoom: mocks.addMembersToEncryptedRoom,
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  requireUnlock: mocks.requireUnlock,
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
    isAccessPending,
    onRetryAccess,
  }: {
    user: { id: string };
    isAccessPending?: boolean;
    onRetryAccess?: () => Promise<void>;
  }) => (
    <div>
      {isAccessPending ? (
        <span data-testid={`member_${user.id}_pending`} />
      ) : null}
      {onRetryAccess ? (
        <button
          type="button"
          data-testid={`member_${user.id}_retry`}
          onClick={() => onRetryAccess()}
        />
      ) : null}
    </div>
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
        access: ShareAccessRights.Editing,
        canEditAccess: true,
      },
    ],
    groups: [],
    guests: [],
    expected: [],
  }) as unknown as TInfoPanelMembers;

const renderMembersOf = (room: TRoom, list = members()) => {
  const setSecondaryProgressBarData = vi.fn();

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
        setRemoveUserConfirmation: vi.fn(),
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
        secondaryProgressDataStore: { setSecondaryProgressBarData },
      }}
    >
      <Members
        members={list}
        total={2}
        searchValue=""
        isFirstLoading={false}
        fetchMoreMembers={vi.fn(async () => {})}
        changeUserRole={vi.fn(async () => {})}
        scrollToTop={vi.fn()}
      />
    </Provider>,
  );

  return { setSecondaryProgressBarData };
};

const recordBob = (missingFileIds: number[] | "all") =>
  pendingAccessStore.record({ roomId: 14, userId: "bob", missingFileIds });

describe("Pending access in the Members view", () => {
  beforeEach(() => {
    mocks.requireUnlock.mockImplementation(async () => identity);
  });

  afterEach(() => {
    pendingAccessStore.clear(14, "bob");
  });

  it("Some files fail: the member row shows the pending marker", () => {
    recordBob([7]);

    renderMembersOf(listItemOf(privateRoomDto()));

    expect(screen.getByTestId("member_bob_pending")).toBeInTheDocument();
    expect(screen.queryByTestId("member_admin_pending")).toBeNull();
  });

  it("Retry succeeds: the pending marker disappears and the restored notice is shown", async () => {
    recordBob([7]);
    mocks.rewrapMissingFilesForMember.mockImplementation(async () => ({
      fileResults: [{ fileId: 7, success: true }],
      skippedMembers: [],
      missingFileIdsByMember: {},
    }));
    const { setSecondaryProgressBarData } = renderMembersOf(
      listItemOf(privateRoomDto()),
    );

    fireEvent.click(screen.getByTestId("member_bob_retry"));

    await waitFor(() =>
      expect(screen.queryByTestId("member_bob_pending")).toBeNull(),
    );
    expect(mocks.requireUnlock).toHaveBeenCalledWith("admin");
    expect(mocks.rewrapMissingFilesForMember).toHaveBeenCalledWith(
      14,
      "bob",
      [7],
      expect.objectContaining({ currentUserId: "admin", identity }),
    );
    expect(mocks.toastr.success).toHaveBeenCalledWith(
      expect.stringContaining("Common:EncryptedAccessRestored"),
    );
    expect(setSecondaryProgressBarData).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: OPERATIONS_NAME.roomReencryption,
        percent: 100,
        completed: true,
      }),
    );
  });

  it("Retry still fails: the pending marker stays and the partial failure is shown again", async () => {
    recordBob([7, 8]);
    mocks.rewrapMissingFilesForMember.mockImplementation(async () => ({
      fileResults: [
        { fileId: 7, success: true },
        { fileId: 8, success: false },
      ],
      skippedMembers: [],
      missingFileIdsByMember: { bob: [8] },
    }));
    renderMembersOf(listItemOf(privateRoomDto()));

    fireEvent.click(screen.getByTestId("member_bob_retry"));

    await waitFor(() =>
      expect(mocks.toastr.warning).toHaveBeenCalledWith(
        expect.stringContaining("Common:EncryptedReencryptPartialFailure"),
      ),
    );
    expect(screen.getByTestId("member_bob_pending")).toBeInTheDocument();
    expect(pendingAccessStore.get(14, "bob")?.missingFileIds).toEqual([8]);
  });

  it("Re-encryption fails as a whole: the retry wraps every encrypted file of the room for the member", async () => {
    recordBob("all");
    mocks.addMembersToEncryptedRoom.mockImplementation(async () => ({
      fileResults: [],
      skippedMembers: [],
      missingFileIdsByMember: {},
    }));
    renderMembersOf(listItemOf(privateRoomDto()));

    fireEvent.click(screen.getByTestId("member_bob_retry"));

    await waitFor(() =>
      expect(screen.queryByTestId("member_bob_pending")).toBeNull(),
    );
    expect(mocks.addMembersToEncryptedRoom).toHaveBeenCalledWith(
      14,
      [{ id: "bob", displayName: "bob tester" }],
      expect.objectContaining({ currentUserId: "admin", identity }),
    );
    expect(mocks.rewrapMissingFilesForMember).not.toHaveBeenCalled();
  });

  it("retries as the signed-in user when they are not on the loaded page of members", async () => {
    recordBob([7]);
    mocks.rewrapMissingFilesForMember.mockImplementation(async () => ({
      fileResults: [{ fileId: 7, success: true }],
      skippedMembers: [],
      missingFileIdsByMember: {},
    }));
    const withoutSelf = { ...members(), administrators: [] };
    renderMembersOf(listItemOf(privateRoomDto()), withoutSelf);

    fireEvent.click(screen.getByTestId("member_bob_retry"));

    await waitFor(() =>
      expect(screen.queryByTestId("member_bob_pending")).toBeNull(),
    );
    expect(mocks.requireUnlock).toHaveBeenCalledWith("admin");
    expect(mocks.rewrapMissingFilesForMember).toHaveBeenCalledWith(
      14,
      "bob",
      [7],
      expect.objectContaining({ currentUserId: "admin" }),
    );
  });

  it("re-wraps nothing when the unlock is declined", async () => {
    recordBob([7]);
    mocks.requireUnlock.mockImplementation(async () => null);
    renderMembersOf(listItemOf(privateRoomDto()));

    fireEvent.click(screen.getByTestId("member_bob_retry"));

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:EncryptionUnlockRequired",
      ),
    );
    expect(mocks.rewrapMissingFilesForMember).not.toHaveBeenCalled();
    expect(screen.getByTestId("member_bob_pending")).toBeInTheDocument();
  });

  it("offers the retry only to a user who may change the access of the room", () => {
    recordBob([7]);

    renderMembersOf(
      listItemOf(
        privateRoomDto({
          security: { ...privateRoomDto().security, EditAccess: false },
        }),
      ),
    );

    expect(screen.getByTestId("member_bob_pending")).toBeInTheDocument();
    expect(screen.queryByTestId("member_bob_retry")).toBeNull();
  });

  it("shows no marker in an ordinary room", () => {
    recordBob([7]);

    renderMembersOf(listItemOf(roomDto()));

    expect(screen.queryByTestId("member_bob_pending")).toBeNull();
  });
});
