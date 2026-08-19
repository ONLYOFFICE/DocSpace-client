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
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test } from "./fixtures/base";

// A deleted portal answers 404 to /settings, so the login app must send the
// visitor to the "wrong portal name" site. The stale auth cookie survives the
// deletion (POST /authentication/logout also 404s on a deleted portal), which
// used to bounce /login back to the portal root and spin up a reload loop.
const AUTH_COOKIE = "asc_auth_key";
const WRONG_PORTAL_NAME_URL = "https://www.onlyoffice.com/wrongportalname.aspx";

const setStaleAuthCookie = (page: Page) =>
  page.context().addCookies([
    {
      name: AUTH_COOKIE,
      value: "stale-session-of-a-deleted-portal",
      domain: "localhost",
      path: "/",
    },
  ]);

// nginx puts the portal behind these; without them the middleware cannot build
// the portal root URL it redirects authenticated visitors to. Sent from the
// browser rather than through page.request, because the MSW interceptor of the
// test process refuses to bypass Playwright's own API requests.
const useProxyHeaders = (page: Page, port: string) =>
  page.setExtraHTTPHeaders({
    "x-forwarded-host": `localhost:${port}`,
    "x-forwarded-proto": "http",
  });

const stubWrongPortalNameSite = (page: Page) =>
  page.route(`${WRONG_PORTAL_NAME_URL}*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>Wrong portal name</h1></body></html>",
    }),
  );

test("portal not found redirects to the wrong portal name site", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.PortalNotFound),
  );

  await useProxyHeaders(page, port);
  await stubWrongPortalNameSite(page);

  await page.goto(`${baseUrl}/login`);

  await page.waitForURL(`${WRONG_PORTAL_NAME_URL}*`);

  await expect(
    page.getByRole("heading", { name: "Wrong portal name" }),
  ).toBeVisible();
});

test("portal not found does not bounce a stale session back to the portal root", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.PortalNotFound),
  );

  await useProxyHeaders(page, port);
  await stubWrongPortalNameSite(page);

  await setStaleAuthCookie(page);

  // The portal root is the client app in production, and it answers a dead
  // session with another trip to /login — so a single hop back there is the
  // whole loop. Only the hops themselves reveal it: this test server has no
  // client app to bounce off, and its 404 page renders the same root layout
  // that ends up on the wrong-portal-name site anyway.
  const documentUrls: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") documentUrls.push(request.url());
  });

  // The client app sends the visitor here precisely because the session is
  // dead; bouncing them back to the portal root is what closed the loop.
  await page.goto(`${baseUrl}/login?authError=true`);

  await page.waitForURL(`${WRONG_PORTAL_NAME_URL}*`);

  expect(documentUrls).not.toContain(`${baseUrl}/`);

  await expect(
    page.getByRole("heading", { name: "Wrong portal name" }),
  ).toBeVisible();
});

test("authenticated visitor of a live portal is still redirected to the portal root", async ({
  page,
  port,
  baseUrl,
}) => {
  await useProxyHeaders(page, port);
  await setStaleAuthCookie(page);

  await page.goto(`${baseUrl}/login`);

  expect(page.url()).toBe(`${baseUrl}/`);
});
