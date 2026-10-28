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

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import {
  encryptedFilesHandlers,
  type EncryptedFilesHandlerHandle,
} from "../encryptedFiles";
import { privateRoomListHandler } from "../privateRoomList";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3200";
const ROOM_ID = 9100;
const ARCHIVED_ROOM_ID = 9200;
const ARCHIVED_FOLDER_ID = 9201;
const MOVING_ROOM_ID = 9300;
const MOVING_FOLDER_ID = 9301;
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";

const FILE_ACCESS_URL = (fileId: number) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/files/${fileId}/access`;

const PUBLIC_KEYS_URL = (fileId: number) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/files/file/${fileId}/publickeys`;

const handle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};
const archivedHandle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};
const movingHandle: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...encryptedFilesHandlers(PORT, {
    roomId: MOVING_ROOM_ID,
    ownerId: ALICE_ID,
    currentUserId: ALICE_ID,
    folders: [{ id: MOVING_FOLDER_ID, title: "Drafts" }],
    withOtherRooms: true,
    handle: movingHandle,
  }),
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: ALICE_ID,
    currentUserId: ALICE_ID,
    handle,
  }),
  privateRoomListHandler(PORT, { roomId: ROOM_ID }),
  ...encryptedFilesHandlers(PORT, {
    roomId: ARCHIVED_ROOM_ID,
    ownerId: ALICE_ID,
    currentUserId: ALICE_ID,
    archived: true,
    folders: [{ id: ARCHIVED_FOLDER_ID, title: "Reports" }],
    handle: archivedHandle,
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

beforeEach(() => {
  handle.current?.reset();
  archivedHandle.current?.reset();
  movingHandle.current?.reset();
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
  afterEach(() => server.resetHandlers());

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

  it("File in an archived private room answers 415 today", async () => {
    const keysHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    server.use(
      ...encryptedFilesHandlers(PORT, {
        roomId: 9500,
        ownerId: ALICE_ID,
        currentUserId: ALICE_ID,
        archived: true,
        handle: keysHandle,
      }),
    );
    keysHandle.current!.setFiles([{ id: 8, title: "s.txt", encrypted: true }]);
    keysHandle.current!.setRoomUserKeys([
      { id: "a", userId: ALICE_ID, publicKey: "PK-A", privateKeyEnc: "ENC-A", date: "", cryptoEngineId: "" },
    ]);

    const res = await fetch(PUBLIC_KEYS_URL(8));

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

describe("encryptedFiles mock — entry DTOs (mirrors FoldersController.GetFolderByFolderId and GetFolderInfo)", () => {
  const ROOMS_SECTION_ID = 2002;
  const FOLDER_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/files/${ROOM_ID}`;
  const FOLDER_INFO_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/files/folder/${ROOM_ID}`;

  type Dto = Record<string, unknown> & {
    security?: Record<string, boolean>;
    viewAccessibility?: Record<string, boolean>;
  };

  it("a listed file carries the Rooms section as root, the custom room type as parent room type, and no Copy", async () => {
    handle.current!.setFiles([
      { id: 1, title: "secret.docx", encrypted: true, fileKeys: [] },
      { id: 2, title: "plain.docx", encrypted: false, fileKeys: [] },
    ]);

    const res = await fetch(FOLDER_URL);
    const body = (await res.json()) as {
      response: { files: Dto[]; current: Dto };
    };
    const [secret, plain] = body.response.files;

    expect(secret).toMatchObject({
      folderId: ROOM_ID,
      rootFolderId: ROOMS_SECTION_ID,
      rootFolderType: 14,
      parentRoomType: 19,
      encrypted: true,
    });
    expect(secret.security?.Copy).toBe(false);
    expect(secret.security).not.toHaveProperty("EditForm");
    expect(secret.viewAccessibility).not.toHaveProperty("CoAuhtoring");
    expect(plain).not.toHaveProperty("encrypted");

    expect(body.response.current).toMatchObject({
      id: ROOM_ID,
      parentId: ROOMS_SECTION_ID,
      rootFolderId: ROOMS_SECTION_ID,
      parentRoomType: 19,
      private: true,
    });
    expect(body.response.current).not.toHaveProperty("pathParts");
  });

  it("the room listing answers its breadcrumbs from the Rooms section as pathParts", async () => {
    const res = await fetch(FOLDER_URL);
    const body = (await res.json()) as { response: { pathParts: Dto[] } };

    expect(body.response.pathParts).toEqual([
      { id: ROOMS_SECTION_ID, title: "Rooms", folderType: 14 },
      { id: ROOM_ID, title: "Private Room", roomType: 5, folderType: 19 },
    ]);
  });

  it("the Rooms section listing answers the section alone as pathParts", async () => {
    const res = await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/rooms`);
    const body = (await res.json()) as { response: { pathParts: Dto[] } };

    expect(body.response.pathParts).toEqual([
      { id: ROOMS_SECTION_ID, title: "Rooms", folderType: 14 },
    ]);
  });

  it("the room DTO sits under the Rooms section and has no parent room type or path parts", async () => {
    const res = await fetch(FOLDER_INFO_URL);
    const body = (await res.json()) as { response: Dto };

    expect(body.response).toMatchObject({
      id: ROOM_ID,
      parentId: ROOMS_SECTION_ID,
      rootFolderId: ROOMS_SECTION_ID,
      rootFolderType: 14,
      roomType: 5,
      private: true,
    });
    expect(body.response).not.toHaveProperty("parentRoomType");
    expect(body.response).not.toHaveProperty("pathParts");
  });
});

describe("encryptedFiles mock — the copy right (mirrors FileSecurity.FilterEntryAsync)", () => {
  type Listing = {
    response: {
      files: { security: Record<string, boolean> }[];
      current: Record<string, unknown> & { security?: Record<string, boolean> };
      pathParts: Record<string, unknown>[];
    };
  };
  const list = async (roomId: number) =>
    (await (
      await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/${roomId}`)
    ).json()) as Listing;
  const seed = { id: 1, title: "secret.docx", encrypted: true, fileKeys: [] };

  it("File in an active private room", async () => {
    handle.current!.setFiles([seed]);

    const { files } = (await list(ROOM_ID)).response;

    expect(files.map((f) => f.security.Copy)).toEqual([false]);
  });

  it("File in an archived private room", async () => {
    archivedHandle.current!.setFiles([seed]);

    const { files, current, pathParts } = (await list(ARCHIVED_ROOM_ID))
      .response;

    expect(files[0]).toMatchObject({
      rootFolderId: 11244,
      rootFolderType: 20,
      security: {
        Read: true,
        Download: true,
        ReadHistory: true,
        Copy: true,
        Edit: false,
        Rename: false,
        Move: false,
        Delete: false,
        Duplicate: false,
      },
    });
    expect(current).toMatchObject({
      rootFolderId: 11244,
      rootFolderType: 20,
      private: true,
      security: { Create: false, CopyTo: false, MoveTo: false },
    });
    expect(pathParts[0]).toEqual({
      id: 11244,
      title: "Archive",
      folderType: 20,
    });
  });
});

describe("encryptedFiles mock — an archived room and its folders (mirrors FoldersController and FolderDtoHelper)", () => {
  type Entry = Record<string, unknown> & { security?: Record<string, boolean> };
  type Listing = {
    response: {
      files: Entry[];
      folders: Entry[];
      current: Entry;
      pathParts: Entry[];
    };
  };
  const get = async <T>(path: string) =>
    (await (await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/${path}`)).json()) as T;

  beforeEach(() => {
    archivedHandle.current!.setFiles([
      { id: 1, title: "root.docx", encrypted: true, fileKeys: [] },
      {
        id: 2,
        title: "nested.docx",
        encrypted: true,
        fileKeys: [],
        folderId: ARCHIVED_FOLDER_ID,
      },
    ]);
  });

  it("stamps no parent room type under Archive, on the room or its entries", async () => {
    const { response } = await get<Listing>(`files/${ARCHIVED_ROOM_ID}`);

    expect(response.current).not.toHaveProperty("parentRoomType");
    expect(response.files[0]).not.toHaveProperty("parentRoomType");
    expect(response.folders[0]).not.toHaveProperty("parentRoomType");
  });

  it("lists the room's own files and its folder, which reports private false and the Archive rights", async () => {
    const { response } = await get<Listing>(`files/${ARCHIVED_ROOM_ID}`);

    expect(response.files.map((f) => f.id)).toEqual([1]);
    expect(response.folders).toHaveLength(1);
    expect(response.folders[0]).toMatchObject({
      id: ARCHIVED_FOLDER_ID,
      parentId: ARCHIVED_ROOM_ID,
      rootFolderType: 20,
      private: false,
      security: {
        Read: true,
        Copy: true,
        Download: true,
        CopyTo: false,
        Create: false,
        Delete: false,
        Move: false,
        Duplicate: false,
      },
    });
  });

  it("answers a folder's listing with its files and the breadcrumbs from Archive through the room", async () => {
    const { response } = await get<Listing>(`files/${ARCHIVED_FOLDER_ID}`);

    expect(response.files.map((f) => f.id)).toEqual([2]);
    expect(response.files[0]).toMatchObject({ folderId: ARCHIVED_FOLDER_ID });
    expect(response.current).toMatchObject({
      id: ARCHIVED_FOLDER_ID,
      private: false,
    });
    expect(response.pathParts.map((p) => p.id)).toEqual([
      11244,
      ARCHIVED_ROOM_ID,
      ARCHIVED_FOLDER_ID,
    ]);
  });

  it("answers GetFolderInfo for the folder with the same DTO", async () => {
    const { response } = await get<{ response: Entry }>(
      `files/folder/${ARCHIVED_FOLDER_ID}`,
    );

    expect(response).toMatchObject({
      id: ARCHIVED_FOLDER_ID,
      parentId: ARCHIVED_ROOM_ID,
      private: false,
    });
  });
});

describe("encryptedFiles mock — restoring an archived room (mirrors OperationController.MoveBatchItems)", () => {
  const RESTORED_ROOM_ID = 9400;
  /** The Rooms section folder of the room mocks. */
  const ROOMS_SECTION_ID = 2002;
  const restoredHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const restoreRoom = () =>
    fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/fileops/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destFolderId: ROOMS_SECTION_ID,
        folderIds: [RESTORED_ROOM_ID],
        fileIds: [],
        conflictResolveType: 0,
        deleteAfter: false,
        returnSingleOperation: true,
      }),
    });
  const getRoom = async () =>
    (
      (await (
        await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/${RESTORED_ROOM_ID}`)
      ).json()) as { response: { current: Record<string, unknown> } }
    ).response.current;

  beforeEach(() => {
    server.use(
      ...encryptedFilesHandlers(PORT, {
        roomId: RESTORED_ROOM_ID,
        ownerId: ALICE_ID,
        currentUserId: ALICE_ID,
        archived: true,
        handle: restoredHandle,
      }),
    );
  });

  afterEach(() => server.resetHandlers());

  it("moves the room to the Rooms section and answers a finished move operation listing it", async () => {
    expect(await getRoom()).toMatchObject({ rootFolderType: 20 });

    const res = await restoreRoom();
    const body = (await res.json()) as {
      response: Array<{ folders: Record<string, unknown>[] }>;
    };

    expect(body.response).toHaveLength(1);
    expect(body.response[0]).toMatchObject({
      Operation: 0,
      finished: true,
      error: "",
      status: 2,
    });
    expect(body.response[0].folders).toMatchObject([
      { id: RESTORED_ROOM_ID, rootFolderType: 14, parentId: ROOMS_SECTION_ID },
    ]);
    expect(await getRoom()).toMatchObject({
      rootFolderType: 14,
      parentRoomType: 19,
    });
  });

  it("puts a restored room back in Archive on reset", async () => {
    await restoreRoom();
    expect(await getRoom()).toMatchObject({ rootFolderType: 14 });

    restoredHandle.current!.reset();

    expect(await getRoom()).toMatchObject({ rootFolderType: 20 });
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

  it("session create refuses a file larger than the free space with 402 and the TenantQuotaException type", async () => {
    handle.current!.setFreeSpace(1536);

    const res = await fetch(SESSION_URL(ROOM_ID), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "blob.bin", fileSize: 4096, encrypted: true }),
    });
    const body = (await res.json()) as { error: unknown; statusCode: number };

    expect(res.status).toBe(402);
    expect(body.statusCode).toBe(402);
    expect(body.error).toEqual({
      message: "The maximum file size is exceeded (1.5 KB).",
      type: "ASC.Core.Tenants.TenantQuotaException",
    });
    expect(handle.current!.getSessions()).toEqual([]);
    expect((await createSession(ROOM_ID, 1024)).id).toBeTruthy();
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
      response: Array<Record<string, unknown>>;
    };

    expect(body.response).toHaveLength(1);
    expect(body.response[0]).toMatchObject({
      Operation: 2,
      finished: true,
      error: "",
      status: 2,
    });
    expect(body.response[0]).not.toHaveProperty("files");
    expect(body.response[0]).not.toHaveProperty("folders");
    expect(handle.current!.getFiles().map((f) => f.id)).toEqual([6]);
  });
});

describe("encryptedFiles mock — DELETE /files/file/{fileId} (mirrors FilesController.DeleteFile)", () => {
  it("removes the file and answers with the finished delete operation of that file", async () => {
    handle.current!.setFiles([
      { id: 5, title: "gone.txt", encrypted: true, fileKeys: [] },
      { id: 6, title: "kept.txt", encrypted: true, fileKeys: [] },
    ]);

    const res = await fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/file/5`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deleteAfter: false,
        immediately: true,
        returnSingleOperation: true,
      }),
    });
    const body = (await res.json()) as {
      response: Array<Record<string, unknown>>;
    };

    expect(body.response).toHaveLength(1);
    expect(body.response[0]).toMatchObject({
      Operation: 2,
      finished: true,
      error: "",
      status: 2,
    });
    expect(handle.current!.getFiles().map((f) => f.id)).toEqual([6]);
  });
});

describe("encryptedFiles mock — viewAccessibility (mirrors FileUtility.GetAccessibility)", () => {
  it("lets an image title open in the image viewer and keeps other titles out of it", async () => {
    handle.current!.setFiles([
      { id: 7, title: "photo.png", serverTitle: "a1b2.png", fileKeys: [] },
      { id: 8, title: "memo.txt", serverTitle: "c3d4.txt", fileKeys: [] },
    ]);

    const res = await fetch(
      `${BASE_URL}:${PORT}/${API_PREFIX}/files/${ROOM_ID}`,
    );
    const body = (await res.json()) as {
      response: {
        files: { id: number; viewAccessibility: Record<string, boolean> }[];
      };
    };
    const access = Object.fromEntries(
      body.response.files.map((f) => [f.id, f.viewAccessibility]),
    );

    expect(access[7]).toMatchObject({ ImageView: true, MediaView: false });
    expect(access[8]).toMatchObject({ ImageView: false, MediaView: false });
  });
});

describe("encryptedFiles mock — GET /files/folder/{folderId}/path (mirrors FoldersController.GetFolderPath)", () => {
  type PathEntry = Record<string, unknown>;
  const getPath = async (folderId: number) =>
    (
      (await (
        await fetch(
          `${BASE_URL}:${PORT}/${API_PREFIX}/files/folder/${folderId}/path`,
        )
      ).json()) as { response: PathEntry[] }
    ).response;

  it("answers the room from the section root down, the room carrying its type and privacy", async () => {
    const path = await getPath(ROOM_ID);

    expect(path.map((entry) => entry.id)).toEqual([2002, ROOM_ID]);
    expect(path[1]).toMatchObject({ roomType: 5, private: true });
  });

  it("ends with the folder itself for a folder of an archived room", async () => {
    const path = await getPath(ARCHIVED_FOLDER_ID);

    expect(path.map((entry) => entry.id)).toEqual([
      11244,
      ARCHIVED_ROOM_ID,
      ARCHIVED_FOLDER_ID,
    ]);
    expect(path[1]).toMatchObject({ private: true, rootFolderType: 20 });
    expect(path[2]).toMatchObject({ private: false });
  });
});

describe("encryptedFiles mock — a second room in the same spec (withOtherRooms)", () => {
  const OTHER_ROOM_ID = 9300;
  const OTHER_FOLDER_ID = 9301;
  const otherHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };

  beforeEach(() => {
    server.use(
      ...encryptedFilesHandlers(PORT, {
        roomId: OTHER_ROOM_ID,
        ownerId: ALICE_ID,
        currentUserId: ALICE_ID,
        folders: [{ id: OTHER_FOLDER_ID, title: "Drafts" }],
        withOtherRooms: true,
        handle: otherHandle,
      }),
    );
  });

  afterEach(() => server.resetHandlers());

  it("lets a file of the first room reach the instance that holds it", async () => {
    handle.current!.setFiles([
      {
        id: 1,
        title: "doc.txt",
        encrypted: true,
        fileKeys: [
          { userId: ALICE_ID, publicKeyId: "alice-pk", privateKeyEnc: "wrapA" },
        ],
      },
    ]);

    const res = await fetch(FILE_ACCESS_URL(1));

    expect(res.status).toBe(200);
    expect(otherHandle.current!.getRequests()).toEqual([]);
  });

  it("opens an upload session in its own room and leaves the first room's to that instance", async () => {
    const create = (folderId: number) =>
      fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/files/${folderId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "blob.bin",
          fileSize: 4,
          encrypted: true,
        }),
      });

    await create(OTHER_ROOM_ID);
    await create(ROOM_ID);

    expect(otherHandle.current!.getSessions().map((s) => s.folderId)).toEqual([
      OTHER_ROOM_ID,
    ]);
    expect(handle.current!.getSessions().map((s) => s.folderId)).toEqual([
      ROOM_ID,
    ]);
  });

  it("serves a folder of the second room: the room counts it, its path runs through the room and a session in it ends with the folder", async () => {
    const api = `${BASE_URL}:${PORT}/${API_PREFIX}`;

    const room = (await (await fetch(`${api}/files/folder/${OTHER_ROOM_ID}`)).json()) as {
      response: Record<string, unknown>;
    };
    const path = (await (
      await fetch(`${api}/files/folder/${OTHER_FOLDER_ID}/path`)
    ).json()) as { response: Record<string, unknown>[] };
    const session = (await (
      await fetch(`${api}/files/${OTHER_FOLDER_ID}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "blob.bin",
          fileSize: 4,
          encrypted: true,
        }),
      })
    ).json()) as { response: { path: number[] } };

    expect(room.response).toMatchObject({ foldersCount: 1, private: true });
    expect(path.response.map((entry) => entry.id)).toEqual([
      2002,
      OTHER_ROOM_ID,
      OTHER_FOLDER_ID,
    ]);
    expect(path.response[1]).toMatchObject({ roomType: 5, private: true });
    expect(path.response[2]).toMatchObject({
      parentId: OTHER_ROOM_ID,
      private: false,
    });
    expect(session.response.path).toEqual([
      2002,
      OTHER_ROOM_ID,
      OTHER_FOLDER_ID,
    ]);
    expect(handle.current!.getRequests()).toEqual([]);
  });
});

