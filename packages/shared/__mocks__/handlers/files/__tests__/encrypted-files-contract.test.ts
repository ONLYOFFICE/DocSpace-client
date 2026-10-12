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

// CONTRACT TESTS — lock the encrypted-files mock to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import {
  encryptedFilesHandlers,
  type EncryptedFilesHandlerHandle,
} from "../encryptedFiles";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3200";
const ROOM_ID = 9100;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

const FILE_ACCESS_URL = (fileId: number) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/files/${fileId}/access`;

const PUBLIC_KEYS_URL = (fileId: number) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/files/file/${fileId}/publickeys`;

const handle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: ALICE_ID,
    handle,
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

beforeEach(() => {
  handle.current?.reset();
});

describe("encryptedFiles mock — GET /files/{fileId}/access (mirrors FilesController.GetEncryptionInfoAsync)", () => {
  it("returns the file's per-recipient fileKeys plus the CURRENT user's identity keys as `userKeys`", async () => {
    handle.current!.setFiles([
      {
        id: 1,
        title: "doc.txt",
        encrypted: true,
        fileKeys: [
          { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "wrapA" },
          { userId: BOB_ID, publicKeyId: "bob-pk", privateKeyEnc: "wrapB" },
        ],
      },
    ]);
    handle.current!.setRoomUserKeys([
      {
        id: "alice-pk",
        userId: ALICE_ID,
        publicKey: "PK-ALICE",
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
    ]);

    const res = await fetch(FILE_ACCESS_URL(1));
    const body = (await res.json()) as {
      response: {
        userKeys: Array<{ userId: string; publicKey: string }>;
        fileKeys: Array<{
          userId: string;
          publicKeyId: string;
          privateKeyEnc: string;
          fileId: number;
        }>;
      };
    };

    // userKeys = CURRENT user's identity keys (per server's
    // encryptionKeyPairDtoHelper.GetKeyPairAsync()), NOT room members'.
    expect(body.response.userKeys).toHaveLength(1);
    expect(body.response.userKeys[0].userId).toBe(ALICE_ID);

    // fileKeys = per-recipient wrapped DEKs scoped to the file
    expect(body.response.fileKeys).toHaveLength(2);
    expect(body.response.fileKeys.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID].sort(),
    );
    expect(body.response.fileKeys[0].fileId).toBe(1);
  });

  it("returns 404 for an unknown file", async () => {
    const res = await fetch(FILE_ACCESS_URL(99999));
    expect(res.status).toBe(404);
  });
});

describe("encryptedFiles mock — PUT /files/{fileId}/access (mirrors FilesController.SetEncryptionInfoAsync)", () => {
  it("replaces fileKeys with the supplied list (array body)", async () => {
    handle.current!.setFiles([
      {
        id: 2,
        title: "x.txt",
        encrypted: true,
        fileKeys: [
          { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "old" },
        ],
      },
    ]);

    const newKeys = [
      { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "newA" },
      { userId: BOB_ID, publicKeyId: "bob-pk", privateKeyEnc: "newB" },
    ];

    await fetch(FILE_ACCESS_URL(2), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKeys),
    });

    expect(handle.current!.getFile(2).fileKeys).toEqual(newKeys);
  });

  it("accepts { keys: [...] } envelope shape", async () => {
    handle.current!.setFiles([
      {
        id: 3,
        title: "y.txt",
        encrypted: true,
        fileKeys: [],
      },
    ]);

    const keys = [
      { userId: ALICE_ID, publicKeyId: "pk", privateKeyEnc: "enc" },
    ];

    await fetch(FILE_ACCESS_URL(3), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    });

    expect(handle.current!.getFile(3).fileKeys).toEqual(keys);
  });
});

describe("encryptedFiles mock — GET /files/file/{fileId}/publickeys (mirrors SecurityController.GetEncryptionAccess)", () => {
  it("returns identity public keys of users with file access", async () => {
    handle.current!.setFiles([
      {
        id: 4,
        title: "shared.txt",
        encrypted: true,
        fileKeys: [],
      },
    ]);
    handle.current!.setRoomUserKeys([
      {
        id: "alice-pk",
        userId: ALICE_ID,
        publicKey: "PK-ALICE",
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
      {
        id: "bob-pk",
        userId: BOB_ID,
        publicKey: "PK-BOB",
        privateKeyEnc: "",
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      },
    ]);

    const res = await fetch(PUBLIC_KEYS_URL(4));
    const body = (await res.json()) as {
      response: Array<{ id: string; userId: string; publicKey: string }>;
    };

    expect(body.response).toHaveLength(2);
    expect(body.response.map((k) => k.userId).sort()).toEqual(
      [ALICE_ID, BOB_ID].sort(),
    );
  });

  it("returns 404 for an unknown file", async () => {
    const res = await fetch(PUBLIC_KEYS_URL(99999));
    expect(res.status).toBe(404);
  });
});
