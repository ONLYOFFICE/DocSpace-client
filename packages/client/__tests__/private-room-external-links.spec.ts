/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied
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
  privateLinksHandlers,
  privateLinkVisitorHandlers,
  privateRoomLinksHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type PrivacyroomAccessHandlerHandle,
  type PrivateLinksHandlerHandle,
  type PrivateLinkVisitorHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { Locator, Page } from "@playwright/test";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import {
  createLinkKey,
  generateLinkSecret,
} from "@docspace/shared/services/encryption/link-key";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const MEMBER_ID = "11111111-1111-1111-1111-111111111111";
const LINK_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = 9900;
const FOLDER_ID = 9910;
const FILE_ID = 8900;
const NOT_READY_ID = 8901;
const KEY = "signed-link-key";
const FILE_NAME = "Quarterly report.txt";
const FILE_TEXT = "Read through the link, decrypted in the page.";
const PASSWORD = "correct horse battery";

type Linked = {
  secret: string;
  handle: { current: PrivateLinkVisitorHandle | null };
};

/**
 * A private room with one file wrapped for a link and one that no member has
 * wrapped for it yet, and the link itself, to the file or to the folder that
 * holds both.
 */
async function installLink(
  mockRequest: WorkerFixture,
  { toFolder = false, password }: { toFolder?: boolean; password?: string } = {},
): Promise<Linked> {
  const secret = generateLinkSecret();
  const { material } = await createLinkKey(secret, password);
  const member = await generateIdentityKeyPair();
  const memberPublicKey = arrayBufferToBase64(member.publicKey);

  const plain = new TextEncoder().encode(FILE_TEXT);
  const { encryptedBlob, dek } = await encryptFile(plain, { fileName: FILE_NAME });
  const fileKeys = await wrapDekForRecipients({
    dek,
    senderIdentity: member,
    senderUserId: MEMBER_ID,
    recipients: [
      { userId: MEMBER_ID, publicKey: memberPublicKey },
      { userId: LINK_ID, publicKey: material.linkPublicKey, publicKeyId: LINK_ID },
    ],
    fileId: FILE_ID,
  });
  const forLink = fileKeys.find((k) => k.userId === LINK_ID)!.privateKeyEnc;

  const handle: Linked["handle"] = { current: null };
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: ROOM_ID,
      ownerId: MEMBER_ID,
      folders: [{ id: FOLDER_ID, title: "Reports" }],
      initialFiles: [
        {
          id: FILE_ID,
          title: FILE_NAME,
          serverTitle: "stored-8900.txt",
          size: plain.byteLength,
          encrypted: true,
          fileKeys,
          bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
          folderId: FOLDER_ID,
        },
        {
          id: NOT_READY_ID,
          title: "Not wrapped yet.txt",
          serverTitle: "stored-8901.txt",
          size: 1,
          encrypted: true,
          fileKeys: [],
          folderId: FOLDER_ID,
        },
      ],
    }),
  );
  // After the room: the keys of a file are answered to the visitor of the link.
  mockRequest.use(
    ...privateLinkVisitorHandlers(TEST_PORT, {
      key: KEY,
      linkId: LINK_ID,
      entryId: toFolder ? FOLDER_ID : FILE_ID,
      entryType: toFolder ? 1 : 2,
      passwordRequired: !!password,
      ...material,
      memberKeys: [{ id: "key-1", userId: MEMBER_ID, publicKey: memberPublicKey }],
      files: { [FILE_ID]: forLink, [NOT_READY_ID]: null },
      wrongProofsLimit: 3,
      handle,
    }),
  );
  return { secret, handle };
}

const address = (baseUrl: string, secret: string, folder?: number) =>
  `${baseUrl}/share/private?key=${KEY}${folder ? `&folder=${folder}` : ""}#${secret}`;

const linkPage = (page: Page) => page.getByTestId("private_link_page");

