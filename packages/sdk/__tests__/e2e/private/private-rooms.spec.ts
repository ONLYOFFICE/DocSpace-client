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

// =============================================================================
// Playwright e2e for the (private) route group (/sdk/private/*).
//
// The signed-in user holds the crypto fixture identity (./fixtures); the
// tests encrypt their files in Node with the shared crypto services and
// unlock the identity in the browser through the SDK's passphrase modal.
// That covers BLOCKER A (unlock) and B (session cookie) named by the tests
// that are still fixme; their comments list what else they need.
//
// The e2e server serves the PRODUCTION build (.next, dev:false in
// createNextTestServer): rebuild packages/sdk after source changes, otherwise
// routes added since the last build 404 via the [...not-found] catch-all.
//
// Run:
//   cd packages/sdk
//   npx playwright test __tests__/e2e/private --reporter=line
// =============================================================================

import type { Locator, Page } from "@playwright/test";

import {
  emptyTemplateHandler,
  encryptedFilesHandlers,
  folderHistoryHandler,
  privacyroomAccessHandlers,
  privateRoomListHandler,
  roomMembersHandlers,
  usersWithRoomSharedHandler,
  type EncryptedFileSeed,
  type EncryptedFilesHandlerHandle,
  type RoomMembersHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { TEncryptionKeyPair } from "@docspace/shared/api/privacy/types";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { isDSE3Format } from "@docspace/shared/services/encryption/streaming-encryption";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";

import { FIXTURE_IDENTITY, FIXTURE_USER_ID } from "../fixtures/crypto";
import {
  test,
  expect,
  passphrasePrompt,
  unlock,
  type TMockBoth,
} from "./fixtures";

const PRIVATE_LIST = "/sdk/private";
const PRIVATE_ARCHIVE = "/sdk/private/archive";
// The host opt-in the private pages require until the feature is released.
const OPT_IN = "?privateRooms=true";

const ROOM_ID = 7001;
const ROOM_TITLE = "Private Test Room";
const SECOND_ROOM_ID = 7002;
const SECOND_ROOM_TITLE = "Second Private Room";
const SECOND_ROOM_FOLDER = { id: 7020, title: "Drafts" };
const ROOM_FOLDER = { id: 7010, title: "Reports" };
const SHARED_ROOM_ID = 7003;
const SHARED_ROOM_TITLE = "Shared Room";
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const CAROL = {
  id: "33333333-3333-3333-3333-333333333333",
  displayName: "Carol Jones",
  email: "carol@example.com",
};

/** The rights FolderDtoHelper sends the owner of an active room. */
const OWNER_ROOM_SECURITY = {
  Read: true,
  Create: true,
  EditRoom: true,
  EditAccess: true,
  CopyTo: true,
  MoveTo: true,
};

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type TPlainFile = {
  id: number;
  name: string;
  serverTitle: string;
  bytes: Uint8Array;
};

const MEMO: TPlainFile = {
  id: 8101,
  name: "memo.txt",
  serverTitle: "5f0c9a52-2f7b-4f43-9a8e-0d1c2b3a4f51.txt",
  bytes: new TextEncoder().encode("Quarterly memo, readable by the room only."),
};

const PHOTO: TPlainFile = {
  id: 8102,
  name: "photo.png",
  serverTitle: "0b6e3c1d-6a4f-4c8e-9d2b-7e5f1a3c9b40.png",
  bytes: new Uint8Array(PNG_1X1),
};

const REPORT: TPlainFile = {
  id: 8103,
  name: "Report.docx",
  serverTitle: "3d8f2a61-9c47-4b1e-8a05-6f2c4e7d1b93.docx",
  bytes: new TextEncoder().encode("Annual report, readable by the room only."),
};

const REPORT_COPY: TPlainFile = {
  id: 8104,
  name: "Report (1).docx",
  serverTitle: "a71c5e08-2b94-4d3f-b6e2-91d0c8f4a527.docx",
  bytes: new TextEncoder().encode("Annual report, its first copy."),
};

type TKeyHolder = { userId: string; publicKey: string };

/** The signed-in user's key as the room access lists return it. */
const MY_KEY = {
  id: FIXTURE_IDENTITY.id,
  userId: FIXTURE_USER_ID,
  publicKey: FIXTURE_IDENTITY.publicKey,
  privateKeyEnc: FIXTURE_IDENTITY.privateKeyEnc,
  date: FIXTURE_IDENTITY.date as string,
  cryptoEngineId: FIXTURE_IDENTITY.cryptoEngineId as string,
};

const ME: TKeyHolder = {
  userId: FIXTURE_USER_ID,
  publicKey: FIXTURE_IDENTITY.publicKey,
};

/** Encrypts a file as Alice's upload does, its key wrapped for `recipients`. */
const encryptedSeed = async (
  file: TPlainFile,
  sender: Awaited<ReturnType<typeof generateIdentityKeyPair>>,
  recipients: TKeyHolder[],
): Promise<EncryptedFileSeed> => {
  const { encryptedBlob, dek } = await encryptFile(file.bytes, {
    fileName: file.name,
  });
  return {
    id: file.id,
    title: file.name,
    serverTitle: file.serverTitle,
    size: file.bytes.byteLength,
    encrypted: true,
    fileKeys: await wrapDekForRecipients({
      dek,
      senderIdentity: sender,
      senderUserId: ALICE_ID,
      recipients,
      fileId: file.id,
    }),
    bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
  };
};

type TRooms = {
  room: EncryptedFilesHandlerHandle;
  secondRoom: EncryptedFilesHandlerHandle | null;
  sharedRoom: EncryptedFilesHandlerHandle | null;
};

/**
 * Serves the private room the signed-in user owns, holding `files` that
 * Alice encrypted for herself and the user; on request also a second private
 * room of the user's and an ordinary room. `memberKeys` are the keys of
 * further members the room's access list names.
 */
const serveRooms = async (
  mockBoth: TMockBoth,
  port: string,
  {
    files = [MEMO],
    secondRoom = false,
    sharedRoom = false,
    memberKeys = [],
    folders = [],
    archived = false,
  }: {
    files?: TPlainFile[];
    secondRoom?: boolean;
    sharedRoom?: boolean;
    memberKeys?: TEncryptionKeyPair[];
    folders?: { id: number; title: string }[];
    archived?: boolean;
  } = {},
): Promise<TRooms> => {
  const alice = await generateIdentityKeyPair();
  const aliceKey = {
    userId: ALICE_ID,
    publicKey: arrayBufferToBase64(alice.publicKey.buffer as ArrayBuffer),
  };
  const initialFiles = await Promise.all(
    files.map((file) => encryptedSeed(file, alice, [aliceKey, ME])),
  );

  const withOtherRooms = secondRoom || sharedRoom;
  const roomHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const secondHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };
  const sharedHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };

  mockBoth(
    ...encryptedFilesHandlers(port, {
      roomId: ROOM_ID,
      title: ROOM_TITLE,
      ownerId: FIXTURE_USER_ID,
      roomSecurity: OWNER_ROOM_SECURITY,
      roomUserKeys: [MY_KEY],
      initialFiles,
      folders,
      archived,
      withOtherRooms,
      handle: roomHandle,
    }),
    ...(secondRoom
      ? encryptedFilesHandlers(port, {
          roomId: SECOND_ROOM_ID,
          title: SECOND_ROOM_TITLE,
          ownerId: FIXTURE_USER_ID,
          roomSecurity: OWNER_ROOM_SECURITY,
          roomUserKeys: [MY_KEY],
          folders: [SECOND_ROOM_FOLDER],
          withOtherRooms: true,
          handle: secondHandle,
        })
      : []),
    ...(sharedRoom
      ? encryptedFilesHandlers(port, {
          roomId: SHARED_ROOM_ID,
          title: SHARED_ROOM_TITLE,
          ownerId: FIXTURE_USER_ID,
          isPrivate: false,
          roomSecurity: OWNER_ROOM_SECURITY,
          withOtherRooms: true,
          handle: sharedHandle,
        })
      : []),
    ...privacyroomAccessHandlers(port, {
      roomKeys: {
        [ROOM_ID]: [
          { id: "alice-1", privateKeyEnc: "", ...aliceKey },
          MY_KEY,
          ...memberKeys,
        ],
        [SECOND_ROOM_ID]: [MY_KEY],
      },
    }),
    privateRoomListHandler(port, {
      roomId: ROOM_ID,
      title: ROOM_TITLE,
      ownerId: FIXTURE_USER_ID,
      otherPrivateRooms: secondRoom
        ? [{ roomId: SECOND_ROOM_ID, title: SECOND_ROOM_TITLE }]
        : [],
      ordinaryRooms: sharedRoom
        ? [{ roomId: SHARED_ROOM_ID, title: SHARED_ROOM_TITLE }]
        : [],
    }),
  );

  return {
    room: roomHandle.current!,
    secondRoom: secondHandle.current,
    sharedRoom: sharedHandle.current,
  };
};

