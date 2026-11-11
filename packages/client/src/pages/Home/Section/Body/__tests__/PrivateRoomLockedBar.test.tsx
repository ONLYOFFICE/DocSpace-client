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

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const encryption = vi.hoisted(() => ({
  isUnlocked: false,
  hasConfiguredKey: true,
  keysLoaded: true,
  requireIdentity: (() => Promise.resolve(null)) as () => Promise<unknown>,
}));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => encryption,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/public-room-bar", () => ({
  default: ({
    headerText,
    bodyText,
    dataTestId,
  }: {
    headerText: React.ReactNode;
    bodyText: React.ReactNode;
    dataTestId: string;
  }) => (
    <div data-testid={dataTestId}>
      <span>{headerText}</span>
      <div>{bodyText}</div>
    </div>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/link", () => ({
  LinkType: { action: "action" },
  Link: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

import { roomUnlockRequest } from "SRC_DIR/helpers/roomUnlockRequest";

const { default: PrivateRoomLockedBar } = (await import(
  "../PrivateRoomLockedBar"
)) as unknown as { default: React.ComponentType };

const ROOM = 9100;
const BAR = "private_room_locked_bar";

const renderBar = ({ isPrivate = true } = {}) => {
  const syncEncryptedRoom = vi.fn();
  const stores = {
    selectedFolderStore: { private: isPrivate, id: ROOM },
    filesStore: { syncEncryptedRoom },
  };
  const view = render(
    <Provider {...stores}>
      <PrivateRoomLockedBar />
    </Provider>,
  );

  return { syncEncryptedRoom, view };
};

const unlockAction = () =>
  screen.getByRole("button", { name: "Common:UnlockKey" });

describe("A locked key is shown in a private room", () => {
  beforeEach(() => {
    encryption.isUnlocked = false;
    encryption.hasConfiguredKey = true;
    encryption.keysLoaded = true;
    encryption.requireIdentity = vi.fn(async () => null);
    roomUnlockRequest.reset();
  });

  it("Prompt cancelled on entry", () => {
    roomUnlockRequest.settle(ROOM);
    renderBar();

    const bar = screen.getByTestId(BAR);
    expect(bar).toHaveTextContent("Common:PrivateRoomLockedBarTitle");
    expect(bar).toHaveTextContent("Common:PrivateRoomLockedBarText");
    expect(unlockAction()).toBeInTheDocument();
  });

  it("Entry prompt open", () => {
    renderBar();

    expect(screen.queryByTestId(BAR)).toBeNull();

    act(() => roomUnlockRequest.settle(ROOM));

    expect(screen.getByTestId(BAR)).toBeInTheDocument();
  });

  it("Unlock from the bar", async () => {
    roomUnlockRequest.settle(ROOM);
    encryption.requireIdentity = vi.fn(async () => {
      encryption.isUnlocked = true;
      return { publicKey: "pub" };
    });
    const { syncEncryptedRoom, view } = renderBar();

    await userEvent.click(unlockAction());

    expect(encryption.requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).toHaveBeenCalledTimes(1);

    // The provider re-renders its consumers when the identity is unlocked.
    view.unmount();
    renderBar();
    expect(screen.queryByTestId(BAR)).toBeNull();
  });

  it("Unlock from the bar cancelled", async () => {
    roomUnlockRequest.settle(ROOM);
    const { syncEncryptedRoom } = renderBar();

    await userEvent.click(unlockAction());

    expect(encryption.requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).not.toHaveBeenCalled();
    expect(screen.getByTestId(BAR)).toBeInTheDocument();
  });

  it("Key locks while the room is open", () => {
    // The folder was entered with an unlocked key, which settles its request.
    encryption.isUnlocked = true;
    roomUnlockRequest.settle(ROOM);
    const { view } = renderBar();
    expect(screen.queryByTestId(BAR)).toBeNull();

    encryption.isUnlocked = false;
    view.unmount();
    renderBar();

    expect(screen.getByTestId(BAR)).toBeInTheDocument();
    expect(encryption.requireIdentity).not.toHaveBeenCalled();
  });

  it("Remembered device", () => {
    // The entry request is answered from the device: unlocked when it settles.
    renderBar();
    expect(screen.queryByTestId(BAR)).toBeNull();

    encryption.isUnlocked = true;
    act(() => roomUnlockRequest.settle(ROOM));

    expect(screen.queryByTestId(BAR)).toBeNull();
  });

  it.each([
    ["known to hold no key", true],
    ["not known", false],
  ])("User without a key: key list %s", (_name, keysLoaded) => {
    encryption.hasConfiguredKey = false;
    encryption.keysLoaded = keysLoaded;
    roomUnlockRequest.settle(ROOM);
    renderBar();

    expect(screen.queryByTestId(BAR)).toBeNull();
  });

  it("is not shown outside private rooms", () => {
    roomUnlockRequest.settle(ROOM);
    renderBar({ isPrivate: false });

    expect(screen.queryByTestId(BAR)).toBeNull();
  });

  it("is not shown for another folder's answer", () => {
    runInAction(() => {
      roomUnlockRequest.settledFolderId = ROOM + 1;
    });
    renderBar();

    expect(screen.queryByTestId(BAR)).toBeNull();
  });
});
