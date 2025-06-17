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
  colorThemeHandler,
  colorThemeResolver,
  getSuccessColorTheme,
  PATH as COLOR_THEME_PATH,
} from "./colorTheme";
import { ssoHandler, ssoResolver, emptySSO, PATH as SSO_PATH } from "./sso";
import {
  licenseRequiredHandler,
  licenseRequiredResolver,
  licenseNotRequiredSuccess,
  licenseRequiredSuccess,
  PATH as LICENSE_REQUIRED_PATH,
} from "./licenseRequired";
import {
  machineNameHandler,
  machineNameResolver,
  machineNameSuccess,
  PATH as MACHINE_NAME_PATH,
} from "./machineName";
import {
  portalCulturesHandler,
  portalCulturesResolver,
  portalCulturesSuccess,
  PATH as PORTAL_CULTURES_PATH,
} from "./portalCultures";

import {
  portalPasswordSettingsHandler,
  portalPasswordSettingsResolver,
  portalPasswordSettingsSuccess,
  PATH as PASSWORD_SETTINGS_PATH,
} from "./portalPasswordSettings";
import {
  portalTimeZoneHandler,
  portalTimeZoneResolver,
  portalTimeZonesSuccess,
  PATH as TIME_ZONES_PATH,
} from "./portalTimeZones";
import {
  settingsHandler,
  settingsResolver,
  settingsWizzard,
  settingsAuth,
  settingsNoAuth,
  PATH as SETTINGS_PATH,
} from "./settings";

import {
  completeHandler,
  completeResolver,
  completeSuccess,
  PATH as COMPLETE_PATH,
} from "./complete";
import {
  licenseHandler,
  licenseResolver,
  licenseSuccess,
  PATH as LICENCE_PATH,
} from "./license";

import {
  tfaAppHandler,
  tfaAppResolver,
  tfaAppSuccess,
  PATH as TFA_APP_PATH,
} from "./tfaApp";
import {
  tfaAppValidateHandler,
  tfaAppValidateResolver,
  tfaAppValidateSuccess,
  PATH as TFA_APP_VALIDATE_PATH,
} from "./tfaAppValidate";

import {
  ownerHandler,
  ownerResolver,
  ownerSuccess,
  PATH as OWNER_PATH,
} from "./owner";

import {
  companyInfoResolver,
  companyInfoHandler,
  companyInfoSuccess,
  PATH as COMPANY_INFO_PATH,
} from "./companyInfo";

import {
  invitationSettingsHandler,
  invitationSettingsResolver,
  invitationSettingsSuccess,
  PATH as INVITATION_SETTINGS_PATH,
} from "./invitationSettings";

export {
  colorThemeHandler,
  colorThemeResolver,
  getSuccessColorTheme,
  COLOR_THEME_PATH,
  ssoHandler,
  ssoResolver,
  emptySSO,
  SSO_PATH,
  licenseRequiredHandler,
  licenseRequiredResolver,
  licenseNotRequiredSuccess,
  licenseRequiredSuccess,
  LICENSE_REQUIRED_PATH,
  machineNameHandler,
  machineNameResolver,
  machineNameSuccess,
  MACHINE_NAME_PATH,
  portalCulturesHandler,
  portalCulturesResolver,
  portalCulturesSuccess,
  PORTAL_CULTURES_PATH,
  portalPasswordSettingsHandler,
  portalPasswordSettingsResolver,
  portalPasswordSettingsSuccess,
  PASSWORD_SETTINGS_PATH,
  portalTimeZoneHandler,
  portalTimeZoneResolver,
  portalTimeZonesSuccess,
  TIME_ZONES_PATH,
  settingsHandler,
  settingsResolver,
  settingsWizzard,
  settingsAuth,
  settingsNoAuth,
  SETTINGS_PATH,
  completeHandler,
  completeSuccess,
  COMPLETE_PATH,
  licenseHandler,
  licenseSuccess,
  LICENCE_PATH,
  tfaAppHandler,
  tfaAppResolver,
  tfaAppSuccess,
  TFA_APP_PATH,
  tfaAppValidateHandler,
  tfaAppValidateResolver,
  tfaAppValidateSuccess,
  TFA_APP_VALIDATE_PATH,
  ownerHandler,
  ownerSuccess,
  OWNER_PATH,
  companyInfoHandler,
  companyInfoSuccess,
  COMPANY_INFO_PATH,
  invitationSettingsHandler,
  invitationSettingsSuccess,
  INVITATION_SETTINGS_PATH,
  completeResolver,
  licenseResolver,
  ownerResolver,
};

export const settingsHandlers = (port: string) => [
  ssoHandler(port),
  portalPasswordSettingsHandler(port),
  portalTimeZoneHandler(port),
  tfaAppHandler(port),
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
];