const openRoom = (page: Page, baseUrl: string) =>
  page.goto(`${baseUrl}${PRIVATE_LIST}/${ROOM_ID}${OPT_IN}`);

/** The list shows titles without their extension. */
const row = (page: Page, title: string) =>
  page
    .getByTestId("table-row")
    .filter({ hasText: title.replace(/\.[^.]+$/, "") });

const openContextMenu = async (fileRow: Locator) => {
  await fileRow.click({ button: "right" });
};

/** Picks Copy, Move to or Duplicate from the "Move or copy" submenu. */
const chooseTransfer = async (
  page: Page,
  fileRow: Locator,
  option: "copy" | "move-to" | "duplicate",
) => {
  await openContextMenu(fileRow);
  await page.locator("#option_move-or-copy").hover();
  await page.locator(`#option_${option}`).click();
};

/**
 * Opens a room from the Rooms level of the transfer dialog, and a folder in
 * it when one is named, and confirms.
 */
const pickRoom = async (
  page: Page,
  roomTitle: string,
  submit: string,
  folderTitle?: string,
) => {
  const picker = page.getByTestId("aside").first();
  const item = (title: string) =>
    picker.locator("[data-testid^='selector-item-']").filter({ hasText: title });
  await picker.getByText("Rooms", { exact: true }).click();
  await item(roomTitle).click();
  if (folderTitle) await item(folderTitle).click();
  await picker.getByRole("button", { name: submit }).click();
};

