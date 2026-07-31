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

import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";

export const resetSessionStorage = () => {
  const portalNameFromSessionStorage = getFromSessionStorage("portalName");
  const portalNameDefaultFromSessionStorage =
    getFromSessionStorage("portalNameDefault");
  const greetingTitleFromSessionStorage =
    getFromSessionStorage("greetingTitle");
  const greetingTitleDefaultFromSessionStorage = getFromSessionStorage(
    "greetingTitleDefault",
  );
  const languageFromSessionStorage = getFromSessionStorage("language");
  const languageDefaultFromSessionStorage =
    getFromSessionStorage("languageDefault");
  const timezoneFromSessionStorage = getFromSessionStorage("timezone");
  const timezoneDefaultFromSessionStorage =
    getFromSessionStorage("timezoneDefault");

  const currentPasswordSettings = getFromSessionStorage(
    "currentPasswordSettings",
  );
  const defaultPasswordSettings = getFromSessionStorage(
    "defaultPasswordSettings",
  );
  const currentTfaSettings = getFromSessionStorage("currentTfaSettings");
  const defaultTfaSettings = getFromSessionStorage("defaultTfaSettings");
  const currentTrustedMailSettings = getFromSessionStorage(
    "currentTrustedMailSettings",
  );
  const defaultTrustedMailSettings = getFromSessionStorage(
    "defaultTrustedMailSettings",
  );
  const currentIPSettings = getFromSessionStorage("currentIPSettings");
  const defaultIPSettings = getFromSessionStorage("defaultIPSettings");
  const currentBruteForceProtection = getFromSessionStorage(
    "currentBruteForceProtection",
  );
  const defaultBruteForceProtection = getFromSessionStorage(
    "defaultBruteForceProtection",
  );
  const currentAdminMessageSettings = getFromSessionStorage(
    "currentAdminMessageSettings",
  );
  const defaultAdminMessageSettings = getFromSessionStorage(
    "defaultAdminMessageSettings",
  );
  const currentSessionLifetimeSettings = getFromSessionStorage(
    "currentSessionLifetimeSettings",
  );
  const defaultSessionLifetimeSettings = getFromSessionStorage(
    "defaultSessionLifetimeSettings",
  );
  const storagePeriodSettings = getFromSessionStorage("storagePeriod");
  const defaultStoragePeriodSettings = getFromSessionStorage(
    "defaultStoragePeriod",
  );

  const companySettingsFromSessionStorage =
    getFromSessionStorage("companySettings");
  const defaultCompanySettingsFromSessionStorage = getFromSessionStorage(
    "defaultCompanySettings",
  );
  if (portalNameFromSessionStorage !== portalNameDefaultFromSessionStorage) {
    saveToSessionStorage("portalName", "none");
    saveToSessionStorage("errorValue", null);
  }
  if (
    greetingTitleFromSessionStorage !== greetingTitleDefaultFromSessionStorage
  ) {
    saveToSessionStorage("greetingTitle", "none");
  }
  if (languageFromSessionStorage !== languageDefaultFromSessionStorage) {
    saveToSessionStorage("language", languageDefaultFromSessionStorage);
  }
  if (timezoneFromSessionStorage !== timezoneDefaultFromSessionStorage) {
    saveToSessionStorage("timezone", timezoneDefaultFromSessionStorage);
  }
  if (currentPasswordSettings !== defaultPasswordSettings) {
    saveToSessionStorage("currentPasswordSettings", defaultPasswordSettings);
  }
  if (currentTfaSettings !== defaultTfaSettings) {
    saveToSessionStorage("currentTfaSettings", defaultTfaSettings);
  }
  if (currentTrustedMailSettings !== defaultTrustedMailSettings) {
    saveToSessionStorage(
      "currentTrustedMailSettings",
      defaultTrustedMailSettings,
    );
  }
  if (currentIPSettings !== defaultIPSettings) {
    saveToSessionStorage("currentIPSettings", defaultIPSettings);
  }
  if (currentBruteForceProtection !== defaultBruteForceProtection) {
    saveToSessionStorage(
      "currentBruteForceProtection",
      defaultBruteForceProtection,
    );
  }
  if (currentAdminMessageSettings !== defaultAdminMessageSettings) {
    saveToSessionStorage(
      "currentAdminMessageSettings",
      defaultAdminMessageSettings,
    );
  }
  if (currentSessionLifetimeSettings !== defaultSessionLifetimeSettings) {
    saveToSessionStorage(
      "currentSessionLifetimeSettings",
      defaultSessionLifetimeSettings,
    );
  }
  if (storagePeriodSettings !== defaultStoragePeriodSettings) {
    saveToSessionStorage("storagePeriod", defaultStoragePeriodSettings);
  }

  sessionStorage.removeItem("companyName");

  if (
    companySettingsFromSessionStorage !==
    defaultCompanySettingsFromSessionStorage
  ) {
    saveToSessionStorage(
      "companySettings",
      defaultCompanySettingsFromSessionStorage,
    );
  }
};
