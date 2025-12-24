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

import { endpoints, HEADER_LIST_THIRD_PARTY_PROVIDERS } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("Profile", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.selfEmailActivatedClient,
      endpoints.tariff,
      endpoints.quota,
      endpoints.additionalSettings,
      endpoints.getPortal,
      endpoints.companyInfo,
      endpoints.cultures,
      endpoints.root,
      endpoints.invitationSettings,
      endpoints.filesSettings,
      endpoints.webPlugins,
      endpoints.thirdPartyProvider,
      endpoints.tfaAppSettings,
      endpoints.activeConnections,
      endpoints.thirdPartyCapabilities,
      endpoints.docService,
      endpoints.thirdParty
    ]);
  });

  test("should navigate to profile", async ({ page }) => {
    await page.goto("/profile/login");

    const mainProfile = page.getByTestId("main-profile");
    await expect(mainProfile).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile.png",
    ]);
  });

   test("should change language", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.updateUserCultureFr]);

    await page.goto("/profile/login");

    const mainProfile = page.getByTestId("main-profile");
    await expect(mainProfile).toBeVisible();

    const languageComboBox = page.getByTestId("language_combo_box").first();
    await expect(languageComboBox).toBeVisible();
    await languageComboBox.click();

    const language = page.getByTestId("drop_down_item_fr").first();
    await language.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-fr.png",
    ]);
  });


   test("should navigate to profile with social networks", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders(endpoints.thirdPartyProvider.url, [
      HEADER_LIST_THIRD_PARTY_PROVIDERS,
    ]);

    await page.goto("/profile/login");

    const socialNetworks = page.getByTestId("profile-social-networks");
    await expect(socialNetworks).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-social-networks.png",
    ]);
  });

   test("should navigate to profile with tfa", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.tfaAppSettingsEnabled, endpoints.tfaAppCodes]);

    await page.goto("/profile/login");

    const tfa = page.getByTestId("profile-tfa");
    await expect(tfa).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-tfa.png",
    ]);
  });

   test("should show backup codes dialog", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.tfaAppSettingsEnabled, endpoints.tfaAppCodes]);

    await page.goto("/profile/login");

    const tfa = page.getByTestId("profile-tfa");
    await expect(tfa).toBeVisible();

    const backupCodesButton = page.getByTestId("show_backup_codes_button");
    await expect(backupCodesButton).toBeVisible();
    await backupCodesButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-backup-codes-dialog.png",
    ]);
  });

   test("should show reset application dialog", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.tfaAppSettingsEnabled, endpoints.tfaAppCodes]);

    await page.goto("/profile/login");

    const tfa = page.getByTestId("profile-tfa");
    await expect(tfa).toBeVisible();

    const resetAppButton = page.getByTestId("reset_app_link");
    await expect(resetAppButton).toBeVisible();
    await resetAppButton.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-reset-app-dialog.png",
    ]);
  });

   test("should navigate to profile notifications tab", async ({ page, mockRequest }) => {
    await mockRequest.router([
        endpoints.notifications0, 
        endpoints.notifications1, 
        endpoints.notifications2, 
        endpoints.notifications3,
        endpoints.notificationChannels,
        endpoints.notificationTelegramCheck
    ]);

    await page.goto("/profile/notifications");

    const notifications = page.getByTestId("profile-notifications");
    await expect(notifications).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-notifications.png",
    ]);
  });

   test("should navigate to profile notifications tab with telegram configured", async ({ page, mockRequest }) => {
    await mockRequest.router([
        endpoints.notifications0, 
        endpoints.notifications1, 
        endpoints.notifications2, 
        endpoints.notifications3,
        endpoints.notificationChannelsWithTelegram,
        endpoints.notificationTelegramCheck
    ]);

    await page.goto("/profile/notifications");

    const notifications = page.getByTestId("profile-notifications");
    await expect(notifications).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-notifications-telegram-configured.png",
    ]);
  });

   test("should navigate to profile notifications tab with telegram connect dialog", async ({ page, mockRequest }) => {
    await mockRequest.router([
        endpoints.notifications0, 
        endpoints.notifications1, 
        endpoints.notifications2, 
        endpoints.notifications3,
        endpoints.notificationChannelsWithTelegram,
        endpoints.notificationTelegramCheck,
        endpoints.notificationTelegramLink
    ]);

    await page.goto("/profile/notifications");

    const notifications = page.getByTestId("profile-notifications");
    await expect(notifications).toBeVisible();

    const telegramConnect = page.getByTestId("profile-telegram-connect");
    await expect(telegramConnect).toBeVisible();
    await telegramConnect.click();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-notifications-telegram-connect-dialog.png",
    ]);
  });

   test("should navigate to profile notifications tab with telegram connected", async ({ page, mockRequest }) => {
    await mockRequest.router([
        endpoints.notifications0, 
        endpoints.notifications1, 
        endpoints.notifications2, 
        endpoints.notifications3,
        endpoints.notificationChannelsWithTelegram,
        endpoints.notificationTelegramCheckLinked,
    ]);

    await page.goto("/profile/notifications");

    const notifications = page.getByTestId("profile-notifications");
    await expect(notifications).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-notifications-telegram-connected.png",
    ]);
  });

   test("should navigate to profile file management tab", async ({ page }) => {
    await page.goto("/profile/file-management");

    const fileManagement = page.getByTestId("profile-file-management");
    await expect(fileManagement).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-file-management.png",
    ]);
  });

   test("should navigate to profile interface theme tab", async ({ page }) => {
    await page.goto("/profile/interface-theme");

    const interfaceTheme = page.getByTestId("profile-interface-theme");
    await expect(interfaceTheme).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-interface-theme.png",
    ]);
  });

   test("should change interface theme to dark", async ({ page, mockRequest }) => {
    await mockRequest.router([endpoints.theme]);

    await page.goto("/profile/interface-theme");

    const interfaceTheme = page.getByTestId("profile-interface-theme");
    await expect(interfaceTheme).toBeVisible();

    const darkThemeButton = page.getByTestId("theme_Dark_radio_button");
    await expect(darkThemeButton).toBeVisible();
    await darkThemeButton.click();

    await page.route("*/**/logo.ashx**", async (route) => {
      await route.fulfill({
        path: `../../public/images/logo/dark_loginpage.svg`,
      });
    });

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-interface-theme-dark.png",
    ]);
  });

   test("should navigate to profile authorized apps tab with empty clients", async ({ page, mockRequest }) => {    
    await mockRequest.router([
        endpoints.oauthToken,
        endpoints.oauthScopes,
        endpoints.oauthEmptyClients,
    ]);

    await page.goto("/profile/authorized-apps");

    const authorizedApps = page.getByTestId("profile-authorized-apps");
    await expect(authorizedApps).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-authorized-apps-empty.png",
    ]);
  });

   test("should navigate to profile authorized apps tab", async ({ page, mockRequest }) => {
    await mockRequest.router([
        endpoints.oauthToken,
        endpoints.oauthScopes,
        endpoints.oauthClients,
    ]);

    await page.goto("/profile/authorized-apps");

    const authorizedApps = page.getByTestId("profile-authorized-apps");
    await expect(authorizedApps).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "profile",
      "profile-authorized-apps.png",
    ]);
  });
});
