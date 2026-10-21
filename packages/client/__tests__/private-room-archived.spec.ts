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
  appsHandler,
  aiConfigHandler,
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  myHandler,
  privacyroomAccessHandlers,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFileSeed,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { API_PREFIX, BASE_URL, type WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { myDocumentsResolver } from "@docspace/shared/__mocks__/handlers/files/documents";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import { http } from "msw";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9480;
const SUBFOLDER_ID = 9481;
const SUBFOLDER_TITLE = "Reports";
const ORDINARY_ROOM_ID = 9490;
const ORDINARY_ROOM_TITLE = "Archived Team Room";
/** The root mock's My documents id and the id its listing reports. */
const MY_DOCUMENTS_IDS = [12764, 100];
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const ALICE_ID = "11111111-1111-1111-1111-111111111111";

const BUDGET = { id: 8901, name: "budget-2026.txt", text: "Budget lines." };
const MINUTES = { id: 8902, name: "minutes.txt", text: "Meeting minutes." };
const Q3 = { id: 8903, name: "q3-report.txt", text: "Third quarter." };

const archivedRoomUrl = (folderId: number, extra = "") =>
  `/rooms/archived/filter?folder=${folderId}${extra}`;

const privateArchivedRoomUrl = (folderId: number, extra = "") =>
  `/private/archived/filter?folder=${folderId}${extra}`;

const apiUrl = (path: string) => `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

type TArchivedRoom = {
  filesHandle: EncryptedFilesHandlerHandle;
  passphrase: string;
};

/**
 * Generates the member's key, then serves an archived private room whose
 * files Alice encrypted for herself and the member: two files at the root
 * and one in the folder "Reports". My documents takes uploads.
 */
const serveArchivedPrivateRoom = async (
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
): Promise<TArchivedRoom> => {
  const { keysHandle, passphrase } = await bootstrapEncryption(
    page,
    mockRequest,
    baseUrl,
  );
  const memberPublicKey = keysHandle.getKeys()[0].publicKey;
  const alice = await generateIdentityKeyPair();
  const alicePublicKey = arrayBufferToBase64(
    alice.publicKey.buffer as ArrayBuffer,
  );

  const seed = async (
    file: typeof BUDGET,
    folderId?: number,
  ): Promise<EncryptedFileSeed> => {
    const plain = new TextEncoder().encode(file.text);
    const { encryptedBlob, dek } = await encryptFile(plain, {
      fileName: file.name,
    });
    const fileKeys = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: alicePublicKey },
        { userId: TEST_USER_ID, publicKey: memberPublicKey },
      ],
      fileId: file.id,
    });
    return {
      id: file.id,
      title: file.name,
      serverTitle: `${crypto.randomUUID()}.txt`,
      size: plain.byteLength,
      encrypted: true,
      fileKeys,
      bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
      folderId,
    };
  };

  const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
    current: null,
  };
  mockRequest.use(
    myHandler(TEST_PORT),
    ...MY_DOCUMENTS_IDS.map((id) =>
      http.get(apiUrl(`files/${id}`), () => myDocumentsResolver()),
    ),
    /**
     * Mirrors OperationController.CheckMoveOrCopyBatchItems
     * (HttpGet "fileops/move"): the requested items that clash with an entry
     * of the destination; none here.
     */
    http.get(apiUrl("files/fileops/move"), () =>
      Response.json({ response: [], status: 0, statusCode: 200 }),
    ),
    ...MY_DOCUMENTS_IDS.flatMap((id) => [
      http.get(apiUrl(`files/folder/${id}`), async () => {
        const { response } = await myDocumentsResolver().json();
        return Response.json({
          response: response.current,
          status: 0,
          statusCode: 200,
        });
      }),
      http.post(apiUrl(`files/${id}/upload/check`), () =>
        Response.json({ response: [], status: 0, statusCode: 200 }),
      ),
    ]),
  );
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: ROOM_ID,
      ownerId: ALICE_ID,
      archived: true,
      folders: [{ id: SUBFOLDER_ID, title: SUBFOLDER_TITLE }],
      initialFiles: [
        await seed(BUDGET),
        await seed(MINUTES),
        await seed(Q3, SUBFOLDER_ID),
      ],
      handle: filesHandle,
    }),
    ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
  );
  accessHandle.current!.setRoomKeys(ROOM_ID, [
    { id: "alice-1", userId: ALICE_ID, publicKey: alicePublicKey, privateKeyEnc: "" },
    { id: "member-1", userId: TEST_USER_ID, publicKey: memberPublicKey, privateKeyEnc: "" },
  ]);

  return { filesHandle: filesHandle.current!, passphrase };
};

const navigateInApp = (page: Page, url: string) =>
  page.evaluate(
    (u) =>
      (
        window as unknown as { DocSpace: { navigate: (to: string) => void } }
      ).DocSpace.navigate(u),
    url,
  );

/** Opens a folder of the room in-app, so the identity stays unlocked. */
const openInApp = async (
  page: Page,
  folderId: number,
  extra = "",
  urlOf = privateArchivedRoomUrl,
) => {
  const loaded = page.waitForResponse(
    (res) =>
      res.request().method() === "GET" &&
      new URL(res.url()).pathname.endsWith(`/files/${folderId}`) &&
      res.ok(),
    { timeout: 15000 },
  );
  await navigateInApp(page, urlOf(folderId, extra));
  await loaded;
};

/** The list shows titles without their extension. */
const row = (page: Page, title: string) =>
  page
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: title.replace(/\.txt$/, "") });

const openContextMenu = async (page: Page, title: string) => {
  await row(page, title).getByTestId("context-menu-button").first().click();
};

const toast = (page: Page, text: RegExp) =>
  page.getByTestId("toast-content").filter({ hasText: text });

const passphrasePrompt = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Enter passphrase" });

const unlockIfPrompted = async (page: Page, passphrase: string) => {
  const prompt = passphrasePrompt(page);
  try {
    await prompt.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    return;
  }
  await prompt
    .locator('input[name="passphrase"], #passphrase input')
    .first()
    .fill(passphrase);
  await prompt.getByRole("button", { name: "Confirm" }).click();
};

/** Records every request the page sends, as "METHOD pathname?search". */
const recordRequests = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    seen.push(`${req.method()} ${url.pathname}${url.search}`);
  });
  return seen;
};

/** Files the mock stored outside the archived room. */
const copiesOutOf = (filesHandle: EncryptedFilesHandlerHandle) =>
  filesHandle
    .getFiles()
    .filter(
      (f) =>
        f.folderId !== undefined &&
        f.folderId !== ROOM_ID &&
        f.folderId !== SUBFOLDER_ID,
    );

const uploadSessions = (seen: string[]) =>
  seen.filter((r) => /\/files\/\d+\/session(\/|\?|$)/.test(r));

const serverCopies = (seen: string[]) =>
  seen.filter((r) => r.startsWith("PUT ") && r.includes("/fileops/copy"));

const searchInput = (page: Page) =>
  page.locator('[data-testid="filter_search_input"] input');

const selector = (page: Page) => page.getByTestId("aside").first();

/** Picks My documents ("Files" at the picker's root) and confirms. */
const copyToMyDocuments = async (page: Page) => {
  const picker = selector(page);
  await picker.getByText("Apps", { exact: true }).first().click();
  await picker
    .locator('[data-testid^="selector-item-"]')
    .filter({ hasText: /^Files$/ })
    .click();
  await picker.getByRole("button", { name: "Copy here" }).click();
};

const banner = (page: Page) =>
  selector(page).getByText("Encrypted files", { exact: true }).first();

/** Selects every item of the open folder with Ctrl+A and waits until the rows show it. */
const selectAll = async (page: Page) => {
  await page.keyboard.press("Control+a");
  await expect(page.locator(".table-row-selected").first()).toBeVisible({
    timeout: 5000,
  });
};

/** Nothing on screen marks an ignored hotkey, so absence is checked after a pause. */
const settle = (page: Page) => page.waitForTimeout(2000);

test.describe("Private room — archived", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
    );
  });

  test("Archived private room opened", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);

    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });
    await expect(row(page, MINUTES.name)).toBeVisible();
    await expect(row(page, SUBFOLDER_TITLE)).toBeVisible();
    await settle(page);
    await expect(page.getByTestId("ai-chat-button")).toHaveCount(0);
  });

  test("Folder inside an archived private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, SUBFOLDER_ID);
    await expect(row(page, Q3.name)).toBeVisible({ timeout: 15000 });
    const seen = recordRequests(page);

    await searchInput(page).fill("q3");

    await expect(row(page, Q3.name)).toBeVisible();
    await settle(page);
    expect(seen.filter((r) => /filterValue=q3|search=q3/.test(r))).toEqual([]);
  });

  test("Archived private room under Rooms", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    // Under Rooms -> Archive only while the Private section is off.
    mockRequest.use(appsHandler(TEST_PORT, { disabled: ["e2e-rooms"] }));
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);

    await openInApp(page, ROOM_ID, "", archivedRoomUrl);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });
    await settle(page);
    await expect(page.getByTestId("ai-chat-button")).toHaveCount(0);

    await openInApp(page, SUBFOLDER_ID, "", archivedRoomUrl);
    await expect(row(page, Q3.name)).toBeVisible({ timeout: 15000 });
    await settle(page);
    await expect(page.getByTestId("ai-chat-button")).toHaveCount(0);
  });

  test("Download in an archived private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { passphrase } = await serveArchivedPrivateRoom(
      page,
      mockRequest,
      baseUrl,
    );
    await openInApp(page, ROOM_ID);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    const downloadEvent = page.waitForEvent("download", { timeout: 20000 });
    await openContextMenu(page, BUDGET.name);
    await page.locator("#option_download").hover();
    await page
      .getByRole("menuitem", { name: "Original format", exact: true })
      .click();
    await unlockIfPrompted(page, passphrase);

    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe(BUDGET.name);
    const fs = await import("node:fs/promises");
    const bytes = await fs.readFile((await download.path()) as string);
    expect(new TextDecoder().decode(bytes)).toBe(BUDGET.text);
  });

  test("Copy to My documents", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { filesHandle, passphrase } = await serveArchivedPrivateRoom(
      page,
      mockRequest,
      baseUrl,
    );
    const seen = recordRequests(page);
    await openInApp(page, ROOM_ID);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, BUDGET.name);
    await page.locator("#option_copy-to").click();
    await expect(banner(page)).toBeVisible({ timeout: 10000 });
    await copyToMyDocuments(page);
    await unlockIfPrompted(page, passphrase);

    await expect
      .poll(() => copiesOutOf(filesHandle).length, { timeout: 30000 })
      .toBe(1);
    const [copy] = copiesOutOf(filesHandle);
    expect(copy.title).toBe(BUDGET.name);
    expect(copy.encrypted).toBe(false);
    expect(new TextDecoder().decode(copy.bytes)).toBe(BUDGET.text);
    expect(filesHandle.getFile(BUDGET.id).encrypted).toBe(true);
    expect(serverCopies(seen)).toEqual([]);
  });

  test("No server copy", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { filesHandle, passphrase } = await serveArchivedPrivateRoom(
      page,
      mockRequest,
      baseUrl,
    );
    const seen = recordRequests(page);
    await openInApp(page, ROOM_ID);
    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, MINUTES.name);
    await page.locator("#option_copy-to").click();
    await copyToMyDocuments(page);
    await unlockIfPrompted(page, passphrase);

    await expect
      .poll(() => copiesOutOf(filesHandle).length, { timeout: 30000 })
      .toBe(1);
    expect(serverCopies(seen)).toEqual([]);
  });

  test("Warning in the destination picker", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);

    await openInApp(page, SUBFOLDER_ID);
    await expect(row(page, Q3.name)).toBeVisible({ timeout: 15000 });
    await openContextMenu(page, Q3.name);
    await page.locator("#option_copy-to").click();

    await expect(banner(page)).toBeVisible({ timeout: 10000 });
    await expect(
      selector(page).getByText(/will be saved in decrypted form/),
    ).toBeVisible();
  });

  test("Identity locked", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { filesHandle } = await serveArchivedPrivateRoom(
      page,
      mockRequest,
      baseUrl,
    );
    const seen = recordRequests(page);
    // A full load locks the identity again.
    await page.goto(`${baseUrl}${privateArchivedRoomUrl(ROOM_ID)}`);
    const entryPrompt = passphrasePrompt(page);
    try {
      await entryPrompt.waitFor({ state: "visible", timeout: 10000 });
      await entryPrompt.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(entryPrompt).toBeHidden();
    } catch {}
    const firstRow = page.getByTestId("table-row-1");
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    await firstRow.getByTestId("context-menu-button").first().click();
    await page.locator("#option_copy-to").click();
    await copyToMyDocuments(page);
    await passphrasePrompt(page).waitFor({ state: "visible", timeout: 10000 });
    await passphrasePrompt(page)
      .getByRole("button", { name: "Cancel", exact: true })
      .click();

    await expect(passphrasePrompt(page)).toBeHidden();
    await settle(page);
    expect(uploadSessions(seen)).toEqual([]);
    expect(copiesOutOf(filesHandle)).toEqual([]);
    expect(serverCopies(seen)).toEqual([]);
  });

  test("Folder context menu", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, SUBFOLDER_TITLE)).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, SUBFOLDER_TITLE);

    await expect(page.locator("#option_open")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#option_copy-to")).toHaveCount(0);
    await expect(page.locator("#option_duplicate")).toHaveCount(0);
  });

  test("Ctrl+C on encrypted files", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    await selectAll(page);
    await page.keyboard.press("Control+c");

    const noticeShown = await toast(page, /clipboard|: \d+$/i)
      .first()
      .waitFor({ state: "visible", timeout: 3000 })
      .then(
        () => true,
        () => false,
      );
    expect(noticeShown).toBe(false);
  });

  test("Paste after Ctrl+C", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    const seen = recordRequests(page);
    await openInApp(page, ROOM_ID);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    await selectAll(page);
    await page.keyboard.press("Control+c");
    await navigateInApp(page, "/rooms/personal/filter?folder=12764");
    await expect(
      page.getByRole("heading", { name: "My documents", level: 1 }),
    ).toBeVisible({ timeout: 15000 });
    await page.keyboard.press("Control+v");
    await settle(page);

    expect(serverCopies(seen)).toEqual([]);
    expect(uploadSessions(seen)).toEqual([]);
  });

  test("Search by decrypted name", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 15000 });

    await searchInput(page).fill("budg");

    await expect(row(page, BUDGET.name)).toBeVisible();
    await expect(row(page, MINUTES.name)).toHaveCount(0);
  });

  test("Query stays on the client", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 15000 });
    const seen = recordRequests(page);

    await searchInput(page).fill("budg");
    await expect(row(page, MINUTES.name)).toHaveCount(0);

    expect(seen.filter((r) => /filterValue=budg|search=budg/.test(r))).toEqual(
      [],
    );
    expect(page.url()).not.toContain("search=");
  });

  test("Search cleared", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 15000 });

    await searchInput(page).fill("budg");
    await expect(row(page, MINUTES.name)).toHaveCount(0);
    await searchInput(page).fill("");

    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 10000 });
    await expect(row(page, BUDGET.name)).toBeVisible();
  });

  test("Open location of an encrypted file", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    // Open location is offered in a rooms section once a type filter is set.
    await openInApp(page, ROOM_ID, "&filterType=1");
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, BUDGET.name);
    await page.locator("#option_open-location").click();

    await expect(searchInput(page)).toHaveValue(BUDGET.name, {
      timeout: 15000,
    });
    await expect(row(page, BUDGET.name)).toBeVisible();
    await expect(row(page, MINUTES.name)).toHaveCount(0);

    await searchInput(page).fill("");
    await expect(row(page, MINUTES.name)).toBeVisible({ timeout: 10000 });
  });

  test("Encrypted file in an archived private room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    await serveArchivedPrivateRoom(page, mockRequest, baseUrl);
    await openInApp(page, ROOM_ID);
    await expect(row(page, BUDGET.name)).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, BUDGET.name);

    await expect(page.locator("#option_download")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#option_ask-ai")).toHaveCount(0);
  });
});

test.describe("Ordinary archived room", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ORDINARY_ROOM_ID,
        archived: true,
        isPrivate: false,
        title: ORDINARY_ROOM_TITLE,
        initialFiles: [
          { id: 8911, title: "plan.txt", size: 4, encrypted: false },
        ],
      }),
    );
  });

  test("Ordinary archived room: the AI chat is offered and search goes to the server", async ({
    page,
    baseUrl,
  }) => {
    const seen = recordRequests(page);
    await page.goto(`${baseUrl}${archivedRoomUrl(ORDINARY_ROOM_ID)}`);
    await expect(row(page, "plan.txt")).toBeVisible({ timeout: 15000 });

    await expect(page.getByTestId("ai-chat-button")).toBeVisible({
      timeout: 10000,
    });

    await searchInput(page).fill("plan");
    await expect
      .poll(() =>
        seen.some(
          (r) =>
            r.startsWith(`GET /${API_PREFIX}/files/${ORDINARY_ROOM_ID}`) &&
            r.includes("filterValue=plan"),
        ),
      )
      .toBe(true);
    await expect.poll(() => page.url()).toContain("search=plan");
  });

  test("Ordinary archived room: copies are made by the server", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      myHandler(TEST_PORT),
      ...MY_DOCUMENTS_IDS.map((id) =>
        http.get(apiUrl(`files/${id}`), () => myDocumentsResolver()),
      ),
      /**
       * Mirrors OperationController.CheckMoveOrCopyBatchItems
       * (HttpGet "fileops/move"): the requested items that clash with an
       * entry of the destination; none here.
       */
      http.get(apiUrl("files/fileops/move"), () =>
        Response.json({ response: [], status: 0, statusCode: 200 }),
      ),
    );
    const seen = recordRequests(page);
    await page.goto(`${baseUrl}${archivedRoomUrl(ORDINARY_ROOM_ID)}`);
    await expect(row(page, "plan.txt")).toBeVisible({ timeout: 15000 });

    await openContextMenu(page, "plan.txt");
    await page.locator("#option_copy-to").click();
    await expect(
      selector(page).getByText("Encrypted files", { exact: true }),
    ).toHaveCount(0);
    await copyToMyDocuments(page);

    await expect.poll(() => serverCopies(seen).length, { timeout: 15000 }).toBe(1);
  });
});
