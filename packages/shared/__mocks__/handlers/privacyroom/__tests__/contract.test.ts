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

// CONTRACT TESTS — lock the mock to the server's actual behavior.
//
// Each `it` describes one invariant that exists in the C# server code today.
// If a test here fails, it means either:
//   (a) somebody changed the mock and broke alignment with the server, OR
//   (b) the server's behavior changed and the mock must be re-aligned.
//
// Either way the divergence is loud, not silent.


import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import {
  privacyroomKeysHandlers,
  privacyroomAccessHandlers,
  type PrivacyroomHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "../index";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3100";
const CALLER = "u1";
const KEYS_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/privacyroom/keys`;
const ACCESS_URL = (roomId: number | string) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/privacyroom/${roomId}/access`;
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const ID_1 = "11111111-1111-1111-1111-111111111111";
const ID_2 = "22222222-2222-2222-2222-222222222222";

const keysHandle: { current: PrivacyroomHandlerHandle | null } = {
  current: null,
};
const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...privacyroomKeysHandlers(PORT, { userId: CALLER, handle: keysHandle }),
  ...privacyroomAccessHandlers(PORT, { userId: CALLER, handle: accessHandle }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

beforeEach(() => {
  keysHandle.current?.reset();
  accessHandle.current?.reset();
});

type KeyBody = { id?: string; publicKey?: string; privateKeyEnc?: string };
type Envelope = {
  response?: Array<Record<string, unknown>>;
  error?: { message: string };
  status: number;
  statusCode: number;
};

const send = async (method: "POST" | "PUT", body: KeyBody) => {
  const res = await fetch(KEYS_URL, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as Envelope };
};

const getKeys = async () => (await (await fetch(KEYS_URL)).json()) as Envelope;

describe("privacyroom mock - GET /privacyroom/keys (GetUserKeys)", () => {
  it("leaves `response` out for a user who never stored a key", async () => {
    const body = await getKeys();
    expect(body).not.toHaveProperty("response");
    expect(body.status).toBe(0);
  });

  it("answers an empty list once the last key was deleted", async () => {
    await send("POST", { id: ID_1, publicKey: "p", privateKeyEnc: "e" });
    await fetch(`${KEYS_URL}/${ID_1}`, { method: "DELETE" });
    expect((await getKeys()).response).toEqual([]);
  });
});

describe("privacyroom mock - POST /privacyroom/keys (SetKeys / CreateKeyPairAsync)", () => {
  it("answers 201 with the full list and stamps date and crypto engine id", async () => {
    const { status, body } = await send("POST", {
      id: ID_1,
      publicKey: "p1",
      privateKeyEnc: "e1",
    });
    expect(status).toBe(201);
    expect(body.response).toHaveLength(1);
    expect(body.response![0]).toMatchObject({
      id: ID_1,
      userId: CALLER,
      publicKey: "p1",
      privateKeyEnc: "e1",
      cryptoEngineId: "{DC522726-5E0E-43E5-AA02-8EA156BECBC5}",
    });
    expect(typeof body.response![0].date).toBe("string");
  });

  it("appends keys with distinct ids", async () => {
    await send("POST", { id: ID_1, publicKey: "p1", privateKeyEnc: "e1" });
    const { body } = await send("POST", { id: ID_2, publicKey: "p2", privateKeyEnc: "e2" });
    expect(body.response!.map((k) => k.id)).toEqual([ID_1, ID_2]);
  });

  it("answers 409 and stores nothing for an id already stored", async () => {
    await send("POST", { id: ID_1, publicKey: "first", privateKeyEnc: "e1" });
    const { status, body } = await send("POST", {
      id: ID_1,
      publicKey: "second",
      privateKeyEnc: "e2",
    });
    expect(status).toBe(409);
    expect(body.status).toBe(1);
    expect(keysHandle.current!.getKeys().map((k) => k.publicKey)).toEqual(["first"]);
  });

  it("binds a missing id to Guid.Empty, so a second id-less POST is a 409", async () => {
    const first = await send("POST", { publicKey: "p", privateKeyEnc: "e" });
    expect(first.body.response![0].id).toBe(EMPTY_GUID);
    const second = await send("POST", { publicKey: "q", privateKeyEnc: "f" });
    expect(second.status).toBe(409);
  });

  it("answers 400 for a blank half", async () => {
    expect((await send("POST", { id: ID_1, publicKey: " ", privateKeyEnc: "e" })).status).toBe(400);
    expect((await send("POST", { id: ID_1, publicKey: "p", privateKeyEnc: "" })).status).toBe(400);
    expect(keysHandle.current!.getKeys()).toHaveLength(0);
  });
});

describe("privacyroom mock - PUT /privacyroom/keys (ReplaceKey / ReplaceKeyPairAsync)", () => {
  it("replaces the entry in place and leaves the others untouched", async () => {
    await send("POST", { id: ID_1, publicKey: "p1", privateKeyEnc: "e1" });
    await send("POST", { id: ID_2, publicKey: "p2", privateKeyEnc: "e2" });
    const { status, body } = await send("PUT", {
      id: ID_1,
      publicKey: "p1-new",
      privateKeyEnc: "e1-new",
    });
    expect(status).toBe(200);
    expect(body.response!.map((k) => [k.id, k.publicKey])).toEqual([
      [ID_1, "p1-new"],
      [ID_2, "p2"],
    ]);
  });

  it("answers 404 and inserts nothing for an id not stored", async () => {
    const { status } = await send("PUT", { id: ID_1, publicKey: "p", privateKeyEnc: "e" });
    expect(status).toBe(404);
    expect(keysHandle.current!.getKeys()).toHaveLength(0);
  });

  it("answers 400 for a blank half", async () => {
    await send("POST", { id: ID_1, publicKey: "p", privateKeyEnc: "e" });
    expect((await send("PUT", { id: ID_1, publicKey: "", privateKeyEnc: "e" })).status).toBe(400);
  });
});

describe("privacyroom mock - DELETE /privacyroom/keys/{id} (DeleteKeys / DeleteAsync)", () => {
  it("answers 204 with no body and removes the entry", async () => {
    await send("POST", { id: ID_1, publicKey: "p1", privateKeyEnc: "e1" });
    await send("POST", { id: ID_2, publicKey: "p2", privateKeyEnc: "e2" });
    const res = await fetch(`${KEYS_URL}/${ID_1}`, { method: "DELETE" });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(keysHandle.current!.getKeys().map((k) => k.id)).toEqual([ID_2]);
  });

  it("answers 404 for an id not stored", async () => {
    const res = await fetch(`${KEYS_URL}/${ID_1}`, { method: "DELETE" });
    expect(res.status).toBe(404);
  });
});

describe("privacyroom mock - GET /privacyroom/{roomId}/access (GetUserKeysForRoom)", () => {
  const member = (userId: string, id: string, publicKey = `pk-${id}`) => ({
    id,
    userId,
    publicKey,
    privateKeyEnc: `enc-${id}`,
  });

  it("lists every key of each member and keeps the private half only on the caller's entries", async () => {
    accessHandle.current!.setRoomKeys(7, [
      member(CALLER, "own"),
      member("bob", "bob-1"),
      member("bob", "bob-2"),
    ]);
    const body = (await (await fetch(ACCESS_URL(7))).json()) as Envelope;
    expect(body.response!.map((k) => k.id)).toEqual(["own", "bob-1", "bob-2"]);
    expect(body.response![0].privateKeyEnc).toBe("enc-own");
    expect(body.response![1]).not.toHaveProperty("privateKeyEnc");
  });

  it("drops entries without a public key", async () => {
    accessHandle.current!.setRoomKeys(7, [member(CALLER, "own"), member("bob", "bob-1", "")]);
    const body = (await (await fetch(ACCESS_URL(7))).json()) as Envelope;
    expect(body.response!.map((k) => k.id)).toEqual(["own"]);
  });

  it("answers 404 for an unknown room", async () => {
    expect((await fetch(ACCESS_URL(9999))).status).toBe(404);
  });

  it("answers 400 for a room that is not private", async () => {
    accessHandle.current!.setNonPrivateRoom(8);
    expect((await fetch(ACCESS_URL(8))).status).toBe(400);
  });

  it("answers 403 when the caller holds no key in the room", async () => {
    accessHandle.current!.setRoomKeys(7, [member("bob", "bob-1")]);
    expect((await fetch(ACCESS_URL(7))).status).toBe(403);
  });
});
