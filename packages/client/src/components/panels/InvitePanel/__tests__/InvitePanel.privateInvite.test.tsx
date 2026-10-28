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

import { ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  privateRoomDto,
  roomDto,
} from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

const mocks = vi.hoisted(() => ({
  requireUnlock: vi.fn(),
  addMembersToEncryptedRoom: vi.fn(),
  backfillEncryptedFilesForRoomMembers: vi.fn(),
  setRoomSecurity: vi.fn(),
  getRoomSecurityInfo: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => <Component t={(key: string) => key} {...props} />,
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  requireUnlock: mocks.requireUnlock,
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  addMembersToEncryptedRoom: mocks.addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers:
    mocks.backfillEncryptedFilesForRoomMembers,
}));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      setRoomSecurity: mocks.setRoomSecurity,
      getRoomSecurityInfo: mocks.getRoomSecurityInfo,
    },
    people: { inviteUsers: vi.fn() },
  },
}));

vi.mock("@docspace/shared/api/portal", () => ({
  getInviteLink: vi.fn(),
  createInviteLink: vi.fn(),
  updateInviteLink: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Part = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );

  return {
    ModalDialog: Object.assign(Part, {
      Container: Part,
      Header: Part,
      Body: Part,
      Footer: Part,
    }),
    ModalDialogType: { aside: "aside", modal: "modal" },
  };
});

