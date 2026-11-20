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
import { http, passthrough, type RequestHandler } from "msw";
import { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import {
  allHandlers,
  capabilitiesHandler,
  privacyroomKeysHandlers,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import {
  generateIdentityKeyPair,
  serializeIdentity,
} from "@docspace/shared/services/encryption/identity";

import { expect, test, TEST_PORT } from "./fixtures/base";

// Spec: private-rooms/key-management, "A lock reaches every tab of the user",
// "Other tabs read the key list again after a key change" and "A newly
// picked auto-lock preset applies at once". Two pages of one browser context
// share its storage and its BroadcastChannel, as two tabs do.

const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const PASSPHRASE = "Test-Horse-Battery-Staple-99!";
const NEW_PASSPHRASE = "Fresh-Forest-River-Mountain-77!";

async function realEnvelope() {
  const kp = await generateIdentityKeyPair();
  const serialized = await serializeIdentity(kp, PASSPHRASE);
  return {
    id: "1",
    userId: TEST_USER_ID,
    publicKey: serialized.publicKey,
    privateKeyEnc: serialized.privateKeyEnc,
    date: "2026-01-01T00:00:00.000Z",
  };
}

/** The handlers of both tabs; the key store behind them is one. */
async function portalWithKey() {
  const handle: { current: PrivacyroomHandlerHandle | null } = {
    current: null,
  };
  const handlers: RequestHandler[] = [
    settingsHandler(TEST_PORT, TypeSettings.Authenticated),
    selfActivationStatusHandler(TEST_PORT, null, false, true),
    capabilitiesHandler(TEST_PORT, true),
    ...privacyroomKeysHandlers(TEST_PORT, {
      initial: [await realEnvelope()],
      handle,
      userId: TEST_USER_ID,
    }),
  ];
  return { handlers, handle };
}

/** A second tab of the same browser, answered by the same handlers. */
async function openSecondTab(page: Page, handlers: RequestHandler[]) {
  const second = await page.context().newPage();
  const worker = new WorkerFixture({
    page: second,
    initialHandlers: [
      ...handlers,
      ...allHandlers(TEST_PORT),
      http.get(/(\/client)?\/locales\/.*\.json(\?.*)?$/, () => passthrough()),
    ],
  });
  await worker.start();
  return second;
}

const keyState = (page: Page) => page.getByTestId("key_lock_state");

async function openKeysManagement(page: Page, baseUrl: string) {
  await page.goto(`${baseUrl}/profile/keys-management`);
  await expect(keyState(page)).toHaveText("Key locked", { timeout: 15_000 });
}

async function unlock(page: Page, passphrase = PASSPHRASE) {
  await page.getByTestId("keys_unlock_button").click();
  const field = page
    .getByRole("dialog")
    .getByLabel("Passphrase", { exact: true });
  await field.fill(passphrase);
  await field.press("Enter");
}

async function openTwoUnlockedTabs(
  page: Page,
  handlers: RequestHandler[],
  baseUrl: string,
) {
  const second = await openSecondTab(page, handlers);
  for (const tab of [page, second]) {
    await openKeysManagement(tab, baseUrl);
    await unlock(tab);
    await expect(keyState(tab)).toHaveText("Key unlocked", {
      timeout: 15_000,
    });
  }
  return second;
}

test.describe("Keys management across tabs", () => {
  test("Lock now in another tab", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { handlers } = await portalWithKey();
    mockRequest.use(...handlers);
    const second = await openTwoUnlockedTabs(page, handlers, baseUrl);

    await page.getByRole("button", { name: "Lock now", exact: true }).click();

    await expect(keyState(page)).toHaveText("Key locked");
    await expect(keyState(second)).toHaveText("Key locked", { timeout: 5_000 });
    await expect(second.getByTestId("keys_unlock_button")).toBeVisible();
  });

  test("Key deleted in another tab", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { handlers, handle } = await portalWithKey();
    mockRequest.use(...handlers);
    const second = await openTwoUnlockedTabs(page, handlers, baseUrl);

    await page
      .locator("[class*='keyItemActions']")
      .first()
      .getByTestId("icon-button")
      .nth(2)
      .click();
    const warning = page
      .getByRole("dialog")
      .filter({ hasText: "Delete encryption keyWarning" });
    const confirm = warning.getByRole("button", {
      name: "Confirm",
      exact: true,
    });
    await expect(confirm).toBeEnabled({ timeout: 10_000 });
    await confirm.click();
    const verify = page
      .getByRole("dialog")
      .filter({ hasText: "Enter passphrase" });
    await verify.getByLabel("Passphrase", { exact: true }).fill(PASSPHRASE);
    await verify.getByRole("button", { name: "Continue", exact: true }).click();
    await expect
      .poll(() => handle.current?.getKeys().length, { timeout: 10_000 })
      .toBe(0);

    // The other tab locks and shows the state without a key, no reload.
    await expect(
      second.getByRole("button", { name: "Create key", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(keyState(second)).toHaveCount(0);
  });

  test("New passphrase in the other tab", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { handlers } = await portalWithKey();
    mockRequest.use(...handlers);
    const second = await openTwoUnlockedTabs(page, handlers, baseUrl);

    await page
      .locator("[class*='keyItemActions']")
      .first()
      .getByTestId("icon-button")
      .nth(0)
      .click();
    await page
      .getByLabel("Current passphrase", { exact: true })
      .fill(PASSPHRASE);
    await page.getByLabel("New passphrase", { exact: true }).fill(NEW_PASSPHRASE);
    await page
      .getByLabel("Confirm new passphrase", { exact: true })
      .fill(NEW_PASSPHRASE);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save", exact: true })
      .click();

    await expect(keyState(second)).toHaveText("Key locked", { timeout: 5_000 });

    await unlock(second, PASSPHRASE);
    await expect(second.getByRole("dialog")).toContainText(
      "Incorrect passphrase",
      { timeout: 15_000 },
    );
    const field = second
      .getByRole("dialog")
      .getByLabel("Passphrase", { exact: true });
    await field.fill(NEW_PASSPHRASE);
    await field.press("Enter");

    await expect(keyState(second)).toHaveText("Key unlocked", {
      timeout: 15_000,
    });
  });

  test("Preset picked in another tab", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const { handlers } = await portalWithKey();
    mockRequest.use(...handlers);
    const second = await openSecondTab(page, handlers);
    await openKeysManagement(page, baseUrl);
    await openKeysManagement(second, baseUrl);

    const autoLock = (tab: Page) =>
      tab
        .getByRole("group", { name: "Auto-lock after inactivity" })
        .getByRole("button");
    await expect(autoLock(second)).toHaveText("30 minutes");

    await autoLock(page).click();
    await page.getByText("5 minutes", { exact: true }).click();
    await expect(autoLock(page)).toHaveText("5 minutes");

    await expect(autoLock(second)).toHaveText("5 minutes", { timeout: 5_000 });
  });

  test("Unlock not shared", async ({ page, mockRequest, baseUrl }) => {
    test.slow();
    const { handlers } = await portalWithKey();
    mockRequest.use(...handlers);
    const second = await openSecondTab(page, handlers);
    await openKeysManagement(page, baseUrl);
    await openKeysManagement(second, baseUrl);

    await unlock(page);
    await expect(keyState(page)).toHaveText("Key unlocked", {
      timeout: 15_000,
    });

    // Long enough for a message between tabs, which take well under a second.
    await second.waitForTimeout(1_500);
    await expect(keyState(second)).toHaveText("Key locked");
  });
});
