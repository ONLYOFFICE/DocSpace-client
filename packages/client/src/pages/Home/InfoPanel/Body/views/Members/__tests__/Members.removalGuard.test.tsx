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
import { describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { privateRoomDto } from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";
import { getActiveUploadCountForRoomImpl } from "SRC_DIR/store/uploadDataStore/selectors.helpers";
import type { TUploadFile } from "SRC_DIR/store/uploadDataStore/helpers";

import type { TInfoPanelMembers } from "../Members.types";

const mocks = vi.hoisted(() => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}|${options.count}`,
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
    <button
      type="button"
      data-testid={`member_${user.id}_remove`}
      onClick={() =>
        onSelectOption?.({ key: "remove", access: ShareAccessRights.None })
      }
    />
  ),
}));

const { default: Members } = await import("../index");

const ROOM_ID = 14;
const SUBFOLDER_ID = 41;

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

const queued = (
  toFolderId: number,
  action: TUploadFile["action"] = "upload",
): TUploadFile =>
  ({
    toFolderId,
    encryptionRoomId: ROOM_ID,
    action,
  }) as TUploadFile;

const renderMembersOf = (room: TRoom, uploads: TUploadFile[]) => {
  const setRemoveUserConfirmation = vi.fn();

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
        getActiveUploadCountForRoom: (roomId: number | string) =>
          getActiveUploadCountForRoomImpl(roomId, { files: uploads }),
        secondaryProgressDataStore: { setSecondaryProgressBarData: vi.fn() },
      }}
    >
      <Members
        members={members()}
        total={1}
        searchValue=""
        isFirstLoading={false}
        fetchMoreMembers={vi.fn(async () => {})}
        changeUserRole={vi.fn(async () => {})}
        scrollToTop={vi.fn()}
      />
    </Provider>,
  );

  return { setRemoveUserConfirmation };
};

describe("Member removal is blocked during active uploads", () => {
  it("Uploads in flight", () => {
    const { setRemoveUserConfirmation } = renderMembersOf(
      privateRoomDto({ id: ROOM_ID }),
      [queued(ROOM_ID)],
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));

    expect(mocks.toastr.warning).toHaveBeenCalledWith(
      "Common:CannotRemoveMemberWhileUploads|1",
    );
    expect(setRemoveUserConfirmation).not.toHaveBeenCalled();
  });

  it("Uploads into a subfolder", () => {
    const { setRemoveUserConfirmation } = renderMembersOf(
      privateRoomDto({ id: ROOM_ID }),
      [
        queued(SUBFOLDER_ID),
        queued(SUBFOLDER_ID),
        queued(SUBFOLDER_ID, "uploaded"),
      ],
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));

    expect(mocks.toastr.warning).toHaveBeenCalledWith(
      "Common:CannotRemoveMemberWhileUploads|2",
    );
    expect(setRemoveUserConfirmation).not.toHaveBeenCalled();
  });

  it("opens the removal confirmation once every upload into the room has finished", () => {
    const { setRemoveUserConfirmation } = renderMembersOf(
      privateRoomDto({ id: ROOM_ID }),
      [queued(ROOM_ID, "uploaded"), queued(SUBFOLDER_ID, "uploaded")],
    );

    fireEvent.click(screen.getByTestId("member_bob_remove"));

    expect(mocks.toastr.warning).not.toHaveBeenCalled();
    expect(setRemoveUserConfirmation).toHaveBeenCalledWith(
      true,
      expect.any(Function),
      true,
    );
  });
});
