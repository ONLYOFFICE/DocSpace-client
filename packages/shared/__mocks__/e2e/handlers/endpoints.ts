import { headers } from "next/headers";
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

import {
  loginHandler,
  LOGIN_PATH,
  LOGIN_PATH_WITH_PARAMS,
  CONFIRM_PATH,
  confirmHandler,
} from "./authentication";
import { OAUTH_SIGN_IN_PATH, oauthSignInHelper } from "./oauth/signIn";
import {
  SELF_PATH,
  SELF_PATH_ACTIVATION_STATUS,
  SELF_PATH_CHANGE_AUTH_DATA,
  SELF_PATH_UPDATE_USER,
  SELF_PATH_USER_BY_EMAIL,
  selfHandler,
} from "./people";
import {
  COMPLETE_PATH,
  completeHandler,
  LICENCE_PATH,
  licenseHandler,
  TFA_APP_VALIDATE_PATH,
  tfaAppValidateHandler,
} from "./settings";

export type TEndpoint = {
  url: string;
  dataHandler: () => Response;
};

export type TEndpoints = {
  [key: string]: TEndpoint;
};

const BASE_URL = "*/**/api/2.0/";

export const endpoints: TEndpoints = {
  wizardComplete: {
    url: `${BASE_URL}${COMPLETE_PATH}`,
    dataHandler: completeHandler,
  },
  license: {
    url: `${BASE_URL}${LICENCE_PATH}`,
    dataHandler: licenseHandler,
  },
  createUser: {
    url: `${BASE_URL}${SELF_PATH}`,
    dataHandler: selfHandler,
  },
  updateUser: {
    url: `${BASE_URL}${SELF_PATH_UPDATE_USER}`,
    dataHandler: selfHandler,
  },
  changePassword: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfHandler,
  },
  changeEmail: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfHandler,
  },
  changeEmailError: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfHandler.bind(null, 400),
  },
  activationStatus: {
    url: `${BASE_URL}${SELF_PATH_ACTIVATION_STATUS}`,
    dataHandler: selfHandler,
  },
  activationStatusError: {
    url: `${BASE_URL}${SELF_PATH_ACTIVATION_STATUS}`,
    dataHandler: selfHandler.bind(null, 400),
  },
  getUserByEmail: {
    url: `${BASE_URL}${SELF_PATH_USER_BY_EMAIL}`,
    dataHandler: selfHandler,
  },
  checkConfirmLink: {
    url: `${BASE_URL}${CONFIRM_PATH}`,
    dataHandler: confirmHandler,
  },
  login: {
    url: `${BASE_URL}${LOGIN_PATH}`,
    dataHandler: loginHandler,
  },
  loginWithTfaCode: {
    url: `${BASE_URL}${LOGIN_PATH_WITH_PARAMS}`,
    dataHandler: loginHandler,
  },
  tfaAppValidate: {
    url: `${BASE_URL}${TFA_APP_VALIDATE_PATH}`,
    dataHandler: tfaAppValidateHandler,
  },
  tfaAppValidateError: {
    url: `${BASE_URL}${TFA_APP_VALIDATE_PATH}`,
    dataHandler: tfaAppValidateHandler.bind(null, 400),
  },
  logout: {
    url: `${BASE_URL}authentication/logout`,
    dataHandler: () => new Response(JSON.stringify({})),
  },
  oauthSignIn: {
    url: `*/**/${OAUTH_SIGN_IN_PATH}`,
    dataHandler: oauthSignInHelper,
  },
};
