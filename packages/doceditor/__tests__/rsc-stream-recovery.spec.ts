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
import {
  editorPagePassthroughHandler,
  fileByIdHandler,
  filesSettingsHandler,
  fillingStatusHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test } from "./fixtures/base";

// Emulates "Connection closed." / minified React error #412, reported by
// hundreds of editor sessions (mostly Firefox): the RSC payload streamed
// inside the editor's HTML ends before a row it promised arrives - here the
// page segment carrying the form's file. The layout hydrates, the page
// segment never resolves, and React rejects it once the document is parsed.
// Before the fix that left the user on the "Something went wrong" page.
const PAGE_PATH = "/doceditor/start-filling?formId=1&roomId=1&share=qwerty";
const DOCUMENT_ROUTE = "**/doceditor/start-filling?*";

const RSC_PUSH = /(<script[^>]*>self\.__next_f\.push\()(\[1,[\s\S]*?\])(\)<\/script>)/g;
// The page segment row: a lazy client component rendered with the file props.
const PAGE_ROW = /(^|\n)[0-9a-f]+:\["\$","\$L[0-9a-f]+",null,\{"file":[^\n]*\n?/;

const dropPageRow = (html: string) => {
  let dropped = false;

  const body = html.replace(RSC_PUSH, (script, head, json, tail) => {
    const [kind, payload] = JSON.parse(json) as [number, string];
    const next = payload.replace(PAGE_ROW, "$1");

    if (next === payload) return script;

    dropped = true;
    // Next escapes "<" inside the inline payload, so must we.
    return `${head}${JSON.stringify([kind, next]).replace(/</g, "\\u003c")}${tail}`;
  });

  return { body, dropped };
};

const interruptStream = async (page: Page, times: number) => {
  let interrupted = 0;

  await page.route(DOCUMENT_ROUTE, async (route) => {
    const request = route.request();

    if (request.resourceType() !== "document" || interrupted >= times) {
      await route.continue();
      return;
    }

    // Global fetch rather than route.fetch(): the editor's Next server runs
    // in this process behind the server-side interceptor, which can pass a
    // fetch request through but not Playwright's own HTTP client.
    const response = await fetch(request.url(), {
      headers: await request.allHeaders(),
    });
    const { body, dropped } = dropPageRow(await response.text());

    // Guards the emulation itself: a Next upgrade that changes the inline
    // stream format would otherwise let this spec pass without exercising
    // anything.
    expect(dropped).toBe(true);

    interrupted += 1;
    await route.fulfill({
      status: response.status,
      contentType: response.headers.get("content-type") ?? "text/html",
      body,
    });
  });

  return () => interrupted;
};

const countLoads = (page: Page) => {
  let loads = 0;
  page.on("load", () => {
    loads += 1;
  });
  return () => loads;
};

test.describe("Interrupted RSC stream recovery", () => {
  test.beforeEach(({ serverRequestInterceptor, port }) => {
    serverRequestInterceptor.use(
      filesSettingsHandler(port),
      fileByIdHandler(port, true),
      fillingStatusHandler(port),
      // interruptStream() requests the document from this process.
      editorPagePassthroughHandler("/start-filling"),
    );
  });

  test("reloads once and opens the form instead of the error page", async ({
    page,
    baseUrl,
  }) => {
    const interrupted = await interruptStream(page, 1);
    const loads = countLoads(page);

    await page.goto(`${baseUrl}${PAGE_PATH}`);

    await expect.poll(loads, { timeout: 30_000 }).toBe(2);
    await expect(
      page.getByTestId("completed_form_vdr_container"),
    ).toBeVisible();
    await expect(page.getByText("Something went wrong.")).toBeHidden();

    expect(interrupted()).toBe(1);
  });

  test("shows the error page instead of reloading in a loop", async ({
    page,
    baseUrl,
  }) => {
    await interruptStream(page, Number.POSITIVE_INFINITY);
    const loads = countLoads(page);

    await page.goto(`${baseUrl}${PAGE_PATH}`);

    // One reload per budget window; the second failure is reported.
    await expect(page.getByText("Something went wrong.")).toBeVisible({
      timeout: 30_000,
    });
    await page.waitForTimeout(3_000);
    expect(loads()).toBe(2);
  });
});
