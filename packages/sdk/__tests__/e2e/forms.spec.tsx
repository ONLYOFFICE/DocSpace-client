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

import { describe } from "node:test";

import {
  aiChatStoreHandlers,
  selfHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test } from "./fixtures/base";
import { callSdkMethod, openInSdkHost, readSdkEvents } from "./fixtures/sdkHost";

const path = "/sdk/forms/my-forms";
const roomId = 42;

const seedAuthCookie = (
  page: import("@playwright/test").Page,
  baseUrl: string,
) =>
  page
    .context()
    .addCookies([{ name: "asc_auth_key", value: "e2e-test-token", url: baseUrl }]);

describe("SDK forms mode — AI chat panel", () => {
  test("shows the AI chat button and opens the panel", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...aiChatStoreHandlers(port));
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}?theme=Base&roomId=${roomId}`);

    const chatButton = page.locator("#ai-chat-button");
    await expect(chatButton).toBeVisible();
    await expect(page.locator("#chat-toolbar")).toHaveCount(0);

    await chatButton.click();

    await expect(page.locator(".chat-panel")).toBeVisible();
    await expect(page.locator("#chat-toolbar")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Chat history" }),
    ).toBeVisible();
  });

  test("scopes the chat to the forms room", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...aiChatStoreHandlers(port));
    await seedAuthCookie(page, baseUrl);

    const threadsRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/ai/threads/list") &&
        new URL(request.url()).searchParams.get("entityId") === String(roomId),
    );

    await page.goto(`${baseUrl}${path}?theme=Base&roomId=${roomId}`);

    await threadsRequest;
  });

  test("hides the AI chat button for an anonymous embed", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(selfHandler(port, 404));
    clientRequestInterceptor.use(selfHandler(port, 404));

    await page.goto(`${baseUrl}${path}?theme=Base&roomId=${roomId}`);

    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
    );
    await expect(page.locator("#ai-chat-button")).toHaveCount(0);
  });
});

test.describe("SDK forms mode — frame methods and custom actions", () => {
  const formsRoomId = 5;
  const formName = "ONLYOFFICE Sample Form";
  const framePath = `${path}?theme=Base&locale=en&roomId=${formsRoomId}`;

  const openForms = async (
    page: import("@playwright/test").Page,
    baseUrl: string,
    config: object = {},
  ) => {
    await seedAuthCookie(page, baseUrl);
    return openInSdkHost(page, baseUrl, framePath, {
      mode: "forms",
      id: String(formsRoomId),
      ...config,
    });
  };

  test("answers the list methods and rejects the folder info", async ({
    page,
    baseUrl,
  }) => {
    const frame = await openForms(page, baseUrl);
    await expect(frame.getByText(formName, { exact: true })).toBeVisible();

    const files = (await callSdkMethod(page, "getFiles")) as unknown[];
    const list = (await callSdkMethod(page, "getList")) as unknown[];

    expect(files.length).toBeGreaterThan(0);
    expect(list.length).toBeGreaterThanOrEqual(files.length);
    await expect(callSdkMethod(page, "getFolderInfo")).resolves.toBe(
      "Wrong method for this mode",
    );
  });

  test("shows the custom file action and reports the room as the folder", async ({
    page,
    baseUrl,
  }) => {
    const frame = await openForms(page, baseUrl, {
      customActions: {
        contextMenu: {
          file: [
            { key: "send", label: "Send to CRM" },
            { key: "completed-only", label: "Completed only", section: ["completed-forms"] },
          ],
        },
      },
    });

    await frame.getByText(formName, { exact: true }).click({ button: "right" });

    await expect(frame.locator("#option_sdk-action-send")).toBeVisible();
    await expect(frame.locator("#option_sdk-action-completed-only")).toHaveCount(0);

    await frame.locator("#option_sdk-action-send").click();

    await expect
      .poll(() => readSdkEvents(page, "onCustomAction"))
      .toEqual([
        expect.objectContaining({
          action: "send",
          type: "file",
          folderId: formsRoomId,
        }),
      ]);
  });
});
