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
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";
import { unzipSync } from "fflate";
import type { Download, Locator, Page } from "@playwright/test";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const BOB_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const ROOM_ID = 9700;
const FILE_ID = 8700;
const ORIGINAL_TEXT = "Cross-user encrypted memo. If you can read this, the unwrap path picked the right roomMemberKeys.";
const FOLDER_ID = 9710;
const FOLDER_TITLE = "Reports";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

type Seed = {
  id: number;
  name: string;
  text: string;
  forBob: boolean;
  folderId?: number;
};

// Two files Bob can open and one wrapped for Alice alone, which the zip
// leaves out and the partial-download warning names by its server title.
const FOLDER_SEEDS: Seed[] = [
  { id: 8710, name: "memo.txt", text: "First memo", forBob: true, folderId: FOLDER_ID },
  { id: 8711, name: "plan.txt", text: "Second plan", forBob: true, folderId: FOLDER_ID },
  { id: 8712, name: "secret.txt", text: "Alice only", forBob: false, folderId: FOLDER_ID },
];
const ROOT_SEED: Seed = {
  id: 8720,
  name: "budget.txt",
  text: "Root budget",
  forBob: true,
};
const FOLDER_ZIP = { "memo.txt": "First memo", "plan.txt": "Second plan" };

/**
 * Opens, as Bob, the room holding the folder "Reports" and the given files,
 * with the passphrase prompt raised on entry dismissed.
 */
async function openReportsRoom(
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
  seeds: Seed[],
) {
  const { keysHandle: bobKeysHandle, passphrase } = await bootstrapEncryption(
    page,
    mockRequest,
    baseUrl,
  );
  const bobPublicKeyB64 = bobKeysHandle.getKeys()[0].publicKey;
  const alice = await generateIdentityKeyPair();

  const initialFiles = await Promise.all(
    seeds.map(async ({ id, name, text, forBob, folderId }) => {
      const plainBytes = new TextEncoder().encode(text);
      const { encryptedBlob, dek } = await encryptFile(plainBytes, {
        fileName: name,
      });
      const fileKeys = await wrapDekForRecipients({
        dek,
        senderIdentity: alice,
        senderUserId: ALICE_ID,
        recipients: [
          { userId: ALICE_ID, publicKey: pubB64(alice) },
          ...(forBob ? [{ userId: BOB_ID, publicKey: bobPublicKeyB64 }] : []),
        ],
        fileId: id,
      });
      return {
        id,
        title: name,
        serverTitle: `obfuscated-${id}.txt`,
        size: plainBytes.byteLength,
        encrypted: true,
        fileKeys,
        bytes: await blobToUint8Array(encryptedBlob),
        folderId,
      };
    }),
  );

  const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
    current: null,
  };
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: ROOM_ID,
      ownerId: ALICE_ID,
      folders: [{ id: FOLDER_ID, title: FOLDER_TITLE }],
      initialFiles,
      roomUserKeys: [
        {
          id: "bob-1",
          userId: BOB_ID,
          publicKey: bobPublicKeyB64,
          privateKeyEnc: "",
          date: "2026-01-01T00:00:00.000Z",
          cryptoEngineId: "",
        },
      ],
    }),
    ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
  );
  accessHandle.current!.setRoomKeys(ROOM_ID, [
    {
      id: "alice-1",
      userId: ALICE_ID,
      publicKey: pubB64(alice),
      privateKeyEnc: "",
    },
    {
      id: "bob-1",
      userId: BOB_ID,
      publicKey: bobPublicKeyB64,
      privateKeyEnc: "",
    },
  ]);

  await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
  await expect(page.getByTestId("table-row-0")).toContainText(FOLDER_TITLE, {
    timeout: 15000,
  });

  const passphrasePrompt = page
    .getByRole("dialog")
    .filter({ hasText: "Enter passphrase" });
  if (await passphrasePrompt.isVisible().catch(() => false)) {
    await passphrasePrompt
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(passphrasePrompt).toBeHidden();
  }

  return { passphrase, passphrasePrompt };
}

/** Answers the passphrase prompt when the download raises one. */
async function enterPassphrase(prompt: Locator, passphrase: string) {
  try {
    await prompt.waitFor({ state: "visible", timeout: 5000 });
    await prompt
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(passphrase);
    await prompt.getByRole("button", { name: "Confirm" }).click();
  } catch {}
}

async function readZip(download: Download) {
  const fs = await import("node:fs/promises");
  const entries = unzipSync(
    new Uint8Array(await fs.readFile((await download.path()) as string)),
  );
  return Object.fromEntries(
    Object.entries(entries).map(([name, data]) => [
      name,
      new TextDecoder().decode(data),
    ]),
  );
}

// The checkbox shows in place of the item icon while its cell is hovered.
async function selectRow(row: Locator) {
  await row.locator(".table-container_element-wrapper").hover();
  await row.getByTestId("checkbox").first().click();
}

/** URLs of the server archive requests the page sends from now on. */
function watchArchiveRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (/\/files\/fileops\/bulkdownload/.test(request.url())) {
      urls.push(request.url());
    }
  });
  return urls;
}

