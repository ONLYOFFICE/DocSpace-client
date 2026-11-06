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

import {
  encryptedFilesHandlers,
  filesSettingsHandler,
  privacyroomKeysHandlers,
} from "@docspace/shared/__mocks__/handlers";
import type { SetupServer } from "@docspace/shared/__mocks__/e2e";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { EDITOR_CONTRACT_VERSION } from "@docspace/shared/services/encryption/types";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";

import { expect, test } from "./fixtures/base";

const ROOM_ID = 9400;
const FILE_ID = 8800;
// successSelf of the people mock, the user every page here is opened as.
const SELF_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const PASSPHRASE = "test-passphrase-12345";
const CRYPTO_ENGINE_ID = "{DC522726-5E0E-43E5-AA02-8EA156BECBC5}";

type THandler = Parameters<SetupServer["use"]>[number];

type TEditorConfig = {
  document?: { url?: string };
  editorConfig?: { encryptionKeys?: unknown };
  token?: string;
};

/**
 * The Document Server is not part of the E2E setup: `api.js` is replaced by
 * a DocsAPI that records each configuration the page hands to the editor.
 */
const stubDocsApi = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    const configs: unknown[] = [];
    w.__editorConfigs = configs;
    w.DocsAPI = {
      DocEditor: (_id: string, config: object) => {
        configs.push(JSON.parse(JSON.stringify(config)));
        return { destroyEditor: () => {} };
      },
    };
  });

const editorConfigs = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __editorConfigs: TEditorConfig[] })
        .__editorConfigs,
  );

/**
 * A .docx the user encrypted into the private room, with the identity they
 * unlock by PASSPHRASE; serves it to the server render and to the browser.
 */
const serveEncryptedFile = async (
  mockBoth: (...handlers: THandler[]) => void,
  port: string,
) => {
  const identity = await generateIdentityKeyPair();
  const serialized = await serializeIdentity(identity, PASSPHRASE, {
    argon2Params: { m_KiB: 256, t: 1, p: 1 },
  });
  const myKey = {
    id: "key-1",
    userId: SELF_ID,
    ...serialized,
    date: "2026-01-01T00:00:00.000Z",
    cryptoEngineId: CRYPTO_ENGINE_ID,
  };

  const { encryptedBlob, dek } = await encryptFile(
    new TextEncoder().encode("Quarterly report, readable by the room only."),
    { fileName: "Report.docx" },
  );
  const dekBase64 = arrayBufferToBase64(dek.slice().buffer as ArrayBuffer);
  const fileKeys = await wrapDekForRecipients({
    dek,
    senderIdentity: identity,
    senderUserId: SELF_ID,
    recipients: [
      {
        userId: SELF_ID,
        publicKey: serialized.publicKey,
        publicKeyId: myKey.id,
      },
    ],
    fileId: FILE_ID,
  });

  mockBoth(
    ...privacyroomKeysHandlers(port, { initial: [myKey], userId: SELF_ID }),
    ...encryptedFilesHandlers(port, {
      roomId: ROOM_ID,
      ownerId: SELF_ID,
      currentUserId: SELF_ID,
      callerKeys: [myKey],
      roomUserKeys: [myKey],
      initialFiles: [
        {
          id: FILE_ID,
          title: "Report.docx",
          serverTitle: "3d8f2a61-9c47-4b1e-8a05-6f2c4e7d1b93.docx",
          size: encryptedBlob.size,
          encrypted: true,
          fileKeys,
          bytes: new Uint8Array(await encryptedBlob.arrayBuffer()),
        },
      ],
    }),
  );

  return { dekBase64 };
};

const passphrasePrompt = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Enter passphrase" });

test.describe("Private room editor", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Tablets and phones get the deep link page instead of the editor",
  );

  test("Configuration extended: the editor gets the DEK, the engine id and the contract version beside the unchanged document address", async ({
    page,
    port,
    baseUrl,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    test.slow();
    const mockBoth = (...handlers: THandler[]) => {
      serverRequestInterceptor.use(...handlers);
      clientRequestInterceptor.use(...handlers);
    };
    mockBoth(filesSettingsHandler(port));
    const { dekBase64 } = await serveEncryptedFile(mockBoth, port);
    await stubDocsApi(page);

    await page.goto(`${baseUrl}/doceditor?fileId=${FILE_ID}`);

    const prompt = passphrasePrompt(page);
    await expect(prompt).toBeVisible({ timeout: 15000 });
    await prompt
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(PASSPHRASE);
    await prompt.getByRole("button", { name: "Confirm" }).click();
    await expect(prompt).toBeHidden({ timeout: 15000 });

    await expect
      .poll(async () => (await editorConfigs(page)).length, { timeout: 15000 })
      .toBeGreaterThan(0);
    const configs = await editorConfigs(page);
    const config = configs[configs.length - 1];

    expect(config.editorConfig?.encryptionKeys).toEqual({
      dek: dekBase64,
      cryptoEngineId: CRYPTO_ENGINE_ID,
      contractVersion: EDITOR_CONTRACT_VERSION,
    });
    expect(config.document?.url).toBe(
      `${baseUrl}/api/2.0/files/file/${FILE_ID}/download`,
    );
    expect(config.token).toBe(`mock-editor-token-${FILE_ID}`);
  });

  test("Capability absent: no key flow and no editor, the refusal shown instead", async ({
    page,
    port,
    baseUrl,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const mockBoth = (...handlers: THandler[]) => {
      serverRequestInterceptor.use(...handlers);
      clientRequestInterceptor.use(...handlers);
    };
    mockBoth(filesSettingsHandler(port, { docServiceEncryptionSupported: false }));
    await serveEncryptedFile(mockBoth, port);
    await stubDocsApi(page);
    const accessReads: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.endsWith(`/files/${FILE_ID}/access`)) {
        accessReads.push(request.url());
      }
    });

    await page.goto(`${baseUrl}/doceditor?fileId=${FILE_ID}`);

    await expect(
      page.getByText("Encrypted files cannot be opened in this editor."),
    ).toBeVisible({ timeout: 15000 });
    await expect(passphrasePrompt(page)).toHaveCount(0);
    expect(await editorConfigs(page)).toEqual([]);
    expect(accessReads).toEqual([]);
  });
});
