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
  filesSettingsHandler,
  peopleListHandler,
  rootHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  createPortalInvitationLink,
  deletePortalInvitationLink,
  getEmptyPortalInvitationLink,
  getPortalInvitationLink,
  updatePortalInvitationLink,
} from "@docspace/shared/__mocks__/handlers/files/invite";
import { EmployeeType } from "@docspace/shared/enums";

test.describe("Invite", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleListHandler(TEST_PORT),
    );
  });

  test("Create invitation link", async ({ page, mockRequest, baseUrl }) => {
    await page.goto(`${baseUrl}/accounts/people`);

    const plusButton = page.getByTestId("plus-button");
    await expect(plusButton).toBeVisible();

    await plusButton.click();

    const menuItem = page.getByTestId("collaborator");
    await expect(menuItem).toBeVisible();
    mockRequest.use(getEmptyPortalInvitationLink(TEST_PORT, EmployeeType.User));
    await menuItem.click();

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
    await expect(inviteDialog).toBeVisible();

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user_empty-link.png",
    ]);

    const toggle = page.getByTestId("toggle-button-container");
    await expect(toggle).toBeVisible();
    mockRequest.use(createPortalInvitationLink(TEST_PORT, EmployeeType.User));
    await toggle.click();

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user_created-link.png",
    ]);
  });

  test("Delete invitation link", async ({ page, mockRequest, baseUrl }) => {
    await page.goto(`${baseUrl}/accounts/people`);

    const plusButton = page.getByTestId("plus-button");
    await expect(plusButton).toBeVisible();
    await plusButton.click();

    const menuItem = page.getByTestId("collaborator");
    await expect(menuItem).toBeVisible();
    mockRequest.use(getPortalInvitationLink(TEST_PORT, EmployeeType.User));
    await menuItem.click();

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
    await expect(inviteDialog).toBeVisible();

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user.png",
    ]);

    const toggle = page.getByTestId("toggle-button-container");
    await expect(toggle).toBeVisible();
    mockRequest.use(deletePortalInvitationLink(TEST_PORT));
    await toggle.click();
    await page.mouse.move(0, 0);

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user_empty-link.png",
    ]);
  });

  test("Update invitation link", async ({ page, mockRequest, baseUrl }) => {
    await page.goto(`${baseUrl}/accounts/people`);

    const plusButton = page.getByTestId("plus-button");
    await expect(plusButton).toBeVisible();

    await plusButton.click();

    const menuItem = page.getByTestId("collaborator");
    await expect(menuItem).toBeVisible();
    mockRequest.use(getPortalInvitationLink(TEST_PORT, EmployeeType.User));
    await menuItem.click();

    const inviteDialog = page.getByTestId("modal-dialog").filter({ hasNotText: "Synchronization with database" });
    await expect(inviteDialog).toBeVisible();

    await expect(inviteDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user.png",
    ]);

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user-settings.png",
    ]);

    const limitToggle = page.getByTestId("toggle-button-container");
    await expect(limitToggle).toBeVisible();
    await limitToggle.click();

    const maxNumberInput = page.getByTestId("link-settings_users-limit");
    await expect(maxNumberInput).toBeVisible();
    await maxNumberInput.fill("30");

    const saveButton = page.getByTestId("link-settings_modal_save_button");
    await expect(maxNumberInput).toBeVisible();

    mockRequest.use(updatePortalInvitationLink(TEST_PORT, EmployeeType.User));
    saveButton.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user-settings-apply.png",
    ]);
  });

  test("Invitation link expired", async ({ page, mockRequest, baseUrl }) => {
    await page.goto(`${baseUrl}/accounts/people`);

    const plusButton = page.getByTestId("plus-button");
    await expect(plusButton).toBeVisible();

    await plusButton.click();

    const menuItem = page.getByTestId("collaborator");
    await expect(menuItem).toBeVisible();
    mockRequest.use(
      getPortalInvitationLink(TEST_PORT, EmployeeType.User, true),
    );
    await menuItem.click();

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user_expired.png",
    ]);

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user-settings_expired.png",
    ]);
  });

  test("Invitation link users limit", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/accounts/people`);

    const plusButton = page.getByTestId("plus-button");
    await expect(plusButton).toBeVisible();

    await plusButton.click();

    const menuItem = page.getByTestId("collaborator");
    await expect(menuItem).toBeVisible();
    mockRequest.use(
      getPortalInvitationLink(TEST_PORT, EmployeeType.User, false, true),
    );
    await menuItem.click();

    const settingsDialog = page.getByTestId("modal-dialog").last();
    await expect(settingsDialog).toBeVisible();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user_limit.png",
    ]);

    const settingsIcon = page.getByTestId("link-settings_icon");
    await expect(settingsIcon).toBeVisible();
    await settingsIcon.click();

    await expect(settingsDialog).toHaveScreenshot([
      "desktop",
      "portal-invite",
      "invite-user-settings_limit.png",
    ]);
  });
});
