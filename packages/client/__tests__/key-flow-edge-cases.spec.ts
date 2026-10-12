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

import { http } from "msw";
import {
  capabilitiesHandler,
  privacyroomKeysHandlers,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

// Must satisfy PASSPHRASE_SETTINGS in PassphraseModal:
// length >= 12, uppercase, digits, special characters.
const STRONG_PASSPHRASE = "Test-Horse-Battery-Staple-99!";

test.describe("Keys management — edge cases", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
    );
  });

  test("passphrase mismatch keeps Continue disabled until fixed", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...privacyroomKeysHandlers(TEST_PORT, { initial: [] }));

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
    await passphraseInput.fill(STRONG_PASSPHRASE);

    const confirmInput = page
      .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
      .first();
    await confirmInput.fill("different-passphrase-1234");

    const continueBtn = page
      .getByRole("dialog")
      .getByRole("button", { name: "Continue", exact: true });
    await expect(continueBtn).toBeDisabled();

    await confirmInput.fill(STRONG_PASSPHRASE);
    await expect(continueBtn).toBeEnabled();
  });

  test("cancel at the recovery-phrase step does NOT post to /privacyroom/keys", async ({
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

    await page
      .getByRole("button", { name: "Generate new key", exact: true })
      .click();

    const passphraseInput = page
      .locator('input[name="passphrase"], #passphrase input')
      .first();
    await expect(passphraseInput).toBeVisible({ timeout: 5000 });
    await passphraseInput.fill(STRONG_PASSPHRASE);

    await page
      .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
      .first()
      .fill(STRONG_PASSPHRASE);

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    const acknowledge = page.locator("#recoveryPhraseAcknowledged");
    await expect(acknowledge).toBeVisible({ timeout: 5000 });

    const recoveryDialog = page
      .getByRole("dialog")
      .filter({ hasText: "Save your recovery" });
    await recoveryDialog
      .getByRole("button", { name: "Cancel", exact: true })
      .click();

    await expect(acknowledge).toBeHidden({ timeout: 5000 });

    expect(handleRef.current).not.toBeNull();
    const writes = handleRef.current!
      .getRequests()
      .filter((r) => r.method === "POST" || r.method === "PUT");
    expect(writes).toHaveLength(0);
    expect(handleRef.current!.getKeys()).toHaveLength(0);
  });

  test("server 500 on key POST surfaces an error toast and leaves no key on server", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      http.post(
        `${BASE_URL}:${TEST_PORT}/api/2.0/privacyroom/keys`,
        () =>
          new Response(
            JSON.stringify({
              error: { message: "boom" },
              status: 1,
              statusCode: 500,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          ),
      ),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [],
        handle: handleRef,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);

    await page
      .getByRole("button", { name: "Generate new key", exact: true })
      .click();

    await page
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(STRONG_PASSPHRASE);
    await page
      .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
      .first()
      .fill(STRONG_PASSPHRASE);

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    const acknowledge = page.locator("#recoveryPhraseAcknowledged");
    await expect(acknowledge).toBeVisible({ timeout: 5000 });

    const recoveryDialog = page.getByRole("dialog");
    const phraseText = await recoveryDialog
      .locator("[class*='phraseBox']")
      .textContent();
    const words = (phraseText ?? "").trim().split(/\s+/);
    expect(words).toHaveLength(24);

    // Saving the phrase (download) unlocks the acknowledge checkbox.
    const downloadPromise = page.waitForEvent("download");
    await recoveryDialog
      .getByRole("button", { name: "Download", exact: true })
      .click();
    await downloadPromise;

    await acknowledge.check();
    await recoveryDialog
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    const errorToast = page
      .getByTestId("toast-content")
      .filter({ hasText: /encryption operation/i });
    await expect(errorToast).toBeVisible({ timeout: 10000 });

    expect(handleRef.current!.getKeys()).toHaveLength(0);
  });

  test("auto-lock on tab visibility change hides the Lock now button", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await bootstrapEncryption(page, mockRequest, baseUrl);

    // The tab-hide lock obeys the auto-lock preference, and the default is
    // "Off" — enable a preset so hiding the tab actually locks. The legacy
    // key is migrated to the per-user key on first read.
    await page.evaluate(() =>
      localStorage.setItem("encryption-auto-lock-timeout-seconds", "300"),
    );

    // "Lock now" is rendered as a Link, not a Button.
    const lockNowBtn = page.getByTestId("lock_now_link");
    await expect(lockNowBtn).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
    });

    // The visibilitychange listener is (re)registered as auto-lock suspension
    // clears, so a single dispatch can race that registration. Keep the tab
    // "hidden" and re-dispatch until the auto-lock takes effect.
    await expect(async () => {
      await page.evaluate(() =>
        document.dispatchEvent(new Event("visibilitychange")),
      );
      await expect(lockNowBtn).toBeHidden({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
  });
});
