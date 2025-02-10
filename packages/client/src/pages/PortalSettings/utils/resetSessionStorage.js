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

  const selectColorId = getFromSessionStorage("selectColorId");
  const defaultColorId = getFromSessionStorage("defaultColorId");
  const selectColorAccent = getFromSessionStorage("selectColorAccent");
  const defaultColorAccent = getFromSessionStorage("defaultColorAccent");

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
  const additionalSettings = getFromSessionStorage("additionalSettings");
  const defaultAdditionalSettings = getFromSessionStorage(
    "defaultAdditionalSettings",
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
  if (additionalSettings !== defaultAdditionalSettings) {
    saveToSessionStorage("additionalSettings", defaultAdditionalSettings);
  }
  if (selectColorId !== defaultColorId) {
    saveToSessionStorage("selectColorId", defaultColorId);
  }
  if (selectColorAccent !== defaultColorAccent) {
    saveToSessionStorage("selectColorAccent", defaultColorAccent);
  }
};
