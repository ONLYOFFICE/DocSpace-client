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

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { Provider } from "mobx-react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const encryption = vi.hoisted(() => ({
  isUnlocked: false,
  hasConfiguredKey: true,
  keysLoaded: true,
  requireIdentity: (() => Promise.resolve(null)) as () => Promise<unknown>,
}));

const recovery = vi.hoisted(() => ({ request: (() => {}) as () => void }));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => encryption,
}));

vi.mock("@docspace/shared/dialogs/key-recovery", () => ({
  useRecoverKeyFlow: () => ({
    request: recovery.request,
    available: true,
    isPending: false,
    modals: null,
  }),
}));

import { roomUnlockRequest } from "SRC_DIR/helpers/roomUnlockRequest";
import {
  clearEncryptedFilenameCache,
  rememberEncryptedFilename,
} from "@docspace/shared/services/encryption/filename-cache";
import { useResolvedFileTitle } from "@docspace/shared/hooks/useResolvedFileTitle";

const { default: PrivateRoomLockedBlock } = (await import(
  "../PrivateRoomLockedBlock"
)) as unknown as { default: React.ComponentType };

const ROOM = 9100;
const BLOCK = "private_room_locked_block";

const STORED_NAME = "3f2b9c1e-stored.txt";
const DECRYPTED_NAME = "budget-2026.txt";
const FILE = { id: 9101, title: STORED_NAME, encrypted: true };

/** A file row of the list, which shows a name the way the list does. */
const FileRow = () => <span data-testid="file_row">{useResolvedFileTitle(FILE)}</span>;

const renderBlock = ({ isPrivate = true, withRow = false } = {}) => {
  const syncEncryptedRoom = vi.fn();
  const stores = {
    selectedFolderStore: { id: ROOM },
    treeFoldersStore: { isPrivacyFolder: isPrivate },
    filesStore: { syncEncryptedRoom },
    userStore: {
      user: { id: "user-1" },
      encryptionKeys: [],
      setUserEncryptionKeys: vi.fn(),
    },
  };
  const view = render(
    <MemoryRouter>
      <Provider {...stores}>
        <PrivateRoomLockedBlock />
        {withRow ? <FileRow /> : null}
      </Provider>
    </MemoryRouter>,
  );

  return { syncEncryptedRoom, view };
};

const block = () => screen.getByTestId(BLOCK);
const unlockAction = () =>
  within(block()).getByRole("button", { name: "Common:UnlockKey" });

describe("A locked key is reported by a block in a private room", () => {
  beforeEach(() => {
    encryption.isUnlocked = false;
    encryption.hasConfiguredKey = true;
    encryption.keysLoaded = true;
    encryption.requireIdentity = vi.fn(async () => null);
    recovery.request = vi.fn();
    roomUnlockRequest.reset();
  });

  it("Prompt cancelled on entry", () => {
    roomUnlockRequest.settle(ROOM);
    renderBlock();

    expect(
      screen.getByRole("region", { name: "Common:PrivateRoomLockedBarTitle" }),
    ).toBe(block());
    expect(block()).toHaveTextContent("Common:PrivateRoomLockedBarText");
    expect(unlockAction()).toBeInTheDocument();
    expect(
      within(block()).getByRole("button", { name: "Common:ForgotPassphrase" }),
    ).toBeInTheDocument();
  });

  it("Entry prompt open", () => {
    renderBlock();

    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });

  it("Unlock from the block", async () => {
    roomUnlockRequest.settle(ROOM);
    encryption.requireIdentity = vi.fn(async () => {
      encryption.isUnlocked = true;
      return { publicKey: "pub" };
    });
    const { syncEncryptedRoom, view } = renderBlock();

    await userEvent.click(unlockAction());

    expect(encryption.requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).toHaveBeenCalledTimes(1);

    // The provider re-renders its consumers when the identity is unlocked.
    view.unmount();
    renderBlock();
    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });

  it("Unlock from the block cancelled", async () => {
    roomUnlockRequest.settle(ROOM);
    const { syncEncryptedRoom } = renderBlock();

    await userEvent.click(unlockAction());

    expect(encryption.requireIdentity).toHaveBeenCalledTimes(1);
    expect(syncEncryptedRoom).not.toHaveBeenCalled();
    expect(block()).toBeInTheDocument();
  });

  it("Key locks while the room is open", () => {
    // The folder was entered with an unlocked key, which settles its request.
    encryption.isUnlocked = true;
    roomUnlockRequest.settle(ROOM);
    const { view } = renderBlock();
    expect(screen.queryByTestId(BLOCK)).toBeNull();

    encryption.isUnlocked = false;
    view.unmount();
    renderBlock();

    expect(block()).toBeInTheDocument();
    expect(encryption.requireIdentity).not.toHaveBeenCalled();
  });

  it("Remembered device", () => {
    // The entry request is answered from the device: unlocked when it settles.
    renderBlock();
    expect(screen.queryByTestId(BLOCK)).toBeNull();

    encryption.isUnlocked = true;
    act(() => roomUnlockRequest.settle(ROOM));

    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });

  it.each([
    ["known to hold no key", true],
    ["not known", false],
  ])("User without a key: key list %s", (_name, keysLoaded) => {
    encryption.hasConfiguredKey = false;
    encryption.keysLoaded = keysLoaded;
    roomUnlockRequest.settle(ROOM);
    renderBlock();

    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });

  it("Forgot passphrase from the block", async () => {
    roomUnlockRequest.settle(ROOM);
    renderBlock();

    await userEvent.click(
      within(block()).getByRole("button", { name: "Common:ForgotPassphrase" }),
    );

    expect(recovery.request).toHaveBeenCalledTimes(1);
  });

  it("is not shown outside private rooms", () => {
    roomUnlockRequest.settle(ROOM);
    renderBlock({ isPrivate: false });

    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });

  it("is not shown for another room's answer", () => {
    runInAction(() => {
      roomUnlockRequest.settledRoomId = ROOM + 1;
    });
    renderBlock();

    expect(screen.queryByTestId(BLOCK)).toBeNull();
  });
});

describe("File names stay as stored while the key is locked", () => {
  beforeEach(() => {
    encryption.isUnlocked = false;
    encryption.hasConfiguredKey = true;
    encryption.keysLoaded = true;
    encryption.requireIdentity = vi.fn(async () => null);
    roomUnlockRequest.reset();
    clearEncryptedFilenameCache();
  });

  it("List under the block", () => {
    roomUnlockRequest.settle(ROOM);
    renderBlock({ withRow: true });

    expect(block()).toBeInTheDocument();
    expect(screen.getByTestId("file_row")).toHaveTextContent(STORED_NAME);
    expect(document.body.innerHTML).not.toContain(DECRYPTED_NAME);
  });

  it("Key locks while the names are decrypted", () => {
    encryption.isUnlocked = true;
    roomUnlockRequest.settle(ROOM);
    rememberEncryptedFilename(FILE.id, DECRYPTED_NAME);
    renderBlock({ withRow: true });
    expect(screen.getByTestId("file_row")).toHaveTextContent(DECRYPTED_NAME);

    // What the provider's lock does to the names it has decrypted; the row
    // stays mounted, as the list does.
    act(() => clearEncryptedFilenameCache());

    expect(screen.getByTestId("file_row")).toHaveTextContent(STORED_NAME);
    expect(document.body.innerHTML).not.toContain(DECRYPTED_NAME);
  });
});