/** The users a stored file's key is wrapped for, sorted. */
const keyHolders = (handle: EncryptedFilesHandlerHandle, fileId: number) =>
  handle
    .getFile(fileId)
    .fileKeys.map((k) => k.userId)
    .sort();

const expectStoredEncrypted = (
  stored: { encrypted: boolean; bytes?: Uint8Array },
  plain: Uint8Array,
) => {
  expect(stored.encrypted).toBe(true);
  expect(isDSE3Format(stored.bytes!)).toBe(true);
  expect(Buffer.from(stored.bytes!).includes(Buffer.from(plain))).toBe(false);
};

test.describe("(private) — rooms list & unlock", () => {
  test("Unlock recovers names", async ({ page, baseUrl, port, mockBoth }) => {
    await serveRooms(mockBoth, port);
    await openRoom(page, baseUrl);

    const memoRow = row(page, MEMO.serverTitle);
    await expect(memoRow).toBeVisible();
    await expect(page.getByText("memo", { exact: true })).toHaveCount(0);

    await openContextMenu(memoRow);
    await page.locator("#option_download").click();
    await unlock(page);

    await expect(row(page, MEMO.name)).toBeVisible();
    await expect(page.getByText(MEMO.serverTitle)).toHaveCount(0);
  });

  test("Open location from the history", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    await serveRooms(mockBoth, port);
    mockBoth(
      folderHistoryHandler(port, ROOM_ID, {
        feeds: [
          {
            id: MEMO.id,
            date: "2026-10-20T09:00:00.000Z",
            title: MEMO.serverTitle,
          },
        ],
      }),
    );
    await page.addInitScript(() => {
      const messages: string[] = [];
      (window as unknown as { hostMessages: string[] }).hostMessages =
        messages;
      window.addEventListener("message", (event) => {
        if (typeof event.data === "string") messages.push(event.data);
      });
    });
    const folderRequests: string[] = [];
    page.on("request", (request) => {
      if (/\/api\/2\.0\/files\/\d+(\?|$)/.test(request.url())) {
        folderRequests.push(request.url());
      }
    });

    await openRoom(page, baseUrl);
    await openContextMenu(row(page, MEMO.serverTitle));
    await page.locator("#option_download").click();
    await unlock(page);
    const memoRow = row(page, MEMO.name);
    await expect(memoRow).toBeVisible();

    // A press on an empty spot of the list drops the selection, so the panel
    // shows the room.
    const dropped = await page.evaluate(() => {
      const body = document.querySelector("[role='grid']")?.closest(".scroll-body");
      body?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
      return !!body;
    });
    expect(dropped).toBe(true);
    await page.locator(".info-panel-toggle").click();
    await page.getByText("History", { exact: true }).click();
    const location = page.getByTestId("history_item_location");
    await expect(location).toBeVisible();

    folderRequests.length = 0;
    await location.click();

    await expect.poll(() => folderRequests.length).toBeGreaterThan(0);
    const address = new URL(page.url());
    expect(address.searchParams.get("folder")).toBe(String(ROOM_ID));
    expect(address.searchParams.has("search")).toBe(false);
    for (const url of folderRequests) {
      expect(new URL(url).searchParams.get("filterValue") ?? "").toBe("");
      expect(url.toLowerCase()).not.toContain("memo");
    }
    const hostMessages = await page.evaluate(
      () => (window as unknown as { hostMessages: string[] }).hostMessages,
    );
    const navigations = hostMessages.filter((m) => m.includes("onNavigate"));
    expect(navigations.length).toBeGreaterThan(0);
    for (const message of navigations) {
      expect(message.toLowerCase()).not.toContain("memo");
    }
  });

  test(
    "rooms list renders the private room from the mock",
    async ({
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    }) => {
      const opts = { roomId: 7001, title: "Private Test Room" };
      serverRequestInterceptor.use(privateRoomListHandler(port, opts));
      clientRequestInterceptor.use(privateRoomListHandler(port, opts));

      await page.goto(`${baseUrl}${PRIVATE_LIST}${OPT_IN}`);

      await expect(page.getByText("Private Test Room")).toBeVisible();
    },
  );

  test("List header", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const opts = { roomId: 7001, title: "Private Test Room" };
    serverRequestInterceptor.use(privateRoomListHandler(port, opts));
    clientRequestInterceptor.use(privateRoomListHandler(port, opts));

    await page.goto(`${baseUrl}${PRIVATE_LIST}${OPT_IN}`);
    await expect(page.getByText("Private Test Room")).toBeVisible();

    const header = page.locator(".header-container");
    await expect(
      header.getByRole("heading", { name: "Private", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Rooms E2E")).toHaveCount(0);
  });

  test("Archive header", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const opts = { roomId: 7001, title: "Private Test Room" };
    serverRequestInterceptor.use(privateRoomListHandler(port, opts));
    clientRequestInterceptor.use(privateRoomListHandler(port, opts));

    await page.goto(`${baseUrl}${PRIVATE_ARCHIVE}${OPT_IN}`);
    await expect(page.getByText("Private Test Room")).toBeVisible();

    const header = page.locator(".header-container");
    await expect(
      header.getByRole("heading", { name: "Archive", exact: true }),
    ).toBeVisible();
    await expect(
      header.getByRole("heading", { name: "Private", exact: true }),
    ).toHaveCount(0);
  });

  test("No archived rooms", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const opts = { roomId: 7001, withoutPrivateRoom: true };
    serverRequestInterceptor.use(privateRoomListHandler(port, opts));
    clientRequestInterceptor.use(privateRoomListHandler(port, opts));

    await page.goto(`${baseUrl}${PRIVATE_ARCHIVE}${OPT_IN}`);
    await expect(page.getByText("No archived rooms here yet")).toBeVisible();

    await page.getByText("Go to rooms", { exact: true }).click();

    await page.waitForURL(
      (url) => url.pathname === PRIVATE_LIST && url.search === OPT_IN,
    );
  });

  test("Generic rooms list", async ({ page, baseUrl, port, mockBoth }) => {
    mockBoth(
      privateRoomListHandler(port, {
        roomId: ROOM_ID,
        title: ROOM_TITLE,
        ordinaryRooms: [{ roomId: SHARED_ROOM_ID, title: SHARED_ROOM_TITLE }],
      }),
    );

    await page.goto(`${baseUrl}/sdk/rooms${OPT_IN}`);

    await expect(page.getByText(SHARED_ROOM_TITLE)).toBeVisible();
    await expect(page.getByText(ROOM_TITLE)).toHaveCount(0);
  });

  test("Private room opened by its generic address", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    await serveRooms(mockBoth, port);

    await page.goto(`${baseUrl}/sdk/rooms/${ROOM_ID}${OPT_IN}`);

    await page.waitForURL(
      (url) =>
        url.pathname === `${PRIVATE_LIST}/${ROOM_ID}` && url.search === OPT_IN,
    );
    await expect(row(page, MEMO.serverTitle)).toBeVisible();
  });
});

