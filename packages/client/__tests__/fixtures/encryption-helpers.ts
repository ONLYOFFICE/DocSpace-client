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
  privacyroomKeysHandlers,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

import { expect, TEST_PORT } from "./base";

export type BootstrapResult = {
  keysHandle: PrivacyroomHandlerHandle;
  passphrase: string;
};

export type BootstrapOptions = {
  passphrase?: string;
};

// Must satisfy PASSPHRASE_SETTINGS in PassphraseModal:
// length ≥ 12, uppercase, digits, special characters.
const DEFAULT_PASSPHRASE = "Test-Horse-Battery-Staple-99!";

export async function bootstrapEncryption(
  page: Page,
  mockRequest: WorkerFixture,
  baseUrl: string,
  options: BootstrapOptions = {},
): Promise<BootstrapResult> {
  const passphrase = options.passphrase ?? DEFAULT_PASSPHRASE;
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
  await expect(generateBtn).toBeVisible({ timeout: 15000 });
  await generateBtn.click();

  const passphraseInput = page
    .locator('input[name="passphrase"], #passphrase input')
    .first();
  await expect(passphraseInput).toBeVisible({ timeout: 5000 });
  await passphraseInput.fill(passphrase);

  const confirmInput = page
    .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
    .first();
  await confirmInput.fill(passphrase);

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Continue" })
    .click();

  const acknowledge = page.locator("#recoveryPhraseAcknowledged");
  await expect(acknowledge).toBeVisible({ timeout: 5000 });

  const words = await page.locator("[class*='wordText']").allTextContents();
  expect(words).toHaveLength(24);

  await acknowledge.check();
  const recoveryDialog = page.getByRole("dialog");
  await recoveryDialog.getByRole("button", { name: "Continue" }).click();

  const quizInputs = recoveryDialog.locator('input[name^="quiz-input-"]');
  await expect(quizInputs.first()).toBeVisible({ timeout: 5000 });
  const inputCount = await quizInputs.count();
  for (let i = 0; i < inputCount; i++) {
    const label = await recoveryDialog
      .locator(`label[for="quiz-input-${i}"]`)
      .textContent();
    const match = label?.match(/#(\d+)/);
    expect(match).toBeTruthy();
    const wordIndex = Number.parseInt(match![1], 10) - 1;
    await quizInputs.nth(i).fill(words[wordIndex]);
  }

  await recoveryDialog.getByRole("button", { name: "Verify" }).click();

  await expect
    .poll(() => handleRef.current?.getKeys().length ?? 0, {
      timeout: 10000,
    })
    .toBe(1);

  await expect(acknowledge).toBeHidden({ timeout: 5000 });

  return { keysHandle: handleRef.current!, passphrase };
}
