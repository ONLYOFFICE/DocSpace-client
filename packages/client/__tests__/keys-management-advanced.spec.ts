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
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";
import {
  capabilitiesHandler,
  privacyroomKeysHandlers,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const KNOWN_PASSPHRASE = "test correct horse battery staple";
const KNOWN_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon art";
const NEW_PASSPHRASE = "fresh forest river mountain";

async function realEnvelope() {
  const kp = await generateIdentityKeyPair();
  const serialized = await serializeIdentity(kp, KNOWN_PASSPHRASE, {
    recoveryMnemonic: KNOWN_MNEMONIC,
  });
  return {
    id: "1",
    userId: TEST_USER_ID,
    publicKey: serialized.publicKey,
    privateKeyEnc: serialized.privateKeyEnc,
    date: "2026-01-01T00:00:00.000Z",
  };
}

test.describe("Keys management — advanced flows", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
    );
  });

  test("recovery phrase end-to-end restores access and uploads new envelope", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    const envelope = await realEnvelope();
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [envelope],
        handle: handleRef,
        userId: TEST_USER_ID,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);

    await page
      .getByRole("button", { name: "Use recovery phrase", exact: true })
      .click();

    const phraseInput = page.locator("#recoveryPhraseInput");
    await expect(phraseInput).toBeVisible({ timeout: 5000 });
    await phraseInput.fill(KNOWN_MNEMONIC);

    await page
      .getByRole("dialog")
      .filter({ hasText: "Use recovery phrase" })
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    const newPassphraseInput = page
      .locator('input[name="passphrase"], #passphrase input')
      .first();
    await expect(newPassphraseInput).toBeVisible({ timeout: 5000 });
    await newPassphraseInput.fill(NEW_PASSPHRASE);
    await page
      .locator('input[name="confirmPassphrase"], #confirmPassphrase input')
      .first()
      .fill(NEW_PASSPHRASE);

    const putPromise = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/privacyroom/keys"),
      { timeout: 30000 },
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Continue", exact: true })
      .click();

    const putReq = await putPromise;
    const body = putReq.postDataJSON() as {
      publicKey: string;
      privateKeyEnc: string;
      update: boolean;
    };
    expect(body.update).toBe(true);
    expect(body.publicKey).toBe(envelope.publicKey);
    expect(body.privateKeyEnc).not.toBe(envelope.privateKeyEnc);
    expect(body.privateKeyEnc.length).toBeGreaterThan(20);

    const successToast = page
      .getByTestId("toast-content")
      .filter({ hasText: /Recovery phrase accepted/i });
    await expect(successToast).toBeVisible({ timeout: 10000 });
  });

  test("delete key shows warning; cancel does NOT delete, confirm does", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    const envelope = {
      id: "99",
      userId: TEST_USER_ID,
      publicKey: "FAKE_PUB_KEY_OK_FOR_DELETE_FLOW",
      privateKeyEnc: "FAKE_PRIV_ENC_OK_FOR_DELETE_FLOW",
      date: "2026-01-01T00:00:00.000Z",
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [envelope],
        handle: handleRef,
        userId: TEST_USER_ID,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);

    const actionButtons = page
      .locator("[class*='keyItemActions']")
      .first()
      .getByTestId("icon-button");
    const deleteBtn = actionButtons.nth(2);
    await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    await deleteBtn.click();

    const deleteDialog = page
      .getByRole("dialog")
      .filter({ hasText: "Delete encryption keyWarning" });
    await expect(deleteDialog).toBeVisible({ timeout: 5000 });
    await expect(deleteDialog.getByText(/inaccessible/i)).toBeVisible();

    await deleteDialog.getByLabel("Cancel", { exact: true }).click();

    expect(
      handleRef
        .current!.getRequests()
        .filter((r) => r.method === "DELETE"),
    ).toHaveLength(0);

    await deleteBtn.click();
    const deletePromise = page.waitForRequest(
      (req) =>
        req.method() === "DELETE" &&
        req.url().endsWith("/privacyroom/keys/99"),
      { timeout: 10000 },
    );
    await deleteDialog.getByLabel("Confirm", { exact: true }).click();

    await deletePromise;
    await expect
      .poll(() => handleRef.current!.getKeys().length, { timeout: 5000 })
      .toBe(0);
  });

  test("change passphrase posts new envelope under the new passphrase", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const handleRef: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };
    const envelope = await realEnvelope();
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [envelope],
        handle: handleRef,
        userId: TEST_USER_ID,
      }),
    );

    await page.goto(`${baseUrl}/profile/keys-management`);

    const actionButtons = page
      .locator("[class*='keyItemActions']")
      .first()
      .getByTestId("icon-button");
    const rotateBtn = actionButtons.nth(0);
    await expect(rotateBtn).toBeVisible({ timeout: 10000 });
    await rotateBtn.click();

    await page
      .locator('input[name="currentPassphrase"]')
      .fill(KNOWN_PASSPHRASE);
    await page.locator('input[name="newPassphrase"]').fill(NEW_PASSPHRASE);
    await page
      .locator('input[name="confirmNewPassphrase"]')
      .fill(NEW_PASSPHRASE);

    const putPromise = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/privacyroom/keys"),
      { timeout: 30000 },
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Change passphrase", exact: true })
      .click();

    const body = (await putPromise).postDataJSON() as {
      publicKey: string;
      privateKeyEnc: string;
      update: boolean;
    };
    expect(body.update).toBe(true);
    expect(body.publicKey).toBe(envelope.publicKey);
    expect(body.privateKeyEnc).not.toBe(envelope.privateKeyEnc);
  });
});
