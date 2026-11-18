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

// CONTRACT TESTS — lock the default start page mock to the server's actual
// behavior. Same purpose as privacyroom/__tests__/contract.test.ts; see that
// file's preamble for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { defaultFolderHandler } from "../defaultFolder";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";

const PORT = "3301";

// FolderType (ASC.Files.Core)
const USER = 5;
const PRIVATE_ROOMS = 42;
const TRASH = 3;

const save = (defaultFolderType: number) =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/settings/defaultFolder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ DefaultFolderType: defaultFolderType }),
  });

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("defaultFolderHandler (mirrors SettingsController.SaveDefaultFolder)", () => {
  it("Default page setting: the Private root is accepted and answered back", async () => {
    server.use(defaultFolderHandler(PORT));

    const res = await save(PRIVATE_ROOMS);

    expect(res.status).toBe(200);
    expect(
      ((await res.json()) as { response: { defaultFolderType: number } })
        .response.defaultFolderType,
    ).toBe(PRIVATE_ROOMS);
  });

  it("refuses a folder a start page cannot be set to", async () => {
    server.use(defaultFolderHandler(PORT));

    expect((await save(TRASH)).status).toBe(400);
  });

  it("refuses My documents for a guest", async () => {
    server.use(defaultFolderHandler(PORT, { isGuest: true }));

    expect((await save(USER)).status).toBe(400);
    expect((await save(PRIVATE_ROOMS)).status).toBe(200);
  });
});
