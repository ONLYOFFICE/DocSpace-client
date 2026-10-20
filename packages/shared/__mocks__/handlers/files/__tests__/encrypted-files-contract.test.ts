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

import { File as NodeFile } from "node:buffer";

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
    currentUserId: ALICE_ID,
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
  it("returns only the caller's entry, as FileKeysDto, and leaves userKeys out when the caller's keys are not given", async () => {
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
        userKeys?: unknown;
        fileKeys: Array<Record<string, unknown>>;
      };
    };

    expect(body.response).not.toHaveProperty("userKeys");
    expect(body.response.fileKeys).toHaveLength(1);
    expect(body.response.fileKeys[0]).toMatchObject({
      userId: ALICE_ID,
      publicKeyId: "alice-pk",
      privateKeyEnc: "wrapA",
      tenantId: 1,
      fileId: 1,
    });
    expect(typeof body.response.fileKeys[0].createOn).toBe("string");
  });

  it("answers 403 for an unknown file", async () => {
    const res = await fetch(FILE_ACCESS_URL(99999));
    expect(res.status).toBe(403);
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

    const res = await fetch(FILE_ACCESS_URL(2), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKeys),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).not.toHaveProperty("response");
    expect(handle.current!.getFile(2).fileKeys).toEqual(newKeys);
  });

  it("keeps the entry of a user the write does not list", async () => {
    handle.current!.setFiles([
      {
        id: 5,
        title: "z.txt",
        encrypted: true,
        fileKeys: [
          { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "a" },
          { userId: BOB_ID, publicKeyId: "bob-pk", privateKeyEnc: "b" },
        ],
      },
    ]);

    await fetch(FILE_ACCESS_URL(5), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "a2" },
      ]),
    });

    expect(handle.current!.getFile(5).fileKeys).toEqual([
      { userId: BOB_ID, publicKeyId: "bob-pk", privateKeyEnc: "b" },
      { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "a2" },
    ]);
  });

  it("answers 403 for an unknown file", async () => {
    const res = await fetch(FILE_ACCESS_URL(99999), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
    expect(res.status).toBe(403);
  });

  it("answers 400 for a body that is not an array", async () => {
    handle.current!.setFiles([
      { id: 3, title: "y.txt", encrypted: true, fileKeys: [] },
    ]);

    const res = await fetch(FILE_ACCESS_URL(3), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keys: [{ userId: ALICE_ID, publicKeyId: "pk", privateKeyEnc: "enc" }],
      }),
    });

    expect(res.status).toBe(400);
    expect(handle.current!.getFile(3).fileKeys).toEqual([]);
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

  it("answers 415 for a file outside a private room", async () => {
    handle.current!.setFiles([{ id: 6, title: "plain.txt", encrypted: false }]);
    handle.current!.setFileOutsidePrivateRoom(6);
    const res = await fetch(PUBLIC_KEYS_URL(6));
    expect(res.status).toBe(415);
  });

  it("drops entries without a public key and keeps the private half only on the caller's entries", async () => {
    handle.current!.setFiles([{ id: 7, title: "s.txt", encrypted: true }]);
    handle.current!.setRoomUserKeys([
      { id: "a", userId: ALICE_ID, publicKey: "PK-A", privateKeyEnc: "ENC-A", date: "", cryptoEngineId: "" },
      { id: "b", userId: BOB_ID, publicKey: "PK-B", privateKeyEnc: "ENC-B", date: "", cryptoEngineId: "" },
      { id: "c", userId: BOB_ID, publicKey: "", privateKeyEnc: "ENC-C", date: "", cryptoEngineId: "" },
    ]);
    const body = (await (await fetch(PUBLIC_KEYS_URL(7))).json()) as {
      response: Array<Record<string, unknown>>;
    };
    expect(body.response.map((k) => k.id)).toEqual(["a", "b"]);
    expect(body.response[0].privateKeyEnc).toBe("ENC-A");
    expect(body.response[1]).not.toHaveProperty("privateKeyEnc");
  });
});

