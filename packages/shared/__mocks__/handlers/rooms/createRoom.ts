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

export type CreateRoomBody = {
  roomType: number;
  private?: boolean;
  title: string;
  tags?: string[];
  denyDownload?: boolean;
  indexing?: boolean;
  lifetime?: { enabled?: boolean } | null;
  watermark?: { enabled?: boolean } | null;
  quota?: number;
  roomKeys?: Array<{
    userId: string;
    publicKey: string;
    privateKeyEnc?: string;
  }>;
  [key: string]: unknown;
};

export type CreatedRoomRecord = CreateRoomBody & {
  id: number;
  createdAt: string;
};

export type CreateRoomHandlerHandle = {
  getRooms: () => CreatedRoomRecord[];
  getPrivateRooms: () => CreatedRoomRecord[];
  getRequests: () => RequestLog[];
  reset: () => void;
};

export type CreateRoomHandlerOptions = {
  initial?: CreatedRoomRecord[];
  startId?: number;
  handle?: { current: CreateRoomHandlerHandle | null };
  /**
   * `false` serves a Document Server without the crypto library, which
   * DocumentServiceEncryptionChecker.IsSupportedAsync reports; true when
   * left out, as the files-settings mock answers.
   */
  docServiceEncryptionSupported?: boolean;
  /**
   * `false` serves a caller whose key record is missing or holds an empty
   * key list, which EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync
   * refuses (since cc60512acd the empty list counts as no keys); true when
   * left out.
   */
  callerHasKeys?: boolean;
};

/**
 * The room types CreateRoomAsync files under the AI hub: RoomType
 * .InstructionsRoom (10), .KnowledgeRoom (11) and .AiProjectRoom (12) of
 * CreateRoomRequestDto.cs, which refuse the private flag.
 */
const AI_HUB_ROOM_TYPES = [10, 11, 12];

const okResponse = <T>(response: T, status = 200): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode: status }),
    { headers: { "Content-Type": "application/json" } },
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

/** A lifetime or watermark sent counts as enabled unless its flag says false. */
const enabled = (setting: { enabled?: boolean } | null | undefined) =>
  !!setting && setting.enabled !== false;

const buildRoomResponse = (record: CreatedRoomRecord) => ({
  id: record.id,
  title: record.title,
  roomType: record.roomType,
  private: !!record.private,
  indexing: !!record.indexing,
  tags: record.tags ?? [],
  isFolder: true,
  isRoom: true,
  created: record.createdAt,
  updated: record.createdAt,
  filesCount: 0,
  foldersCount: 0,
  rootFolderType: 14,
  parentId: 0,
  pathParts: [{ id: record.id, title: record.title }],
});