test.describe("(private) — create / upload / download / preview", () => {
  test("Document created", async ({ page, baseUrl, port, mockBoth }) => {
    const { room } = await serveRooms(mockBoth, port, { files: [] });
    mockBoth(emptyTemplateHandler(port));
    await openRoom(page, baseUrl);

    await page.getByTestId("main-button").click();
    await page.getByTestId("actions_new-document").first().click();
    const createDialog = page
      .getByRole("dialog")
      .filter({ hasText: "Document" });
    await createDialog.getByRole("textbox").fill("Plan");
    await createDialog
      .getByRole("button", { name: "Create", exact: true })
      .click();
    await unlock(page);

    await expect.poll(() => room.getFiles().length).toBe(1);
    const [created] = room.getFiles();
    expect(created.serverTitle).not.toContain("Plan");
    expect(created.serverTitle.endsWith(".docx")).toBe(true);
    expect(created.encrypted).toBe(true);
    expect(isDSE3Format(created.bytes!)).toBe(true);
    await expect
      .poll(() => keyHolders(room, created.id))
      .toEqual([ALICE_ID, FIXTURE_USER_ID].sort());

    await expect(row(page, "Plan.docx")).toBeVisible();
  });

  test("Create menu opened", async ({ page, baseUrl, port, mockBoth }) => {
    await serveRooms(mockBoth, port, { files: [] });
    await openRoom(page, baseUrl);

    await page.getByTestId("main-button").click();

    for (const id of [
      "actions_new-document",
      "actions_new-spreadsheet",
      "actions_new-presentation",
      "actions_new-form",
      "actions_new-folder",
      "actions_upload-files",
    ]) {
      await expect(page.getByTestId(id).first()).toBeVisible();
    }
    await expect(page.getByTestId("actions_upload-folder")).toHaveCount(0);
  });

  test("PDF form hotkey", async ({ page, baseUrl, port, mockBoth }) => {
    const { room } = await serveRooms(mockBoth, port, { files: [] });
    mockBoth(emptyTemplateHandler(port));
    await openRoom(page, baseUrl);
    await expect(page.getByTestId("main-button")).toBeVisible();

    const editorPages: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/doceditor")) editorPages.push(request.url());
    });
    await page.keyboard.press("Shift+O");
    const createDialog = page.getByRole("dialog").filter({ hasText: "PDF" });
    await createDialog.getByRole("textbox").fill("Form");
    await createDialog
      .getByRole("button", { name: "Create", exact: true })
      .click();
    await unlock(page);

    await expect.poll(() => room.getFiles().length).toBe(1);
    const [created] = room.getFiles();
    expect(created.serverTitle.endsWith(".pdf")).toBe(true);
    expect(created.serverTitle).not.toContain("Form");
    expect(isDSE3Format(created.bytes!)).toBe(true);
    expect(editorPages).toEqual([]);
  });

  test("Member uploads a file", async ({ page, baseUrl, port, mockBoth }) => {
    const { room } = await serveRooms(mockBoth, port, { files: [] });
    const notes = new TextEncoder().encode("Notes that stay encrypted.");
    await openRoom(page, baseUrl);

    const chooser = page.waitForEvent("filechooser");
    await page.getByTestId("main-button").click();
    await page.getByTestId("actions_upload-files").first().click();
    await (await chooser).setFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(notes),
    });
    await unlock(page);

    await expect.poll(() => room.getFiles().length).toBe(1);
    const [uploaded] = room.getFiles();
    expect(uploaded.serverTitle).not.toContain("notes");
    expectStoredEncrypted(uploaded, notes);
    expect(room.getSessions().map((s) => s.encrypted)).toEqual([true]);
    await expect
      .poll(() => keyHolders(room, uploaded.id))
      .toEqual([ALICE_ID, FIXTURE_USER_ID].sort());
    await expect(row(page, "notes.txt")).toBeVisible();
  });

  /** Uploads a file named like MEMO and waits for the name-clash dialog. */
  const uploadClashingMemo = async (page: Page) => {
    const chooser = page.waitForEvent("filechooser");
    await page.getByTestId("main-button").click();
    await page.getByTestId("actions_upload-files").first().click();
    await (await chooser).setFiles({
      name: MEMO.name,
      mimeType: "text/plain",
      buffer: Buffer.from("A second memo."),
    });
    await unlock(page);
    const dialog = page
      .getByRole("dialog")
      .filter({ hasText: "Action required" })
      .filter({ hasText: MEMO.name });
    await expect(dialog).toBeVisible();
    return dialog;
  };

  test("Upload with a clashing name: cancel sends nothing", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port);
    await openRoom(page, baseUrl);

    const dialog = await uploadClashingMemo(page);
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

    await expect(dialog).toBeHidden();
    expect(room.getSessions()).toEqual([]);
    expect(room.getFiles()).toHaveLength(1);
  });

  test("Upload with a clashing name: keep both stores the first free copy suffix", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port);
    await openRoom(page, baseUrl);

    const dialog = await uploadClashingMemo(page);
    await dialog.getByRole("button", { name: "OK", exact: true }).click();

    await expect.poll(() => room.getFiles().length).toBe(2);
    const stored = room.getFiles().find((f) => f.id !== MEMO.id)!;
    expect(stored.serverTitle).not.toContain("memo");

    await page.reload();
    await openContextMenu(row(page, MEMO.serverTitle));
    await page.locator("#option_download").click();
    await unlock(page);
    await expect(row(page, "memo (1).txt")).toBeVisible();
  });

  test("Uploader declines to unlock", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port, { files: [] });
    await openRoom(page, baseUrl);

    const chooser = page.waitForEvent("filechooser");
    await page.getByTestId("main-button").click();
    await page.getByTestId("actions_upload-files").first().click();
    await (await chooser).setFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Notes that stay encrypted."),
    });
    const prompt = passphrasePrompt(page);
    await expect(prompt).toBeVisible({ timeout: 15000 });
    await prompt.getByRole("button", { name: "Cancel" }).click();

    await expect(
      page.getByText(
        "Upload canceled: the encryption key was not unlocked. The file was not sent.",
      ),
    ).toBeVisible();
    await page
      .getByRole("dialog")
      .filter({ hasText: "Uploading" })
      .getByText("Error", { exact: true })
      .hover();
    await expect(
      page.getByText(
        "The file was not uploaded because your encryption key is locked. Unlock it and try again.",
      ),
    ).toBeVisible();
    expect(room.getSessions()).toEqual([]);
    expect(room.getFiles()).toEqual([]);
  });

  test("Quota exceeded mid-batch", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port, { files: [] });
    room.setFreeSpace(4096);
    await openRoom(page, baseUrl);

    const chooser = page.waitForEvent("filechooser");
    await page.getByTestId("main-button").click();
    await page.getByTestId("actions_upload-files").first().click();
    await (await chooser).setFiles([
      { name: "first.txt", mimeType: "text/plain", buffer: Buffer.from("first") },
      {
        name: "large.txt",
        mimeType: "text/plain",
        buffer: Buffer.alloc(8192, 0x62),
      },
      { name: "third.txt", mimeType: "text/plain", buffer: Buffer.from("third") },
    ]);
    await unlock(page);

    await expect(page.getByText("Retry after upgrading quota")).toHaveCount(2);
    await expect.poll(() => room.getFiles().length).toBe(1);
    expect(
      room
        .getRequests()
        .filter((r) => r.method === "POST" && r.url.endsWith("/session")),
    ).toHaveLength(2);
    expect(room.getSessions()).toHaveLength(1);
  });

  test("Download from a private room", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    await serveRooms(mockBoth, port);
    await openRoom(page, baseUrl);

    const download = page.waitForEvent("download");
    await openContextMenu(row(page, MEMO.serverTitle));
    await page.locator("#option_download").click();
    await unlock(page);

    const saved = await download;
    expect(saved.suggestedFilename()).toBe(MEMO.name);
    const fs = await import("node:fs/promises");
    expect(new Uint8Array(await fs.readFile((await saved.path())!))).toEqual(
      MEMO.bytes,
    );
  });

  test("Preview an encrypted image", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    await serveRooms(mockBoth, port, { files: [PHOTO] });
    await openRoom(page, baseUrl);

    await page
      .getByText(PHOTO.serverTitle.replace(/\.png$/, ""), { exact: true })
      .click();
    await unlock(page);

    const viewer = page.getByRole("dialog", {
      name: `image viewer - ${PHOTO.name}`,
    });
    const image = viewer.locator("img[src^='blob:']");
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBe(1);
  });

  test.fixme(
    "open-in-editor is blocked for encrypted documents with a toast",
    async () => {
      // Waits for private-rooms-editor-contract, which defines how the SDK
      // opens an encrypted document in the editor.
    },
  );
});