describe("encryptedFiles mock — upload sessions (mirrors UploadController)", () => {
  const ROOMS_SECTION_ID = 2002;
  const SESSION_URL = (folderId: number) =>
    `${BASE_URL}:${PORT}/${API_PREFIX}/files/${folderId}/session`;

  const createSession = async (folderId: number, fileSize: number) => {
    const res = await fetch(SESSION_URL(folderId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "blob.bin", fileSize, encrypted: true }),
    });
    return (await res.json()).response as Record<string, unknown> & {
      id: string;
    };
  };

  // jsdom replaces File, which Node's multipart parser builds parts from,
  // and its FormData is opaque to Node's fetch: restore the one and build
  // the multipart body by hand instead of the other.
  const jsdomFile = globalThis.File;
  beforeAll(() => {
    globalThis.File = NodeFile as unknown as typeof File;
  });
  afterAll(() => {
    globalThis.File = jsdomFile;
  });

  const postChunk = (url: string, bytes: number[]) => {
    const boundary = "contract-test-boundary";
    const encoder = new TextEncoder();
    const head = encoder.encode(
      [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="blob.bin"',
        "Content-Type: application/octet-stream",
        "",
        "",
      ].join("\r\n"),
    );
    const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
    const body = new Uint8Array(head.length + bytes.length + tail.length);
    body.set(head, 0);
    body.set(bytes, head.length);
    body.set(tail, head.length + bytes.length);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      body,
    });
  };

  it("session create answers a ChunkedUploadSessionDto with the breadcrumb folder ids as path", async () => {
    const session = await createSession(ROOM_ID, 4);

    expect(Object.keys(session).sort()).toEqual(
      ["bytes_total", "created", "expired", "id", "location", "path"].sort(),
    );
    expect(session.path).toEqual([ROOMS_SECTION_ID, ROOM_ID]);
    expect(session.bytes_total).toBe(4);
    expect(session.location).toBe(
      `${BASE_URL}:${PORT}/ChunkedUploader.ashx?uid=${session.id}`,
    );

    const inFolder = await createSession(9101, 4);
    expect(inFolder.path).toEqual([ROOMS_SECTION_ID, ROOM_ID, 9101]);
  });

  it("numbered upload answers the session DTO and never builds the file", async () => {
    const session = await createSession(ROOM_ID, 2);

    const res = await postChunk(
      `${SESSION_URL(ROOM_ID)}/${session.id}/upload`,
      [1, 2],
    );
    const body = (await res.json()) as { response: Record<string, unknown> };

    expect(res.status).toBe(200);
    expect(body.response).toMatchObject({
      id: session.id,
      path: [ROOM_ID],
      bytes_total: 2,
    });
    expect(body.response).not.toHaveProperty("uploaded");
    expect(handle.current!.getFiles()).toHaveLength(0);
  });

  it("sequential upload answers 200 uploaded false until the last byte, then 201 with the stored file", async () => {
    const session = await createSession(ROOM_ID, 4);
    const url = `${SESSION_URL(ROOM_ID)}/${session.id}`;

    const first = await postChunk(url, [1, 2]);
    const firstBody = (await first.json()) as {
      statusCode: number;
      response: Record<string, unknown>;
    };
    expect(first.status).toBe(200);
    expect(firstBody.response).toMatchObject({
      id: 0,
      folderId: ROOM_ID,
      version: 1,
      uploaded: false,
    });
    expect(handle.current!.getFiles()).toHaveLength(0);

    const last = await postChunk(url, [3, 4]);
    const lastBody = (await last.json()) as {
      statusCode: number;
      response: { id: number; uploaded: boolean; file: { id: number } };
    };
    expect(last.status).toBe(201);
    expect(lastBody.statusCode).toBe(201);
    expect(lastBody.response.uploaded).toBe(true);
    expect(lastBody.response.file.id).toBe(lastBody.response.id);
    expect(
      Array.from(handle.current!.getFile(lastBody.response.id).bytes ?? []),
    ).toEqual([1, 2, 3, 4]);
  });

  it("finalize answers 201 with the stored file, then 404 for a finalised or unknown session", async () => {
    const session = await createSession(ROOM_ID, 2);
    await postChunk(`${SESSION_URL(ROOM_ID)}/${session.id}/upload`, [7, 8]);
    const finalizeUrl = `${SESSION_URL(ROOM_ID)}/${session.id}/finalize`;

    const res = await fetch(finalizeUrl, { method: "PUT" });
    const body = (await res.json()) as {
      response: { id: number; uploaded: boolean; file: { id: number } };
    };
    expect(res.status).toBe(201);
    expect(body.response.uploaded).toBe(true);
    expect(
      Array.from(handle.current!.getFile(body.response.id).bytes ?? []),
    ).toEqual([7, 8]);

    expect((await fetch(finalizeUrl, { method: "PUT" })).status).toBe(404);
    expect(
      (
        await fetch(`${SESSION_URL(ROOM_ID)}/mock-session-404/finalize`, {
          method: "PUT",
        })
      ).status,
    ).toBe(404);
  });
});

describe("PUT /files/fileops/delete", () => {
  const DELETE_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/files/fileops/delete`;

  it("removes the listed files and answers with a finished delete operation", async () => {
    handle.current!.setFiles([
      { id: 5, title: "gone.txt", encrypted: true, fileKeys: [] },
      { id: 6, title: "kept.txt", encrypted: true, fileKeys: [] },
    ]);

    const res = await fetch(DELETE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderIds: [],
        fileIds: [5],
        deleteAfter: false,
        immediately: true,
        returnSingleOperation: true,
      }),
    });
    const body = (await res.json()) as {
      response: Array<{ Operation: number; finished: boolean; error: string }>;
    };

    expect(body.response).toHaveLength(1);
    expect(body.response[0]).toMatchObject({
      Operation: 2,
      finished: true,
      error: "",
    });
    expect(handle.current!.getFiles().map((f) => f.id)).toEqual([6]);
  });
});
