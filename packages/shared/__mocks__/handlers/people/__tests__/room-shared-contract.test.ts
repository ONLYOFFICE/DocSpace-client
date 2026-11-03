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

// CONTRACT TESTS — lock the people-for-a-room mock to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { usersWithRoomSharedHandler } from "../roomShared";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3400";
const ROOM_ID = 9400;

const server = setupServer(
  usersWithRoomSharedHandler(PORT, ROOM_ID, [
    { id: "u-1", displayName: "Carol Jones", email: "carol@example.com" },
    {
      id: "u-2",
      displayName: "Dan Brown",
      email: "dan@example.com",
      shared: true,
    },
  ]),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => server.close());

describe("usersWithRoomSharedHandler (mirrors UserController.GetUsersWithRoomShared)", () => {
  it("answers EmployeeFullDto entries carrying `shared`, with count and total set from the paging", async () => {
    const res = await fetch(
      `${BASE_URL}:${PORT}/${API_PREFIX}/people/room/${ROOM_ID}?area=1&count=1&startIndex=1`,
    );
    const body = (await res.json()) as {
      response: Record<string, unknown>[];
      count: number;
      total: number;
    };

    expect(res.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.total).toBe(2);
    expect(body.response).toEqual([
      expect.objectContaining({
        id: "u-2",
        displayName: "Dan Brown",
        email: "dan@example.com",
        shared: true,
      }),
    ]);
  });
});
