// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
