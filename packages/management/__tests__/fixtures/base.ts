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
  BASE_URL,
  createNextTestServer,
  createServerRequestInterceptor,
  setupAndResetHandlersServer,
  SetupServer,
  WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";
import { allHandlers } from "@docspace/shared/__mocks__/handlers";
import { test as base, Page } from "@playwright/test";
import path from "path";

export const test = base.extend<
  {
    page: Page;
    clientRequestInterceptor: WorkerFixture;
    resetHandlersServer: void;
  },
  {
    serverRequestInterceptor: SetupServer;
    port: string;
    baseUrl: string;
  }
>({
  page: async ({ page, port }, use) => {
    await page.context().addCookies([
      {
        name: "asc_auth_key",
        value: "test",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.setExtraHTTPHeaders({
      "x-forwarded-host": `localhost:${port}`,
      "x-forwarded-proto": "http",
    });

    await use(page);
  },
  port: [
    async ({}, use) => {
      const { port, server } = await createNextTestServer(
        path.resolve(__dirname, "../../"),
      );
      await use(port);
      server.close();
    },
    {
      scope: "worker",
      auto: true,
    },
  ],
  baseUrl: [
    async ({ port }, use) => {
      await use(`${BASE_URL}:${port}`);
    },
    {
      scope: "worker",
      auto: true,
    },
  ],
  serverRequestInterceptor: [
    async ({}, use) => {
      const requestInterceptor = await createServerRequestInterceptor();
      await use(requestInterceptor);
      requestInterceptor.close();
    },
    {
      scope: "worker",
      auto: true,
    },
  ],
  resetHandlersServer: [
    async ({ serverRequestInterceptor, port }, use) => {
      const resetHandlers = await setupAndResetHandlersServer(
        serverRequestInterceptor,
        port,
      );
      await use();
      resetHandlers();
    },
    {
      auto: true,
    },
  ],
  clientRequestInterceptor: [
    async ({ page, port }, use) => {
      const worker = new WorkerFixture({
        page: page as never,
        initialHandlers: allHandlers(port),
      });

      await worker.start();
      await use(worker);
      // await worker.stop();
    },
    {
      auto: true,
    },
  ],
});

export { expect } from "@playwright/test";
