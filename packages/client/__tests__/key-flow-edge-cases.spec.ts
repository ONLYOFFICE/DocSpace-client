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

const STRONG_PASSPHRASE = "test correct horse battery staple";

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
    await acknowledge.check();

    await page
      .getByRole("dialog")
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

    const lockNowBtn = page.getByRole("button", {
      name: "Lock now",
      exact: true,
    });
    await expect(lockNowBtn).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await expect(lockNowBtn).toBeHidden({ timeout: 5000 });
  });
});
