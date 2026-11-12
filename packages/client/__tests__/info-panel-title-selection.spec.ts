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

import { http, HttpResponse } from "msw";
import {
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
  rootHandler,
  myDocumentsHandler,
  myHandler,
  selfActivationStatusHandler,
  fileSharedUsersHandler,
  folderSharedUsersHandler,
} from "@docspace/shared/__mocks__/handlers";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOM_ID = 33;
const ROOM_TITLE = "Web Applications Department";
const FOLDER_A = { id: 501, title: "Backend Development Team" };
const FOLDER_B = { id: 502, title: "Connectors Development Team" };
const ROOM_CONTENT_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

const ADMIN = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator",
  avatarSmall: "",
  profileUrl: "",
  hasAvatar: false,
  isAnonim: false,
};

const folderSecurity = {
  Read: true,
  Create: true,
  Delete: true,
  EditRoom: true,
  Rename: true,
  CopyTo: true,
  Copy: true,
  MoveTo: true,
  Move: true,
  Pin: true,
  Mute: true,
  EditAccess: true,
  Duplicate: true,
  Download: true,
  CopySharedLink: true,
  CopyLink: true,
  Embed: true,
  ChangeOwner: true,
  HistoryExport: true,
};

const makeFolder = (
  id: number,
  title: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  title,
  parentId: ROOM_ID,
  filesCount: 0,
  foldersCount: 0,
  new: 0,
  mute: false,
  pinned: false,
  private: false,
  fileEntryType: 1,
  rootFolderId: 2002,
  rootFolderType: 14,
  canShare: true,
  shared: false,
  sharedForUser: false,
  parentShared: false,
  inRoom: true,
  access: 0,
  security: folderSecurity,
  created: "2026-01-01T00:00:00.000Z",
  createdBy: ADMIN,
  updated: "2026-01-01T00:00:00.000Z",
  updatedBy: ADMIN,
  ...extra,
});

const room = makeFolder(ROOM_ID, ROOM_TITLE, {
  parentId: 2002,
  isRoom: true,
  roomType: 6,
  foldersCount: 2,
  shareSettings: { ExternalLink: 6, PrimaryExternalLink: 1 },
});

const listing = (
  current: Record<string, unknown>,
  folders: Record<string, unknown>[],
  pathParts: { id: number; title: string; folderType: number }[],
) =>
  HttpResponse.json({
    response: {
      files: [],
      folders,
      current,
      pathParts,
      startIndex: 0,
      count: folders.length,
      total: folders.length,
      new: 0,
    },
  });

// The room holds two folders; each folder is empty.
const roomTreeHandler = (port: string) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/:folderId`,
    ({ params }) => {
      const roomPath = [
        { id: 2002, title: "Rooms", folderType: 14 },
        { id: ROOM_ID, title: ROOM_TITLE, folderType: 14 },
      ];
      const id = Number(params.folderId);

      if (id === ROOM_ID) {
        return listing(
          room,
          [FOLDER_A, FOLDER_B].map((f) => makeFolder(f.id, f.title)),
          roomPath,
        );
      }

      const folder = [FOLDER_A, FOLDER_B].find((f) => f.id === id);
      if (!folder) return undefined;

      return listing(makeFolder(folder.id, folder.title), [], [
        ...roomPath,
        { id: folder.id, title: folder.title, folderType: 0 },
      ]);
    },
  );

// The Share tab of a folder and the Contacts tab of the room only need to
// load without errors; they stay empty.
const sharingHandlers = (port: string) => {
  const api = `${BASE_URL}:${port}/${API_PREFIX}/files`;

  return [
    http.get(`${api}/folder/:folderId/links`, () =>
      HttpResponse.json({ response: [] }),
    ),
    http.get(`${api}/rooms/${ROOM_ID}/links`, () =>
      HttpResponse.json({ response: [] }),
    ),
    http.get(`${api}/rooms/${ROOM_ID}/share`, () =>
      HttpResponse.json({ response: { items: [], total: 0 } }),
    ),
  ];
};

test.describe("Rooms - info panel title", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
      folderSharedUsersHandler(TEST_PORT),
    );
    // after myDocumentsHandler: its `files/:id` pattern would win otherwise
    mockRequest.use(roomTreeHandler(TEST_PORT), ...sharingHandlers(TEST_PORT));
  });

  // Bug report (4.0.1): with the Lingualeo extension installed, selecting the
  // folder title in the info panel and then opening another folder renders
  // "Connectors Development TeamBackend Development Team". Plain selection
  // leaves the DOM alone; the extension wraps the selected range in <wtf> with
  // Range.surroundContents, which splits the text node React rendered the
  // title into. React keeps updating its own (now leading) node, and the old
  // title stays behind it unless the foreign text guard cleans it up.
  test("should replace the title after an extension split the selected title", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    const headerText = page.locator(".info-panel_header-text");

    if (!(await headerText.isVisible().catch(() => false))) {
      await page.locator(".info-panel-toggle").click();
    }
    await expect(headerText).toHaveText(ROOM_TITLE);

    await page.getByText(FOLDER_A.title, { exact: true }).first().click();
    await expect(headerText).toHaveText(FOLDER_A.title);

    // Select the first word, as in the recording.
    await headerText.dblclick({ position: { x: 5, y: 10 } });
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
      FOLDER_A.title.split(" ")[0],
    );

    // What Lingualeo 3.1.2 does with the selection (content.js). The <wtf>
    // element stays in the DOM until the next lookup.
    await page.evaluate(() => {
      const range = window.getSelection()!.getRangeAt(0);
      range.surroundContents(document.createElement("wtf"));
      window.getSelection()!.removeAllRanges();
    });
    await expect(headerText.locator("wtf")).toHaveCount(1);
    await expect(headerText).toHaveText(FOLDER_A.title);

    await page.goBack();
    await expect(headerText).toHaveText(ROOM_TITLE);

    await page.getByText(FOLDER_B.title, { exact: true }).first().click();
    await expect(headerText).toHaveText(FOLDER_B.title);
  });
});