test.describe("External links of private rooms: the page of a visitor", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.NoAuth),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Link to a file", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest);
    const sent: string[] = [];
    page.on("request", (request) => {
      sent.push(`${request.url()} ${request.postData() ?? ""}`);
    });

    await page.goto(address(baseUrl, secret));

    await expect(linkPage(page)).toContainText(FILE_NAME);

    // Link opened: no request of the page carries the part after #.
    expect(sent.some((entry) => entry.includes(secret))).toBe(false);
    expect(new URL(page.url()).hash).toBe(`#${secret}`);

    const download = page.waitForEvent("download");
    await page.getByTestId(`private_link_download_${FILE_ID}`).click();
    const saved = await download;
    expect(saved.suggestedFilename()).toBe(FILE_NAME);
    const stream = await saved.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).toString("utf8")).toBe(FILE_TEXT);
  });

  test("Page reloaded", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest);
    await page.goto(address(baseUrl, secret));
    await expect(linkPage(page)).toContainText(FILE_NAME);

    await page.reload();

    await expect(linkPage(page)).toContainText(FILE_NAME);
  });

  test("Link to a folder or a room", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest, { toFolder: true });

    await page.goto(address(baseUrl, secret, FOLDER_ID));

    await expect(linkPage(page)).toContainText(FILE_NAME);
    // File the link has no key for
    const notReady = page.getByTestId(`private_link_file_${NOT_READY_ID}`);
    await expect(notReady).toBeVisible();
    await expect(
      page.getByTestId(`private_link_download_${NOT_READY_ID}`),
    ).toHaveCount(0);
  });

  test("Wrong password", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest, { password: PASSWORD });
    await page.goto(address(baseUrl, secret));

    const field = page.locator("#private-link-password");
    await expect(field).toBeVisible();
    await field.fill("another password");
    await page.getByTestId("private_link_open").click();

    await expect(linkPage(page)).not.toContainText(FILE_NAME);
    await expect(page.locator("#private-link-password")).toBeVisible();

    await page.locator("#private-link-password").fill(PASSWORD);
    await page.getByTestId("private_link_open").click();

    await expect(linkPage(page)).toContainText(FILE_NAME);
  });

  test("Address without the secret", async ({ page, mockRequest, baseUrl }) => {
    await installLink(mockRequest);
    let asked = false;
    page.on("request", (request) => {
      if (request.url().includes("/files/share/")) asked = true;
    });

    await page.goto(`${baseUrl}/share/private?key=${KEY}`);

    await expect(linkPage(page).getByRole("alert")).toBeVisible();
    await expect(linkPage(page)).not.toContainText(FILE_NAME);
    expect(asked).toBe(false);
  });

  test("Secret cut short", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest);

    await page.goto(address(baseUrl, secret.slice(0, 30)));

    await expect(linkPage(page).getByRole("alert")).toBeVisible();
    await expect(linkPage(page)).not.toContainText(FILE_NAME);
  });

  test("Revoked or expired link", async ({ page, mockRequest, baseUrl }) => {
    const { secret, handle } = await installLink(mockRequest);
    handle.current!.setClosed(true);

    await page.goto(address(baseUrl, secret));

    await expect(linkPage(page).getByRole("alert")).toBeVisible();
    await expect(linkPage(page)).not.toContainText(FILE_NAME);
    expect(handle.current!.isOpen()).toBe(false);
  });

  test("Script from another origin", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest);
    const refused = (target: Page) =>
      target.evaluate(
        () =>
          new Promise<boolean>((resolve) => {
            const timer = setTimeout(() => resolve(false), 2000);
            document.addEventListener(
              "securitypolicyviolation",
              () => {
                clearTimeout(timer);
                resolve(true);
              },
              { once: true },
            );
            const script = document.createElement("script");
            script.src = "https://example.invalid/x.js";
            document.head.appendChild(script);
          }),
      );

    await page.goto(address(baseUrl, secret));
    await expect(linkPage(page)).toContainText(FILE_NAME);
    expect(await refused(page)).toBe(true);

    // The same request on another page of the client is not refused by a
    // policy of the page.
    await page.goto(`${baseUrl}/login`);
    expect(await refused(page)).toBe(false);
  });

  test("Link of a private item", async ({ page, mockRequest, baseUrl }) => {
    const { secret } = await installLink(mockRequest);

    // The address of an ordinary public room, made by hand for this link.
    await page.goto(`${baseUrl}/rooms/share?key=${KEY}#${secret}`);

    await expect(linkPage(page)).toContainText(FILE_NAME);
    const landed = new URL(page.url());
    expect(landed.pathname).toBe("/share/private");
    expect(landed.hash).toBe(`#${secret}`);
  });
});

const USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const OWN_ROOM_ID = 9950;
const OWN_FILE_ID = 8950;
const OWN_FILE_NAME = "Board minutes.txt";

/** Answers the passphrase prompt an action behind the unlock raises. */
async function enterPassphrase(page: Page, passphrase: string) {
  const prompt = page.getByRole("dialog").filter({ hasText: "Enter passphrase" });
  await prompt.waitFor({ state: "visible", timeout: 10000 });
  await prompt
    .locator('input[name="passphrase"], #passphrase input')
    .first()
    .fill(passphrase);
  await prompt.getByRole("button", { name: "Unlock", exact: true }).click();
}

async function dismissPassphrase(page: Page) {
  const prompt = page.getByRole("dialog").filter({ hasText: "Enter passphrase" });
  if (await prompt.isVisible().catch(() => false)) {
    await prompt.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(prompt).toBeHidden();
  }
}

/**
 * A private room the signed-in user owns, with one file wrapped for them by
 * another member, opened in the list with the file selected and the info
 * panel shown.
 */
async function openOwnRoom(
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
) {
  const { keysHandle, passphrase } = await bootstrapEncryption(
    page,
    mockRequest,
    baseUrl,
  );
  const ownKey = keysHandle.getKeys()[0];
  const member = await generateIdentityKeyPair();
  const memberPublicKey = arrayBufferToBase64(member.publicKey);

  const plain = new TextEncoder().encode("minutes");
  const { encryptedBlob, dek } = await encryptFile(plain, {
    fileName: OWN_FILE_NAME,
  });
  const fileKeys = await wrapDekForRecipients({
    dek,
    senderIdentity: member,
    senderUserId: MEMBER_ID,
    recipients: [
      { userId: MEMBER_ID, publicKey: memberPublicKey },
      { userId: USER_ID, publicKey: ownKey.publicKey, publicKeyId: ownKey.id },
    ],
    fileId: OWN_FILE_ID,
  });

  const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
    current: null,
  };
  const linksHandle: { current: PrivateLinksHandlerHandle | null } = {
    current: null,
  };
  const roomKeys = [
    { id: "member-1", userId: MEMBER_ID, publicKey: memberPublicKey, privateKeyEnc: "" },
    { id: ownKey.id, userId: USER_ID, publicKey: ownKey.publicKey, privateKeyEnc: "" },
  ];
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: OWN_ROOM_ID,
      ownerId: USER_ID,
      currentUserId: USER_ID,
      // The owner of the room may change its access, which is what tells
      // that they manage the links of its items.
      roomSecurity: {
        Read: true,
        Create: true,
        Delete: true,
        Download: true,
        Rename: true,
        EditRoom: true,
        EditAccess: true,
        Move: true,
        MoveTo: true,
        Copy: false,
        CopyTo: false,
        Duplicate: false,
        IndexExport: false,
      },
      initialFiles: [
        {
          id: OWN_FILE_ID,
          title: OWN_FILE_NAME,
          serverTitle: "stored-8950.txt",
          size: plain.byteLength,
          encrypted: true,
          fileKeys,
          bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
        },
      ],
      callerKeys: [
        { ...ownKey, date: "2026-01-01T00:00:00.000Z", cryptoEngineId: "" },
      ],
      roomUserKeys: roomKeys.map((key) => ({
        ...key,
        date: "2026-01-01T00:00:00.000Z",
        cryptoEngineId: "",
      })),
    }),
    ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
  );
  accessHandle.current!.setRoomKeys(OWN_ROOM_ID, roomKeys);
  // After the room: the links of its items are those of a private item.
  mockRequest.use(
    ...privateLinksHandlers(TEST_PORT, {
      roomId: OWN_ROOM_ID,
      fileIds: [OWN_FILE_ID],
      callerId: USER_ID,
      managerIds: [USER_ID],
      handle: linksHandle,
    }),
  );

  await page.goto(`${baseUrl}/private/${OWN_ROOM_ID}/filter?folder=${OWN_ROOM_ID}`);
  const row = page.getByTestId("table-row-0");
  await expect(row).toBeVisible({ timeout: 15000 });
  await dismissPassphrase(page);

  return { passphrase, linksHandle: linksHandle.current!, row };
}

