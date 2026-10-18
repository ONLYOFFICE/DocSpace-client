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
  appsHandler,
  type AppsHandlerOptions,
  roomListHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * Apps switched off in Settings -> Apps (standalone only).
 *
 * Every Rooms / Forms / AI Agents route waits for `GET apps` on a standalone
 * portal before deciding whether to let the visitor in, since the client's
 * answer is optimistic until the list arrives. Two ways that wait went wrong:
 *
 * - a failed `GET apps` was never retried and never ended the wait, so the
 *   whole Rooms section stayed blank until a reload;
 * - Settings -> Apps showed every switch "on" before the list arrived and let
 *   the administrator flip that guess.
 *
 * Assertions are functional only, so this holds on a local run as well as in
 * Docker.
 */

const ROOMS_URL = "/rooms/shared/filter";
const APPS_SETTINGS_URL = "/portal-settings/apps";

const pathnameOf = (page: Page) => new URL(page.url()).pathname;

const toggleInput = (page: Page, appId: string) =>
  page
    .getByTestId(`settings-app-toggle-${appId}`)
    .getByTestId("toggle-button-input");

const useStandalone = (
  mockRequest: WorkerFixture,
  apps: AppsHandlerOptions = {},
) => {
  mockRequest.use(
    settingsHandler(TEST_PORT, TypeSettings.Authenticated),
    selfByTypeHandler(TEST_PORT, "owner"),
    appsHandler(TEST_PORT, apps),
    // A non-empty list, so the section is told apart from a blank page by its
    // table rather than by the empty view's copy.
    roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
  );
};

test.describe("Standalone portal: app routes", () => {
  test("Rooms open with every app switched on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest);

    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(page.getByTestId("table-body")).toBeVisible();
    expect(pathnameOf(page)).toBe(ROOMS_URL);
  });

  test("Rooms redirect to the dashboard once switched off", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest, { disabled: ["ai-rooms"] });

    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect
      .poll(() => pathnameOf(page), {
        message: "a switched-off Rooms section stayed reachable by URL",
      })
      .toBe("/dashboard");
  });

  test("Rooms still open when the apps list fails to load", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest, { errorStatus: 500 });

    await page.goto(`${baseUrl}${ROOMS_URL}`);

    // The route used to wait for a list that never came and render nothing.
    // With the list unavailable it has to fall back to the optimistic answer.
    await expect(
      page.getByTestId("table-body"),
      "the Rooms section stayed blank after GET apps failed; ProtectedAppRoute " +
        "must stop waiting on `appsStore.isLoadFailed`",
    ).toBeVisible();
    expect(pathnameOf(page)).toBe(ROOMS_URL);
  });
});

test.describe("Standalone portal: Settings -> Apps", () => {
  test("switches are locked until the apps list arrives", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest, { pending: true });

    await page.goto(`${baseUrl}${APPS_SETTINGS_URL}`);

    const rooms = toggleInput(page, "ai-rooms");
    await expect(rooms).toBeAttached();
    // The switch shows the optimistic "on" while the list is pending; flipping
    // it would act on a guess, so it must not be enabled.
    await expect(rooms).toBeDisabled();
    await page.waitForTimeout(1000);
    await expect(rooms).toBeDisabled();
  });

  test("switches stay locked when the apps list fails to load", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest, { errorStatus: 500 });

    await page.goto(`${baseUrl}${APPS_SETTINGS_URL}`);

    const rooms = toggleInput(page, "ai-rooms");
    await expect(rooms).toBeAttached();
    await page.waitForLoadState("networkidle");
    await expect(rooms).toBeDisabled();
  });

  test("switches show the real state once the list arrives", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useStandalone(mockRequest, { disabled: ["ai-rooms"] });

    await page.goto(`${baseUrl}${APPS_SETTINGS_URL}`);

    const rooms = toggleInput(page, "ai-rooms");
    await expect(rooms).toBeEnabled();
    await expect(rooms).not.toBeChecked();

    const forms = toggleInput(page, "ai-forms");
    await expect(forms).toBeEnabled();
    await expect(forms).toBeChecked();

    // Files is the core of the portal and can never be switched off.
    const files = toggleInput(page, "ai-files");
    await expect(files).toBeChecked();
    await expect(files).toBeDisabled();
  });
});
