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
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

const backfillMock = vi.fn().mockResolvedValue({
  fileResults: [],
  skippedMembers: [],
});

vi.mock(
  "@docspace/shared/services/private-room/encrypted-filename-recovery",
  () => ({ recoverEncryptedFilenames: vi.fn() }),
);
vi.mock("@docspace/shared/services/private-room/room-encryption", () => ({
  backfillEncryptedFilesForRoomMembers: backfillMock,
}));

import { PrivateRoomFilesStore } from "./PrivateRoomFilesStore";

const fakeIdentity = {} as IdentityKeyPair;

describe("PrivateRoomFilesStore", () => {
  let store: PrivateRoomFilesStore;

  beforeEach(() => {
    backfillMock.mockClear();
    backfillMock.mockResolvedValue({ fileResults: [], skippedMembers: [] });
    store = new PrivateRoomFilesStore();
  });

  describe("room context", () => {
    it("starts empty", () => {
      expect(store.roomId).toBeNull();
      expect(store.isPrivateRoomFolder).toBe(false);
      expect(store.canEditRoom).toBe(false);
    });

    it("setRoomContext stores roomId, private flag and EditRoom permission", () => {
      store.setRoomContext(5, true, true);
      expect(store.roomId).toBe(5);
      expect(store.isPrivateRoomFolder).toBe(true);
      expect(store.canEditRoom).toBe(true);
    });

    it("defaults canEditRoom to false when omitted", () => {
      store.setRoomContext(5, true);
      expect(store.canEditRoom).toBe(false);
    });

    it("reset clears the room context", () => {
      store.setRoomContext(5, true, true);
      store.reset();
      expect(store.roomId).toBeNull();
      expect(store.isPrivateRoomFolder).toBe(false);
      expect(store.canEditRoom).toBe(false);
    });
  });

  describe("maybeBackfillEncryptedRoom", () => {
    it("does nothing without a roomId", async () => {
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).not.toHaveBeenCalled();
    });

    it("does nothing without EditRoom permission", async () => {
      store.setRoomContext(5, true, false);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).not.toHaveBeenCalled();
    });

    it("runs the backfill for a room manager (numeric roomId)", async () => {
      store.setRoomContext("5", true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).toHaveBeenCalledTimes(1);
      expect(backfillMock).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ currentUserId: "u1" }),
      );
    });

    it("backfills a room at most once per session", async () => {
      store.setRoomContext(5, true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).toHaveBeenCalledTimes(1);
    });

    it("keeps the session guard across reset / re-entry", async () => {
      store.setRoomContext(5, true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      store.reset();
      store.setRoomContext(5, true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).toHaveBeenCalledTimes(1);
    });

    it("releases the guard on failure so it retries next time", async () => {
      backfillMock.mockRejectedValueOnce(new Error("network"));
      store.setRoomContext(5, true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      expect(backfillMock).toHaveBeenCalledTimes(2);
    });

    it("uses a non-interactive (refuse) TOFU resolver for the background sweep", async () => {
      store.setRoomContext(5, true, true);
      await store.maybeBackfillEncryptedRoom("u1", fakeIdentity);
      const opts = backfillMock.mock.calls[0][1] as {
        onKeyChange: () => Promise<string>;
      };
      await expect(opts.onKeyChange()).resolves.toBe("refuse");
    });
  });
});
