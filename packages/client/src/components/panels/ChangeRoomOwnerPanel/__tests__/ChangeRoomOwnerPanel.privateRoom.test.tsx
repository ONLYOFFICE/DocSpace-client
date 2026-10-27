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

import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MembersSubjectType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { privateRoomDto } from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

type TSelectorProps = {
  excludeItems?: string[];
  onSubmit: (
    user: { id: string; label?: string; displayName?: string }[],
    access: unknown,
    footerInput: unknown,
    isChecked: boolean,
  ) => Promise<void>;
};

const mocks = vi.hoisted(() => ({
  getRoomMembers: vi.fn(),
  getUserList: vi.fn(),
  validateMembersForEncryption: vi.fn(),
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  selector: null as TSelectorProps | null,
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => <Component t={(key: string) => key} {...props} />,
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

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

vi.mock("@onlyoffice/apps-ui-kit/selectors/People", () => ({
  default: (props: TSelectorProps) => {
    mocks.selector = props;
    return <div data-testid="people_selector" />;
  },
}));

// Every prop comes from the stores below; the inferred inject typing of the
// .js panel still lists them as required.
const ChangeRoomOwnerPanel = (await import("../index"))
  .default as unknown as React.ComponentType<{ useModal?: boolean }>;

const ROOM_ID = 14;

const renderPanelFor = (room: TRoom) => {
  const changeRoomOwner = vi.fn(async () => {});

  render(
    <Provider
      dialogsStore={{
        changeRoomOwnerIsVisible: true,
        setChangeRoomOwnerIsVisible: vi.fn(),
      }}
      filesStore={{ selection: [room], bufferSelection: null }}
      selectedFolderStore={{}}
      filesActionsStore={{ changeRoomOwner }}
      userStore={{ user: { id: "me" } }}
      infoPanelStore={{ updateInfoPanelMembers: vi.fn() }}
    >
      <ChangeRoomOwnerPanel useModal={false} />
    </Provider>,
  );

  return { changeRoomOwner };
};

const member = (id: string, subjectType = MembersSubjectType.User) => ({
  subjectType,
  sharedTo: { id },
});

describe("Change owner of a private room", () => {
  beforeEach(() => {
    mocks.selector = null;
    mocks.getRoomMembers.mockImplementation(async () => ({
      items: [member("bob"), member("group-1", MembersSubjectType.Group)],
    }));
    mocks.getUserList.mockImplementation(async () => ({
      items: [{ id: "bob" }, { id: "carol" }, { id: "me" }],
    }));
    mocks.validateMembersForEncryption.mockImplementation(async () => ({
      skipped: [],
    }));
  });

  it("offers room members only: the leaver and administrators outside the room are excluded", async () => {
    renderPanelFor(privateRoomDto({ id: ROOM_ID }));

    await waitFor(() => expect(screen.getByTestId("people_selector")));
    expect(mocks.selector?.excludeItems).toEqual(["me", "carol"]);
    expect(mocks.getRoomMembers).toHaveBeenCalledWith(
      ROOM_ID,
      { count: 100 },
      expect.any(AbortSignal),
    );
    const [adminsFilter] = mocks.getUserList.mock.calls[0];
    expect(adminsFilter.pageCount).toBe(100);
  });

  it("offers every candidate when the room members cannot be read", async () => {
    mocks.getRoomMembers.mockImplementation(async () => {
      throw new Error("403");
    });
    renderPanelFor(privateRoomDto({ id: ROOM_ID }));

    await waitFor(() => expect(screen.getByTestId("people_selector")));
    expect(mocks.selector?.excludeItems).toEqual(["me"]);
  });

  it("refuses a new owner without a key", async () => {
    mocks.validateMembersForEncryption.mockImplementation(async () => ({
      skipped: [{ id: "bob", reason: "no-key", displayName: "Bob" }],
    }));
    const { changeRoomOwner } = renderPanelFor(
      privateRoomDto({ id: ROOM_ID }),
    );
    await waitFor(() => expect(screen.getByTestId("people_selector")));

    await act(() =>
      mocks.selector!.onSubmit([{ id: "bob", label: "Bob" }], null, "", true),
    );

    expect(mocks.validateMembersForEncryption).toHaveBeenCalledWith(
      ROOM_ID,
      ["bob"],
      "me",
      undefined,
      { bob: "Bob" },
    );
    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedChangeOwnerNoKeys",
    );
    expect(changeRoomOwner).not.toHaveBeenCalled();
  });

  it("refuses a new owner whose key changed", async () => {
    mocks.validateMembersForEncryption.mockImplementation(async () => ({
      skipped: [{ id: "bob", reason: "key-mismatch-refused" }],
    }));
    const { changeRoomOwner } = renderPanelFor(
      privateRoomDto({ id: ROOM_ID }),
    );
    await waitFor(() => expect(screen.getByTestId("people_selector")));

    await act(() =>
      mocks.selector!.onSubmit([{ id: "bob", label: "Bob" }], null, "", true),
    );

    expect(mocks.toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedChangeOwnerKeyMismatch",
    );
    expect(changeRoomOwner).not.toHaveBeenCalled();
  });

  it("hands a new owner with a verified key to the owner change", async () => {
    const { changeRoomOwner } = renderPanelFor(
      privateRoomDto({ id: ROOM_ID }),
    );
    await waitFor(() => expect(screen.getByTestId("people_selector")));

    await act(() =>
      mocks.selector!.onSubmit([{ id: "bob", label: "Bob" }], null, "", true),
    );

    expect(changeRoomOwner).toHaveBeenCalledWith(expect.anything(), "bob", true);
    expect(mocks.toastr.error).not.toHaveBeenCalled();
  });
});
