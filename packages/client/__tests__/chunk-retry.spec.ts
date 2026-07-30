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
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// Emulates the "white screen after background throttling / lost
// connection" bug for the Vite-built client app: dropped bundle requests
// must be retried by the inline bootstrap injected by the chunk-retry
// Vite plugin (config/plugins/chunk-retry.ts). Unlike the Next.js apps,
// bundles here are ES modules — a failed module fetch may be cached by
// the browser for the document lifetime, so recovery is allowed to happen
// either in place or through the bounded reload fallback.
const PAGE_PATH = "/portal-settings/security/access-portal/access-control";
const BUNDLES_ROUTE = /\/static\/(?:js|styles)\//;

const isAppBooted = () =>
  Boolean(document.querySelector("#root")?.hasChildNodes());

test.describe("Chunk load recovery", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT, { externalShare: true }),
    );
  });

  test("ships the retry bootstrap in the served head", async ({
    page,
    baseUrl,
  }) => {
    const response = await page.goto(`${baseUrl}${PAGE_PATH}`);
    expect(response).not.toBeNull();
    const html = (await response?.text()) ?? "";

    const bootstrapIndex = html.indexOf('id="chunk-retry"');
    const headEnd = html.indexOf("</head>");

    expect(bootstrapIndex).toBeGreaterThan(-1);
    expect(headEnd).toBeGreaterThan(-1);
    expect(bootstrapIndex).toBeLessThan(headEnd);
  });

  test("recovers when every bundle request fails once", async ({
    page,
    baseUrl,
  }) => {
    const failedOnce = new Set<string>();
    const recovered = new Set<string>();

    await page.route(BUNDLES_ROUTE, async (route) => {
      const url = route.request().url().split("?")[0];
      if (!failedOnce.has(url)) {
        failedOnce.add(url);
        await route.abort("failed");
        return;
      }
      recovered.add(url);
      await route.continue();
    });

    await page.goto(`${baseUrl}${PAGE_PATH}`);

    await expect
      .poll(() => page.evaluate(isAppBooted).catch(() => false), {
        timeout: 30_000,
      })
      .toBe(true);

    await expect(page.getByTestId("external_sharing_radio")).toBeVisible();

    expect(failedOnce.size).toBeGreaterThan(0);
    expect(recovered.size).toBeGreaterThan(0);
  });

  test("recovers after a network outage while the app is loading", async ({
    page,
    baseUrl,
  }) => {
    let outage = true;
    await page.route(BUNDLES_ROUTE, async (route) => {
      if (outage) {
        await route.abort("internetdisconnected");
        return;
      }
      await route.continue();
    });

    await page.goto(`${baseUrl}${PAGE_PATH}`);
    await page.context().setOffline(true);

    await page.waitForTimeout(3_000);
    const bootedOffline = await page
      .evaluate(isAppBooted)
      .catch(() => false);
    expect(bootedOffline).toBe(false);

    outage = false;
    await page.context().setOffline(false);

    await expect
      .poll(() => page.evaluate(isAppBooted).catch(() => false), {
        timeout: 30_000,
      })
      .toBe(true);

    await expect(page.getByTestId("external_sharing_radio")).toBeVisible();
  });

  test("reloads a bounded number of times when bundles never load", async ({
    page,
    baseUrl,
  }) => {
    let pageLoads = 0;
    page.on("load", () => {
      pageLoads += 1;
    });

    await page.route(BUNDLES_ROUTE, (route) => route.abort("failed"));

    await page.goto(`${baseUrl}${PAGE_PATH}`);

    await expect.poll(() => pageLoads, { timeout: 45_000 }).toBe(3);

    await page.waitForTimeout(5_000);
    expect(pageLoads).toBe(3);
  });
});
