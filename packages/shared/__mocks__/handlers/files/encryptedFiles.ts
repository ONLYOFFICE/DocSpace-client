// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
};

export type EncryptedFilesHandlerHandle = {
  getFiles: () => EncryptedFileRecord[];
  getFile: (fileId: number) => EncryptedFileRecord;
  setFiles: (files: EncryptedFileSeed[]) => void;
  setFileKeys: (fileId: number, keys: EncryptedFileKey[]) => void;
  setRoomUserKeys: (keys: RoomMemberKeyEntry[]) => void;
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
  handle?: { current: EncryptedFilesHandlerHandle | null };
};

const okResponse = <T>(response: T): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode: 200 }),
    { headers: { "Content-Type": "application/json" } },
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
  let nextFileId = 1000;
  let nextSessionId = 1;

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
    getSessions: () => Array.from(sessions.values()),
    getRequests: () => [...requests],
    reset: () => {
      files.clear();
      sessions.clear();
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
     * Mirrors FilesController.GetEncryptionInfoAsync.
     * @see server/products/ASC.Files/Server/Api/FilesController.cs (HttpGet "{fileId}/access")
     *
     * Response shape (FileEncryptionInfoDto):
     *  - userKeys: CURRENT user's identity keys (from
     *    encryptionKeyPairDtoHelper.GetKeyPairAsync()). NOT room members' keys.
     *  - fileKeys: per-recipient wrapped DEKs scoped to current user.
     *
     * Clients that need room members' public keys for unwrap MUST call
     * GET /privacyroom/{roomId}/access (GetUserKeysForRoom) instead.
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
        if (!f) return errorResponse(404, `file ${fileId} not found`);
        return okResponse({
          userKeys: roomUserKeys,
          fileKeys: f.fileKeys.map((k) => ({
            userId: k.userId,
            publicKeyId: k.publicKeyId,
            privateKeyEnc: k.privateKeyEnc,
            fileId,
          })),
        });
      },
    ),

    /**
     * Mirrors FilesController.SetEncryptionInfoAsync.
     * @see server/products/ASC.Files/Server/Api/FilesController.cs (HttpPut "{fileId}/access")
     *
     * Replaces the file's per-recipient wrapped DEKs. Body is either
     * EncryptedFileKey[] (legacy) or { keys: EncryptedFileKey[] }.
     */
    http.put(
      `${apiBase}/files/:fileId(\\d+)/access`,
      async ({ params, request }) => {
        const fileId = Number(params.fileId);
        const body = (await request.json()) as
          | EncryptedFileKey[]
          | { keys?: EncryptedFileKey[] };
        const keys = Array.isArray(body) ? body : (body.keys ?? []);
        requests.push({
          method: "PUT",
          url: new URL(request.url).pathname,
          body: keys,
        });
        const f = files.get(fileId);
        if (!f) return errorResponse(404, `file ${fileId} not found`);
        f.fileKeys = keys;
        return okResponse({ keys });
      },
    ),

    /**
     * Mirrors SecurityController.GetEncryptionAccess.
     * @see server/products/ASC.Files/Server/Api/SecurityController.cs (HttpGet "file/{fileId}/publickeys")
     *
     * Returns identity public keys of every user who currently has share/read
     * access to the file. Used by re-wrap flow (UploadDataStore.encryptKeysForRoomMembers)
     * to find new recipients AND to look up the sender's public key during unwrap.
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
        return okResponse(roomUserKeys);
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
     * Mirrors UploadController.CreateUploadSession.
     * @see server/products/ASC.Files/Server/Api/UploadController.cs
     *
     * Starts a chunked upload session for the given folder; returns
     * { id, path, bytes_total, bytes_uploaded, created, expired }.
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
        sessions.set(sessionId, {
          id: sessionId,
          folderId,
          fileName: body.fileName,
          fileSize: body.fileSize,
          encrypted: !!body.encrypted,
          chunks: [],
          completed: false,
        });
        return okResponse({
          id: sessionId,
          path: `/files/${folderId}/session/${sessionId}/upload`,
          bytes_total: body.fileSize,
          bytes_uploaded: 0,
          created: new Date(),
          expired: new Date(Date.now() + 60 * 60 * 1000),
        });
      },
    ),

    /**
     * Mirrors UploadController.UploadChunkInSession — accepts one chunk of the
     * session's payload as multipart/form-data. On the final chunk the server
     * materialises the file record and returns its full FileDto.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/session/:sessionId/upload`,
      async ({ params, request }) => {
        const session = sessions.get(String(params.sessionId));
        if (!session) return errorResponse(404, "session not found");

        const fd = await request.formData();
        const filePart = fd.get("file");
        const chunkBytes =
          filePart instanceof Blob
            ? new Uint8Array(await filePart.arrayBuffer())
            : new Uint8Array();
        session.chunks.push(chunkBytes);
        const totalUploaded = session.chunks.reduce(
          (acc, c) => acc + c.byteLength,
          0,
        );
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body: { chunkBytes: chunkBytes.byteLength },
        });

        const isFinal = totalUploaded >= session.fileSize;
        if (isFinal && !session.completed) {
          session.completed = true;
          const id = nextFileId++;
          session.resultFileId = id;
          const merged = new Uint8Array(totalUploaded);
          let offset = 0;
          for (const c of session.chunks) {
            merged.set(c, offset);
            offset += c.byteLength;
          }
          files.set(id, {
            id,
            title: session.fileName,
            serverTitle: session.fileName,
            size: session.fileSize,
            encrypted: session.encrypted,
            fileKeys: [],
            bytes: merged,
          });
          return okResponse({
            success: true,
            data: buildFileDto(
              files.get(id) as EncryptedFileRecord,
              session.folderId,
              ownerId,
              port,
            ),
          });
        }

        return okResponse({
          success: true,
          data: {
            id: session.id,
            bytes_total: session.fileSize,
            bytes_uploaded: totalUploaded,
          },
        });
      },
    ),
  ];
};
