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

// In-memory mock of the privacyroom API surface. Each call to
// `privacyroomKeysHandlers()` closes over fresh state, so tests are isolated.
//
// SOURCE OF TRUTH (server, looked up with CodeGraph and read in the source):
//   - Controller: server/products/ASC.Files/Server/Api/PrivacyRoomController.cs
//     (PrivacyRoomControllerCommon: SetKeys, ReplaceKey, GetUserKeys,
//     GetUserKeysForRoom, DeleteKeys)
//   - Helper:     server/products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs
//     (EncryptionKeyPairDtoHelper: CreateKeyPairAsync, ReplaceKeyPairAsync,
//     GetKeyPairAsync, GetKeyPairForRoomAsync, DeleteAsync)
//   - Envelope:   server/common/ASC.Api.Core/Middleware/CommonApiResponse.cs
//
// Contract tests: ./__tests__/contract.test.ts.

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import type { TEncryptionKeyPair } from "../../../api/privacy/types";

/** The server's default `EncryptionKeyDto.CryptoEngineId`. */
const DEFAULT_CRYPTO_ENGINE_ID = "{DC522726-5E0E-43E5-AA02-8EA156BECBC5}";
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef"; // matches successSelf

/** SuccessApiResponse: a null response is left out of the JSON. */
const okResponse = <T>(response: T | null, statusCode = 200): Response =>
  new Response(
    JSON.stringify({
      ...(response === null ? {} : { response }),
      count: Array.isArray(response)
        ? response.length
        : response === null
          ? 0
          : 1,
      status: 0,
      statusCode,
    }),
    { status: statusCode, headers: { "Content-Type": "application/json" } },
  );

/** ErrorApiResponse, with the status ResponseWrapper maps the exception to. */
const errorResponse = (statusCode: number, message: string): Response =>
  new Response(JSON.stringify({ error: { message }, status: 1, statusCode }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });

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
  /** Drops every key and request, back to a user who never stored a key. */
  reset: () => void;
};

export type PrivacyroomHandlersOptions = {
  /** Existing keys the server already knows about (for replace/recover flows). */
  initial?: TEncryptionKeyPair[];
  /** Auth user id to put on freshly created keys. */
  userId?: string;
  /** Optional handle the caller can read after interaction. */
  handle?: { current: PrivacyroomHandlerHandle | null };
};

type KeyRequestBody = {
  id?: string;
  publicKey?: string;
  privateKeyEnc?: string;
};

/** ValidateKeyPair: both halves are mandatory (ArgumentException -> 400). */
const blankHalf = (body: KeyRequestBody): string | null => {
  if (!body.publicKey?.trim()) return "The public key is not specified";
  if (!body.privateKeyEnc?.trim()) {
    return "The encrypted private key is not specified";
  }
  return null;
};

