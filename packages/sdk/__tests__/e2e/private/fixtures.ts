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
import type { SetupServer } from "@docspace/shared/__mocks__/e2e";
import {
  privacyroomKeysHandlers,
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";

import { test as base, expect } from "../fixtures/base";
import { FIXTURE_IDENTITY, FIXTURE_PASSPHRASE } from "../fixtures/crypto";

type THandler = Parameters<SetupServer["use"]>[number];

export type TMockBoth = (...handlers: THandler[]) => void;

/**
 * Private-rooms e2e fixture: extends the shared base with an automatic
 * `asc_auth_key` cookie, so the Next.js server components under /sdk/private
 * do not treat the session as anonymous, and with the crypto fixture identity
 * as the signed-in user's stored key. Kept separate from the base fixture so
 * suites that intentionally test the anonymous flow remain unaffected.
 */
export const test = base.extend<{
  authCookie: void;
  /**
   * Installs handlers for the server-rendered pages and for the browser at
   * once. Both get the same instances, so a file the browser uploads is
   * listed by the next server render.
   */
  mockBoth: TMockBoth;
  /** The key list of the signed-in user, holding FIXTURE_IDENTITY. */
  identityKeys: PrivacyroomHandlerHandle;
}>({
  authCookie: [
    async ({ page, baseUrl }, use) => {
      await page.context().addCookies([
        { name: "asc_auth_key", value: "e2e-test-token", url: baseUrl },
      ]);
      await use();
    },
    { auto: true },
  ],
  mockBoth: async (
    { serverRequestInterceptor, clientRequestInterceptor },
    use,
  ) => {
    await use((...handlers) => {
      serverRequestInterceptor.use(...handlers);
      clientRequestInterceptor.use(...handlers);
    });
  },
  identityKeys: [
    // Waits for resetHandlersServer, whose default handlers would otherwise
    // shadow the seeded key list on the server.
    async ({ port, mockBoth, resetHandlersServer: _reset }, use) => {
      const handle: { current: PrivacyroomHandlerHandle | null } = {
        current: null,
      };
      mockBoth(
        ...privacyroomKeysHandlers(port, {
          initial: [FIXTURE_IDENTITY],
          handle,
        }),
      );
      await use(handle.current!);
    },
    { auto: true },
  ],
});

/** The SDK's own passphrase modal. */
export const passphrasePrompt = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Enter passphrase" });

/** Answers the passphrase modal with the fixture identity's passphrase. */
export const unlock = async (page: Page) => {
  const prompt = passphrasePrompt(page);
  await expect(prompt).toBeVisible({ timeout: 15000 });
  await prompt
    .locator('input[name="passphrase"], #passphrase input')
    .first()
    .fill(FIXTURE_PASSPHRASE);
  await prompt.getByRole("button", { name: "Confirm" }).click();
  await expect(prompt).toBeHidden({ timeout: 15000 });
};

export { expect };
