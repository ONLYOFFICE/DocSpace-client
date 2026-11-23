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
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { API_PREFIX, BASE_URL } from "../../../e2e/utils";
import { encryptedFilesHandlers } from "../../files/encryptedFiles";
import { privacyroomKeysHandlers } from "../../privacyroom";
import { privateRoomsAppOffHandlers } from "../index";

const PORT = "3231";
const ROOM_ID = 9760;
const FILE_ID = 9761;

const server = setupServer(
  ...privateRoomsAppOffHandlers(PORT, { roomId: ROOM_ID, fileIds: [FILE_ID] }),
  ...encryptedFilesHandlers(PORT, {
    roomId: ROOM_ID,
    initialFiles: [{ id: FILE_ID, title: "a.docx", size: 4 }],
  }),
  ...privacyroomKeysHandlers(PORT),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

const api = (path: string, init?: RequestInit) =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/${path}`, init);

describe("privateRoomsAppOffHandlers (mirrors PrivateRoomsGate)", () => {
  it("App off, private room requested by id", async () => {
    const statuses = await Promise.all(
      [
        `files/${ROOM_ID}`,
        `files/folder/${ROOM_ID}`,
        `files/file/${FILE_ID}`,
        `files/file/${FILE_ID}/openedit`,
        `files/rooms/${ROOM_ID}/share`,
        `privacyroom/${ROOM_ID}/access`,
      ].map(async (path) => (await api(path)).status),
    );

    expect(statuses).toEqual([404, 404, 404, 404, 403, 403]);
  });

  it("App off, private room created", async () => {
    const create = (isPrivate: boolean) =>
      api("files/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Room", roomType: 5, private: isPrivate }),
      });

    const res = await create(true);

    expect(res.status).toBe(403);
    expect((await res.json()).error.message).toBe(
      "Private rooms are turned off on this portal",
    );
  });

  it("App off, other private-room routes", async () => {
    expect((await api("privacyroom/keys")).status).toBe(200);
  });
});
