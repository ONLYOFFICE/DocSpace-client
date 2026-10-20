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

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import type { RequestLog } from "../privacyroom";

export type EncryptedFileKey = {
  userId: string;
  publicKeyId: string;
  privateKeyEnc: string;
};

export type EncryptedFileSeed = {
  id: number;
  title: string;
  serverTitle?: string;
  size?: number;
  encrypted?: boolean;
  fileKeys?: EncryptedFileKey[];
  bytes?: Uint8Array;
  encryptedNameHeader?: string;
};

export type EncryptedFileRecord = Required<
  Omit<EncryptedFileSeed, "bytes" | "encryptedNameHeader">
> & {
  bytes?: Uint8Array;
  encryptedNameHeader?: string;
};

export type UploadSessionRecord = {
  id: string;
  folderId: number;
  fileName: string;
  fileSize: number;
  encrypted: boolean;
  chunks: Uint8Array[];
  completed: boolean;
  resultFileId?: number;
  created: string;
  expired: string;
};

export type EncryptedFilesHandlerHandle = {
  getFiles: () => EncryptedFileRecord[];
  getFile: (fileId: number) => EncryptedFileRecord;
  setFiles: (files: EncryptedFileSeed[]) => void;
  setFileKeys: (fileId: number, keys: EncryptedFileKey[]) => void;
  setRoomUserKeys: (keys: RoomMemberKeyEntry[]) => void;
  /** Marks a file as lying outside a private room (publickeys answers 415). */
  setFileOutsidePrivateRoom: (fileId: number) => void;
  getSessions: () => UploadSessionRecord[];
  getRequests: () => RequestLog[];
  reset: () => void;
};

export type RoomMemberKeyEntry = {
  id: string;
  userId: string;
  publicKey: string;
  privateKeyEnc: string;
  date: string;
  cryptoEngineId: string;
};

export type EncryptedFilesHandlerOptions = {
  roomId: number;
  initialFiles?: EncryptedFileSeed[];
  ownerId?: string;
  roomUserKeys?: RoomMemberKeyEntry[];
  /** The signed-in user: access reads return only this user's entries. */
  currentUserId?: string;
  /** The signed-in user's own key pairs, returned as `userKeys`. */
  callerKeys?: RoomMemberKeyEntry[];
  handle?: { current: EncryptedFilesHandlerHandle | null };
};

const DEFAULT_CURRENT_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef"; // matches successSelf
const MOCK_TENANT_ID = 1;
/** The Rooms section folder id the room mocks share (see privateRoomList.ts). */
const ROOMS_SECTION_ID = 2002;
/** ChunkedUploadSessionHolder.SlidingExpiration. */
const SESSION_SLIDING_EXPIRATION_MS = 12 * 60 * 60 * 1000;

const okResponse = <T>(response: T, statusCode = 200): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode }),
    { status: statusCode, headers: { "Content-Type": "application/json" } },
  );

