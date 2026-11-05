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

import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { setupServer } from "../../../__mocks__/e2e/msw-compat";
import {
  encryptedFilesHandlers,
  privacyroomAccessHandlers,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "../../../__mocks__/handlers";

import { generateIdentityKeyPair } from "../../encryption/identity";
import {
  registerKeyMismatchHandler,
  resetTofuStores,
  unregisterKeyMismatchHandler,
} from "../../encryption/tofu-store";
import { arrayBufferToBase64 } from "../../encryption/utils";
import type { IdentityKeyPair } from "../../encryption/types";

import { orchestrateEncryptedUpload } from "../encrypted-upload-orchestrator";

import { mockIDB, resetMockIDB } from "./_helpers/mock-idb";

const PORT = "3000";
const ROOM_ID = 8890;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

const memberKey = (id: string, userId: string, kp: IdentityKeyPair) => ({
  id,
  userId,
  publicKey: pubB64(kp),
  privateKeyEnc: "",
  date: "2026-01-01T00:00:00.000Z",
  cryptoEngineId: "",
});

const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};
const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: ALICE_ID,
    currentUserId: ALICE_ID,
    handle: filesHandle,
  }),
  ...privacyroomAccessHandlers(PORT, { userId: ALICE_ID, handle: accessHandle }),
);

beforeAll(async () => {
  // jsdom's FormData, File and Blob cannot travel through the Node Request
  // MSW builds from the upload; use Node's own for the multipart chunks.
  const NodeFormData = (
    await new Response("", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).formData()
  ).constructor;
  vi.stubGlobal("FormData", NodeFormData);
  vi.stubGlobal("File", NodeFile);
  vi.stubGlobal("Blob", NodeBlob);
  (window as unknown as { ClientConfig: unknown }).ClientConfig = {
    api: { origin: "", prefix: "/api/2.0", timeout: 30000 },
    proxy: { url: "" },
  };
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  filesHandle.current?.reset();
  accessHandle.current?.reset();
  resetTofuStores();
  resetMockIDB();
  unregisterKeyMismatchHandler();
  vi.stubGlobal("indexedDB", mockIDB);
});

afterEach(() => {
  unregisterKeyMismatchHandler();
});

describe("TOFU on upload — integration via MSW + real crypto", () => {
  it("Member key mismatch on upload: after the server swaps a member key, the next upload leaves that member out", async () => {
    const alice = await generateIdentityKeyPair();
    const bobOld = await generateIdentityKeyPair();
    const bobSwapped = await generateIdentityKeyPair();
    const refuse = vi.fn(async () => "refuse" as const);
    registerKeyMismatchHandler(refuse);

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      memberKey("alice-1", ALICE_ID, alice),
      memberKey("bob-1", BOB_ID, bobOld),
    ]);

    const upload = (name: string) =>
      orchestrateEncryptedUpload({
        files: [new File([new TextEncoder().encode(name)], name)],
        folderId: ROOM_ID,
        roomId: ROOM_ID,
        identity: alice,
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        publicKeyId: "alice-1",
      });

    const first = await upload("first.txt");
    expect(first.results[0].ok).toBe(true);
    expect(first.results[0].skippedMembers).toBeUndefined();
    const firstStored = filesHandle.current!.getFile(
      Number(first.results[0].fileId),
    );
    expect(firstStored.fileKeys.map((k) => String(k.userId)).sort()).toEqual(
      [ALICE_ID, BOB_ID].sort(),
    );

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      memberKey("alice-1", ALICE_ID, alice),
      memberKey("bob-2", BOB_ID, bobSwapped),
    ]);

    const second = await upload("second.txt");

    expect(refuse).toHaveBeenCalledTimes(1);
    expect(second.results[0].ok).toBe(true);
    expect(second.results[0].skippedMembers).toEqual([
      { userId: BOB_ID, displayName: undefined, reason: "key-mismatch-refused" },
    ]);
    const secondStored = filesHandle.current!.getFile(
      Number(second.results[0].fileId),
    );
    expect(secondStored.fileKeys.map((k) => String(k.userId))).toEqual([
      ALICE_ID,
    ]);
  });
});
