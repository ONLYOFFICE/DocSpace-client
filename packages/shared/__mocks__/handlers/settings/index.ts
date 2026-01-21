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
