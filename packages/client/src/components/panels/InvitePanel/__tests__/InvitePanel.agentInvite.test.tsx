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
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { roomDto } from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

const mocks = vi.hoisted(() => ({
  getRoomSecurityInfo: vi.fn(),
  itemsList: vi.fn(),
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => <Component t={(key: string) => key} {...props} />,
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@docspace/shared/api", () => ({
  default: {
    rooms: {
      setRoomSecurity: vi.fn(),
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
// The "Invite via link" block, drawn as a mark.
vi.mock("../sub-components/ExternalLinks", () => ({
  default: () => <div data-testid="invite_panel_external_links" />,
}));
vi.mock("../sub-components/InviteInput", () => ({
  default: () => <div data-testid="invite_panel_invite_input" />,
}));
vi.mock("../sub-components/ItemsList", () => ({
  default: (props: { externalLinksVisible: boolean }) => {
    mocks.itemsList(props);
    return null;
  },
}));

// Every prop comes from the stores below; the inferred inject typing of the
// .js panel still lists them as required.
const InvitePanel = (await import("../index"))
  .default as unknown as React.ComponentType;

const ROOM_ID = 10;

const renderInvite = (room: TRoom) =>
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
      filesStore={{ folders: [room], getFolderInfo: vi.fn() }}
      dialogsStore={{
        inviteItems: [
          {
            id: "bob",
            avatar: "/avatar.png",
            displayName: "bob tester",
            email: "bob@example.com",
            access: ShareAccessRights.Editing,
          },
        ],
        invitePanelOptions: {
          visible: true,
          roomId: ROOM_ID,
          hideSelector: false,
          defaultAccess: ShareAccessRights.ReadOnly,
        },
        setInviteItems: vi.fn(),
        setInvitePanelOptions: vi.fn(),
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

// A link the room was given before: an agent may still carry one.
const enabledLink = {
  items: [
    {
      access: ShareAccessRights.RoomManager,
      sharedTo: { id: "link", title: "Invite", shareLink: "https://link" },
    },
  ],
};

describe("Invite via link in the invite panel", () => {
  beforeEach(() => {
    mocks.getRoomSecurityInfo.mockImplementation(async () => enabledLink);
  });

  it("is not offered for an agent, whose members are invited by name only", async () => {
    renderInvite(
      roomDto({ id: ROOM_ID, title: "Agent", roomType: RoomsType.AiProjectRoom }),
    );

    await waitFor(() => expect(mocks.itemsList).toHaveBeenCalled());
    await waitFor(() =>
      expect(mocks.itemsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ roomType: RoomsType.AiProjectRoom }),
      ),
    );
    expect(screen.getByTestId("invite_panel_invite_input")).toBeInTheDocument();
    expect(screen.queryByTestId("invite_panel_external_links")).toBeNull();
    // The list is laid out as if no link block stood above it.
    expect(mocks.itemsList).toHaveBeenLastCalledWith(
      expect.objectContaining({ externalLinksVisible: false }),
    );
  });

  it("is offered for a room", async () => {
    renderInvite(roomDto({ id: ROOM_ID, title: "Room" }));

    expect(
      await screen.findByTestId("invite_panel_external_links"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.itemsList).toHaveBeenLastCalledWith(
        expect.objectContaining({ externalLinksVisible: true }),
      ),
    );
  });
});
