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
  fileByIdHandler,
  filesSettingsHandler,
  fillingStatusHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test } from "./fixtures/base";

// Emulates the "white screen after background throttling" bug: a hidden or
// minimized window drops Next.js chunk requests and the editor never
// bootstraps. The trigger (an aborted network request) is reproduced with
// route interception; the visibility gating itself is covered by unit
// tests in @docspace/shared.
const PAGE_PATH = "/doceditor/start-filling?formId=1&roomId=1&share=qwerty";
const CHUNKS_ROUTE = "**/_next/static/chunks/**";

test.describe("Chunk load recovery", () => {
  test("ships the retry bootstrap before any chunk script", async ({
    page,
    serverRequestInterceptor,
    port,
    baseUrl,
  }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      fileByIdHandler(port, true),
      fillingStatusHandler(port),
    );

    const response = await page.goto(`${baseUrl}${PAGE_PATH}`);
    expect(response).not.toBeNull();
    const html = (await response?.text()) ?? "";

    // The inline bootstrap must ship inside <head> of the SSR HTML. Next.js
    // hoists its own async chunk <script> tags above user head content, so
    // a tag-order check is impossible — but async scripts cannot execute
    // (or fail) before the parser reaches the inline script a few KB
    // later, which the recovery test below proves by aborting chunk
    // requests instantly.
    const bootstrapIndex = html.indexOf('id="chunk-retry"');
    const headEnd = html.indexOf("</head>");

    expect(bootstrapIndex).toBeGreaterThan(-1);
    expect(headEnd).toBeGreaterThan(-1);
    expect(bootstrapIndex).toBeLessThan(headEnd);
  });

  test("recovers when every chunk request fails once", async ({
    page,
    serverRequestInterceptor,
    port,
    baseUrl,
  }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      fileByIdHandler(port, true),
      fillingStatusHandler(port),
    );

    const failedOnce = new Set<string>();
    const recovered = new Set<string>();

    await page.route(CHUNKS_ROUTE, async (route) => {
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

    // window.next appears only after the (re-injected) framework chunks
    // execute, so it proves the page recovered instead of white-screening.
    // Polling via evaluate survives a potential in-between reload.
    await expect
      .poll(
        () =>
          page
            .evaluate(() =>
              Boolean(
                (window as { next?: { version?: string } }).next?.version,
              ),
            )
            .catch(() => false),
        { timeout: 30_000 },
      )
      .toBe(true);

    await expect(
      page.getByTestId("completed_form_vdr_container"),
    ).toBeVisible();

    expect(failedOnce.size).toBeGreaterThan(0);
    expect(recovered.size).toBeGreaterThan(0);
  });

  test("reloads a bounded number of times when chunks never load", async ({
    page,
    serverRequestInterceptor,
    port,
    baseUrl,
  }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      fileByIdHandler(port, true),
      fillingStatusHandler(port),
    );

    let pageLoads = 0;
    page.on("load", () => {
      pageLoads += 1;
    });

    await page.route(CHUNKS_ROUTE, (route) => route.abort("failed"));

    await page.goto(`${baseUrl}${PAGE_PATH}`);

    // Every chunk exhausts its retries (~2.1s of backoff), then the
    // bootstrap reloads the page; the sessionStorage budget allows two
    // reloads per tab: initial load + 2 reloads.
    await expect.poll(() => pageLoads, { timeout: 45_000 }).toBe(3);

    // The budget is spent — the page must not enter a reload loop.
    await page.waitForTimeout(5_000);
    expect(pageLoads).toBe(3);
  });
});