const buildHandlers = (port: string, opts: CreateRoomHandlerOptions) => {
  const state: CreatedRoomRecord[] = [...(opts.initial ?? [])];
  const requests: RequestLog[] = [];
  let nextId = opts.startId ?? 100;

  const handle: CreateRoomHandlerHandle = {
    getRooms: () => [...state],
    getPrivateRooms: () => state.filter((r) => r.private === true),
    getRequests: () => [...requests],
    reset: () => {
      state.length = 0;
      requests.length = 0;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms`;

  /**
   * Mirrors VirtualRoomsController.CreateRoom -> FileStorageService
   * .CreateRoomAsync -> InternalCreateFolderAsync, in the server's order.
   * CreateRoomAsync refuses the private flag on an AI hub room type with an
   * ArgumentException, 400 "Bad request.". InternalCreateFolderAsync then
   * runs DemandPrivateRoomCanBeCreatedAsync: the creator without a key
   * record, or with an empty key list (ThrowIfKeysAreNotSetAsync, since
   * cc60512acd), is refused with an InvalidOperationException, and so is
   * a Document Server that cannot encrypt (since b562fc3fb1); the
   * CustomExceptionHandler answers both with 403, the message and the
   * exception type. Last, since bd89a24dcd, a private room refuses with
   * 400 "Bad request." indexing, or a lifetime or watermark whose
   * `enabled` is not false, an object without the flag counting as
   * enabled. A public or form-filling room created as private is stored
   * like any other: nothing at creation refuses it, its primary link is
   * made lazily on the first read and refused there.
   */
  const create = http.post(url, async ({ request }) => {
    const body = (await request.json()) as CreateRoomBody;
    requests.push({ method: "POST", url, body });

    if (body.private && AI_HUB_ROOM_TYPES.includes(Number(body.roomType))) {
      return errorResponse(400, "Bad request.");
    }

    if (body.private && opts.callerHasKeys === false) {
      return errorResponse(
        403,
        "The user does not have an encryption key",
        "System.InvalidOperationException",
      );
    }

    if (body.private && opts.docServiceEncryptionSupported === false) {
      return errorResponse(
        403,
        "The document server connected to this portal cannot work with encrypted files",
        "System.InvalidOperationException",
      );
    }

    if (
      body.private &&
      (body.indexing === true || enabled(body.lifetime) || enabled(body.watermark))
    ) {
      return errorResponse(400, "Bad request.");
    }

    const record: CreatedRoomRecord = {
      ...body,
      id: nextId++,
      private: !!body.private,
      createdAt: new Date().toISOString(),
    };
    state.push(record);

    return okResponse(buildRoomResponse(record));
  });

  /**
   * Mirrors VirtualRoomsController.UpdateRoom -> FileStorageService
   * .UpdateRoomAsync on a room this instance created: on a private room,
   * indexing turned on, or a lifetime or watermark sent enabled, is refused
   * with 400 "Bad request."; turning them off and the other fields pass.
   * A room this instance does not hold is left to another handler.
   */
  const update = http.put(`${url}/:roomId`, async ({ params, request }) => {
    const record = state.find((r) => r.id === Number(params.roomId));
    if (!record) return undefined;
    const body = (await request.clone().json()) as Partial<CreateRoomBody>;
    requests.push({ method: "PUT", url: `${url}/${record.id}`, body });

    if (
      record.private &&
      ((body.indexing === true && !record.indexing) ||
        enabled(body.lifetime) ||
        enabled(body.watermark))
    ) {
      return errorResponse(400, "Bad request.");
    }

    Object.assign(record, body);

    return okResponse(buildRoomResponse(record));
  });

  /**
   * Mirrors VirtualRoomsController.CreateRoomThirdParty -> FileStorageService
   * .CreateThirdPartyRoomAsync (since b562fc3fb1): the private flag is
   * refused before anything else with an ArgumentException, 400 "A private
   * room cannot be created on a third-party storage", with or without keys;
   * without the flag the room is created out of the third-party folder,
   * answered with string identifiers.
   */
  const createThirdParty = http.post(
    `${url}/thirdparty/:providerId`,
    async ({ params, request }) => {
      const body = (await request.json()) as CreateRoomBody;
      const routeUrl = `${url}/thirdparty/${params.providerId}`;
      requests.push({ method: "POST", url: routeUrl, body });

      if (body.private) {
        return errorResponse(
          400,
          "A private room cannot be created on a third-party storage",
        );
      }

      const record: CreatedRoomRecord = {
        ...body,
        id: nextId++,
        private: false,
        createdAt: new Date().toISOString(),
      };
      state.push(record);

      return okResponse({
        ...buildRoomResponse(record),
        id: `${params.providerId}-${record.id}`,
        parentId: String(params.providerId),
      });
    },
  );

  return { create, update, createThirdParty };
};

export const createPrivateRoomHandler = (
  port: string,
  opts: CreateRoomHandlerOptions = {},
) => buildHandlers(port, opts).create;

/**
 * The creation and update routes of rooms and the third-party creation
 * route, sharing one store.
 */
export const createPrivateRoomHandlers = (
  port: string,
  opts: CreateRoomHandlerOptions = {},
) => {
  const { create, update, createThirdParty } = buildHandlers(port, opts);
  return [create, createThirdParty, update];
};
