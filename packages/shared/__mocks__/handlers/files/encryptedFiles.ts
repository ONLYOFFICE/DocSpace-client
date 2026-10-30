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
  /** One of `folders`; the room itself when left out. */
  folderId?: number;
};

export type EncryptedFileRecord = Required<
  Omit<EncryptedFileSeed, "bytes" | "encryptedNameHeader" | "folderId">
> & {
  bytes?: Uint8Array;
  encryptedNameHeader?: string;
  folderId?: number;
};

export type EncryptedFolderSeed = { id: number; title: string };

export type UploadSessionRecord = {
  id: string;
  /** The account that opened the session. */
  userId: string;
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
  /** Answers as another signed-in user until `reset`. */
  setCurrentUserId: (userId: string) => void;
  /**
   * The bytes a new upload may take (the room's free space); a session for a
   * larger file is refused as the server refuses it. Null lifts the limit.
   */
  setFreeSpace: (bytes: number | null) => void;
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
  /**
   * The room lies in the Archive section. Rights then follow the Archive
   * branch of FileSecurity.FilterEntryAsync (FileSecurity.cs, FolderType.Archive)
   * for the room owner: files keep Read, Download, ReadHistory and Copy and
   * lose Edit, Rename, Move, Delete and Duplicate; the room denies Create,
   * CopyTo and MoveTo.
   */
  archived?: boolean;
  /** `false` serves an ordinary room through the same routes. */
  isPrivate?: boolean;
  /** The room's title; "Private Room" when left out. */
  title?: string;
  /** Folders directly inside the room. */
  folders?: EncryptedFolderSeed[];
  /**
   * The rights of the active room, as FolderDtoHelper sends them in
   * `security`; the active room carries none when left out.
   */
  roomSecurity?: Record<string, boolean>;
  /**
   * Mock-only: another instance serves other rooms in the same spec, so a
   * file, folder or upload session this room does not hold falls through to
   * it instead of being answered 403 or 404.
   */
  withOtherRooms?: boolean;
  handle?: { current: EncryptedFilesHandlerHandle | null };
};

const DEFAULT_CURRENT_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef"; // matches successSelf
const MOCK_TENANT_ID = 1;
/** The Rooms section folder id the room mocks share (see privateRoomList.ts). */
const ROOMS_SECTION_ID = 2002;
/** The Archive section folder id of the root mock (see root.ts). */
const ARCHIVE_SECTION_ID = 11244;

const sectionOf = (archived: boolean) =>
  archived
    ? { id: ARCHIVE_SECTION_ID, title: "Archive", folderType: 20 }
    : { id: ROOMS_SECTION_ID, title: "Rooms", folderType: 14 };
/** ChunkedUploadSessionHolder.SlidingExpiration. */
const SESSION_SLIDING_EXPIRATION_MS = 12 * 60 * 60 * 1000;

/** Configuration.DocType for the extensions the mock seeds use. */
const DOCUMENT_TYPE_BY_EXTENSION = {
  docx: "word",
  xlsx: "cell",
  pptx: "slide",
  pdf: "pdf",
} as const;
/** The `files:viewed-images` setting of appsettings.json. */
const VIEWED_IMAGES = [
  ".svg",
  ".bmp",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".ico",
  ".tif",
  ".tiff",
  ".webp",
  ".heic",
];
/** The `files:viewed-media` setting of appsettings.json. */
const VIEWED_MEDIA = [
  ".aac",
  ".flac",
  ".m4a",
  ".mp3",
  ".oga",
  ".ogg",
  ".wav",
  ".f4v",
  ".m4v",
  ".mov",
  ".mp4",
  ".ogv",
  ".webm",
];

const okResponse = <T>(response: T, statusCode = 200): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode }),
    { status: statusCode, headers: { "Content-Type": "application/json" } },
  );

