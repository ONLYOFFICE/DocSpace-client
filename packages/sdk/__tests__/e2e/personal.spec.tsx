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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";
import { callSdkMethod, openInSdkHost, readSdkEvents } from "./fixtures/sdkHost";

const framePath = "/sdk/personal-files/my-documents?theme=Base&locale=en";
const docxTitle = "ONLYOFFICE Sample Document.docx";
const docxName = "ONLYOFFICE Sample Document";
const pngName = "screenshot";

const LIST_VIEW_KEYS = ["icon", "href", "contextOptions", "previewUrl", "docUrl"];

const customActions = {
  contextMenu: {
    file: [
      { key: "send", label: "Send to CRM", extensions: ["docx"] },
      { key: "archive", label: "Archive in CRM" },
    ],
    folder: [{ key: "link-folder", label: "Link folder to CRM" }],
  },
  createMenu: [{ key: "upload-from-crm", label: "Upload from CRM" }],
};

const seedAuthCookie = (page: Page, baseUrl: string) =>
  page
    .context()
    .addCookies([{ name: "asc_auth_key", value: "e2e-test-token", url: baseUrl }]);

const openPersonal = async (
  page: Page,
  baseUrl: string,
  config: object = {},
) => {
  await seedAuthCookie(page, baseUrl);
  return openInSdkHost(page, baseUrl, framePath, {
    mode: "personal",
    ...config,
  });
};

test.describe("SDK Personal mode — frame methods", () => {
  test("answers the data methods with the list entities", async ({
    page,
    baseUrl,
  }) => {
    const frame = await openPersonal(page, baseUrl);
    await expect(frame.getByText(docxName, { exact: true })).toBeVisible();

    const folder = (await callSdkMethod(page, "getFolderInfo")) as {
      id?: number;
    };
    const files = (await callSdkMethod(page, "getFiles")) as Record<
      string,
      unknown
    >[];
    const list = (await callSdkMethod(page, "getList")) as unknown[];

    expect(folder.id).toBeDefined();
    expect(files.map((file) => file.title)).toContain(docxTitle);
    expect(list.length).toBeGreaterThanOrEqual(files.length);
    for (const file of files) {
      for (const key of LIST_VIEW_KEYS) expect(file).not.toHaveProperty(key);
    }
  });

  test("answers a Manager-only method with the wrong-mode reply", async ({
    page,
    baseUrl,
  }) => {
    await openPersonal(page, baseUrl);

    await expect(callSdkMethod(page, "getRooms")).resolves.toBe(
      "Wrong method for this mode",
    );
  });
});

test.describe("SDK Personal mode — custom actions", () => {
  test("shows file actions by extension and reports the clicked one", async ({
    page,
    baseUrl,
  }) => {
    const frame = await openPersonal(page, baseUrl, { customActions });

    await frame.getByText(pngName, { exact: true }).click({ button: "right" });
    await expect(frame.locator("#option_sdk-action-archive")).toBeVisible();
    await expect(frame.locator("#option_sdk-action-send")).toHaveCount(0);
    await page.keyboard.press("Escape");

    await frame.getByText(docxName, { exact: true }).click({ button: "right" });
    await frame.locator("#option_sdk-action-send").click();

    await expect
      .poll(() => readSdkEvents(page, "onCustomAction"))
      .toEqual([
        expect.objectContaining({
          action: "send",
          type: "file",
          item: expect.objectContaining({ title: docxTitle }),
          items: [expect.objectContaining({ title: docxTitle })],
        }),
      ]);
  });

  test("adds create menu items to the New button", async ({ page, baseUrl }) => {
    const frame = await openPersonal(page, baseUrl, { customActions });

    await frame.getByText("New", { exact: true }).click();
    await frame.getByText("Upload from CRM").click();

    await expect
      .poll(() => readSdkEvents(page, "onCustomAction"))
      .toEqual([
        expect.objectContaining({ action: "upload-from-crm", type: "create" }),
      ]);
  });

  test("replaces the items with setCustomActions", async ({ page, baseUrl }) => {
    const frame = await openPersonal(page, baseUrl, { customActions });

    await callSdkMethod(page, "setCustomActions", {
      contextMenu: { file: [{ key: "replaced", label: "Replaced action" }] },
    });

    await frame.getByText(docxName, { exact: true }).click({ button: "right" });
    await expect(frame.locator("#option_sdk-action-replaced")).toBeVisible();
    await expect(frame.locator("#option_sdk-action-send")).toHaveCount(0);
  });

  test("renders the custom actions in the file context menu", async ({
    page,
    baseUrl,
  }) => {
    const frame = await openPersonal(page, baseUrl, { customActions });

    await frame.getByText(docxName, { exact: true }).click({ button: "right" });
    await expect(frame.locator("#option_sdk-action-send")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "personal",
      "personal-file-context-menu-custom-actions.png",
    ]);
  });
});
