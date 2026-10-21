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

import {
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  privacyroomAccessHandlers,
  privateRoomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import {
  API_PREFIX,
  BASE_URL,
  type WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";
import { isDSE3Format } from "@docspace/shared/services/encryption/streaming-encryption";
import { http } from "msw";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9470;
const ROOM_TITLE = "Private Test Room";
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const ROOMS_URL = "/rooms/shared/filter";
/** One more than FilesSettingsStore.maxUploadFilesCount. */
const QUEUED_FILE_COUNT = 6;
const PLAINTEXT = "must never leave the browser";
const OPAQUE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.txt$/;

const sessionUrl = `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/files/${ROOM_ID}/session`;

type SessionRequest = { fileName: string; encrypted: boolean };

const unlockIfPrompted = async (page: Page, passphrase: string) => {
  const prompt = page
    .getByRole("dialog")
    .filter({ hasText: "Enter passphrase" });
  if (await prompt.isVisible().catch(() => false)) {
    await prompt
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(passphrase);
    await prompt.getByRole("button", { name: "Confirm" }).click();
  }
};

/** Generates a key, then opens the private room in-app so the identity stays unlocked. */
const openPrivateRoomWithKey = async (
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
) => {
  const { keysHandle, passphrase } = await bootstrapEncryption(
    page,
    mockRequest,
    baseUrl,
  );
  const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
    current: null,
  };
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: ROOM_ID,
      ownerId: TEST_USER_ID,
      handle: filesHandle,
    }),
    ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    privateRoomListHandler(TEST_PORT, { roomId: ROOM_ID, title: ROOM_TITLE }),
  );
  accessHandle.current!.setRoomKeys(ROOM_ID, [
    { ...keysHandle.getKeys()[0], userId: TEST_USER_ID },
  ]);

  await navigateInApp(page, `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
  await page.waitForResponse(
    (res) =>
      res.request().method() === "GET" &&
      new URL(res.url()).pathname.endsWith(`/files/${ROOM_ID}`) &&
      res.ok(),
    { timeout: 15000 },
  );

  return { filesHandle, passphrase };
};

const navigateInApp = (page: Page, url: string) =>
  page.evaluate(
    (u) =>
      (
        window as unknown as { DocSpace: { navigate: (to: string) => void } }
      ).DocSpace.navigate(u),
    url,
  );

/** Opens the Rooms list in-app and waits until it has replaced the room's view. */
const openRoomsList = async (page: Page) => {
  const roomsLoaded = page.waitForResponse(
    (res) =>
      res.request().method() === "GET" &&
      new URL(res.url()).pathname.endsWith("/files/rooms") &&
      res.ok(),
    { timeout: 15000 },
  );
  await navigateInApp(page, ROOMS_URL);
  await roomsLoaded;
  await expect(
    page.getByTestId("table-body").getByText(ROOM_TITLE),
  ).toBeVisible({ timeout: 10000 });
};

/** Records every session request the client sends into the private room. */
const recordSessionRequests = (page: Page) => {
  const sent: SessionRequest[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url() === sessionUrl) {
      sent.push(req.postDataJSON() as SessionRequest);
    }
  });
  return sent;
};

/** Holds session requests into the private room until `release` is called. */
const holdSessions = (mockRequest: WorkerFixture) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  mockRequest.use(
    http.post(sessionUrl, async () => {
      await released;
      return undefined;
    }),
  );
  return release;
};

/** Answers the first session request into the private room with a server error. */
const failFirstSession = (mockRequest: WorkerFixture) => {
  let failed = false;
  mockRequest.use(
    http.post(sessionUrl, () => {
      if (failed) return undefined;
      failed = true;
      return new Response(
        JSON.stringify({
          error: { message: "Upload session failed" },
          status: 1,
          statusCode: 500,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }),
  );
};

const retryFromUploadPanel = async (page: Page) => {
  await page.locator(".layout-progress-bar").getByTestId("icon-upload").click();
  await page.locator(".enter-password", { hasText: "Retry" }).click();
};

const plaintextFiles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    name: `note-${i}.txt`,
    mimeType: "text/plain",
    buffer: Buffer.from(`${PLAINTEXT} #${i}`),
  }));

const expectOnlyCiphertext = (
  sent: SessionRequest[],
  filesHandle: EncryptedFilesHandlerHandle,
) => {
  for (const request of sent) {
    expect(request.encrypted).toBe(true);
    expect(request.fileName).toMatch(OPAQUE_NAME);
  }
  for (const session of filesHandle.getSessions()) {
    expect(session.encrypted).toBe(true);
    expect(isDSE3Format(session.chunks[0])).toBe(true);
    for (const chunk of session.chunks) {
      expect(Buffer.from(chunk).includes(PLAINTEXT)).toBe(false);
    }
  }
};

test.describe("Private room — upload target fixed when the user starts the upload", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Room left while files are queued", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { filesHandle, passphrase } = await openPrivateRoomWithKey(
      page,
      mockRequest,
      baseUrl,
    );
    const sent = recordSessionRequests(page);
    const releaseSessions = holdSessions(mockRequest);

    await page
      .locator("#customFileInput")
      .first()
      .setInputFiles(plaintextFiles(QUEUED_FILE_COUNT));
    await unlockIfPrompted(page, passphrase);
    await expect
      .poll(() => sent.length, { timeout: 30000 })
      .toBe(QUEUED_FILE_COUNT - 1);

    await openRoomsList(page);
    releaseSessions();

    await expect
      .poll(
        () => filesHandle.current!.getSessions().filter((s) => s.completed)
          .length,
        { timeout: 30000 },
      )
      .toBe(QUEUED_FILE_COUNT);
    expect(sent).toHaveLength(QUEUED_FILE_COUNT);
    expectOnlyCiphertext(sent, filesHandle.current!);
  });

  test("Retry from another folder", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { filesHandle, passphrase } = await openPrivateRoomWithKey(
      page,
      mockRequest,
      baseUrl,
    );
    const sent = recordSessionRequests(page);
    failFirstSession(mockRequest);

    await page.locator("#customFileInput").first().setInputFiles(plaintextFiles(1));
    await unlockIfPrompted(page, passphrase);
    await expect.poll(() => sent.length, { timeout: 30000 }).toBe(1);

    await openRoomsList(page);
    await retryFromUploadPanel(page);
    await unlockIfPrompted(page, passphrase);

    await expect
      .poll(
        () => filesHandle.current!.getSessions().filter((s) => s.completed)
          .length,
        { timeout: 30000 },
      )
      .toBe(1);
    expect(sent).toHaveLength(2);
    expectOnlyCiphertext(sent, filesHandle.current!);
  });
});
