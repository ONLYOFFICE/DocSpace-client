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
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  privateRoomDto,
  roomDto,
} from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

const mocks = vi.hoisted(() => ({
  requireUnlock: vi.fn(),
  getRoomCandidateKeys: vi.fn(),
  validateMembersForEncryption: vi.fn(),
  addMembersToEncryptedRoom: vi.fn(),
  backfillEncryptedFilesForRoomMembers: vi.fn(),
  setRoomSecurity: vi.fn(),
  getRoomSecurityInfo: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  inviteInput: null as null | { setAddUsersPanelVisible: (v: boolean) => void },
  peopleSelector: null as null | {
    onSubmit: (users: object[], access: { access: number }) => void;
    getItemMarks?: (
      people: { id: string }[],
    ) => Promise<Record<string, { label: string; description: string }>>;
  },
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  // The key, then the values it is given, so that a test can find a name.
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => (
      <Component
        t={(key: string, values?: object) =>
          values ? `${key} ${JSON.stringify(values)}` : key
        }
        {...props}
      />
    ),
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  requireUnlock: mocks.requireUnlock,
}));

vi.mock("@docspace/shared/services/private-room/room-encryption", async (io) => ({
  waitsForAccess: (
    (await io()) as typeof import("@docspace/shared/services/private-room/room-encryption")
  ).waitsForAccess,
  addMembersToEncryptedRoom: mocks.addMembersToEncryptedRoom,
  backfillEncryptedFilesForRoomMembers:
    mocks.backfillEncryptedFilesForRoomMembers,
  validateMembersForEncryption: mocks.validateMembersForEncryption,
}));

vi.mock("@docspace/shared/api/privacy", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getRoomCandidateKeys: mocks.getRoomCandidateKeys,
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

vi.mock("@docspace/shared/api/rooms", () => ({
  setRoomSecurity: mocks.setRoomSecurity,
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
  default: (props: NonNullable<typeof mocks.peopleSelector>) => {
    mocks.peopleSelector = props;
    return null;
  },
}));
vi.mock("SRC_DIR/components/PaidQuotaLimitError", () => ({
  default: () => null,
}));
vi.mock("../../LinkSettingsPanel", () => ({ default: () => null }));
vi.mock("../sub-components/InviteInput", () => ({
  default: (props: NonNullable<typeof mocks.inviteInput>) => {
    mocks.inviteInput = props;
    return null;
  },
}));
vi.mock("../sub-components/ItemsList", () => ({ default: () => null }));

// Every prop comes from the stores below; the inferred inject typing of the
// .js panel still lists them as required.
const InvitePanel = (await import("../index"))
  .default as unknown as React.ComponentType;

const ROOM_ID = 10;

const LINK_CONTROLS = [
  "invite_panel_external_links_toggle",
  "link-settings_icon",
  "invite_panel_external_link_input",
  "invite_panel_external_link_access",
];

const ROOM_LINK = {
  access: ShareAccessRights.ReadOnly,
  sharedTo: {
    id: "link-1",
    title: "Invite link",
    shareLink: "https://example.com/invite",
    expirationDate: null,
    currentUseCount: 0,
    maxUseCount: null,
  },
};

const renderPanel = (room: TRoom) => {
  const inviteItems: unknown[] = [];
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
        inviteItems,
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
      aiProjectsStore={{ activeProject: null }}
      uploadDataStore={{
        secondaryProgressDataStore: { setSecondaryProgressBarData: vi.fn() },
      }}
    >
      <InvitePanel />
    </Provider>,
  );

};

describe("Invite panel opened", () => {
  it("renders no link controls for a private room", async () => {
    mocks.getRoomSecurityInfo.mockResolvedValue({ items: [ROOM_LINK] });
    renderPanel(privateRoomDto({ id: ROOM_ID, title: "Pirate room" }));

    await screen.findByTestId("invite_panel_send_button");

    for (const testId of LINK_CONTROLS) {
      expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    }
    expect(mocks.getRoomSecurityInfo).not.toHaveBeenCalled();
  });

  it("renders the link controls for an ordinary room with its links on", async () => {
    mocks.getRoomSecurityInfo.mockResolvedValue({ items: [ROOM_LINK] });
    renderPanel(roomDto({ id: ROOM_ID, title: "Public room" }));

    await waitFor(() =>
      expect(
        screen.getByTestId("invite_panel_external_link_input"),
      ).toBeInTheDocument(),
    );
    for (const testId of LINK_CONTROLS) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });
});
