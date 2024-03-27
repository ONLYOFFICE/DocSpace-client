// (c) Copyright Ascensio System SIA 2009-2024
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

import { Request } from "express";

type WindowI18nType = {
  inLoad: object[];
  loaded: {
    [key: string]: {
      data: {
        [key: string]: string | undefined;
      };
      namespaces?: string;
    };
  };
};

declare global {
  interface Window {
    authCallback?: (profile: string) => {};
    __ASC_INITIAL_LOGIN_STATE__: IInitialState;
    initialI18nStoreASC: IInitialI18nStoreASC;
    initialLanguage: string;
    i18n: WindowI18nType;
    [key: string]: object;
  }

  type MatchType = {
    confirmedEmail?: string;
    message?: string;
    messageKey?: string;
    authError?: string;
  };

  type PasswordHashType = {
    iterations: number;
    salt: string;
    size: number;
  };

  type CaptchaPublicKeyType = string | undefined;

  interface IEmailValid {
    value: string;
    isValid: boolean;
    errors: string[]; // TODO: check type
  }

  interface IPortalSettings {
    culture: string;
    debugInfo: boolean;
    docSpace: boolean;
    enableAdmMess: boolean;
    enabledJoin: boolean;
    greetingSettings: string;
    ownerId: string;
    passwordHash: PasswordHashType;
    personal: boolean;
    tenantAlias: string;
    tenantStatus: number;
    thirdpartyEnable: boolean;
    trustedDomainsType: number;
    utcHoursOffset: number;
    utcOffset: string;
    version: string;
    standalone: boolean;
    trustedDomains: string[];
    recaptchaPublicKey: CaptchaPublicKeyType;
  }

  interface IBuildInfo {
    communityServer: string;
    documentServer: string;
    mailServer: string;
  }

  interface IProvider {
    linked: boolean;
    provider: string;
    url: string;
  }
  type ProvidersType = IProvider[] | undefined;

  interface ICapabilities {
    ldapEnabled: boolean;
    providers: string[];
    ssoLabel: string;
    ssoUrl: string;
  }

  type TThemeObj = {
    accent: string;
    buttons: string;
  };

  interface ITheme {
    id: number;
    main: TThemeObj;
    text: TThemeObj;
    name: string;
  }
  interface IThemes {
    limit: number;
    selected: number;
    themes: ITheme[];
  }

  interface IError {
    status: number;
    standalone: boolean;
    message: string | undefined;
  }

  interface ISSOSettings {
    hideAuthPage: boolean;
  }

  interface IInitialState {
    portalSettings?: IPortalSettings;
    buildInfo?: IBuildInfo;
    providers?: ProvidersType;
    capabilities?: ICapabilities;
    match?: MatchType;
    currentColorScheme?: ITheme;
    ssoSettings?: ISSOSettings;
    logoUrls: ILogoUrl[];
    error?: IError;
  }

  interface DevRequest {
    assets: assetsType;
  }
  var IS_DEVELOPMENT: boolean;
  var PORT: number;
  var IS_PERSONAL: boolean;
  var IS_ROOMS_MODE: boolean;
  var BROWSER_DETECTOR_URL: string;
  var CONFIG_URL: string;

  type assetsType = { [key: string]: string } | undefined;

  interface IInitialI18nStoreASC extends Object {
    en: {
      [Common: string]: { [key: any]: string };
      [Login: string]: { [key: any]: string };
    };
    [key: string]: {
      [Common: string]: { [key: any]: string };
      [Login: string]: { [key: any]: string };
    };
  }

  type HTMLElementEvent<T extends HTMLElement> = Event & {
    target: T;
  };

  type TFuncType = (key: string) => string;

  interface IParsedConfig extends Object {
    PORT: number;
  }
  interface ILoginRequest extends Request {
    i18n?: I18next;
    t?: TFuncType;
  }
  type timeoutType = ReturnType<typeof setTimeout>;
  interface IAcceptLanguage {
    code?: string;
    quality?: number;
  }

  interface IUserTheme {
    [key: string]: string;
    isBase: boolean;
  }

  type TLogoPath = {
    light: string;
    dark?: string;
  };

  type TLogoSize = {
    width: number;
    height: number;
    isEmpty: boolean;
  };

  interface ILogoUrl {
    name: string;
    path: TLogoPath;
    size: TLogoSize;
  }
}
