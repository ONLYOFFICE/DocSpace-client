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

import { colorThemeHandler } from "./colorTheme";
import { ssoHandler } from "./sso";
import { licenseRequiredHandler } from "./licenseRequired";
import { machineNameHandler } from "./machineName";
import { portalCulturesHandler } from "./portalCultures";
import { portalPasswordSettingsHandler } from "./portalPasswordSettings";
import { portalTimeZoneHandler } from "./portalTimeZones";
import { settingsHandler, TypeSettings } from "./settings";
import { completeHandler } from "./complete";
import { licenseHandler } from "./license";
import { tfaAppHandler } from "./tfaApp";
import { ldapHandler, ldapDefaultHandler, ldapCronHandler } from "./ldap";
import { tfaAppValidateHandler } from "./tfaAppValidate";
import { ownerHandler } from "./owner";
import { invitationSettingsHandler } from "./invitationSettings";
import { companyInfoHandler } from "./companyInfo";
import { buildHandler } from "./build";
import { settingsAdditionalHandler } from "./additional";
import { culturesHandler } from "./cultures";
import {
  webPluginsHandler,
  webPluginsAddHandler,
  webPluginsUpdateHandler,
  webPluginsDeleteHandler,
} from "./webplugins";
import { activeConnectionsHandler } from "./activeconnections";
import { backupStorageHandler } from "./backupStorage";
import { deepLinkHandler } from "./deepLink";
import { encryptionSettingsHandler } from "./encryption";
import { paymentSettingsHandler } from "./paymentSettings";
import { storageRegionsHandler } from "./storageRegions";
import { tfaAppCodesHandler } from "./tfaAppCodes";
import { tfaAppSettingsHandler } from "./tfaAppSettings";
import { thirdPartyBackupHandler } from "./thirdpartyBackup";
import {
  whiteLabelLogosAddHandler,
  whiteLabelLogosIsDefaultHandler,
  whiteLabelLogoTextHandler,
  whiteLabelLogosHandler,
} from "./whitelabel";

export {
  ssoHandler,
  licenseRequiredHandler,
  machineNameHandler,
  portalCulturesHandler,
  portalPasswordSettingsHandler,
  portalTimeZoneHandler,
  settingsHandler,
  completeHandler,
  tfaAppValidateHandler,
  ownerHandler,
  companyInfoHandler,
  invitationSettingsHandler,
  tfaAppHandler,
  colorThemeHandler,
  licenseHandler,
  TypeSettings,
  buildHandler,
  settingsAdditionalHandler,
  culturesHandler,
  webPluginsHandler,
  webPluginsAddHandler,
  webPluginsUpdateHandler,
  webPluginsDeleteHandler,
  ldapHandler,
  ldapDefaultHandler,
  ldapCronHandler,
  activeConnectionsHandler,
  backupStorageHandler,
  deepLinkHandler,
  encryptionSettingsHandler,
  paymentSettingsHandler,
  storageRegionsHandler,
  tfaAppCodesHandler,
  tfaAppSettingsHandler,
  thirdPartyBackupHandler,
  whiteLabelLogosAddHandler,
  whiteLabelLogosIsDefaultHandler,
  whiteLabelLogoTextHandler,
  whiteLabelLogosHandler,
};

export const settingsHandlers = (port: string) => [
  ssoHandler(port),
  portalPasswordSettingsHandler(port),
  portalTimeZoneHandler(port),
  tfaAppHandler(port),
  tfaAppSettingsHandler(port),
  tfaAppValidateHandler(port),
  settingsHandler(port),
  colorThemeHandler(port),
  licenseRequiredHandler(port),
  machineNameHandler(port),
  portalCulturesHandler(port),
  companyInfoHandler(port),
  invitationSettingsHandler(port),
  completeHandler(port),
  licenseHandler(port),
  ownerHandler(port),
  buildHandler(port),
  settingsAdditionalHandler(port),
  culturesHandler(port),
  webPluginsHandler(port),
  webPluginsAddHandler(port),
  webPluginsUpdateHandler(port),
  webPluginsDeleteHandler(port),
  ldapHandler(port),
  ldapDefaultHandler(port),
  ldapCronHandler(port),
  activeConnectionsHandler(port),
  backupStorageHandler(port),
  deepLinkHandler(port),
  encryptionSettingsHandler(port),
  paymentSettingsHandler(port),
  storageRegionsHandler(port),
  tfaAppCodesHandler(port),
  tfaAppSettingsHandler(port),
  thirdPartyBackupHandler(port),
  whiteLabelLogosAddHandler(port),
  whiteLabelLogosIsDefaultHandler(port),
  whiteLabelLogoTextHandler(port),
  whiteLabelLogosHandler(port),
];
