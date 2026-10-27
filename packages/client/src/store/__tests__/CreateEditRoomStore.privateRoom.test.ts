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

import { describe, it, expect, vi } from "vitest";

import type { TFunction } from "i18next";

import { RoomsType } from "@docspace/shared/enums";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (k: string) => k, exists: () => true, language: "en" },
}));

const CreateEditRoomStore = (await import("../CreateEditRoomStore")).default;
const { toastr } = await import("@onlyoffice/apps-ui-kit/components/toast");

const t = ((key: string) => key) as unknown as TFunction;

/** CreateEditRoomStore with only the deps onCreateRoom touches before the room exists. */
const createStore = (userStore: Record<string, unknown>) => {
  const createRoom = vi.fn(async () => ({ id: 77 }));
  const store = new CreateEditRoomStore(
    ...([
      { createRoom, selection: [], bufferSelection: null, userStore },
      {
        processCreatingRoomFromData: false,
        setProcessCreatingRoomFromData: vi.fn(),
        preparingDataForCopyingToRoom: vi.fn(),
      },
      {},
      {},
      { deleteThirdParty: vi.fn() },
      {},
      { isDefaultRoomsQuotaSet: false },
      {},
      {
        cover: null,
        clearCoverProps: vi.fn(),
        setIsNewRoomByCurrentUser: vi.fn(),
      },
      {},
      {},
    ] as unknown as ConstructorParameters<typeof CreateEditRoomStore>),
  );
  store.setRoomParams({
    type: RoomsType.CustomRoom,
    isPrivate: true,
    title: "Vault",
    tags: [],
    storageLocation: { isThirdparty: false },
    icon: { uploadedFile: null },
  } as unknown as Parameters<typeof store.setRoomParams>[0]);
  return { store, createRoom };
};

describe("CreateEditRoomStore.onCreateRoom for a private room", () => {
  it("asks the server for keys when none are cached, and creates nothing without them", async () => {
    const getEncryptionKeys = vi.fn(async () => []);
    const { store, createRoom } = createStore({
      encryptionKeys: [],
      getEncryptionKeys,
    });

    await store.onCreateRoom(t);

    expect(getEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionKeysRequiredForPrivateRoom",
    );
    expect(createRoom).not.toHaveBeenCalled();
  });

  it("creates nothing when the keys cannot be fetched", async () => {
    const { store, createRoom } = createStore({
      encryptionKeys: null,
      getEncryptionKeys: vi.fn(async () => {
        throw new Error("503");
      }),
    });

    await store.onCreateRoom(t);

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionKeysRequiredForPrivateRoom",
    );
    expect(createRoom).not.toHaveBeenCalled();
  });

  it("creates the room with the keys fetched again", async () => {
    const getEncryptionKeys = vi.fn(async () => [{ id: "key-1" }]);
    const { store, createRoom } = createStore({
      encryptionKeys: [],
      getEncryptionKeys,
    });

    await store.onCreateRoom(t);

    expect(getEncryptionKeys).toHaveBeenCalledTimes(1);
    expect(createRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        private: true,
        roomType: RoomsType.CustomRoom,
      }),
    );
  });

  it("creates the room with the cached keys without asking the server", async () => {
    const getEncryptionKeys = vi.fn();
    const { store, createRoom } = createStore({
      encryptionKeys: [{ id: "key-1" }],
      getEncryptionKeys,
    });

    await store.onCreateRoom(t);

    expect(getEncryptionKeys).not.toHaveBeenCalled();
    expect(createRoom).toHaveBeenCalledTimes(1);
  });
});