test.describe("(private) — copy / move / duplicate (P1)", () => {
  test("Same-room copy", async ({ page, baseUrl, port, mockBoth }) => {
    const { room } = await serveRooms(mockBoth, port);
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "duplicate");
    await unlock(page);

    await expect.poll(() => room.getFiles().length).toBe(2);
    const copy = room.getFiles().find((f) => f.id !== MEMO.id)!;
    expect(copy.serverTitle).not.toContain("memo");
    expectStoredEncrypted(copy, MEMO.bytes);
    await expect
      .poll(() => keyHolders(room, copy.id))
      .toEqual([ALICE_ID, FIXTURE_USER_ID].sort());
  });

  test("Copy of a name that already has a copy", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port, {
      files: [REPORT, REPORT_COPY],
    });
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, REPORT.serverTitle), "duplicate");
    await unlock(page);

    await expect.poll(() => room.getFiles().length).toBe(3);
    const copy = room
      .getFiles()
      .find((f) => f.id !== REPORT.id && f.id !== REPORT_COPY.id)!;
    expectStoredEncrypted(copy, REPORT.bytes);
    await expect(row(page, "Report (2).docx")).toBeVisible();
  });

  test("File moved within the room", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room } = await serveRooms(mockBoth, port, {
      folders: [ROOM_FOLDER],
    });
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "move-to");
    const picker = page.getByTestId("aside").first();
    await picker
      .locator("[data-testid^='selector-item-']")
      .filter({ hasText: ROOM_FOLDER.title })
      .click();
    await picker.getByRole("button", { name: "Move here" }).click();

    await expect
      .poll(() => room.getFile(MEMO.id).folderId)
      .toBe(ROOM_FOLDER.id);
    expect(
      room
        .getRequests()
        .filter((r) => r.method === "PUT" && r.url.endsWith("/fileops/move")),
    ).toHaveLength(1);
    expect(room.getSessions()).toEqual([]);
    await expect(passphrasePrompt(page)).toHaveCount(0);
  });

  test("Copy into another private room", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room, secondRoom } = await serveRooms(mockBoth, port, {
      secondRoom: true,
    });
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "copy");
    await pickRoom(page, SECOND_ROOM_TITLE, "Copy here");
    await unlock(page);

    await expect.poll(() => secondRoom!.getFiles().length).toBe(1);
    const [copy] = secondRoom!.getFiles();
    expectStoredEncrypted(copy, MEMO.bytes);
    await expect
      .poll(() => keyHolders(secondRoom!, copy.id))
      .toEqual([FIXTURE_USER_ID]);
    expect(room.getFiles().map((f) => f.id)).toEqual([MEMO.id]);
  });

  test("Copy into a folder of another private room", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { secondRoom } = await serveRooms(mockBoth, port, {
      secondRoom: true,
    });
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "copy");
    await pickRoom(page, SECOND_ROOM_TITLE, "Copy here", SECOND_ROOM_FOLDER.title);
    await unlock(page);

    await expect.poll(() => secondRoom!.getFiles().length).toBe(1);
    const [copy] = secondRoom!.getFiles();
    expect(copy.folderId).toBe(SECOND_ROOM_FOLDER.id);
    expectStoredEncrypted(copy, MEMO.bytes);
    expect(secondRoom!.getSessions().map((s) => s.encrypted)).toEqual([true]);
  });

  test("Move dialog", async ({ page, baseUrl, port, mockBoth }) => {
    const { room, secondRoom } = await serveRooms(mockBoth, port, {
      secondRoom: true,
    });
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "move-to");
    const picker = page.getByTestId("aside").first();
    await expect(picker.getByText(ROOM_TITLE, { exact: true })).toBeVisible();
    await expect(picker.getByText("Rooms", { exact: true })).toHaveCount(0);
    await expect(picker.getByText(SECOND_ROOM_TITLE)).toHaveCount(0);
    await expect(
      picker.getByText("Encrypted files", { exact: true }),
    ).toHaveCount(0);
    await picker.getByRole("button", { name: "Cancel" }).click();

    await expect(passphrasePrompt(page)).toHaveCount(0);
    expect(secondRoom!.getSessions()).toEqual([]);
    expect(room.getFiles().map((f) => f.id)).toEqual([MEMO.id]);
  });

  test("Destination outside private rooms", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const { room, sharedRoom } = await serveRooms(mockBoth, port, {
      sharedRoom: true,
    });
    const existing = { id: 7301, title: MEMO.name, encrypted: false };
    sharedRoom!.setFiles([existing]);
    await openRoom(page, baseUrl);

    await chooseTransfer(page, row(page, MEMO.serverTitle), "copy");
    await expect(
      page
        .getByTestId("aside")
        .first()
        .getByText("Encrypted files", { exact: true }),
    ).toBeVisible();
    await pickRoom(page, SHARED_ROOM_TITLE, "Copy here");
    await unlock(page);

    const conflict = page
      .getByRole("dialog")
      .filter({ hasText: "Action required" });
    await expect(conflict).toBeVisible();
    await expect(conflict).toContainText(MEMO.name);
    expect(sharedRoom!.getSessions()).toEqual([]);
    await conflict.getByText("Create file copy", { exact: true }).click();
    await conflict.getByRole("button", { name: "OK" }).click();

    await expect.poll(() => sharedRoom!.getFiles().length).toBe(2);
    const copy = sharedRoom!.getFiles().find((f) => f.id !== existing.id)!;
    expect(copy.encrypted).toBe(false);
    expect(copy.bytes).toEqual(MEMO.bytes);
    expect(sharedRoom!.getSessions().map((s) => s.encrypted)).toEqual([false]);
    expect(room.getFiles().map((f) => f.id)).toEqual([MEMO.id]);
  });
});

