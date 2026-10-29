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

import type { Page } from "@playwright/test";
import { http, HttpResponse } from "msw";
import { RoomsType } from "@onlyoffice/apps-ui-kit/enums";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e/utils";
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
  roomContentHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Public Room id from the roomList mock (getRoomList index 0, roomType 6)
const ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_CONTENT_URL = `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`;

const API = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}`;
const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const UPLOADED_FILE_ID = 999;
const UPLOAD_SESSION_ID = "upload-session";

const openDetails = async (page: Page) => {
  const detailsTab = page.getByTestId("info_details_tab");

  if (!(await detailsTab.isVisible().catch(() => false))) {
    await page.locator(".info-panel-toggle").click();
    await expect(detailsTab).toBeVisible({ timeout: 10000 });
  }

  await detailsTab.click();
};

const uploadedFile = {
  id: UPLOADED_FILE_ID,
  folderId: ROOM_ID,
  title: "Uploaded.docx",
  fileExst: ".docx",
  fileType: 7,
  version: 1,
  versionGroup: 1,
  contentLength: "1 byte",
  pureContentLength: 1,
  fileStatus: 0,
  fileEntryType: 2,
  rootFolderId: ROOM_ID,
  rootFolderType: 14,
  access: 0,
  security: { Read: true, Edit: true, Delete: true, Download: true },
  viewAccessibility: { WebView: true, WebEdit: true },
  created: "2026-01-01T00:00:00.000Z",
  updated: "2026-01-01T00:00:00.000Z",
  createdBy: { id: ADMIN_ID, displayName: "Administrator" },
  updatedBy: { id: ADMIN_ID, displayName: "Administrator" },
};

test.describe("Rooms — info panel details", () => {
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
    );
  });

  // Production report (4.0.0): "Cannot read properties of undefined
  // (reading 'EditRoom')" thrown by the Details view of an opened room,
  // which took the whole info panel down.
  test("should render details of a room that has no security", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // must be registered after myDocumentsHandler: its `files/:id` pattern
    // would otherwise resolve the room content request.
    mockRequest.use(
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID, {
        roomType: RoomsType.VirtualDataRoom,
        security: null,
      }),
    );

    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await openDetails(page);

    await expect(
      page.getByTestId("info_panel_details_room_icon"),
    ).toBeVisible();

    expect(pageErrors.filter((m) => m.includes("EditRoom"))).toEqual([]);
  });

  // Production report (4.0.1): uploading one file into a room raised the
  // "Content" counter by two. The upload finish and the socket "create"
  // event both counted the file when the socket came first.
  test("should count an uploaded file once when the socket event arrives first", async ({
    page,
    baseUrl,
    mockRequest,
    wsMock,
  }) => {
    let releaseFinalize!: () => void;
    const finalizeGate = new Promise<void>((resolve) => {
      releaseFinalize = resolve;
    });
    let onFinalizeRequested!: () => void;
    const finalizeRequested = new Promise<void>((resolve) => {
      onFinalizeRequested = resolve;
    });

    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID),
      http.post(`${API}/files/${ROOM_ID}/upload/check`, () =>
        HttpResponse.json({ response: [] }),
      ),
      // no counts here, so the server sync after the socket event leaves
      // them alone and the test sees the local counting only
      http.get(`${API}/files/folder/${ROOM_ID}`, () =>
        HttpResponse.json({ response: { id: ROOM_ID, title: "Public Room" } }),
      ),
      http.post(`${API}/files/${ROOM_ID}/session`, () =>
        HttpResponse.json({
          response: { id: UPLOAD_SESSION_ID, path: [ROOM_ID] },
        }),
      ),
      http.post(
        `${API}/files/${ROOM_ID}/session/${UPLOAD_SESSION_ID}/upload`,
        () => HttpResponse.json({ response: { uploaded: false } }),
      ),
      http.put(
        `${API}/files/${ROOM_ID}/session/${UPLOAD_SESSION_ID}/finalize`,
        async () => {
          onFinalizeRequested();
          await finalizeGate;
          return HttpResponse.json({
            response: {
              uploaded: true,
              id: UPLOADED_FILE_ID,
              file: uploadedFile,
            },
          });
        },
      ),
      // the socket handler fetches the new file to list it; held back so
      // the upload is the one that lists it, as when the backend is slow
      http.get(`${API}/files/file/${UPLOADED_FILE_ID}`, async () => {
        await finalizeGate;
        return HttpResponse.json({ response: uploadedFile });
      }),
    );
    await wsMock.setupWebSocketMock();

    await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await openDetails(page);

    const content = page.getByText(/Folders: \d+ \| Files: \d+/);
    await expect(content).toHaveText("Folders: 0 | Files: 1");

    await page.locator(".custom-file-input-article").setInputFiles({
      name: uploadedFile.title,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: Buffer.from("x"),
    });

    await finalizeRequested;

    wsMock.emitModifyFolder({
      cmd: "create",
      type: "file",
      id: UPLOADED_FILE_ID,
      data: JSON.stringify(uploadedFile),
    });

    await expect(content).toHaveText("Folders: 0 | Files: 2");

    releaseFinalize();

    await expect(
      page.getByTestId("table-body").getByText("Uploaded", { exact: false }),
    ).toBeVisible();
    await expect(content).toHaveText("Folders: 0 | Files: 2");

    wsMock.closeConnection();
  });

  // A file outside the loaded list cannot be counted locally, so after the
  // socket events settle the counts are taken from the server.
  test("should take the room's counts from the server after a socket event", async ({
    page,
    baseUrl,
    mockRequest,
    wsMock,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      roomContentHandler(TEST_PORT, ROOM_ID, ROOM_FILE_ID),
      http.get(`${API}/files/folder/${ROOM_ID}`, () =>
        HttpResponse.json({
          response: {
            id: ROOM_ID,
            title: "Public Room",
            filesCount: 0,
            foldersCount: 0,
          },
        }),
      ),
    );
    await wsMock.setupWebSocketMock();

    await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await openDetails(page);

    const content = page.getByText(/Folders: \d+ \| Files: \d+/);
    await expect(content).toHaveText("Folders: 0 | Files: 1");

    wsMock.emitModifyFolder({
      cmd: "delete",
      type: "file",
      id: 555,
      data: JSON.stringify({ id: 555, folderId: ROOM_ID }),
    });

    await expect(content).toHaveText("Folders: 0 | Files: 0");

    wsMock.closeConnection();
  });
});
