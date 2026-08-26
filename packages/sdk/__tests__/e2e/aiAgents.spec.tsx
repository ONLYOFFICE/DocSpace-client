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
  aiAgentGetByIdHandler,
  aiAgentsHandler,
  aiChatStoreHandlers,
  selfHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test } from "./fixtures/base";

const path = "/sdk/ai-agents";
const agentId = 251365;

type FrameMessagesWindow = Window & { __frameMessages?: string[] };

const collectFrameMessages = `
  window.__frameMessages = [];
  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") window.__frameMessages.push(e.data);
  });
`;

const readFrameMessages = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => (window as FrameMessagesWindow).__frameMessages ?? [],
  );

const seedAuthCookie = (
  page: import("@playwright/test").Page,
  baseUrl: string,
) =>
  page
    .context()
    .addCookies([{ name: "asc_auth_key", value: "e2e-test-token", url: baseUrl }]);

const agentRoomHandlers = (port: string) => [
  aiAgentsHandler(port, { withListCreate: true }),
  aiAgentGetByIdHandler(port),
  ...aiChatStoreHandlers(port),
];

describe("SDK ai-agents mode", () => {
  test("renders the agents list and emits the frame events", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(
      aiAgentsHandler(port, { withListCreate: true }),
    );
    clientRequestInterceptor.use(...agentRoomHandlers(port));
    await seedAuthCookie(page, baseUrl);
    await page.addInitScript(collectFrameMessages);

    await page.goto(`${baseUrl}${path}?theme=Base`);

    await expect(page.getByText("AI agent", { exact: true })).toBeVisible();

    await expect
      .poll(() => readFrameMessages(page))
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining('"event":"onAppReady"'),
          expect.stringContaining('"commandName":"setIsLoaded"'),
        ]),
      );
  });

  test("renders the agent room with the chat toolbar and header menu", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...agentRoomHandlers(port));
    await seedAuthCookie(page, baseUrl);

    await page.goto(`${baseUrl}${path}/${agentId}?theme=Base&tab=chat`);

    await expect(page.locator("#chat-toolbar")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Chat history" }),
    ).toBeVisible();
    await expect(page.locator("#header_optional-button")).toBeVisible();
  });

  test("reports tab changes through onNavigate", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    port,
  }) => {
    clientRequestInterceptor.use(...agentRoomHandlers(port));
    await seedAuthCookie(page, baseUrl);
    await page.addInitScript(collectFrameMessages);

    await page.goto(`${baseUrl}${path}/${agentId}?theme=Base&tab=chat`);
    await expect(page.locator("#chat-toolbar")).toBeVisible();

    await page.getByText("Knowledge base", { exact: true }).click();

    await expect
      .poll(() => readFrameMessages(page))
      .toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            /"event":"onNavigate".*"section":"knowledge"/s,
          ),
        ]),
      );
    await expect(page.locator("#chat-toolbar")).toHaveCount(0);
  });

  test("shows the no-access screen for an anonymous embed", async ({
    page,
    baseUrl,
    clientRequestInterceptor,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(selfHandler(port, 404));
    clientRequestInterceptor.use(
      selfHandler(port, 404),
      aiAgentGetByIdHandler(port),
    );

    await page.goto(`${baseUrl}${path}/${agentId}?theme=Base&tab=chat`);

    await expect(page.locator("#chat-toolbar")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
    );
  });
});