async function openShareTab(page: Page, row: Locator) {
  await row.click();
  await page.locator(".info-panel-toggle").click();
  await page.getByTestId("info_share_tab").click();
}

test.describe("External links of private rooms: the member who manages links", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Link to a file to view without a password, then revoked", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { passphrase, linksHandle, row } = await openOwnRoom(
      page,
      mockRequest,
      baseUrl,
    );
    await openShareTab(page, row);

    await page.getByTestId("info_panel_share_create_and_copy_link").click();
    await enterPassphrase(page, passphrase);

    await expect.poll(() => linksHandle.getLinks().length).toBe(1);
    const [link] = linksHandle.getLinks();
    expect(link.passwordRequired).toBe(false);
    expect(link.expirationDate).toBeTruthy();
    // The secret of the link is kept wrapped for who manages links.
    await expect
      .poll(() => Object.keys(linksHandle.getLinks()[0].secretWraps))
      .toEqual([USER_ID]);

    // Revoking an external link
    const linkRow = page.getByText("External link", { exact: true });
    await expect(linkRow).toBeVisible();
    await page
      .locator('[class*="linkRow"], [class*="link-row"]')
      .first()
      .getByTestId("context-menu-button")
      .click();
    await page.getByTestId("delete-link-key_item").click();
    // The revocation asks first, and nothing is revoked before the answer.
    const confirm = page.getByTestId("revoke_private_link_dialog_submit");
    await expect(confirm).toBeVisible();
    expect(linksHandle.getLinks()).toHaveLength(1);
    await confirm.click();

    await expect.poll(() => linksHandle.getLinks().length).toBe(0);
  });

  test("Portal forbids the links", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(filesSettingsHandler(TEST_PORT, { privateRoomLinks: false }));
    const { row } = await openOwnRoom(page, mockRequest, baseUrl);

    await row.click();
    await page.locator(".info-panel-toggle").click();

    await expect(page.getByTestId("info_details_tab")).toBeVisible();
    await expect(page.getByTestId("info_share_tab")).toHaveCount(0);
  });

  test("Administrator turns the links off", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(privateRoomLinksHandler(TEST_PORT));
    const sent = page.waitForRequest(
      (request) =>
        request.method() === "PUT" &&
        request.url().includes("/files/settings/external/private"),
    );

    await page.goto(
      `${baseUrl}/portal-settings/security/access-portal/access-control`,
    );
    const toggle = page.getByTestId("private_room_links_toggle");
    await expect(toggle.locator("input")).toBeChecked();
    await page.getByText("External links of private rooms", { exact: true }).click();

    expect((await sent).postDataJSON()).toEqual({ set: false });
    await expect(toggle.locator("input")).not.toBeChecked();
  });
});