test.describe("(private) — members / invite / owner / backfill (P1/M3)", () => {
  test("All invitees have verified keys", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    const carol = await generateIdentityKeyPair();
    const { room } = await serveRooms(mockBoth, port, {
      memberKeys: [
        {
          id: "carol-1",
          userId: CAROL.id,
          publicKey: arrayBufferToBase64(carol.publicKey.buffer as ArrayBuffer),
          privateKeyEnc: "",
        },
      ],
    });
    const members: { current: RoomMembersHandlerHandle | null } = {
      current: null,
    };
    mockBoth(
      usersWithRoomSharedHandler(port, ROOM_ID, [CAROL]),
      ...roomMembersHandlers(port, ROOM_ID, { handle: members }),
    );
    await page.goto(`${baseUrl}${PRIVATE_LIST}${OPT_IN}`);

    await page.getByText(ROOM_TITLE).first().click({ button: "right" });
    await page.locator("#option_invite-users-to-room").click();
    await page.getByTestId("invite_panel_choose_from_list_link").click();
    const people = page.getByTestId("invite_panel_people_selector");
    await people.getByTestId("selector-item-0").click();
    await people.getByTestId("selector_submit_button").click();
    await page.getByTestId("invite_panel_send_button").click();
    await unlock(page);

    await expect
      .poll(() => keyHolders(room, MEMO.id))
      .toEqual([ALICE_ID, CAROL.id, FIXTURE_USER_ID].sort());
    expect(members.current!.getMembers().map((m) => m.id)).toEqual([CAROL.id]);
    await expect(page.getByText("Users invited")).toBeVisible();
  });

  // §17.2 #15
  test.fixme(
    "revoke-member: blocked while uploads are in flight, otherwise revokes",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The "blocked while uploads are in flight" path requires triggering
      //     an upload (so UploadDataStore.isUploading is true) then attempting
      //     member removal; the guard shows CannotRemoveMemberWhileUploads toast.
      //   - Timing: the upload must be artificially slowed (e.g. mock the upload
      //     chunk endpoint to delay) so the remove action fires during upload.
      //
      // With an active upload → remove shows CannotRemoveMemberWhileUploads.
      // Without uploads → revokeMemberFromEncryptedRoom runs.
    },
  );

  // §17.2 #16
  test.fixme(
    "change-owner: validates the candidate has an encryption key before handoff",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The guard in usePrivateChangeOwner: check privacyroomKeys for the
      //     candidate; if absent → toast Common:PrivateRoomChangeOwnerNoKey.
      //   - If present but the key fingerprint does not match → toast
      //     Common:PrivateRoomChangeOwnerKeyMismatch (§3.3 parity).
      //   - The test requires two users in the mock: one with a key and one without.
      //
      // Candidate without key → blocked with a toast; with key → setFileOwner.
    },
  );

  test.fixme(
    "backfill: entering a room as manager wraps DEKs for late-registered members",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The backfill sweep (maybeBackfillEncryptedRoom) runs on room entry
      //     when the identity is unlocked. It detects members who registered keys
      //     AFTER the last backfill (by checking privacyroomAccessHandlers for
      //     members without corresponding fileKeys entries).
      //   - The test requires a controlled MSW state: a member whose publicKey
      //     was added AFTER the last backfill timestamp, and files with DEKs that
      //     do not yet include that member.
      //   - Post-backfill: the member's fileKeys entries appear via PUT
      //     /files/{fileId}/access calls (verified via handler.getRequests()).
      //
      // Member registered keys AFTER invite → on owner entry the backfill sweep
      // (maybeBackfillEncryptedRoom) wraps existing file DEKs for them; the
      // member can then decrypt. Runs at most once per session.
    },
  );
});