vi.mock("@onlyoffice/apps-ui-kit/components/button", () => ({
  Button: ({
    testId,
    label,
    onClick,
    isDisabled,
  }: {
    testId?: string;
    label?: string;
    onClick?: () => void;
    isDisabled?: boolean;
  }) => (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={isDisabled}
    >
      {label}
    </button>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/context/InterfaceDirectionContext", () => ({
  useInterfaceDirection: () => ({ isRTL: false }),
}));

vi.mock("@onlyoffice/apps-ui-kit/selectors/People", () => ({
  default: () => null,
}));
vi.mock("SRC_DIR/components/PaidQuotaLimitError", () => ({
  default: () => null,
}));
vi.mock("../../LinkSettingsPanel", () => ({ default: () => null }));
vi.mock("../sub-components/ExternalLinks", () => ({ default: () => null }));
vi.mock("../sub-components/InviteInput", () => ({ default: () => null }));
vi.mock("../sub-components/ItemsList", () => ({ default: () => null }));

// Every prop comes from the stores below; the inferred inject typing of the
// .js panel still lists them as required.
const InvitePanel = (await import("../index"))
  .default as unknown as React.ComponentType;

const ROOM_ID = 10;

const BOB_ITEM = {
  id: "bob",
  avatar: "/avatar.png",
  displayName: "bob tester",
  email: "bob@example.com",
  access: ShareAccessRights.Editing,
};

const renderInviteFromList = (room: TRoom) => {
  const getFolderInfo = vi.fn();
  const setInviteItems = vi.fn();
  const setInvitePanelOptions = vi.fn();

  render(
    <Provider
      settingsStore={{
        theme: {},
        standalone: false,
        allowInvitingGuests: true,
        checkGuests: vi.fn(),
        hasGuests: false,
        culture: "en",
      }}
      filesStore={{ folders: [room], getFolderInfo }}
      dialogsStore={{
        inviteItems: [BOB_ITEM],
        invitePanelOptions: {
          visible: true,
          roomId: ROOM_ID,
          hideSelector: false,
          defaultAccess: ShareAccessRights.ReadOnly,
        },
        setInviteItems,
        setInvitePanelOptions,
        setInviteLanguage: vi.fn(),
        setIsNewUserByCurrentUser: vi.fn(),
      }}
      infoPanelStore={{
        setIsMobileHidden: vi.fn(),
        updateInfoPanelMembers: vi.fn(),
      }}
      authStore={{ isRoomAdmin: false }}
      currentQuotaStore={{ isUserTariffLimit: false }}
      currentTariffStatusStore={{ isCommunity: false }}
      userStore={{ user: { id: "admin", isOwner: true, isAdmin: true } }}
      peopleStore={{}}
      uploadDataStore={{
        secondaryProgressDataStore: { setSecondaryProgressBarData: vi.fn() },
      }}
    >
      <InvitePanel />
    </Provider>,
  );

  return { getFolderInfo, setInviteItems, setInvitePanelOptions };
};

const closedPanel = expect.objectContaining({ visible: false });

describe("Invite opened from the list", () => {
  const identity = { userId: "admin" };

  beforeEach(() => {
    mocks.getRoomSecurityInfo.mockImplementation(async () => ({ items: [] }));
    mocks.setRoomSecurity.mockImplementation(async () => ({}));
    mocks.addMembersToEncryptedRoom.mockImplementation(async () => ({
      fileResults: [],
      skippedMembers: [],
    }));
    mocks.backfillEncryptedFilesForRoomMembers.mockImplementation(
      async () => {},
    );
  });

  it("raises the passphrase prompt and sends nothing when it is dismissed", async () => {
    mocks.requireUnlock.mockImplementation(async () => null);
    const { getFolderInfo } = renderInviteFromList(
      privateRoomDto({ id: ROOM_ID, title: "Pirate room" }),
    );

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    await waitFor(() =>
      expect(mocks.toastr.error).toHaveBeenCalledWith(
        "Common:EncryptionLockedAddMembers",
      ),
    );
    expect(mocks.requireUnlock).toHaveBeenCalledWith("admin");
    expect(mocks.setRoomSecurity).not.toHaveBeenCalled();
    expect(getFolderInfo).not.toHaveBeenCalled();
  });

  it("re-wraps the file keys for the new member once unlocked", async () => {
    mocks.requireUnlock.mockImplementation(async () => identity);
    renderInviteFromList(privateRoomDto({ id: ROOM_ID, title: "Pirate room" }));

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    await waitFor(() =>
      expect(mocks.addMembersToEncryptedRoom).toHaveBeenCalledWith(
        ROOM_ID,
        [{ id: "bob", displayName: "bob tester" }],
        expect.objectContaining({ currentUserId: "admin", identity }),
      ),
    );
    expect(mocks.setRoomSecurity).toHaveBeenCalledWith(
      ROOM_ID,
      expect.objectContaining({
        invitations: [{ id: "bob", access: ShareAccessRights.Editing }],
      }),
    );
    expect(mocks.setRoomSecurity.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.addMembersToEncryptedRoom.mock.invocationCallOrder[0],
    );
  });

  it("All invitees have verified keys: the panel lists them as invited and closes on Close", async () => {
    mocks.requireUnlock.mockImplementation(async () => identity);
    mocks.addMembersToEncryptedRoom.mockImplementation(async () => ({
      fileResults: [{ fileId: 1, success: true }],
      skippedMembers: [],
      missingFileIdsByMember: {},
    }));
    const { setInvitePanelOptions } = renderInviteFromList(
      privateRoomDto({ id: ROOM_ID, title: "Pirate room" }),
    );

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    expect(
      await screen.findByTestId("invite_panel_result_granted"),
    ).toHaveTextContent("bob tester");
    expect(setInvitePanelOptions).not.toHaveBeenCalledWith(closedPanel);
    expect(
      screen.queryByTestId("invite_panel_invite_again_button"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("invite_panel_close_button"));

    expect(setInvitePanelOptions).toHaveBeenCalledWith(closedPanel);
  });

  it("Mixed invitation: the panel stays open listing the skipped invitee with the reason", async () => {
    mocks.requireUnlock.mockImplementation(async () => identity);
    mocks.addMembersToEncryptedRoom.mockImplementation(async () => ({
      fileResults: [],
      skippedMembers: [{ id: "bob", reason: "no-key" }],
      missingFileIdsByMember: {},
    }));
    const { setInviteItems, setInvitePanelOptions } = renderInviteFromList(
      privateRoomDto({ id: ROOM_ID, title: "Pirate room" }),
    );

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    expect(
      await screen.findByTestId("invite_panel_result_skipped"),
    ).toHaveTextContent("Common:EncryptedSkippedNoKeys");
    expect(setInvitePanelOptions).not.toHaveBeenCalledWith(closedPanel);

    fireEvent.click(screen.getByTestId("invite_panel_invite_again_button"));

    expect(setInviteItems).toHaveBeenCalledWith([BOB_ITEM]);
    expect(screen.queryByTestId("invite_panel_result")).not.toBeInTheDocument();
    expect(screen.getByTestId("invite_panel_send_button")).toBeInTheDocument();
  });

  it("Some files fail: the panel lists the invitee as pending with the failed file count", async () => {
    mocks.requireUnlock.mockImplementation(async () => identity);
    mocks.addMembersToEncryptedRoom.mockImplementation(async () => ({
      fileResults: [
        { fileId: 1, success: true },
        { fileId: 2, success: false },
      ],
      skippedMembers: [],
      missingFileIdsByMember: { bob: [2] },
    }));
    renderInviteFromList(privateRoomDto({ id: ROOM_ID, title: "Pirate room" }));

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    const pending = await screen.findByTestId("invite_panel_result_pending");
    expect(pending).toHaveTextContent("Common:EncryptedAccessPending");
    expect(pending).toHaveTextContent("bob tester");
    expect(pending).toHaveTextContent("Common:EncryptedReencryptPartialFailure");
    expect(
      screen.queryByTestId("invite_panel_result_granted"),
    ).not.toBeInTheDocument();
  });

  it("sends an ordinary room's invitations without unlocking", async () => {
    const { setInvitePanelOptions } = renderInviteFromList(
      roomDto({ id: ROOM_ID }),
    );

    fireEvent.click(screen.getByTestId("invite_panel_send_button"));

    await waitFor(() =>
      expect(mocks.toastr.success).toHaveBeenCalledWith("Common:UsersInvited"),
    );
    expect(mocks.setRoomSecurity).toHaveBeenCalled();
    expect(mocks.requireUnlock).not.toHaveBeenCalled();
    expect(mocks.addMembersToEncryptedRoom).not.toHaveBeenCalled();
    expect(setInvitePanelOptions).toHaveBeenCalledWith(closedPanel);
    expect(screen.queryByTestId("invite_panel_result")).not.toBeInTheDocument();
  });
});
