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

// In-memory mock of the privacyroom API surface. Each call to
// `privacyroomKeysHandlers()` closes over fresh state, so tests are isolated.

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import type { TEncryptionKeyPair } from "../../../api/privacy/types";

const okResponse = <T>(response: T): Response =>
  new Response(
    JSON.stringify({
      response,
      status: 0,
      statusCode: 200,
    }),
    { headers: { "Content-Type": "application/json" } },
  );

export type RequestLog = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: unknown;
};

export type PrivacyroomHandlerHandle = {
  /** Snapshot of keys currently stored on the mock server. */
  getKeys: () => TEncryptionKeyPair[];
  /** All requests observed since this handler set was installed. */
  getRequests: () => RequestLog[];
};

export type PrivacyroomHandlersOptions = {
  /** Existing keys the server already knows about (for replace/recover flows). */
  initial?: TEncryptionKeyPair[];
  /** Auth user id to put on freshly created keys. */
  userId?: string;
  /** Optional handle the caller can read after interaction. */
  handle?: { current: PrivacyroomHandlerHandle | null };
};

export const privacyroomKeysHandlers = (
  port: string,
  opts: PrivacyroomHandlersOptions = {},
) => {
  const state: TEncryptionKeyPair[] = [...(opts.initial ?? [])];
  const requests: RequestLog[] = [];
  const userId =
    opts.userId ?? "66faa6e4-f133-11ea-b126-00ffeec8b4ef"; // matches successSelf

  if (opts.handle) {
    opts.handle.current = {
      getKeys: () => [...state],
      getRequests: () => [...requests],
    };
  }

  const base = `${BASE_URL}:${port}/${API_PREFIX}/privacyroom/keys`;

  return [
    http.get(base, () => {
      requests.push({ method: "GET", url: base });
      return okResponse(state);
    }),

    http.post(base, async ({ request }) => {
      const body = (await request.json()) as {
        id?: string;
        publicKey: string;
        privateKeyEnc: string;
      };
      requests.push({ method: "POST", url: base, body });
      const id = body.id ?? "00000000-0000-0000-0000-000000000000";
      const existingIdx = state.findIndex((k) => k.id === id);
      if (existingIdx === -1) {
        state.push({
          id,
          userId,
          publicKey: body.publicKey,
          privateKeyEnc: body.privateKeyEnc,
          date: new Date().toISOString(),
        });
      }
      return okResponse(state);
    }),

    http.put(base, async ({ request }) => {
      const body = (await request.json()) as {
        id?: string;
        publicKey: string;
        privateKeyEnc: string;
        update: boolean;
      };
      requests.push({ method: "PUT", url: base, body });
      const id = body.id ?? "00000000-0000-0000-0000-000000000000";
      const existingIdx = state.findIndex((k) => k.id === id);
      if (existingIdx !== -1) {
        state[existingIdx] = {
          id,
          userId,
          publicKey: body.publicKey,
          privateKeyEnc: body.privateKeyEnc,
          date: new Date().toISOString(),
        };
      }
      return okResponse(state);
    }),

    http.delete(`${base}/:keyId`, ({ params }) => {
      const keyId = String(params.keyId);
      requests.push({ method: "DELETE", url: `${base}/${keyId}` });
      const idx = state.findIndex((k) => k.id === keyId);
      if (idx !== -1) state.splice(idx, 1);
      return okResponse(state);
    }),
  ];
};

export type PrivacyroomAccessHandlerHandle = {
  getRoomKeys: (roomId: number | string) => TEncryptionKeyPair[];
  setRoomKeys: (
    roomId: number | string,
    keys: TEncryptionKeyPair[],
  ) => void;
  getFileKeys: (fileId: number | string) => TEncryptionKeyPair[];
  getRequests: () => RequestLog[];
  reset: () => void;
};

export type PrivacyroomAccessOptions = {
  roomKeys?: Record<string, TEncryptionKeyPair[]>;
  fileKeys?: Record<string, TEncryptionKeyPair[]>;
  handle?: { current: PrivacyroomAccessHandlerHandle | null };
};

export const privacyroomAccessHandlers = (
  port: string,
  opts: PrivacyroomAccessOptions = {},
) => {
  const roomKeys = new Map<string, TEncryptionKeyPair[]>(
    Object.entries(opts.roomKeys ?? {}),
  );
  const fileKeys = new Map<string, TEncryptionKeyPair[]>(
    Object.entries(opts.fileKeys ?? {}),
  );
  const requests: RequestLog[] = [];

  const handle: PrivacyroomAccessHandlerHandle = {
    getRoomKeys: (id) => [...(roomKeys.get(String(id)) ?? [])],
    setRoomKeys: (id, keys) => {
      roomKeys.set(String(id), [...keys]);
    },
    getFileKeys: (id) => [...(fileKeys.get(String(id)) ?? [])],
    getRequests: () => [...requests],
    reset: () => {
      roomKeys.clear();
      fileKeys.clear();
      requests.length = 0;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const base = `${BASE_URL}:${port}/${API_PREFIX}/privacyroom`;

  return [
    http.get(`${base}/:roomId(\\d+)/access`, ({ params, request }) => {
      const id = String(params.roomId);
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      return okResponse(roomKeys.get(id) ?? []);
    }),

    http.get(`${base}/access/:fileId(\\d+)`, ({ params, request }) => {
      const id = String(params.fileId);
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      return okResponse(fileKeys.get(id) ?? []);
    }),

    http.post(
      `${base}/access/:fileId(\\d+)`,
      async ({ params, request }) => {
        const id = String(params.fileId);
        const body = (await request.json()) as {
          keys?: TEncryptionKeyPair[];
        };
        requests.push({
          method: "POST",
          url: new URL(request.url).pathname,
          body,
        });
        fileKeys.set(id, body.keys ?? []);
        return okResponse({ keys: body.keys ?? [] });
      },
    ),
  ];
};

/** Default handler set: empty state. Tests can override with a fresh factory call. */
export const privacyroomHandlers = (port: string) =>
  privacyroomKeysHandlers(port);