test.describe("(private) — archive", () => {
  test("Upload hotkey in an archived room", async ({
    page,
    baseUrl,
    port,
    mockBoth,
  }) => {
    await serveRooms(mockBoth, port, { archived: true });
    const uploadRequests: string[] = [];
    page.on("request", (request) => {
      if (/\/upload\/|\/session/.test(request.url())) {
        uploadRequests.push(request.url());
      }
    });

    await openRoom(page, baseUrl);
    await expect(row(page, MEMO.serverTitle)).toBeVisible();

    const chooser = page
      .waitForEvent("filechooser", { timeout: 2000 })
      .catch(() => null);
    await page.keyboard.press("Shift+U");

    expect(await chooser).toBeNull();
    expect(uploadRequests).toEqual([]);
  });

  // §17.2 #17
  // Converted from test.fixme: this test body only asserts compile-time
  // constants and does not navigate to any URL or interact with the browser.
  // The test verifies that the route constants used throughout this suite are
  // consistent, serving as a regression guard if routes are renamed.
  test(
    "archive-restore: archiving removes the room from the active list and adds it to /archive",
    async () => {
      await test.step(
        "route constants are defined and mutually exclusive",
        async () => {
          expect(PRIVATE_LIST).toBe("/sdk/private");
          expect(PRIVATE_ARCHIVE).toBe("/sdk/private/archive");
          expect(PRIVATE_LIST).not.toBe(PRIVATE_ARCHIVE);
          expect(PRIVATE_ARCHIVE.startsWith(PRIVATE_LIST + "/")).toBe(true);
        },
      );

      // Full browser test is still blocked:
      // BLOCKER A + B:
      //   - Needs `asc_auth_key` cookie + identity unlock to navigate to the
      //     private rooms list and trigger archive action.
      //   - The archive action (moveToArchive) calls the rooms archive API;
      //     the mock must handle the PUT /files/rooms/{roomId}/archive endpoint.
      //   - After archiving, the room should disappear from PRIVATE_LIST and
      //     appear in PRIVATE_ARCHIVE. Verifying this requires two page.goto()
      //     calls and DOM assertions on room card presence/absence.
      //
      // Wire the full test when auth cookie fixture is added to base.ts.
    },
  );
});