const errorResponse = (
  status: number,
  message: string,
  type?: string,
): Response =>
  new Response(
    JSON.stringify({
      error: { message, ...(type && { type }) },
      status: 1,
      statusCode: status,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );

/** Mirrors CommonFileSizeComment.FilesSizeToString with the English postfixes. */
const filesSizeToString = (size: number) => {
  const names = ["bytes", "KB", "MB", "GB", "TB"];
  let power = 0;
  let result = size;
  if (result >= 1024) {
    power = Math.min(
      Math.floor(Math.log(result) / Math.log(1024)),
      names.length - 1,
    );
    result /= 1024 ** power;
  }
  return `${result.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${names[power]}`;
};

const seedToRecord = (seed: EncryptedFileSeed): EncryptedFileRecord => ({
  id: seed.id,
  title: seed.title,
  serverTitle: seed.serverTitle ?? seed.title,
  size: seed.size ?? 0,
  encrypted: seed.encrypted ?? true,
  fileKeys: seed.fileKeys ?? [],
  bytes: seed.bytes,
  encryptedNameHeader: seed.encryptedNameHeader,
  folderId: seed.folderId,
});

const buildFileDto = (
  record: EncryptedFileRecord,
  roomId: number,
  ownerId: string,
  port?: string,
  archived = false,
) => {
  const section = sectionOf(archived);
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
    folderId: record.folderId ?? roomId,
    rootFolderId: section.id,
    rootFolderType: section.folderType,
    ...(!archived && { parentRoomType: 19 }),
    pureContentLength: record.size,
    contentLength: `${record.size} bytes`,
    version: 1,
    versionGroup: 1,
    access: 0,
    canShare: true,
    shared: false,
    mute: false,
    ...(record.encrypted ? { encrypted: true } : {}),
    thumbnailStatus: 1,
    thumbnailUrl: "",
    viewUrl: `${downloadOrigin}/api/2.0/files/file/${record.id}/download`,
    webUrl: `${downloadOrigin}/api/2.0/files/file/${record.id}/download`,
    shortWebUrl: "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    createdBy: creator,
    updatedBy: creator,
    // FileUtility.GetAccessibility reads ImageView and MediaView from the
    // title's extension; the mock keeps the other entries off.
    viewAccessibility: {
      ImageView: VIEWED_IMAGES.includes(fileExst.toLowerCase()),
      MediaView: VIEWED_MEDIA.includes(fileExst.toLowerCase()),
      WebView: false,
      WebEdit: false,
      WebReview: false,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: false,
      WebComment: false,
      CanConvert: false,
      MustConvert: false,
    },
    security: {
      Read: true,
      Edit: true,
      Delete: true,
      Download: true,
      Copy: false,
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
      Vectorization: false,
      ...(archived && {
        Edit: false,
        Delete: false,
        Copy: true,
        Move: false,
        Rename: false,
        ReadHistory: true,
        Duplicate: false,
      }),
    },
  };
};

/**
 * The room as FolderDtoHelper.GetAsync builds it. `foldersCount` is the
 * stored count of folders below it (FolderQueries.UpdateFoldersCountAsync);
 * the mock's folders all sit directly in the room.
 */
const buildFolderDto = (
  roomId: number,
  archived = false,
  isPrivate = true,
  title = "Private Room",
  foldersCount = 0,
) => {
  const section = sectionOf(archived);
  return {
    id: roomId,
    title,
    parentId: section.id,
    filesCount: 0,
    foldersCount,
    rootFolderId: section.id,
    rootFolderType: section.folderType,
    roomType: 5,
    shared: false,
    private: isPrivate,
    // FolderDtoHelper sets InRoom for the room's creator and for a user with
    // a direct share record; the mock's current user is always one of them.
    inRoom: true,
    ...(archived && {
      security: {
        Read: true,
        Download: true,
        Copy: true,
        Create: false,
        CopyTo: false,
        MoveTo: false,
        EditRoom: false,
        Rename: false,
      },
    }),
  };
};

/**
 * A folder inside the room, as FolderDtoHelper.GetAsync builds it: `private`
 * is the folder's own setting, which only a room carries, and the rights
 * follow FileSecurity.FilterEntryAsync for the room owner. In an active
 * private room a subfolder loses Copy and CopyTo; in Archive only Read,
 * ReadHistory, Copy and Download pass for a folder that is not the room.
 */
const buildSubfolderDto = (
  folder: EncryptedFolderSeed,
  roomId: number,
  archived: boolean,
  isPrivate: boolean,
) => {
  const section = sectionOf(archived);
  const activeSecurity = {
    Read: true,
    Create: true,
    Delete: true,
    Download: true,
    Rename: true,
    Move: true,
    MoveTo: true,
    Copy: !isPrivate,
    CopyTo: !isPrivate,
    Duplicate: true,
    EditAccess: !isPrivate,
  };
  return {
    id: folder.id,
    title: folder.title,
    parentId: roomId,
    filesCount: 0,
    foldersCount: 0,
    fileEntryType: 1,
    rootFolderId: section.id,
    rootFolderType: section.folderType,
    shared: false,
    private: false,
    ...(!archived && { parentRoomType: 19 }),
    security: archived
      ? {
          Read: true,
          ReadHistory: true,
          Copy: true,
          Download: true,
          Create: false,
          Delete: false,
          Rename: false,
          Move: false,
          MoveTo: false,
          CopyTo: false,
          Duplicate: false,
          EditAccess: false,
        }
      : activeSecurity,
  };
};

export const encryptedFilesHandlers = (
  port: string,
  opts: EncryptedFilesHandlerOptions,
) => {
  const roomId = opts.roomId;
  // Restoring the room from Archive (PUT fileops/move) moves it to Rooms.
  let archived = !!opts.archived;
  const isPrivate = opts.isPrivate ?? true;
  const roomTitle = opts.title ?? "Private Room";
  const folders = opts.folders ?? [];
  const withOtherRooms = !!opts.withOtherRooms;
  const holdsFolder = (folderId: number) =>
    folderId === roomId || folders.some((f) => f.id === folderId);
  const roomDto = () => ({
    ...buildFolderDto(roomId, archived, isPrivate, roomTitle, folders.length),
    ...(!archived && opts.roomSecurity && { security: opts.roomSecurity }),
  });
  const ownerId =
    opts.ownerId ?? "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
  const files = new Map<number, EncryptedFileRecord>();
  for (const seed of opts.initialFiles ?? []) {
    files.set(seed.id, seedToRecord(seed));
  }
  const sessions = new Map<string, UploadSessionRecord>();
  const requests: RequestLog[] = [];
  let roomUserKeys: RoomMemberKeyEntry[] = [...(opts.roomUserKeys ?? [])];
  let currentUserId = opts.currentUserId ?? DEFAULT_CURRENT_USER_ID;
  let freeSpace: number | null = null;
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
  /** FileOperationDto entries of the moves this room ran, for fileops. */
  const operations: Record<string, unknown>[] = [];

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
      folderId: session.folderId,
    };
    files.set(id, record);
    return {
      id,
      folderId: session.folderId,
      version: 1,
      title: session.fileName,
      uploaded: true,
      file: buildFileDto(record, session.folderId, ownerId, port, archived),
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
    setCurrentUserId: (userId) => {
      currentUserId = userId;
    },
    setFreeSpace: (bytes) => {
      freeSpace = bytes;
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
      operations.length = 0;
      currentUserId = opts.currentUserId ?? DEFAULT_CURRENT_USER_ID;
      freeSpace = null;
      archived = !!opts.archived;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const apiBase = `${BASE_URL}:${port}/${API_PREFIX}`;

  return [
    /**
     * Mirrors FoldersController.GetFolderByFolderId (HttpGet "{folderId}"): a
     * FolderContentDto of the room or of a folder in it.
     * FileStorageService.GetFolderItemsAsync stamps the room's type
     * (CustomRoom, 19) as `parentRoomType` on the folder and on every entry
     * in it only under the Rooms section (RootFolderType VirtualRooms), so an
     * archived room's answer carries none. `pathParts` are its breadcrumbs,
     * each `{ id, title, roomType, folderType }`; MapToRoomType gives the
     * section (Rooms or Archive) no room type, so that part has none.
     */
    http.get(`${apiBase}/files/:folderId(\\d+)`, ({ params, request }) => {
      const folderId = Number(params.folderId);
      const subfolder = folders.find((f) => f.id === folderId);
      if (folderId !== roomId && !subfolder) {
        return undefined;
      }
      requests.push({ method: "GET", url: new URL(request.url).pathname });

      const listed = Array.from(files.values()).filter(
        (f) => (f.folderId ?? roomId) === folderId,
      );
      const listedFolders = subfolder
        ? []
        : folders.map((f) =>
            buildSubfolderDto(f, roomId, archived, isPrivate),
          );
      const section = sectionOf(archived);
      const current = subfolder
        ? buildSubfolderDto(subfolder, roomId, archived, isPrivate)
        : { ...roomDto(), ...(!archived && { parentRoomType: 19 }) };
      return okResponse({
        files: listed.map((f) =>
          buildFileDto(f, roomId, ownerId, port, archived),
        ),
        folders: listedFolders,
        current,
        pathParts: [
          { id: section.id, title: section.title, folderType: section.folderType },
          { id: roomId, title: roomTitle, roomType: 5, folderType: 19 },
          ...(subfolder
            ? [{ id: subfolder.id, title: subfolder.title, folderType: 1 }]
            : []),
        ],
        startIndex: 0,
        count: listed.length + listedFolders.length,
        total: listed.length + listedFolders.length,
        new: 0,
      });
    }),

    /**
     * Mirrors FoldersController.GetFolderInfo (HttpGet "folder/{folderId}"):
     * the FolderDto of the room or of a folder in it. DetermineParentRoomType
     * finds no room above a room, so the room carries no `parentRoomType`.
     */
    http.get(
      `${apiBase}/files/folder/:folderId(\\d+)`,
      ({ params, request }) => {
        const folderId = Number(params.folderId);
        const subfolder = folders.find((f) => f.id === folderId);
        if (folderId !== roomId && !subfolder) return undefined;
        requests.push({ method: "GET", url: new URL(request.url).pathname });
        return okResponse(
          subfolder
            ? buildSubfolderDto(subfolder, roomId, archived, isPrivate)
            : roomDto(),
        );
      },
    ),

    /**
     * Mirrors FoldersController.GetFolderPath (HttpGet "folder/{folderId}/path"):
     * the breadcrumbs of the folder as FileEntryBaseDto entries, from the
     * section root down to the folder itself, each built by FolderDtoHelper.
     */
    http.get(
      `${apiBase}/files/folder/:folderId(\\d+)/path`,
      ({ params, request }) => {
        const folderId = Number(params.folderId);
        const subfolder = folders.find((f) => f.id === folderId);
        if (folderId !== roomId && !subfolder) return undefined;
        requests.push({ method: "GET", url: new URL(request.url).pathname });
        const section = sectionOf(archived);
        return okResponse([
          {
            id: section.id,
            title: section.title,
            parentId: 0,
            rootFolderId: section.id,
            rootFolderType: section.folderType,
            fileEntryType: 1,
          },
          roomDto(),
          ...(subfolder
            ? [buildSubfolderDto(subfolder, roomId, archived, isPrivate)]
            : []),
        ]);
      },
    ),

    /**
     * Mirrors UploadController.CheckUploadAsync
     * (HttpPost "{folderId}/upload/check"): the submitted titles that already
     * belong to a file in the folder, without repetitions, matched by title
     * ignoring case. An encrypted file is left out, since an upload cannot
     * take it over; a body without `filesTitle` is a 400.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/upload/check`,
      async ({ params, request }) => {
        const folderId = Number(params.folderId);
        if (!holdsFolder(folderId)) return undefined;
        const body = (await request.json()) as { filesTitle?: string[] };
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body,
        });
        if (!body.filesTitle) {
          return errorResponse(400, "filesTitle is required");
        }
        const taken = new Set(
          Array.from(files.values())
            .filter((f) => !f.encrypted && (f.folderId ?? roomId) === folderId)
            .map((f) => f.serverTitle.toLowerCase()),
        );
        return okResponse(
          Array.from(
            new Set(
              body.filesTitle.filter((title) =>
                taken.has(title.toLowerCase()),
              ),
            ),
          ),
        );
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
        if (!f && withOtherRooms) return undefined;
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
        if (!files.has(fileId) && withOtherRooms) return undefined;
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
        listed.forEach((uid) => createdOn.delete(`${fileId}:${uid}`));
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
     * The private-room check accepts RootFolderType VirtualRooms only, so
     * every file of an archived room is answered 415 as well.
     */
    http.get(
      `${apiBase}/files/file/:fileId(\\d+)/publickeys`,
      ({ params, request }) => {
        const fileId = Number(params.fileId);
        const f = files.get(fileId);
        if (!f && withOtherRooms) return undefined;
        requests.push({
          method: "GET",
          url: new URL(request.url).pathname,
        });
        if (!f) return errorResponse(404, `file ${fileId} not found`);
        if (archived || outsidePrivateRoom.has(fileId)) {
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
     * Mirrors FilesController.GetFileInfo (HttpGet "file/{fileId}") ->
     * FilesControllerHelper.GetFileInfoAsync -> FileDtoHelper.GetAsync: the
     * file as the room listing reports it (SetAssignedMetadataTemplatesAsync
     * adds nothing for a tenant without metadata templates). An unknown file
     * is 404 (NotFoundIfNull).
     */
    http.get(`${apiBase}/files/file/:fileId(\\d+)`, ({ params, request }) => {
      const fileId = Number(params.fileId);
      const f = files.get(fileId);
      if (!f && withOtherRooms) return undefined;
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      if (!f) return errorResponse(404, "File not found");
      return okResponse(buildFileDto(f, roomId, ownerId, port, archived));
    }),

    /**
     * Mirrors EditorController.OpenEditFile (HttpGet "file/{fileId}/openedit")
     * -> DocumentServiceHelper.GetParamsAsync -> ConfigurationConverter.Convert
     * for a desktop opening by the signed-in user: the document (the stored,
     * opaque title; the address of the content, here the mock download route;
     * the revision key; the caller's permissions; the reference data with the
     * file key and the instance id only, since RoomId is set for a virtual
     * data room alone), the editor configuration (mode "edit" unless the
     * caller asks `view` or the room is archived; the callback address while
     * the session may write; the caller's full key list with privateKeyEnc
     * in encryptionKeys when the file lies in a private room, as
     * EncryptionKeyPairDtoHelper.GetKeyPairAsync() returns it; mentionShare
     * false and no favorite for an encrypted file), the signature token and
     * the file as FileDtoHelper reports it. A missing file is 404.
     */
    http.get(
      `${apiBase}/files/file/:fileId(\\d+)/openedit`,
      ({ params, request }) => {
        const fileId = Number(params.fileId);
        const f = files.get(fileId);
        if (!f && withOtherRooms) return undefined;
        const url = new URL(request.url);
        requests.push({ method: "GET", url: url.pathname });
        if (!f) return errorResponse(404, `file ${fileId} not found`);

        const origin = port ? `${BASE_URL}:${port}` : BASE_URL;
        const dotIdx = f.serverTitle.lastIndexOf(".");
        const fileExt =
          dotIdx > 0 ? f.serverTitle.slice(dotIdx + 1).toLowerCase() : "";
        const documentType =
          DOCUMENT_TYPE_BY_EXTENSION[
            fileExt as keyof typeof DOCUMENT_TYPE_BY_EXTENSION
          ] ?? "";
        const isPdf = fileExt === "pdf";
        const canEdit = !archived;
        const tryEdit = url.searchParams.get("view") !== "true";
        const modeWrite = canEdit && tryEdit;
        const key = `${MOCK_TENANT_ID}_${fileId}_1`;
        const folderId = f.folderId ?? roomId;
        const gobackUrl = archived
          ? `${origin}/rooms/archived/filter?folder=${folderId}`
          : `${origin}/rooms/shared/${folderId}/filter?folder=${folderId}`;

        return okResponse({
          document: {
            fileType: fileExt,
            info: {
              ...(!f.encrypted && { favorite: false }),
              folder: `${sectionOf(archived).title} \\ ${roomTitle}`,
              owner: "Test User",
              type: 0,
              uploaded: "01/01/2026 12:00 PM",
            },
            isLinkedForMe: false,
            key,
            permissions: {
              comment: canEdit,
              chat: true,
              download: true,
              edit: canEdit,
              fillForms: canEdit,
              modifyFilter: canEdit,
              protect: true,
              print: true,
              review: canEdit,
              copy: true,
            },
            referenceData: {
              fileKey: String(fileId),
              instanceId: String(MOCK_TENANT_ID),
              canEditRoom: false,
            },
            title: f.serverTitle,
            url: `${origin}/${API_PREFIX}/files/file/${fileId}/download`,
            isForm: false,
          },
          documentType,
          editorConfig: {
            ...(modeWrite && {
              callbackUrl: `${origin}/filehandler.ashx?action=track&fileid=${fileId}&auth=mock-auth-key`,
            }),
            createUrl: `${origin}/filehandler.ashx?action=create&doctype=${documentType}&title=New+document`,
            customization: {
              about: true,
              forcesave: false,
              goback: { url: gobackUrl },
              logo: {
                image: `${origin}/logo/editor.png`,
                imageDark: `${origin}/logo/editor-dark.png`,
                imageLight: `${origin}/logo/editor-light.png`,
                url: origin,
                visible: true,
              },
              mentionShare: !f.encrypted,
              ...(!modeWrite && { review: { reviewDisplay: "markup" } }),
              ...(isPdf && {
                submitForm: { visible: false, resultMessage: "" },
              }),
              anonymous: { request: true },
              ai: { disabled: false },
            },
            ...(isPrivate &&
              opts.callerKeys && {
                encryptionKeys: opts.callerKeys.map((k) => ({ ...k })),
              }),
            lang: "en-US",
            mode: modeWrite ? "edit" : "view",
            modeWrite,
            plugins: { pluginsData: [] },
            templates: [],
            user: {
              id: currentUserId,
              name: "Test User",
              image: `${origin}/storage/userphotos/${currentUserId}_medium.png`,
              roles: null,
            },
          },
          editorType: 0,
          editorUrl: `${origin}/ds-vpath/web-apps/apps/api/documents/api.js?shardkey=${key}`,
          token: `mock-editor-token-${fileId}`,
          type: "desktop",
          file: buildFileDto(f, roomId, ownerId, port, archived),
          startFillingMode: 0,
        });
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
        if (!f && withOtherRooms) return undefined;
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
     * FileUploader.VerifyChunkedUploadAsync first refuses a file larger than
     * the folder's maximum upload size, the room's free space included, with
     * FileSizeComment.GetFileSizeException: a TenantQuotaException, which
     * UnhandledExceptionMiddleware answers with 402 and the exception type.
     */
    http.post(
      `${apiBase}/files/:folderId(\\d+)/session`,
      async ({ params, request }) => {
        const folderId = Number(params.folderId);
        if (withOtherRooms && !holdsFolder(folderId)) return undefined;
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

        if (freeSpace !== null && body.fileSize > freeSpace) {
          return errorResponse(
            402,
            `The maximum file size is exceeded (${filesSizeToString(freeSpace)}).`,
            "ASC.Core.Tenants.TenantQuotaException",
          );
        }

        const sessionId = `mock-session-${nextSessionId++}`;
        const created = new Date();
        const session: UploadSessionRecord = {
          id: sessionId,
          userId: currentUserId,
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
        if (!session && withOtherRooms) return undefined;
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
        if (!session && withOtherRooms) return undefined;
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
            file: buildFileDto(
              pending,
              session.folderId,
              ownerId,
              port,
              archived,
            ),
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
        if (!session && withOtherRooms) return undefined;
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
     * Mirrors UploadController.AbortUploadSession
     * (HttpDelete "{folderId}/session/{sessionId}") ->
     * FileUploader.AbortUploadAsync: discards the session and the parts it
     * received. The session is found by its id alone, the folder segment is
     * not matched. ChunkedUploadSessionHolder.GetSessionAsync throws
     * ItemNotFoundException, so 404, for a session that is unknown,
     * finalised or already aborted (expiry is not modelled); a session
     * another account opened is a SecurityException, so 403. The action
     * returns nothing, so the envelope has no `response`.
     */
    http.delete(
      `${apiBase}/files/:folderId(\\d+)/session/:sessionId`,
      ({ params, request }) => {
        const sessionId = String(params.sessionId);
        const session = sessions.get(sessionId);
        if (!session && withOtherRooms) return undefined;
        requests.push({
          method: "DELETE",
          url: new URL(request.url).pathname,
        });
        if (!session || session.completed) {
          return errorResponse(404, "session not found");
        }
        if (session.userId !== currentUserId) {
          return errorResponse(403, "Access denied");
        }
        sessions.delete(sessionId);
        return new Response(JSON.stringify({ status: 0, statusCode: 200 }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    ),

    /**
     * Mirrors OperationController.DeleteBatchItems.
     * @see server/products/ASC.Files/Server/Api/OperationController.cs (HttpPut "fileops/delete")
     *
     * Removes the listed files from the mock and answers with one operation
     * that is already finished (FileOperationType.Delete = 2,
     * DistributedTaskStatus.Completed = 2), so the client does not poll
     * `fileops` for progress. FileOperationDtoHelper never lists `files` or
     * `folders` for a delete.
     */
    http.put(`${apiBase}/files/fileops/delete`, async ({ request }) => {
      const body = (await request.clone().json()) as {
        fileIds?: (number | string)[];
        folderIds?: (number | string)[];
        immediately?: boolean;
      };
      if (
        withOtherRooms &&
        (body.fileIds ?? []).length > 0 &&
        (body.fileIds ?? []).every((id) => !files.has(Number(id)))
      ) {
        return undefined;
      }
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
          status: 2,
        },
      ]);
    }),

    /**
     * Mirrors FilesController.DeleteFile (HttpDelete "file/{fileId}"), which
     * publishes the same delete operation for the one file; answered like
     * fileops/delete above.
     */
    http.delete(
      `${apiBase}/files/file/:fileId(\\d+)`,
      async ({ params, request }) => {
        const fileId = Number(params.fileId);
        if (!files.has(fileId) && withOtherRooms) return undefined;
        const body = await request.json().catch(() => ({}));
        requests.push({
          method: "DELETE",
          url: new URL(request.url).pathname,
          body,
        });
        files.delete(fileId);
        return okResponse([
          {
            id: `mock-delete-${requests.length}`,
            Operation: 2,
            progress: 100,
            error: "",
            processed: "1",
            finished: true,
            status: 2,
          },
        ]);
      },
    ),

    /**
     * Mirrors OperationController.CheckMoveOrCopyBatchItems (HttpGet
     * "fileops/move") -> FileStorageService.MoveOrCopyFilesCheckAsync: the
     * listed files whose title the destination folder already holds, as
     * FileEntryBaseDto entries. An encrypted file is never listed (the check
     * skips Encrypted files), and only project folders are compared, which a
     * room does not hold.
     */
    http.get(`${apiBase}/files/fileops/move`, ({ request }) => {
      const query = new URL(request.url).searchParams;
      const destFolderId = Number(query.get("destFolderId"));
      if (!holdsFolder(destFolderId)) {
        return withOtherRooms ? undefined : errorResponse(404, "folder not found");
      }
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      const inDest = Array.from(files.values()).filter(
        (f) => (f.folderId ?? roomId) === destFolderId,
      );
      const clashing = query
        .getAll("fileIds")
        .map((id) => files.get(Number(id)))
        .filter(
          (f): f is EncryptedFileRecord =>
            !!f &&
            !f.encrypted &&
            inDest.some((d) => d.serverTitle === f.serverTitle),
        );
      return okResponse(
        clashing.map((f) => buildFileDto(f, roomId, ownerId, port, archived)),
      );
    }),

    /**
     * Mirrors OperationController.MoveBatchItems (HttpPut "fileops/move"):
     * queues the move and answers the move operations, here one already
     * finished (FileOperationType.Move = 0, DistributedTaskStatus.Completed
     * = 2) listing the moved files. Within one private room the server's
     * CompliesPrivateRoomRulesAsync lets a move pass; the mock moves files
     * between the room and its folders and does not model folder moves.
     *
     * The archived room itself moved to the Rooms section is restored: the
     * room branch of FileMoveCopyOperation.MoveOrCopyFoldersAsync checks
     * CanMoveAsync on the room, which the Archive branch of
     * FileSecurity.FilterEntryAsync grants the room's full-access users, and
     * moves it (MessageAction.RoomUnarchived). The finished operation lists
     * the room in `folders`; the server lists the Rooms section there too.
     */
    http.put(`${apiBase}/files/fileops/move`, async ({ request }) => {
      const body = (await request.clone().json()) as {
        destFolderId?: number | string;
        fileIds?: (number | string)[];
        folderIds?: (number | string)[];
      };
      const destFolderId = Number(body.destFolderId);
      const fileIds = (body.fileIds ?? []).map(Number);
      const folderIds = (body.folderIds ?? []).map(Number);
      if (
        archived &&
        destFolderId === ROOMS_SECTION_ID &&
        folderIds.length === 1 &&
        folderIds[0] === roomId &&
        fileIds.length === 0
      ) {
        requests.push({
          method: "PUT",
          url: new URL(request.url).pathname,
          body,
        });
        archived = false;
        const operation = {
          id: `mock-move-${requests.length}`,
          Operation: 0,
          progress: 100,
          error: "",
          processed: "1",
          finished: true,
          status: 2,
          files: [],
          folders: [roomDto()],
        };
        operations.push(operation);
        return okResponse([operation]);
      }
      if (!holdsFolder(destFolderId) || fileIds.some((id) => !files.has(id))) {
        return withOtherRooms
          ? undefined
          : errorResponse(403, "You don't have enough permission to move the file");
      }
      requests.push({
        method: "PUT",
        url: new URL(request.url).pathname,
        body,
      });
      const moved = fileIds.map((id) => {
        const record = files.get(id) as EncryptedFileRecord;
        record.folderId = destFolderId === roomId ? undefined : destFolderId;
        return record;
      });
      const operation = {
        id: `mock-move-${requests.length}`,
        Operation: 0,
        progress: 100,
        error: "",
        processed: String(moved.length),
        finished: true,
        status: 2,
        files: moved.map((f) =>
          buildFileDto(f, roomId, ownerId, port, archived),
        ),
        folders: [],
      };
      operations.push(operation);
      return okResponse([operation]);
    }),

    /**
     * Mirrors OperationController.GetOperationStatuses (HttpGet "fileops"):
     * the caller's operations, only the one named by `id` when it is given.
     */
    http.get(`${apiBase}/files/fileops`, ({ request }) => {
      const id = new URL(request.url).searchParams.get("id");
      const found = operations.filter((o) => !id || o.id === id);
      if (found.length === 0 && withOtherRooms) return undefined;
      return okResponse(found);
    }),
  ];
};