const errorResponse = (status: number, message: string): Response =>
  new Response(
    JSON.stringify({
      error: { message },
      status: 1,
      statusCode: status,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );

const seedToRecord = (seed: EncryptedFileSeed): EncryptedFileRecord => ({
  id: seed.id,
  title: seed.title,
  serverTitle: seed.serverTitle ?? seed.title,
  size: seed.size ?? 0,
  encrypted: seed.encrypted ?? true,
  fileKeys: seed.fileKeys ?? [],
  bytes: seed.bytes,
  encryptedNameHeader: seed.encryptedNameHeader,
});

const buildFileDto = (
  record: EncryptedFileRecord,
  roomId: number,
  ownerId: string,
  port?: string,
) => {
  const downloadOrigin = port ? `${BASE_URL}:${port}` : BASE_URL;
  const dotIdx = record.serverTitle.lastIndexOf(".");
  const fileExst = dotIdx > 0 ? record.serverTitle.slice(dotIdx) : "";
  const creator = {
    id: ownerId,
    displayName: "Test User",
    avatar: "",
    avatarOriginal: "",
    avatarMax: "",
    avatarMedium: "",
    avatarSmall: "",
    profileUrl: "",
    hasAvatar: false,
    isAnonim: false,
  };
  return {
    id: record.id,
    title: record.serverTitle,
    fileExst,
    fileType: 0,
    fileStatus: 0,
    fileEntryType: 2,
    folderId: roomId,
    rootFolderId: roomId,
    rootFolderType: 14,
    parentRoomType: 14,
    pureContentLength: record.size,
    contentLength: `${record.size} bytes`,
    version: 1,
    versionGroup: 1,
    access: 0,
    canShare: true,
    shared: false,
    mute: false,
    encrypted: record.encrypted,
    thumbnailStatus: 1,
    thumbnailUrl: "",
    viewUrl: `${downloadOrigin}/api/2.0/files/file/${record.id}/download`,
    webUrl: `${downloadOrigin}/api/2.0/files/file/${record.id}/download`,
    shortWebUrl: "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    createdBy: creator,
    updatedBy: creator,
    viewAccessibility: {
      ImageView: false,
      MediaView: false,
      WebView: false,
      WebEdit: false,
      WebReview: false,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: false,
      WebComment: false,
      CoAuhtoring: false,
      CanConvert: false,
      MustConvert: false,
    },
    security: {
      Read: true,
      Edit: true,
      Delete: true,
      Download: true,
      Copy: true,
      Move: true,
      Rename: true,
      Comment: false,
      FillForms: false,
      Review: false,
      CustomFilter: false,
      ReadHistory: false,
      Lock: false,
      EditHistory: false,
      Duplicate: true,
      SubmitToFormGallery: false,
      Convert: false,
      CreateRoomFrom: false,
      CopyLink: false,
      Embed: false,
      EditForm: false,
      Vectorization: false,
    },
  };
};

const buildFolderDto = (roomId: number) => ({
  id: roomId,
  title: "Private Room",
  parentId: 0,
  filesCount: 0,
  foldersCount: 0,
  rootFolderId: roomId,
  rootFolderType: 14,
  roomType: 5,
  shared: false,
  private: true,
  pathParts: [{ id: roomId, title: "Private Room" }],
});

export const encryptedFilesHandlers = (
  port: string,
  opts: EncryptedFilesHandlerOptions,
) => {
  const roomId = opts.roomId;
  const ownerId =
    opts.ownerId ?? "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
  const files = new Map<number, EncryptedFileRecord>();
  for (const seed of opts.initialFiles ?? []) {
    files.set(seed.id, seedToRecord(seed));
  }
  const sessions = new Map<string, UploadSessionRecord>();
  const requests: RequestLog[] = [];
  let roomUserKeys: RoomMemberKeyEntry[] = [...(opts.roomUserKeys ?? [])];
  const currentUserId = opts.currentUserId ?? DEFAULT_CURRENT_USER_ID;
  const createdOn = new Map<string, string>();
  const outsidePrivateRoom = new Set<number>();
  /** files_file_keys.create_on: set when the row is written. */
  const keyCreatedOn = (fileId: number, userId: string) => {
    const key = `${fileId}:${userId}`;
    if (!createdOn.has(key)) createdOn.set(key, new Date().toISOString());
    return createdOn.get(key) as string;
  };
  let nextFileId = 1000;
  let nextSessionId = 1;

  const sessionBytes = (session: UploadSessionRecord) =>
    session.chunks.reduce((acc, c) => acc + c.byteLength, 0);

  const readChunk = async (request: Request) => {
    const filePart = (await request.formData()).get("file");
    return typeof filePart === "object" && filePart
      ? new Uint8Array(await filePart.arrayBuffer())
      : new Uint8Array();
  };

  /** ChunkedUploadSessionDto; `location` is FilesLinkUtility.GetUploadChunkLocationUrl. */
  const sessionDto = (session: UploadSessionRecord, path: number[]) => ({
    id: session.id,
    path,
    created: session.created,
    expired: session.expired,
    location: `${BASE_URL}:${port}/ChunkedUploader.ashx?uid=${session.id}`,
    bytes_total: session.fileSize,
  });

  /** Stores the session's parts as one file; returns the UploadSessionResponseDto. */
  const completeSession = (session: UploadSessionRecord) => {
    session.completed = true;
    const id = nextFileId++;
    session.resultFileId = id;
    const merged = new Uint8Array(sessionBytes(session));
    let offset = 0;
    for (const c of session.chunks) {
      merged.set(c, offset);
      offset += c.byteLength;
    }
    const record: EncryptedFileRecord = {
      id,
      title: session.fileName,
      serverTitle: session.fileName,
      size: session.fileSize,
      encrypted: session.encrypted,
      fileKeys: [],
      bytes: merged,
    };
    files.set(id, record);
    return {
      id,
      folderId: session.folderId,
      version: 1,
      title: session.fileName,
      uploaded: true,
      file: buildFileDto(record, session.folderId, ownerId, port),
    };
  };

  const handle: EncryptedFilesHandlerHandle = {
    getFiles: () => Array.from(files.values()),
    getFile: (id) => {
      const f = files.get(id);
      if (!f) throw new Error(`Mock encrypted file ${id} not found`);
      return f;
    },
    setFiles: (seeds) => {
      files.clear();
      for (const seed of seeds) files.set(seed.id, seedToRecord(seed));
    },
    setFileKeys: (id, keys) => {
      const f = files.get(id);
      if (!f) throw new Error(`Mock encrypted file ${id} not found`);
      f.fileKeys = keys;
    },
    setRoomUserKeys: (keys) => {
      roomUserKeys = [...keys];
    },
    setFileOutsidePrivateRoom: (fileId) => {
      outsidePrivateRoom.add(fileId);
    },
    getSessions: () => Array.from(sessions.values()),
    getRequests: () => [...requests],
    reset: () => {
      files.clear();
      sessions.clear();
      createdOn.clear();
      outsidePrivateRoom.clear();
      requests.length = 0;
      roomUserKeys = [];
      nextFileId = 1000;
      nextSessionId = 1;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const apiBase = `${BASE_URL}:${port}/${API_PREFIX}`;

  return [
    /**
     * Mirrors VirtualRoomsCommonController.GetVirtualRooms / FoldersControllerHelper
     * folder listing — returns the room's files+folders in the standard DTO shape.
     */
    http.get(`${apiBase}/files/:folderId(\\d+)`, ({ params, request }) => {
      const folderId = Number(params.folderId);
      if (folderId !== roomId) {
        return undefined;
      }
      requests.push({ method: "GET", url: new URL(request.url).pathname });

      const all = Array.from(files.values());
      return okResponse({
        files: all.map((f) => buildFileDto(f, roomId, ownerId, port)),
        folders: [],
        current: buildFolderDto(roomId),
        pathParts: [{ id: roomId, title: "Private Room" }],
        startIndex: 0,
        count: all.length,
        total: all.length,
        new: 0,
      });
    }),

    /**
     * Mirrors FoldersController.GetFolder.
     * @see server/products/ASC.Files/Server/Api/FoldersController.cs (HttpGet "folder/{folderId}")
     */
    http.get(
      `${apiBase}/files/folder/:folderId(\\d+)`,
      ({ params, request }) => {
        const folderId = Number(params.folderId);
        if (folderId !== roomId) return undefined;
        requests.push({ method: "GET", url: new URL(request.url).pathname });
        return okResponse(buildFolderDto(roomId));
      },
    ),

    /**
     * Mirrors UploadController.CheckUpload — preflight collision check; returns
     * the list of files in the destination folder that would conflict.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/upload/check`,
      async ({ params, request }) => {
        const folderId = Number(params.folderId);
        if (folderId !== roomId) return undefined;
        const body = (await request.json()) as { filesTitle?: string[] };
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body,
        });
        return okResponse([]);
      },
    ),

    /**
     * Mirrors FilesController.GetEncryptionInfoAsync
     * (HttpGet "{fileId}/access"): `userKeys` are the caller's own key pairs
     * (left out when the caller has none) and `fileKeys` only the caller's
     * entries (FileDao.GetFileKeys(fileId, CurrentAccount.ID)), as
     * FileKeysDto. A missing file is an InvalidOperationException, so 403.
     */
    http.get(
      `${apiBase}/files/:fileId(\\d+)/access`,
      ({ params, request }) => {
        const fileId = Number(params.fileId);
        const f = files.get(fileId);
        requests.push({
          method: "GET",
          url: new URL(request.url).pathname,
        });
        if (!f) return errorResponse(403, `file ${fileId} not found`);
        return okResponse({
          ...(opts.callerKeys ? { userKeys: opts.callerKeys } : {}),
          fileKeys: f.fileKeys
            .filter((k) => String(k.userId) === currentUserId)
            .map((k) => ({
              userId: k.userId,
              publicKeyId: k.publicKeyId,
              privateKeyEnc: k.privateKeyEnc,
              tenantId: MOCK_TENANT_ID,
              fileId,
              createOn: keyCreatedOn(fileId, k.userId),
            })),
        });
      },
    ),

    /**
     * Mirrors FilesController.SetEncryptionInfoAsync ->
     * FileStorageService.SetEncryptionInfoAsync -> FileDao.SetFileKey
     * (HttpPut "{fileId}/access"). The body binds to
     * `[FromBody] IEnumerable<AccessRequestKeyDto>`, so it is a bare array;
     * the mock answers anything else with 400. SetFileKey deletes the rows of
     * the listed users and inserts the new ones, so every other user's row
     * stays. The action returns nothing, so the envelope has no `response`.
     * A missing file is an InvalidOperationException, so 403. The server's
     * read, private-room and create-right checks are not modelled here.
     */
    http.put(
      `${apiBase}/files/:fileId(\\d+)/access`,
      async ({ params, request }) => {
        const fileId = Number(params.fileId);
        const body = (await request.json()) as unknown;
        requests.push({
          method: "PUT",
          url: new URL(request.url).pathname,
          body,
        });
        if (!Array.isArray(body)) {
          return errorResponse(400, "The keys must be sent as an array");
        }
        const keys = body as EncryptedFileKey[];
        const f = files.get(fileId);
        if (!f) return errorResponse(403, `file ${fileId} not found`);
        // Two entries for one user collide on the (tenant, file, user) key;
        // the mock refuses the whole write like the failed transaction.
        const listed = new Set<string>();
        for (const k of keys) {
          const uid = String(k.userId);
          if (listed.has(uid)) {
            return errorResponse(
              403,
              `duplicate DbFileKeys row for user ${uid} on file ${fileId}`,
            );
          }
          listed.add(uid);
        }
        f.fileKeys = [
          ...f.fileKeys.filter((k) => !listed.has(String(k.userId))),
          ...keys,
        ];
        for (const uid of listed) createdOn.delete(`${fileId}:${uid}`);
        return new Response(JSON.stringify({ status: 0, statusCode: 200 }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    ),

    /**
     * Mirrors SecurityController.GetEncryptionAccess ->
     * EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)
     * (HttpGet "file/{fileId}/publickeys"): the keys of the users who reach
     * the file through a direct user share (here: the room's member keys).
     * 404 for a missing file, 415 for a file outside a private room
     * (NotSupportedException); SanitizeAccessKeys drops entries without a
     * public key and keeps the private half only on the caller's entries.
     */
    http.get(
      `${apiBase}/files/file/:fileId(\\d+)/publickeys`,
      ({ params, request }) => {
        const fileId = Number(params.fileId);
        const f = files.get(fileId);
        requests.push({
          method: "GET",
          url: new URL(request.url).pathname,
        });
        if (!f) return errorResponse(404, `file ${fileId} not found`);
        if (outsidePrivateRoom.has(fileId)) {
          return errorResponse(415, "Unsupported Media Type");
        }
        return okResponse(
          roomUserKeys
            .filter((k) => !!k.publicKey?.trim())
            .map((k) => {
              if (String(k.userId) === currentUserId) return { ...k };
              const { privateKeyEnc: _privateKeyEnc, ...rest } = k;
              return rest;
            }),
        );
      },
    ),

    /**
     * Mock-only: serves the encrypted blob for download. Real server routes
     * download via FileHandler.ashx with a signed token; tests use this stub.
     */
    http.get(
      `${apiBase}/files/file/:fileId(\\d+)/download`,
      ({ params, request }) => {
        const fileId = Number(params.fileId);
        const f = files.get(fileId);
        requests.push({
          method: "GET",
          url: new URL(request.url).pathname,
        });
        if (!f) return errorResponse(404, `file ${fileId} not found`);

        const body = f.bytes ?? new Uint8Array();
        const headers: Record<string, string> = {
          "Content-Type": "application/octet-stream",
          "Content-Length": String(body.byteLength),
        };
        if (f.encryptedNameHeader) {
          headers["X-Encrypted-Name"] = f.encryptedNameHeader;
        }
        return new Response(body.slice().buffer, { headers });
      },
    ),

    /**
     * Mirrors UploadController.CreateUploadSessionInFolder
     * (HttpPost "{folderId}/session") -> ChunkedUploadSessionHelper
     * .ToResponseObjectAsync(session, appendBreadCrumbs: true): a
     * ChunkedUploadSessionDto whose `path` is the breadcrumb chain of folder
     * ids, from the Rooms section down to the target folder.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/session`,
      async ({ params, request }) => {
        const folderId = Number(params.folderId);
        const body = (await request.json()) as {
          fileName: string;
          fileSize: number;
          encrypted: boolean;
        };
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body,
        });

        const sessionId = `mock-session-${nextSessionId++}`;
        const created = new Date();
        const session: UploadSessionRecord = {
          id: sessionId,
          folderId,
          fileName: body.fileName,
          fileSize: body.fileSize,
          encrypted: !!body.encrypted,
          chunks: [],
          completed: false,
          created: created.toISOString(),
          expired: new Date(
            created.getTime() + SESSION_SLIDING_EXPIRATION_MS,
          ).toISOString(),
        };
        sessions.set(sessionId, session);
        const path =
          folderId === roomId
            ? [ROOMS_SECTION_ID, roomId]
            : [ROOMS_SECTION_ID, roomId, folderId];
        return okResponse(sessionDto(session, path));
      },
    ),

    /**
     * Mirrors UploadController.UploadAsyncSession
     * (HttpPost "{folderId}/session/{sessionId}/upload"): stores one numbered
     * part and answers the ChunkedUploadSessionDto (path = [folderId]). It
     * never assembles the file; that happens on finalize.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/session/:sessionId/upload`,
      async ({ params, request }) => {
        const session = sessions.get(String(params.sessionId));
        if (!session || session.completed) {
          return errorResponse(404, "session not found");
        }

        const chunkBytes = await readChunk(request);
        session.chunks.push(chunkBytes);
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body: { chunkBytes: chunkBytes.byteLength },
        });

        return okResponse(sessionDto(session, [session.folderId]));
      },
    ),

    /**
     * Mirrors UploadController.UploadSession
     * (HttpPost "{folderId}/session/{sessionId}"): stores one part in order;
     * once every byte arrived the server finalises the session and answers
     * 201 with an UploadSessionResponseDto carrying `uploaded: true` and the
     * stored FileDto, otherwise 200 with `uploaded: false` and the DTO of the
     * file not stored yet (id 0, version 1).
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/session/:sessionId`,
      async ({ params, request }) => {
        const session = sessions.get(String(params.sessionId));
        if (!session || session.completed) {
          return errorResponse(404, "session not found");
        }

        const chunkBytes = await readChunk(request);
        session.chunks.push(chunkBytes);
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body: { chunkBytes: chunkBytes.byteLength },
        });

        if (sessionBytes(session) < session.fileSize) {
          const pending: EncryptedFileRecord = {
            id: 0,
            title: session.fileName,
            serverTitle: session.fileName,
            size: session.fileSize,
            encrypted: session.encrypted,
            fileKeys: [],
          };
          return okResponse({
            id: 0,
            folderId: session.folderId,
            version: 1,
            title: session.fileName,
            uploaded: false,
            file: buildFileDto(pending, session.folderId, ownerId, port),
          });
        }
        return okResponse(completeSession(session), 201);
      },
    ),

    /**
     * Mirrors UploadController.FinalizeSession
     * (HttpPut "{folderId}/session/{sessionId}/finalize"): assembles the
     * numbered parts and answers 201 with an UploadSessionResponseDto. A
     * session that is unknown or already finalised answers 404.
     */
    http.put(
      `${apiBase}/files/:folderId(\\d+)/session/:sessionId/finalize`,
      async ({ params, request }) => {
        const session = sessions.get(String(params.sessionId));
        requests.push({
          method: "PUT",
          url: new URL(request.url).pathname,
          body: {},
        });
        if (!session || session.completed) {
          return errorResponse(404, "session not found");
        }
        return okResponse(completeSession(session), 201);
      },
    ),

    /**
     * Mirrors OperationController.DeleteBatchItems.
     * @see server/products/ASC.Files/Server/Api/OperationController.cs (HttpPut "fileops/delete")
     *
     * Removes the listed files from the mock and answers with one operation
     * that is already finished (FileOperationType.Delete = 2), so the client
     * does not poll `fileops` for progress.
     */
    http.put(`${apiBase}/files/fileops/delete`, async ({ request }) => {
      const body = (await request.json()) as {
        fileIds?: (number | string)[];
        folderIds?: (number | string)[];
        immediately?: boolean;
      };
      requests.push({
        method: "PUT",
        url: new URL(request.url).pathname,
        body,
      });
      const fileIds = (body.fileIds ?? []).map(Number);
      for (const id of fileIds) files.delete(id);
      return okResponse([
        {
          id: `mock-delete-${requests.length}`,
          Operation: 2,
          progress: 100,
          error: "",
          processed: String(fileIds.length),
          finished: true,
          files: [],
          folders: [],
        },
      ]);
    }),
  ];
};
