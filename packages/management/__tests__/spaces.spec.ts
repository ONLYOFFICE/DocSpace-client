// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import {
  endpoints,
  HEADER_EMPTY_PORTAL,
  HEADER_UNCOMPLETED_TENANT,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("Spaces", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([endpoints.colorTheme]);
  });

  test("should configuration spaces state", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [HEADER_EMPTY_PORTAL]);

    await page.goto("/management/spaces");

    await expect(
      page.getByTestId("configuration-spaces-wrapper"),
    ).toBeVisible();
    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-configuration-render.png",
    ]);
  });

  test("should multiple spaces state", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [
      HEADER_UNCOMPLETED_TENANT,
    ]);

    await page.goto("/management/spaces");

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();
    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-multiple-render.png",
    ]);
  });

  test("should create second space", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.registerPortal]);

    await page.goto("/management/spaces");

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const createSpaceButton = page.getByTestId("create-new-space");
    await expect(createSpaceButton).toBeVisible();
    await createSpaceButton.click();

    const createPortalInput = page.getByTestId("create-portal-input");
    await expect(createPortalInput).toBeVisible();

    await createPortalInput.fill("test");

    const createPortalButton = page.getByTestId("create-portal-button");
    await expect(createPortalButton).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-create-space-modal.png",
    ]);

    await mockRequest.setHeaders("**/management/spaces**", [
      HEADER_UNCOMPLETED_TENANT,
    ]);

    await createPortalButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-create-space-render.png",
    ]);
  });

  test("should delete second space", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [
      HEADER_UNCOMPLETED_TENANT,
    ]);
    await mockRequest.router([endpoints.removePortal]);

    await page.goto("/management/spaces");

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const rows = page.getByTestId("row-container");
    const secondRow = rows.getByTestId("row").nth(1);
    const contextMenuButton = secondRow.locator(".expandButton").first();
    await contextMenuButton.click();
    const deleteContextItem = page.getByTestId("space_delete");
    await deleteContextItem.click();
    const deleteSpaceButton = page.getByTestId("delete-space-button");

    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-delete-space-modal.png",
    ]);

    await mockRequest.setHeaders("**/management/spaces**", []);

    await deleteSpaceButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-delete-space-render.png",
    ]);
  });

  test("should change domain dialog render", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("/management/spaces", [
      HEADER_UNCOMPLETED_TENANT,
    ]); 
    await mockRequest.router([endpoints.setDomain]);

    await page.goto("/management/spaces");

    await expect(page.getByTestId("multiple-spaces-wrapper")).toBeVisible();

    const editDomain = page.getByTestId("edit-domain-button");
    await expect(editDomain).toBeVisible();
    await editDomain.click();

    const changeDomainInput = page.getByTestId("change-domain-input");
    await expect(changeDomainInput).toBeVisible();

    await changeDomainInput.fill("test.com");

    await expect(page).toHaveScreenshot([
      "desktop",
      "spaces",
      "spaces-change-domain-modal.png",
    ]);
  });
});
