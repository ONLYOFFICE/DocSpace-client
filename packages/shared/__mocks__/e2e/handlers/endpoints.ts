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
  LOGIN_PATH,
  LOGIN_PATH_WITH_PARAMS,
  CONFIRM_PATH,
  loginResolver,
  confirmResolver,
} from "./authentication";
import { OAUTH_SIGN_IN_PATH, oauthSignInResolver } from "./oauth/signIn";
import {
  SELF_PATH,
  SELF_PATH_ACTIVATION_STATUS,
  SELF_PATH_CHANGE_AUTH_DATA,
  SELF_PATH_DELETE_USER,
  SELF_PATH_UPDATE_USER,
  SELF_PATH_USER_BY_EMAIL,
  PATH_ADD_GUEST,
  selfResolver,
} from "./people";
import {
  COMPLETE_PATH,
  completeResolver,
  LICENCE_PATH,
  licenseResolver,
  OWNER_PATH,
  ownerResolver,
  TFA_APP_VALIDATE_PATH,
  tfaAppValidateResolver,
} from "./settings";
import {
  CONTINUE_PATH,
  continuePortalResolver,
  DELETE_PATH,
  deletePortalResolver,
  SUSPEND_PATH,
  suspendPortalResolver,
} from "./portal";
import {
  filesSettingsResolver,
  FILES_SETTINGS_PATH,
  folderResolver,
  PATH_FOLDER,
  PATH_ROOMS_LIST,
  roomListResolver,
} from "./files";

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
    dataHandler: completeResolver,
  },
  license: {
    url: `${BASE_URL}${LICENCE_PATH}`,
    dataHandler: licenseResolver,
  },
  changeOwner: {
    url: `${BASE_URL}${OWNER_PATH}`,
    dataHandler: ownerResolver,
  },
  createUser: {
    url: `${BASE_URL}people`,
    dataHandler: selfResolver,
  },
  updateUser: {
    url: `${BASE_URL}${SELF_PATH_UPDATE_USER}`,
    dataHandler: selfResolver,
  },
  removeUser: {
    url: `${BASE_URL}${SELF_PATH_DELETE_USER}`,
    dataHandler: selfResolver,
  },
  changePassword: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfResolver,
  },
  changeEmail: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfResolver,
  },
  changeEmailError: {
    url: `${BASE_URL}${SELF_PATH_CHANGE_AUTH_DATA}`,
    dataHandler: selfResolver.bind(null, 400),
  },
  activationStatus: {
    url: `${BASE_URL}${SELF_PATH_ACTIVATION_STATUS}`,
    dataHandler: selfResolver,
  },
  activationStatusError: {
    url: `${BASE_URL}${SELF_PATH_ACTIVATION_STATUS}`,
    dataHandler: selfResolver.bind(null, 400),
  },
  getUserByEmail: {
    url: `${BASE_URL}${SELF_PATH_USER_BY_EMAIL}`,
    dataHandler: selfResolver,
  },
  checkConfirmLink: {
    url: `${BASE_URL}${CONFIRM_PATH}`,
    dataHandler: confirmResolver,
  },
  login: {
    url: `${BASE_URL}${LOGIN_PATH}`,
    dataHandler: loginResolver,
  },
  loginWithTfaCode: {
    url: `${BASE_URL}${LOGIN_PATH_WITH_PARAMS}`,
    dataHandler: loginResolver,
  },
  tfaAppValidate: {
    url: `${BASE_URL}${TFA_APP_VALIDATE_PATH}`,
    dataHandler: tfaAppValidateResolver,
  },
  tfaAppValidateError: {
    url: `${BASE_URL}${TFA_APP_VALIDATE_PATH}`,
    dataHandler: tfaAppValidateResolver.bind(null, 400),
  },
  logout: {
    url: `${BASE_URL}authentication/logout`,
    dataHandler: () => new Response(JSON.stringify({})),
  },
  oauthSignIn: {
    url: `*/**/${OAUTH_SIGN_IN_PATH}`,
    dataHandler: oauthSignInResolver,
  },
  suspendPortal: {
    url: `${BASE_URL}${SUSPEND_PATH}`,
    dataHandler: suspendPortalResolver,
  },
  continuePortal: {
    url: `${BASE_URL}${CONTINUE_PATH}`,
    dataHandler: continuePortalResolver,
  },
  deletePortal: {
    url: `${BASE_URL}${DELETE_PATH}`,
    dataHandler: deletePortalResolver,
  },

  roomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: () => roomListResolver("isDefault"),
  },
  filteredRoomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: () => roomListResolver("isFiltered"),
  },
  emptyRoomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: roomListResolver,
  },
  folder: {
    url: `${BASE_URL}files/[0-9]*?*`,
    dataHandler: folderResolver,
  },
  fileSetting: {
    url: `${BASE_URL}${FILES_SETTINGS_PATH}`,
    dataHandler: filesSettingsResolver,
  },

  filteredFolder: {
    url: `${BASE_URL}files/[0-9]*?*`,
    dataHandler: () => folderResolver("isFiltered"),
  },
  emptyFolder: {
    url: `${BASE_URL}${PATH_FOLDER}`,
    dataHandler: () => folderResolver("isEmpty"),
  },
  addGuest: {
    url: `${BASE_URL}${PATH_ADD_GUEST}`,
    dataHandler: selfResolver,
  },
};
