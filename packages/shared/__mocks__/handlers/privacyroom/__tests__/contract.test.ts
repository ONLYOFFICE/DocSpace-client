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
const KEYS_URL = `${BASE_URL}:${PORT}/${API_PREFIX}/privacyroom/keys`;
const ACCESS_URL = (roomId: number | string) =>
  `${BASE_URL}:${PORT}/${API_PREFIX}/privacyroom/${roomId}/access`;

const keysHandle: { current: PrivacyroomHandlerHandle | null } = {
  current: null,
};
const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...privacyroomKeysHandlers(PORT, { userId: "u1", handle: keysHandle }),
  ...privacyroomAccessHandlers(PORT, { handle: accessHandle }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

beforeEach(() => {
  // privacyroomKeysHandlers state is closed over per factory call; we get a
  // fresh one by re-installing. Simpler: just rely on each test cleaning up
  // via DELETE since handle is the same instance for all tests.
  const existing = keysHandle.current?.getKeys() ?? [];
  for (const k of existing) {
    void fetch(`${KEYS_URL}/${k.id}`, { method: "DELETE" });
  }
  accessHandle.current?.reset();
});

async function postKey(body: {
  id?: string;
  publicKey: string;
  privateKeyEnc: string;
}) {
  const res = await fetch(KEYS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<{
    response: Array<{ id: string; publicKey: string; privateKeyEnc: string }>;
  }>;
}

async function putKey(body: {
  id?: string;
  publicKey: string;
  privateKeyEnc: string;
  update?: boolean;
}) {
  const res = await fetch(KEYS_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<{
    response: Array<{ id: string; publicKey: string; privateKeyEnc: string }>;
  }>;
}

async function getKeys() {
  const res = await fetch(KEYS_URL);
  return res.json() as Promise<{
    response: Array<{ id: string; publicKey: string; privateKeyEnc: string }>;
  }>;
}

describe("privacyroom mock — POST /privacyroom/keys (mirrors SetKeys, replace=false)", () => {
  it("appends a new key when body.id is not in state", async () => {
    const before = (await getKeys()).response;
    expect(before).toHaveLength(0);

    const after = (
      await postKey({
        id: "a1",
        publicKey: "pub-a",
        privateKeyEnc: "enc-a",
      })
    ).response;

    expect(after).toHaveLength(1);
    expect(after[0]).toMatchObject({
      id: "a1",
      publicKey: "pub-a",
      privateKeyEnc: "enc-a",
    });
  });

  it("appends multiple keys with distinct ids (multi-key support)", async () => {
    await postKey({ id: "k1", publicKey: "p1", privateKeyEnc: "e1" });
    const after = (
      await postKey({ id: "k2", publicKey: "p2", privateKeyEnc: "e2" })
    ).response;

    expect(after).toHaveLength(2);
    expect(after.map((k) => k.id).sort()).toEqual(["k1", "k2"]);
  });

  it("is a NO-OP when body.id matches an existing key (server uses replace=false)", async () => {
    await postKey({ id: "same", publicKey: "first", privateKeyEnc: "enc1" });

    const after = (
      await postKey({
        id: "same",
        publicKey: "OVERWRITE-attempt",
        privateKeyEnc: "OVERWRITE-attempt",
      })
    ).response;

    expect(after).toHaveLength(1);
    expect(after[0].publicKey).toBe("first"); // NOT overwritten
    expect(after[0].privateKeyEnc).toBe("enc1");
  });

  it("treats missing body.id as Guid.Empty — first POST adds it, second is a no-op", async () => {
    const empty = "00000000-0000-0000-0000-000000000000";

    const first = (
      await postKey({ publicKey: "p", privateKeyEnc: "e" })
    ).response;
    expect(first).toHaveLength(1);
    expect(first[0].id).toBe(empty);

    const second = (
      await postKey({ publicKey: "p2", privateKeyEnc: "e2" })
    ).response;
    expect(second).toHaveLength(1); // still just one — server dedup'd
    expect(second[0].publicKey).toBe("p"); // first wins
  });
});

describe("privacyroom mock — PUT /privacyroom/keys (mirrors ReplaceKey, replace=true)", () => {
  it("replaces the key when body.id matches an existing key", async () => {
    await postKey({ id: "rot", publicKey: "old-pub", privateKeyEnc: "old-enc" });

    const after = (
      await putKey({
        id: "rot",
        publicKey: "new-pub",
        privateKeyEnc: "new-enc",
      })
    ).response;

    expect(after).toHaveLength(1);
    expect(after[0]).toMatchObject({
      id: "rot",
      publicKey: "new-pub",
      privateKeyEnc: "new-enc",
    });
  });

  it("is a NO-OP when body.id is not in state (server does not insert on PUT)", async () => {
    const before = (await getKeys()).response;
    expect(before).toHaveLength(0);

    const after = (
      await putKey({
        id: "ghost",
        publicKey: "nope",
        privateKeyEnc: "nope",
      })
    ).response;

    expect(after).toHaveLength(0);
  });

  it("leaves other keys untouched when one is rotated", async () => {
    await postKey({ id: "k1", publicKey: "p1", privateKeyEnc: "e1" });
    await postKey({ id: "k2", publicKey: "p2", privateKeyEnc: "e2" });

    const after = (
      await putKey({ id: "k1", publicKey: "p1-rotated", privateKeyEnc: "e1-rotated" })
    ).response;

    expect(after).toHaveLength(2);
    const k1 = after.find((k) => k.id === "k1");
    const k2 = after.find((k) => k.id === "k2");
    expect(k1?.publicKey).toBe("p1-rotated");
    expect(k2?.publicKey).toBe("p2"); // untouched
  });
});

describe("privacyroom mock — DELETE /privacyroom/keys/{id} (mirrors DeleteKeys)", () => {
  it("removes the entry by id", async () => {
    await postKey({ id: "doomed", publicKey: "p", privateKeyEnc: "e" });
    await postKey({ id: "keep", publicKey: "p2", privateKeyEnc: "e2" });

    await fetch(`${KEYS_URL}/doomed`, { method: "DELETE" });

    const after = (await getKeys()).response;
    expect(after).toHaveLength(1);
    expect(after[0].id).toBe("keep");
  });

  it("is a no-op when id does not exist", async () => {
    await postKey({ id: "alive", publicKey: "p", privateKeyEnc: "e" });

    await fetch(`${KEYS_URL}/ghost`, { method: "DELETE" });

    const after = (await getKeys()).response;
    expect(after).toHaveLength(1);
  });
});

describe("privacyroom mock — GET /privacyroom/{roomId}/access (mirrors GetUserKeysForRoom)", () => {
  it("returns identity keys configured for the room", async () => {
    accessHandle.current!.setRoomKeys(7, [
      {
        id: "r1",
        userId: "alice",
        publicKey: "pub-alice",
        privateKeyEnc: "",
      },
      {
        id: "r2",
        userId: "bob",
        publicKey: "pub-bob",
        privateKeyEnc: "",
      },
    ]);

    const res = await fetch(ACCESS_URL(7));
    const body = (await res.json()) as {
      response: Array<{ userId: string; publicKey: string }>;
    };

    expect(body.response).toHaveLength(2);
    expect(body.response.map((k) => k.userId).sort()).toEqual([
      "alice",
      "bob",
    ]);
  });

  it("returns empty array for an unknown room", async () => {
    const res = await fetch(ACCESS_URL(9999));
    const body = (await res.json()) as { response: unknown[] };
    expect(body.response).toEqual([]);
  });
});
