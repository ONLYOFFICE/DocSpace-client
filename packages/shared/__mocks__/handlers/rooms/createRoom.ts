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
  lifetime?: unknown;
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
};

const okResponse = <T>(response: T, status = 200): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode: status }),
    { headers: { "Content-Type": "application/json" } },
  );

const buildRoomResponse = (record: CreatedRoomRecord) => ({
  id: record.id,
  title: record.title,
  roomType: record.roomType,
  private: !!record.private,
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

export const createPrivateRoomHandler = (
  port: string,
  opts: CreateRoomHandlerOptions = {},
) => {
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

  return http.post(url, async ({ request }) => {
    const body = (await request.json()) as CreateRoomBody;
    requests.push({ method: "POST", url, body });

    const record: CreatedRoomRecord = {
      ...body,
      id: nextId++,
      private: !!body.private,
      createdAt: new Date().toISOString(),
    };
    state.push(record);

    return okResponse(buildRoomResponse(record));
  });
};

export const createPrivateRoomHandlers = (
  port: string,
  opts: CreateRoomHandlerOptions = {},
) => [createPrivateRoomHandler(port, opts)];