export const privacyroomKeysHandlers = (
  port: string,
  opts: PrivacyroomHandlersOptions = {},
) => {
  const state: TEncryptionKeyPair[] = [...(opts.initial ?? [])];
  // The server keeps no record until the first save; after that an emptied
  // list is stored as "[]" and read back as an empty array.
  let hasRecord = state.length > 0;
  const requests: RequestLog[] = [];
  const userId = opts.userId ?? DEFAULT_USER_ID;

  if (opts.handle) {
    opts.handle.current = {
      getKeys: () => [...state],
      getRequests: () => [...requests],
      reset: () => {
        state.length = 0;
        requests.length = 0;
        hasRecord = false;
      },
    };
  }

  const base = `${BASE_URL}:${port}/${API_PREFIX}/privacyroom/keys`;

  // The request DTO carries no date: the mapped EncryptionKeyDto stamps
  // DateTime.Now and the default crypto engine id on create and replace.
  const toStored = (id: string, body: KeyRequestBody): TEncryptionKeyPair => ({
    id,
    userId,
    publicKey: body.publicKey as string,
    privateKeyEnc: body.privateKeyEnc as string,
    date: new Date().toISOString(),
    cryptoEngineId: DEFAULT_CRYPTO_ENGINE_ID,
  });

  return [
    /**
     * Mirrors PrivacyRoomControllerCommon.GetUserKeys -> GetKeyPairAsync
     * (HttpGet "keys"): the caller's keys; no `response` at all for a user who
     * never stored one.
     */
    http.get(base, () => {
      requests.push({ method: "GET", url: base });
      return okResponse(hasRecord ? [...state] : null);
    }),

    /**
     * Mirrors PrivacyRoomControllerCommon.SetKeys -> CreateKeyPairAsync
     * (HttpPost "keys"): 201 with the full list; 409 for an id already stored;
     * 400 for a blank half. A missing id binds to Guid.Empty.
     */
    http.post(base, async ({ request }) => {
      const body = (await request.json()) as KeyRequestBody;
      requests.push({ method: "POST", url: base, body });
      const invalid = blankHalf(body);
      if (invalid) return errorResponse(400, invalid);
      const id = body.id ?? EMPTY_GUID;
      if (state.some((k) => k.id === id)) {
        return errorResponse(409, `The encryption key ${id} already exists`);
      }
      state.push(toStored(id, body));
      hasRecord = true;
      return okResponse([...state], 201);
    }),

    /**
     * Mirrors PrivacyRoomControllerCommon.ReplaceKey -> ReplaceKeyPairAsync
     * (HttpPut "keys"): replaces the entry in place and answers the full list;
     * 404 for an id not stored; 400 for a blank half.
     */
    http.put(base, async ({ request }) => {
      const body = (await request.json()) as KeyRequestBody;
      requests.push({ method: "PUT", url: base, body });
      const invalid = blankHalf(body);
      if (invalid) return errorResponse(400, invalid);
      const id = body.id ?? EMPTY_GUID;
      const index = state.findIndex((k) => k.id === id);
      if (index < 0) {
        return errorResponse(404, `The encryption key ${id} is not found`);
      }
      state[index] = toStored(id, body);
      return okResponse([...state]);
    }),

    /**
     * Mirrors PrivacyRoomControllerCommon.DeleteKeys -> DeleteAsync
     * (HttpDelete "keys/{id}"): 204 with no body; 404 for an id not stored.
     */
    http.delete(`${base}/:keyId`, ({ params }) => {
      const keyId = String(params.keyId);
      requests.push({ method: "DELETE", url: `${base}/${keyId}` });
      const index = state.findIndex((k) => k.id === keyId);
      if (index < 0) {
        return errorResponse(404, `The encryption key ${keyId} is not found`);
      }
      state.splice(index, 1);
      hasRecord = true;
      return new Response(null, { status: 204 });
    }),
  ];
};

export type PrivacyroomAccessHandlerHandle = {
  getRoomKeys: (roomId: number | string) => TEncryptionKeyPair[];
  setRoomKeys: (
    roomId: number | string,
    keys: TEncryptionKeyPair[],
  ) => void;
  getRequests: () => RequestLog[];
  reset: () => void;
};

export type PrivacyroomAccessOptions = {
  roomKeys?: Record<string, TEncryptionKeyPair[]>;
  handle?: { current: PrivacyroomAccessHandlerHandle | null };
};

export const privacyroomAccessHandlers = (
  port: string,
  opts: PrivacyroomAccessOptions = {},
) => {
  const roomKeys = new Map<string, TEncryptionKeyPair[]>(
    Object.entries(opts.roomKeys ?? {}),
  );
  const requests: RequestLog[] = [];

  const handle: PrivacyroomAccessHandlerHandle = {
    getRoomKeys: (id) => [...(roomKeys.get(String(id)) ?? [])],
    setRoomKeys: (id, keys) => {
      roomKeys.set(String(id), [...keys]);
    },
    getRequests: () => [...requests],
    reset: () => {
      roomKeys.clear();
      requests.length = 0;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const base = `${BASE_URL}:${port}/${API_PREFIX}/privacyroom`;

  return [
    /**
     * Mirrors PrivacyRoomController.GetUserKeysForRoom → EncryptionKeyPairDtoHelper.GetKeyPairForRoomAsync.
     * @see server/products/ASC.Files/Server/Api/PrivacyRoomController.cs (HttpGet "{roomId:int}/access")
     *
     * Returns the list of identity public keys for every member of the given
     * room — used by the client as `roomMemberKeys` during unwrap, because
     * /files/{fileId}/access.userKeys only carries the CURRENT user's keys.
     */
    http.get(`${base}/:roomId(\\d+)/access`, ({ params, request }) => {
      const id = String(params.roomId);
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      return okResponse(roomKeys.get(id) ?? []);
    }),
  ];
};

/** Default handler set: empty state. Tests can override with a fresh factory call. */
export const privacyroomHandlers = (port: string) =>
  privacyroomKeysHandlers(port);
