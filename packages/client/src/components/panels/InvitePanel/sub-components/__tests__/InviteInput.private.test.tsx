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
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  AccountsSearchArea,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

const mocks = vi.hoisted(() => ({
  getMembersList: vi.fn(),
  setInviteItems: vi.fn(),
}));

vi.mock("@docspace/shared/api/people", () => ({
  getMembersList: mocks.getMembersList,
  getUserList: vi.fn(),
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => <Component t={(key: string) => key} {...props} />,
}));

vi.mock("SRC_DIR/HOCs/withCultureNames", () => ({
  default:
    (Component: React.ComponentType<{ cultureNames: unknown[] }>) =>
    (props: object) => (
      <Component cultureNames={[{ key: "en", label: "English" }]} {...props} />
    ),
}));

// Every prop but the ones below comes from the stores.
const InviteInput = (await import("../InviteInput"))
  .default as unknown as React.ComponentType<Record<string, unknown>>;

const ROOM_ID = 10;
const EMAIL = "bob@example.com";

const renderInput = ({
  isPrivateRoom,
  allowInvitingGuests = true,
}: {
  isPrivateRoom: boolean;
  allowInvitingGuests?: boolean;
}) => {
  // The panel owns the typed value and the found people.
  const Panel = () => {
    const [inputValue, setInputValue] = useState("");
    const [usersList, setUsersList] = useState<unknown[]>([]);
    return (
      <InviteInput
        t={(key: string) => key}
        onClose={vi.fn()}
        setCultureKey={vi.fn()}
        roomType={RoomsType.CustomRoom}
        inputsRef={{ current: null }}
        setAddUsersPanelVisible={vi.fn()}
        isMobileView={false}
        removeExist={(items: unknown[]) => items}
        inputValue={inputValue}
        setInputValue={setInputValue}
        usersList={usersList}
        setUsersList={setUsersList}
        isPrivateRoom={isPrivateRoom}
      />
    );
  };

  return render(
    <Provider
      settingsStore={{ culture: "en", allowInvitingGuests }}
      dialogsStore={{
        invitePanelOptions: {
          roomId: ROOM_ID,
          hideSelector: false,
          defaultAccess: ShareAccessRights.ReadOnly,
        },
        inviteItems: [],
        setInviteItems: mocks.setInviteItems,
        setInviteLanguage: vi.fn(),
        culture: { key: "en", label: "English" },
        isPaidUserAccess: () => false,
      }}
      userStore={{ user: { isOwner: true, isAdmin: true } }}
      currentQuotaStore={{ isUserTariffLimit: false }}
    >
      <Panel />
    </Provider>,
  );
};

const search = (value: string) =>
  fireEvent.change(screen.getByTestId("invite_panel_search_input"), {
    target: { value },
  });

describe("Searching invitees", () => {
  it("asks the people area only in a private room and offers no e-mail invitation", async () => {
    mocks.getMembersList.mockResolvedValue({ items: [] });
    renderInput({ isPrivateRoom: true });

    search(EMAIL);

    await waitFor(() => expect(mocks.getMembersList).toHaveBeenCalledTimes(1));
    expect(mocks.getMembersList).toHaveBeenCalledWith(
      AccountsSearchArea.People,
      ROOM_ID,
      expect.anything(),
    );
    expect(await screen.findByText("Common:NotFoundUsers")).toBeInTheDocument();
    expect(screen.queryByText(EMAIL)).not.toBeInTheDocument();

    fireEvent.keyUp(document, { key: "Enter" });

    expect(mocks.setInviteItems).not.toHaveBeenCalled();
  });

  it("asks every area in an ordinary room", async () => {
    mocks.getMembersList.mockResolvedValue({ items: [] });
    renderInput({ isPrivateRoom: false });

    search(EMAIL);

    await waitFor(() =>
      expect(mocks.getMembersList).toHaveBeenCalledWith(
        AccountsSearchArea.Any,
        ROOM_ID,
        expect.anything(),
      ),
    );
  });
});

describe("Portal allows inviting guests", () => {
  it("offers members only in a private room, without an invitation language", () => {
    renderInput({ isPrivateRoom: true, allowInvitingGuests: true });

    expect(
      screen.getByText("Common:InviteToRoomManuallyInfoMembers"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("invite_panel_search_input")).toHaveAttribute(
      "placeholder",
      "Common:InviteToRoomAddPlaceholder",
    );
    expect(
      screen.queryByTestId("invite_panel_language_combobox"),
    ).not.toBeInTheDocument();
  });
});
