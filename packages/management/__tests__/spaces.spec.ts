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
  colorThemeHandler,
  getPortalApiHandler,
  getPortalHandler,
  registerHandler,
  removePortalHandler,
  setDomainHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";

test.describe("Spaces", () => {
  test.beforeEach(async ({ serverRequestInterceptor, port }) => {
    serverRequestInterceptor.use(colorThemeHandler(port));
  });

  test("should configuration spaces state", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, true));

    await page.goto(`${baseUrl}/management/spaces`);

    await expect(
      page.getByTestId("configuration-spaces-wrapper"),
    ).toBeVisible();
    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-configuration-render.png",
    ]);
  });

  test("should multiple spaces state", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    // Override to return portals with uncompleted tenant
    serverRequestInterceptor.use(
      getPortalHandler(port, false, true),
      settingsHandler(port, TypeSettings.Connected),
    );

    await page.goto(`${baseUrl}/management/spaces`);

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();
    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-multiple-render.png",
    ]);
  });

  test("should create second space", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(
      getPortalHandler(port, false, true),
      registerHandler(port),
      settingsHandler(port, TypeSettings.Connected),
    );

    await page.goto(`${baseUrl}/management/spaces`);

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const createSpaceButton = page.getByTestId("create-new-space");
    await expect(createSpaceButton).toBeVisible();
    await createSpaceButton.click();

    const createPortalInput = page.getByTestId("create-portal-input");
    await expect(createPortalInput).toBeVisible();

    await createPortalInput.fill("test");

    const createPortalButton = page.getByTestId("create-portal-button");
    await expect(createPortalButton).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-create-space-modal.png",
    ]);

    // Override to return portals with uncompleted tenant after creation
    serverRequestInterceptor.use(
      getPortalApiHandler(port, false, true),
      settingsHandler(port, TypeSettings.Connected),
    );

    await createPortalButton.click();

    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-create-space-render.png",
    ]);
  });

  test("should delete second space", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    // Start with uncompleted tenant
    serverRequestInterceptor.use(getPortalHandler(port, false, true));
    serverRequestInterceptor.use(
      removePortalHandler(port),
      settingsHandler(port, TypeSettings.Connected),
    );

    await page.goto(`${baseUrl}/management/spaces`);

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const rows = page.getByTestId("row-container");
    const secondRow = rows.getByTestId("row").nth(1);
    const contextMenuButton = secondRow.locator(".expandButton").first();
    await contextMenuButton.click();
    const deleteContextItem = page.getByTestId("space_delete");
    await deleteContextItem.click();
    const deleteSpaceButton = page.getByTestId("delete-space-button");

    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-delete-space-modal.png",
    ]);

    // Override to return default portals after deletion
    serverRequestInterceptor.use(getPortalApiHandler(port));

    await deleteSpaceButton.click();

    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-delete-space-render.png",
    ]);
  });

  test("should change domain dialog render", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    // Start with uncompleted tenant
    serverRequestInterceptor.use(getPortalHandler(port, false, true));
    serverRequestInterceptor.use(
      setDomainHandler(port),
      settingsHandler(port, TypeSettings.Connected),
    );

    await page.goto(`${baseUrl}/management/spaces`);

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const editDomain = page.getByTestId("edit-domain-button");
    await expect(editDomain).toBeVisible();
    await editDomain.click();

    const changeDomainInput = page.getByTestId("change-domain-input");
    await expect(changeDomainInput).toBeVisible();

    await changeDomainInput.fill("test.com");

    await expectScreenshot(page,[
      "desktop",
      "spaces",
      "spaces-change-domain-modal.png",
    ]);
  });
});
