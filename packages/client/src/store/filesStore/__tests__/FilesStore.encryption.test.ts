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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileType } from "@docspace/shared/enums";

// Mock the crypto modules in THIS file so the hoisted registration applies to
// both our direct imports and the store's (a mock declared only in the shared
// harness would not intercept this file's top-level imports).
vi.mock("@docspace/shared/services/encryption/secret-storage", () => ({
  SecretStorage: { getCached: vi.fn(() => null) },
}));
vi.mock(
  "@docspace/shared/services/private-room/encrypted-filename-recovery",
  () => ({
    ensureDecryptedFilename: vi.fn(async () => {}),
    recoverEncryptedFilenames: vi.fn(async () => {}),
  }),
);
vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  backfillEncryptedFilesForRoomMembers: vi.fn(async () => ({
    fileResults: [],
    skippedMembers: [],
  })),
}));

import { SecretStorage } from "@docspace/shared/services/encryption/secret-storage";
import {
  ensureDecryptedFilename,
  recoverEncryptedFilenames,
} from "@docspace/shared/services/private-room/encrypted-filename-recovery";
import { backfillEncryptedFilesForRoomMembers } from "@docspace/shared/services/private-room/room-encryption";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const IDENTITY = { publicKey: "pk", privateKey: "sk" } as unknown;

const encFile = (id: number): TItem =>
  ({
    id,
    encrypted: true,
    viewUrl: `http://x/${id}`,
    fileType: FileType.Document,
  }) as unknown as TItem;

const getBackfilled = (store: ReturnType<typeof createTestFilesStore>) =>
  (store as unknown as { _backfilledEncryptedRooms: Set<number | string> })
    ._backfilledEncryptedRooms;

beforeEach(() => {
  // clearMocks:true already resets call history between tests.
  vi.mocked(backfillEncryptedFilesForRoomMembers).mockResolvedValue({
    fileResults: [],
    skippedMembers: [],
  } as never);
});

describe("FilesStore.maybeBackfillEncryptedRoom — characterization", () => {
  it("no-ops without a roomId", () => {
    const store = createTestFilesStore();
    store.maybeBackfillEncryptedRoom(null, { EditRoom: true });
    expect(backfillEncryptedFilesForRoomMembers).not.toHaveBeenCalled();
  });

  it("skips a member without EditRoom permission", () => {
    const store = createTestFilesStore();
    store.maybeBackfillEncryptedRoom(10, { EditRoom: false });
    expect(backfillEncryptedFilesForRoomMembers).not.toHaveBeenCalled();
  });

  it("skips when the identity is not unlocked", () => {
    const store = createTestFilesStore();
    vi.mocked(SecretStorage.getCached).mockReturnValue(null as never);
    store.maybeBackfillEncryptedRoom(10, { EditRoom: true });
    expect(backfillEncryptedFilesForRoomMembers).not.toHaveBeenCalled();
  });

  it("backfills once for a manager with an unlocked identity", () => {
    const store = createTestFilesStore();
    vi.mocked(SecretStorage.getCached).mockReturnValue(IDENTITY as never);

    store.maybeBackfillEncryptedRoom(10, { EditRoom: true });

    expect(backfillEncryptedFilesForRoomMembers).toHaveBeenCalledTimes(1);
    expect(getBackfilled(store).has(10)).toBe(true);

    // second call is a no-op — the room is already marked backfilled
    store.maybeBackfillEncryptedRoom(10, { EditRoom: true });
    expect(backfillEncryptedFilesForRoomMembers).toHaveBeenCalledTimes(1);
  });
});

describe("FilesStore.recoverEncryptedFilenamesForCurrentView — characterization", () => {
  it("recovers filenames for encrypted files when in a room with an identity", () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: 1, isRoom: true, navigationPath: [] },
    });
    vi.mocked(SecretStorage.getCached).mockReturnValue(IDENTITY as never);
    store.files = [encFile(1), encFile(2)] as never;

    store.recoverEncryptedFilenamesForCurrentView();

    expect(recoverEncryptedFilenames).toHaveBeenCalledTimes(1);
    const [candidates] = vi.mocked(recoverEncryptedFilenames).mock.calls[0];
    expect(candidates).toHaveLength(2);
  });

  it("no-ops when the identity is locked", () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: 1, isRoom: true, navigationPath: [] },
    });
    vi.mocked(SecretStorage.getCached).mockReturnValue(null as never);
    store.files = [encFile(1)] as never;

    store.recoverEncryptedFilenamesForCurrentView();
    expect(recoverEncryptedFilenames).not.toHaveBeenCalled();
  });
});

describe("FilesStore.ensureEncryptedFilenameForFile — characterization", () => {
  it("decrypts an encrypted file's name when unlocked in a room", () => {
    const store = createTestFilesStore({
      selectedFolderStore: { id: 1, isRoom: true, navigationPath: [] },
    });
    vi.mocked(SecretStorage.getCached).mockReturnValue(IDENTITY as never);

    store.ensureEncryptedFilenameForFile(encFile(1) as never);
    expect(ensureDecryptedFilename).toHaveBeenCalledTimes(1);
  });

  it("ignores a non-encrypted file", () => {
    const store = createTestFilesStore();
    vi.mocked(SecretStorage.getCached).mockReturnValue(IDENTITY as never);

    store.ensureEncryptedFilenameForFile({ id: 1, encrypted: false } as never);
    expect(ensureDecryptedFilename).not.toHaveBeenCalled();
  });
});

describe("FilesStore.syncEncryptedRoom — characterization", () => {
  it("recovers filenames and backfills the current room", () => {
    const store = createTestFilesStore({
      selectedFolderStore: {
        id: 1,
        isRoom: true,
        navigationPath: [],
        security: { EditRoom: true },
      },
    });
    vi.mocked(SecretStorage.getCached).mockReturnValue(IDENTITY as never);
    store.files = [encFile(1)] as never;

    store.syncEncryptedRoom();

    expect(recoverEncryptedFilenames).toHaveBeenCalled();
    expect(backfillEncryptedFilesForRoomMembers).toHaveBeenCalledTimes(1);
  });
});
