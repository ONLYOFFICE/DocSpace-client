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

    const generateBtn = page.getByRole("button", { name: "Generate new key" });
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
    await generateBtn.click();

    // PasswordInput passes id straight to the underlying InputBlock.
    const passphraseInput = page.locator(
      'input[name="passphrase"], #passphrase input',
    );
    await expect(passphraseInput.first()).toBeVisible({ timeout: 5_000 });
    await passphraseInput.first().fill("correct horse battery staple");

    const confirmInput = page.locator(
      'input[name="confirmPassphrase"], #confirmPassphrase input',
    );
    await confirmInput.first().fill("correct horse battery staple");

    const passphraseDialog = page.getByRole("dialog");
    await passphraseDialog
      .getByRole("button", { name: "Continue" })
      .click();

    const acknowledge = page.locator("#recoveryPhraseAcknowledged");
    await expect(acknowledge).toBeVisible({ timeout: 5_000 });

    const recoveryDialog = page.getByRole("dialog");
    const continueBtn = recoveryDialog.getByRole("button", { name: "Continue" });
    await expect(continueBtn).toBeDisabled();

    await acknowledge.check();
    await expect(continueBtn).toBeEnabled();

    const postPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().endsWith("/privacyroom/keys"),
    );

    await continueBtn.click();

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
    const generateBtn = page.getByRole("button", { name: "Generate new key" });
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
    await generateBtn.click();

    const dialog = page.getByRole("dialog");
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
