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
// Both passphrases must satisfy PASSPHRASE_SETTINGS in PassphraseModal:
// length >= 12, uppercase, digits, special characters.
const KNOWN_PASSPHRASE = "Test-Horse-Battery-Staple-99!";
const KNOWN_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon abandon " +
  "abandon abandon abandon abandon abandon art";
const NEW_PASSPHRASE = "Fresh-Forest-River-Mountain-77!";

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
      id: string;
      publicKey: string;
      privateKeyEnc: string;
    };
    // Sprint 1: recovery now targets the existing key by id (server's
    // ReplaceKey is keyed by Guid). Sprint 2: the `update: true` cruft in
    // the body was dropped — server uses the HTTP method to choose replace.
    expect(body.id).toBeTruthy();
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
      id: string;
      publicKey: string;
      privateKeyEnc: string;
    };
    // Sprint 1: rotation now targets the existing key by id, so PUT replaces
    // the right entry on the server (server's ReplaceKey is keyed by id).
    // Sprint 2: the `update: true` cruft in the body was dropped — server
    // uses the HTTP method (POST vs PUT) to choose replace=false vs true.
    expect(body.id).toBeTruthy();
    expect(body.publicKey).toBe(envelope.publicKey);
    expect(body.privateKeyEnc).not.toBe(envelope.privateKeyEnc);
  });
});
