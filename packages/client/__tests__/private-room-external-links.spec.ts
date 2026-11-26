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
  encryptedFilesHandlers,
  filesSettingsHandler,
  privateLinkVisitorHandlers,
  settingsHandler,
  TypeSettings,
  type PrivateLinkVisitorHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { Page } from "@playwright/test";
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
