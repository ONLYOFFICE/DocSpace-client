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
  privacyroomKeysHandlers,
  selfActivationStatusHandler,
  settingsHandler,
  type PrivacyroomHandlerHandle,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.describe("Profile > Keys Management", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
    );
  });

  test("generate first key end-to-end posts a valid envelope", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [],
        handle: handleRef,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);

    const generateBtn = page.getByRole("button", {
      name: "Generate new key",
      exact: true,
    });
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
    await generateBtn.click();

    // PasswordInput passes id straight to the underlying InputBlock.
    const passphraseInput = page.locator(
      'input[name="passphrase"], #passphrase input',
    );
    await expect(passphraseInput.first()).toBeVisible({ timeout: 5_000 });
    await passphraseInput.first().fill("Test-Horse-Battery-Staple-99!");

    const confirmInput = page.locator(
      'input[name="confirmPassphrase"], #confirmPassphrase input',
    );
    await confirmInput.first().fill("Test-Horse-Battery-Staple-99!");

    const passphraseDialog = page.getByRole("dialog");
    await passphraseDialog
      .getByRole("button", { name: "Continue" })
      .click();

    const acknowledge = page.locator("#recoveryPhraseAcknowledged");
    await expect(acknowledge).toBeVisible({ timeout: 5_000 });

    const recoveryDialog = page.getByRole("dialog");
    const continueBtn = recoveryDialog.getByRole("button", { name: "Continue" });
    await expect(continueBtn).toBeDisabled();

    const words = await page.locator("[class*='wordText']").allTextContents();
    expect(words).toHaveLength(24);

    await acknowledge.check();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    const quizInputs = recoveryDialog.locator('input[name^="quiz-input-"]');
    await expect(quizInputs.first()).toBeVisible({ timeout: 5_000 });
    const inputCount = await quizInputs.count();
    for (let i = 0; i < inputCount; i++) {
      const label = await recoveryDialog
        .locator(`label[for="quiz-input-${i}"]`)
        .textContent();
      const wordNumber = Number.parseInt(label?.match(/#(\d+)/)?.[1] ?? "0", 10);
      await quizInputs.nth(i).fill(words[wordNumber - 1]);
    }

    const postPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().endsWith("/privacyroom/keys"),
    );

    await recoveryDialog.getByRole("button", { name: "Verify" }).click();

    const post = await postPromise;
    const body = post.postDataJSON() as {
      publicKey: string;
      privateKeyEnc: string;
    };

    expect(body.publicKey).toBeTruthy();
    expect(body.privateKeyEnc).toBeTruthy();
    expect(body.publicKey.length).toBeGreaterThan(20);
    expect(body.privateKeyEnc.length).toBeGreaterThan(20);
    expect(body.publicKey).not.toBe(body.privateKeyEnc);

    await expect
      .poll(() => handleRef.current?.getKeys().length ?? 0, {
        timeout: 5_000,
      })
      .toBe(1);

    const stored = handleRef.current!.getKeys()[0];
    expect(stored.publicKey).toBe(body.publicKey);
    expect(stored.privateKeyEnc).toBe(body.privateKeyEnc);

    await expect(acknowledge).toBeHidden({ timeout: 5_000 });
  });

  test("cancel passphrase modal does NOT upload anything", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [],
        handle: handleRef,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);
    const generateBtn = page.getByRole("button", {
      name: "Generate new key",
      exact: true,
    });
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
    await generateBtn.click();

    const dialog = page
      .getByRole("dialog")
      .filter({ hasText: "Create passphrase" });
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();

    // Pin the handle first so a null fallback can't mask a real upload.
    expect(handleRef.current).not.toBeNull();
    const writeRequests = handleRef.current!
      .getRequests()
      .filter((r) => r.method === "POST" || r.method === "PUT");
    expect(writeRequests).toHaveLength(0);
  });
});
