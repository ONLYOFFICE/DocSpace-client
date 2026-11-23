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


import { setupServer } from "msw/node";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import {
  encryptedFilesHandlers,
  type EncryptedFilesHandlerHandle,
} from "../../files/encryptedFiles";
import { privateRoomAccountsHandlers } from "../privateRoomAccounts";

const PORT = "3232";
const ROOM_ID = 9770;
const OWNER_ID = "11111111-1111-1111-1111-111111111111";
const BOB_ID = "22222222-2222-2222-2222-222222222222";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";
const OWNERSHIP = "ASC.Files.Core.Helpers.PrivateRoomOwnershipException";

const files: { current: EncryptedFilesHandlerHandle | null } = {
  current: null,
};

const server = setupServer(
  ...privateRoomAccountsHandlers(PORT, {
    owners: [OWNER_ID],
    canTakeRooms: [CAROL_ID],
    files,
  }),
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    ownerId: OWNER_ID,
    handle: files,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

beforeEach(() => {
  files.current!.setFiles([
    {
      id: 1,
      title: "a.docx",
      encrypted: true,
      fileKeys: [OWNER_ID, BOB_ID].map((userId) => ({
        userId,
        publicKeyId: `pk-${userId}`,
        privateKeyEnc: `wrap-${userId}`,
      })),
    },
  ]);
});

const put = (path: string, body: unknown, method = "PUT") =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/people/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const keyHolders = () =>
  files.current!.getFiles()[0].fileKeys.map((k) => k.userId);

describe("privateRoomAccounts mock - PUT /people/status/{status} (mirrors UserController.UpdateUserStatus)", () => {
  it("Deactivated member", async () => {
    const res = await put("status/2", { userIds: [BOB_ID] });

    expect(res.status).toBe(200);
    expect(keyHolders()).toEqual([OWNER_ID]);
  });

  it("Deactivated owner", async () => {
    const res = await put("status/2", { userIds: [BOB_ID, OWNER_ID] });

    expect(res.status).toBe(403);
    expect((await res.json()).error.type).toBe(OWNERSHIP);
    expect(keyHolders()).toEqual([OWNER_ID, BOB_ID]);
  });

  it("Member activated again", async () => {
    await put("status/2", { userIds: [BOB_ID] });

    const res = await put("status/1", { userIds: [BOB_ID] });

    expect(res.status).toBe(200);
    expect(keyHolders()).toEqual([OWNER_ID]);
  });
});

describe("privateRoomAccounts mock - POST /people/type (mirrors UserController.StartUserTypeUpdate)", () => {
  const toGuest = (userId: string, reassignUserId: string) =>
    put("type", { type: 2, userId, reassignUserId }, "POST");

  it("New owner cannot take the rooms", async () => {
    const res = await toGuest(OWNER_ID, BOB_ID);

    expect(res.status).toBe(403);
    expect((await res.json()).error.type).toBe(OWNERSHIP);
  });

  it("Owner turned into a guest", async () => {
    expect((await toGuest(OWNER_ID, CAROL_ID)).status).toBe(200);
  });

  it("Member turned into a guest", async () => {
    expect((await toGuest(BOB_ID, BOB_ID)).status).toBe(200);
  });
});