describe("encryptedFiles mock — POST /files/{folderId}/upload/check (mirrors UploadController.CheckUploadAsync)", () => {
  const CHECK_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/files/${MOVING_FOLDER_ID}/upload/check`;

  const check = (body: object) =>
    fetch(CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("answers the submitted titles a plain file of the folder holds, once each, ignoring case and encrypted files", async () => {
    movingHandle.current!.setFiles([
      { id: 41, title: "Report.docx", encrypted: false, folderId: MOVING_FOLDER_ID },
      { id: 42, title: "secret.docx", encrypted: true, folderId: MOVING_FOLDER_ID },
      { id: 43, title: "root.docx", encrypted: false },
    ]);

    const res = await check({
      filesTitle: ["report.docx", "secret.docx", "root.docx", "report.docx"],
    });
    const body = (await res.json()) as { response: string[] };

    expect(res.status).toBe(200);
    expect(body.response).toEqual(["report.docx"]);
  });

  it("answers 400 for a body without filesTitle", async () => {
    const res = await check({});

    expect(res.status).toBe(400);
  });
});

describe("encryptedFiles mock — moves inside a private room (mirrors OperationController)", () => {
  const FILEOPS = `${BASE_URL}:${PORT}/${API_PREFIX}/files/fileops`;

  it("CheckMoveOrCopyBatchItems lists a plain file whose title the destination holds, never an encrypted one", async () => {
    movingHandle.current!.setFiles([
      { id: 31, title: "a.txt", encrypted: false, folderId: MOVING_FOLDER_ID },
      { id: 32, title: "a.txt", encrypted: false },
      { id: 33, title: "b.txt", encrypted: true, folderId: MOVING_FOLDER_ID },
      { id: 34, title: "b.txt", encrypted: true },
    ]);

    const res = await fetch(
      `${FILEOPS}/move?destFolderId=${MOVING_FOLDER_ID}&fileIds=32&fileIds=34`,
    );
    const body = (await res.json()) as { response: { id: number }[] };

    expect(body.response.map((entry) => entry.id)).toEqual([32]);
  });

  it("MoveBatchItems moves the files and answers a finished move operation that fileops reports", async () => {
    movingHandle.current!.setFiles([{ id: 35, title: "c.txt", encrypted: true }]);

    const res = await fetch(`${FILEOPS}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destFolderId: MOVING_FOLDER_ID,
        folderIds: [],
        fileIds: [35],
        conflictResolveType: 0,
        deleteAfter: false,
        returnSingleOperation: true,
      }),
    });
    const body = (await res.json()) as {
      response: Array<Record<string, unknown>>;
    };

    expect(body.response).toHaveLength(1);
    expect(body.response[0]).toMatchObject({
      Operation: 0,
      finished: true,
      error: "",
      status: 2,
    });
    expect(movingHandle.current!.getFile(35).folderId).toBe(MOVING_FOLDER_ID);

    const status = (await (
      await fetch(`${FILEOPS}?id=${body.response[0].id}`)
    ).json()) as { response: { id: string }[] };
    expect(status.response.map((o) => o.id)).toEqual([body.response[0].id]);
  });
});