test.describe("Private room — cross-user file exchange", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Bob can download a file Alice uploaded — uses /privacyroom/{roomId}/access for unwrap", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { keysHandle: bobKeysHandle, passphrase: bobPassphrase } =
      await bootstrapEncryption(page, mockRequest, baseUrl);
    const bobServerKey = bobKeysHandle.getKeys()[0];
    expect(bobServerKey).toBeDefined();
    const bobPublicKeyB64 = bobServerKey.publicKey;

    const alice = await generateIdentityKeyPair();

    const plainBytes = new TextEncoder().encode(ORIGINAL_TEXT);
    const { encryptedBlob, dek } = await encryptFile(plainBytes, {
      fileName: "memo.txt",
    });
    const wrapped = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: bobPublicKeyB64 },
      ],
      fileId: FILE_ID,
    });
    const encryptedBytes = await blobToUint8Array(encryptedBlob);

    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: ALICE_ID,
        initialFiles: [
          {
            id: FILE_ID,
            title: "memo.txt",
            serverTitle: "obfuscated.txt",
            size: plainBytes.byteLength,
            encrypted: true,
            fileKeys: wrapped,
            bytes: encryptedBytes,
          },
        ],
        roomUserKeys: [
          {
            id: "bob-1",
            userId: BOB_ID,
            publicKey: bobPublicKeyB64,
            privateKeyEnc: "",
            date: "2026-01-01T00:00:00.000Z",
            cryptoEngineId: "",
          },
        ],
        handle: filesHandle,
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    );

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "alice-1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "bob-1",
        userId: BOB_ID,
        publicKey: bobPublicKeyB64,
        privateKeyEnc: "",
      },
    ]);

    await page.goto(
      `${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        new RegExp(`/files/${ROOM_ID}(\\?|$)`).test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });

    // Entering the private room prompts to unlock the device key; that modal
    // overlays the page and would intercept the context-menu click. Dismiss it
    // — the download-decrypt flow below re-prompts for the passphrase.
    const entryPrompt = page
      .getByRole("dialog")
      .filter({ hasText: "Enter passphrase" });
    if (await entryPrompt.isVisible().catch(() => false)) {
      await entryPrompt
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      await expect(entryPrompt).toBeHidden();
    }

    const roomAccessPromise = page.waitForRequest(
      (req) =>
        req.method() === "GET" &&
        new RegExp(`/privacyroom/${ROOM_ID}/access`).test(req.url()),
      { timeout: 15000 },
    );
    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });

    const contextMenuButton = row.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();

    const downloadGroup = page.locator("#option_download");
    await expect(downloadGroup).toBeVisible({ timeout: 5000 });
    await downloadGroup.hover();

    const downloadDecrypt = page.getByRole("menuitem", {
      name: "Original format",
      exact: true,
    });
    await expect(downloadDecrypt).toBeVisible({ timeout: 5000 });
    await downloadDecrypt.click();

    const passphrasePrompt = page.getByRole("dialog").filter({
      hasText: "Enter passphrase",
    });
    try {
      await passphrasePrompt.waitFor({ state: "visible", timeout: 5000 });
      const passphraseField = passphrasePrompt
        .locator('input[name="passphrase"], #passphrase input')
        .first();
      await passphraseField.fill(bobPassphrase);
      await passphrasePrompt
        .getByRole("button", { name: "Confirm" })
        .click();
    } catch {}

    const roomAccessRequest = await roomAccessPromise;
    expect(roomAccessRequest.method()).toBe("GET");

    const download = await downloadPromise;

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const fs = await import("node:fs/promises");
    const buf = await fs.readFile(downloadPath as string);
    const decryptedText = new TextDecoder().decode(buf);
    expect(decryptedText).toBe(ORIGINAL_TEXT);
  });

  test("Folder download", async ({ page, mockRequest, baseUrl }) => {
    const { passphrase, passphrasePrompt } = await openReportsRoom(
      page,
      mockRequest,
      baseUrl,
      FOLDER_SEEDS,
    );
    const row = page.getByTestId("table-row-0");

    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });

    await row.getByTestId("context-menu-button").first().click();
    const downloadGroup = page.locator("#option_download");
    await expect(downloadGroup).toBeVisible({ timeout: 5000 });
    await downloadGroup.hover();
    await expect(
      page.getByRole("menuitem", {
        name: "Download without decryption",
        exact: true,
      }),
    ).toBeVisible({ timeout: 5000 });
    await page
      .getByRole("menuitem", { name: "Original format", exact: true })
      .click();

    await enterPassphrase(passphrasePrompt, passphrase);

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`${FOLDER_TITLE}.zip`);
    expect(await readZip(download)).toEqual(FOLDER_ZIP);

    await expect(
      page
        .getByTestId("toast-content")
        .filter({ hasText: "were left out of the archive" }),
    ).toContainText("obfuscated-8712.txt", { timeout: 5000 });
  });

  test("Folder selected in the header menu", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { passphrase, passphrasePrompt } = await openReportsRoom(
      page,
      mockRequest,
      baseUrl,
      [...FOLDER_SEEDS, ROOT_SEED],
    );
    const archiveRequests = watchArchiveRequests(page);

    await selectRow(page.getByTestId("table-row-0"));

    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
    await page.locator("#menu-download").click();
    await enterPassphrase(passphrasePrompt, passphrase);

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`${FOLDER_TITLE}.zip`);
    expect(await readZip(download)).toEqual(FOLDER_ZIP);
    expect(archiveRequests).toEqual([]);
  });

  test("Files and folders selected", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { passphrase, passphrasePrompt } = await openReportsRoom(
      page,
      mockRequest,
      baseUrl,
      [...FOLDER_SEEDS, ROOT_SEED],
    );
    const archiveRequests = watchArchiveRequests(page);

    await selectRow(page.getByTestId("table-row-0"));
    await selectRow(page.getByTestId("table-row-1"));

    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
    await page.locator("#menu-download").click();
    await enterPassphrase(passphrasePrompt, passphrase);

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Files.zip");
    expect(await readZip(download)).toEqual({
      "budget.txt": "Root budget",
      [`${FOLDER_TITLE}/memo.txt`]: "First memo",
      [`${FOLDER_TITLE}/plan.txt`]: "Second plan",
    });
    expect(archiveRequests).toEqual([]);
  });
});
