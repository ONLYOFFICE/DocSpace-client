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
  SELF_PATH_DELETE_USER,
  SELF_PATH_UPDATE_USER,
  SELF_PATH_USER_BY_EMAIL,
  PATH_ADD_GUEST,
  PATH_PEOPLE_LIST,
  selfHandler,
  peopleListHandler,
  peopleListAccessDeniedHandler,
  adminOnlySuccess,
  roomAdminSuccess,
  visitorSuccess,
  regularUserSuccess,
} from "./people";
import {
  colorThemeHandler,
  PATH_COLOR_THEME,
  COMPLETE_PATH,
  completeHandler,
  LICENCE_PATH,
  licenseHandler,
  OWNER_PATH,
  ownerHandler,
  TFA_APP_VALIDATE_PATH,
  tfaAppValidateHandler,
  settingsHandler,
  PATH_SETTINGS,
  PATH_SETTINGS_WITH_QUERY,
  PATH_BUILD,
  buildHandler,
  PATH_SETTINGS_ADDITIONAL,
  settingsAdditionalHandler,
  COMPANY_INFO_PATH,
  companyInfoHandler,
  PATH_CULTURES,
  culturesHandler,
  INVITATION_SETTINGS_PATH,
  invitationSettingsHandler,
  PATH_WEB_PLUGINS,
  webPluginsHandler,
  webPluginsAddHandler,
  webPluginsUpdateHandler,
  webPluginsDeleteHandler,
  whiteLabelLogosHandler,
  whiteLabelLogoTextHandler,
  whiteLabelLogosIsDefaultHandler,
  PATH_WHITELABEL_LOGOS,
  PATH_WHITELABEL_LOGOTEXT,
  PATH_WHITELABEL_LOGOS_IS_DEFAULT,
  paymentSettingsHandler,
  PATH_PAYMENT_SETTINGS,
  thirdPartyBackupHandler,
  PATH_THIRDPARTY_BACKUP,
  backupStorageHandler,
  PATH_BACKUP_STORAGE,
  storageRegionsHandler,
  PATH_STORAGE_REGIONS,
  encryptionSettingsHandler,
  PATH_ENCRYPTION_SETTINGS,
} from "./settings";
import {
  CONTINUE_PATH,
  continuePortalHandler,
  DELETE_PATH,
  deletePortalHandler,
  getPortalHandler,
  PATH_PORTAL_GET,
  PATH_QUOTA,
  PATH_TARIFF,
  quotaHandler,
  SUSPEND_PATH,
  suspendHandler,
  tariffHandler,
  licenseQuotaHandler,
  PATH_LICENSE_QUOTA,
  backupScheduleHandler,
  PATH_BACKUP_SCHEDULE,
  backupProgressHandler,
  PATH_BACKUP_PROGRESS,
} from "./portal";
import {
  docServiceHandler,
  filesSettingsHandler,
  folderHandler,
  PATH_DOC_SERVICE,
  PATH_FILES_SETTINGS,
  PATH_FOLDER,
  PATH_ROOMS_LIST,
  PATH_SHARE,
  PATH_SHARED_WITH_ME,
  PATH_THIRD_PARTY,
  PATH_THIRD_PARTY_CAPABILITIES,
  roomListHandler,
  ROOT_PATH,
  rootHandler,
  sharedWithMeHandler,
  shareHandler,
  thirdPartyCapabilitiesHandler,
  thirdPartyHandler,
  recentEmptyHandler,
  recentHandler,
  PATH_RECENT,
  PATH_FAVORITES,
  PATH_DELETE_FAVORITES,
  PATH_ADD_TO_FAVORITES,
  PATH_GET_FILE_INFO,
  favoritesHandler,
  PATH_GET_FILE,
  getFileHandler,
  PATH_MY_DOCUMENTS,
  myDocumentsHandler,
  getFileInfoHandler,
  PATH_AGENT_FOLDER,
  agentFolderHandler,
} from "./files";
import { capabilitiesHandler, PATH_CAPABILITIES } from "./capabilities";

import {
  HEADER_AUTHENTICATED_SETTINGS,
  HEADER_AUTHENTICATED_WITH_SOCKET_SETTINGS,
  HEADER_EMPTY_FOLDER,
  HEADER_FILTERED_FOLDER,
  HEADER_FILTERED_ROOMS_LIST,
  HEADER_LIST_CAPABILITIES,
  HEADER_ROOMS_LIST,
  HEADER_AI_DISABLED,
  HEADER_PLUGINS_SETTINGS,
} from "../utils";
import {
  PATH_DELETE_USER,
  PATH_UPDATE_USER_CULTURE,
  updateUserCultureHandler,
} from "./people/self";
import {
  aiConfigHandler,
  PATH_AI_CONFIG,
  PATH_AI_AGENTS,
  aiAgentsHandler,
  PATH_AI_PROVIDERS,
  aiProvidersHandler,
  aiProvidersPostHandler,
  aiProvidersDeleteHandler,
  aiProvidersPutHandler,
  PATH_AI_PROVIDER,
  PATH_AI_PROVIDERS_AVAILABLE,
  aiProvidersAvailableHandler,
  PATH_AI_MODELS,
  aiModelsHandler,
  PATH_AI_SERVER,
  aiServerHandler,
  PATH_AI_SERVERS_AVAILABLE,
  aiServersAvailableHandler,
  PATH_AI_SERVERS_WITH_FILTER,
  aiServersGetHandler,
  aiServersPostHandler,
  PATH_AI_SERVERS,
  aiServersDeleteHandler,
  aiServerPutHandler,
  PATH_AI_CONFIG_WEB_SEARCH,
  aiWebSearchGetHandler,
  aiWebSearchPutHandler,
  PATH_AI_CONFIG_VECTORIZATION,
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
  PATH_AI_SERVER_STATUS,
  aiServerStatusPutHandler,
  PATH_AI_ROOMS_CHATS_CONFIG,
  aiRoomsChatsConfigHandler,
  PATH_AI_ROOMS_SERVERS,
  aiRoomsServersHandler,
  aiRoomsChatsHandler,
  PATH_AI_CHAT,
  aiChatHandler,
  PATH_AI_CHAT_MESSAGES,
  aiChatMessagesHandler,
} from "./ai";
import { PATH_TAGS, roomTagsHandler } from "./rooms";
import {
  LINK_FILE_PATH,
  LinkHandler,
  PATH_SHARE_TO_USERS_FILE,
  shareToUserHandle,
} from "./share";
import {
  registerHandler,
  PATH_PORTAL_REGISTER,
  removePortalHandler,
  PATH_PORTAL_REMOVE,
  setDomainHandler,
  PATH_SET_DOMAIN,
} from "./apisystem";
import type { MethodType } from "../types";
import { PATH_AI_ROOMS_CHATS } from "./ai/roomsChats";

export type TEndpoint = {
  url: string | RegExp;
  dataHandler: () => Response;
  method?: MethodType;
};

export type TEndpoints = {
  [key: string]: TEndpoint;
};

const BASE_URL = "*/**/api/2.0/";
const API_SYSTEM_URL = "*/**/apisystem/";

export const endpoints = {
  wizardComplete: {
    url: `${BASE_URL}${COMPLETE_PATH}`,
    dataHandler: completeHandler,
  },
  license: {
    url: `${BASE_URL}${LICENCE_PATH}`,
    dataHandler: licenseHandler,
  },
  changeOwner: {
    url: `${BASE_URL}${OWNER_PATH}`,
    dataHandler: ownerHandler,
  },
  createUser: {
    url: `${BASE_URL}${SELF_PATH}`,
    dataHandler: selfHandler,
  },
  updateUser: {
    url: `${BASE_URL}${SELF_PATH_UPDATE_USER}`,
    dataHandler: selfHandler,
  },
  updateUserCultureAz: {
    url: `${BASE_URL}${PATH_UPDATE_USER_CULTURE}`,
    dataHandler: () => updateUserCultureHandler("az"),
  },
  updateUserCultureLv: {
    url: `${BASE_URL}${PATH_UPDATE_USER_CULTURE}`,
    dataHandler: () => updateUserCultureHandler("lv"),
  },
  removeUser: {
    url: `${BASE_URL}${SELF_PATH_DELETE_USER}`,
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
    dataHandler: selfHandler.bind(null, null, null, true),
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
  loginError403: {
    url: `${BASE_URL}${LOGIN_PATH}`,
    dataHandler: loginHandler.bind(null, 403),
  },
  loginError: {
    url: `${BASE_URL}${LOGIN_PATH}`,
    dataHandler: loginHandler.bind(null, 401),
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
  suspendPortal: {
    url: `${BASE_URL}${SUSPEND_PATH}`,
    dataHandler: suspendHandler,
  },
  continuePortal: {
    url: `${BASE_URL}${CONTINUE_PATH}`,
    dataHandler: continuePortalHandler,
  },
  deletePortal: {
    url: `${BASE_URL}${DELETE_PATH}`,
    dataHandler: deletePortalHandler,
  },

  roomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: () =>
      roomListHandler(new Headers({ [HEADER_ROOMS_LIST]: "true" })),
  },
  filteredRoomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: () =>
      roomListHandler(new Headers({ [HEADER_FILTERED_ROOMS_LIST]: "true" })),
  },
  emptyRoomList: {
    url: `${BASE_URL}${PATH_ROOMS_LIST}`,
    dataHandler: roomListHandler,
  },

  folder: {
    url: `${BASE_URL}${PATH_FOLDER}`,
    dataHandler: folderHandler,
  },
  filteredFolder: {
    url: `${BASE_URL}${PATH_FOLDER}`,
    dataHandler: () =>
      folderHandler(new Headers({ [HEADER_FILTERED_FOLDER]: "true" })),
  },
  emptyFolder: {
    url: `${BASE_URL}${PATH_FOLDER}`,
    dataHandler: () =>
      folderHandler(new Headers({ [HEADER_EMPTY_FOLDER]: "true" })),
  },
  agentFolder: {
    url: PATH_AGENT_FOLDER,
    dataHandler: agentFolderHandler,
  },
  addGuest: {
    url: `${BASE_URL}${PATH_ADD_GUEST}`,
    dataHandler: selfHandler,
  },
  capabilities: {
    url: `${BASE_URL}${PATH_CAPABILITIES}`,
    dataHandler: () =>
      capabilitiesHandler(new Headers({ [HEADER_LIST_CAPABILITIES]: "true" })),
  },
  colorTheme: {
    url: `${BASE_URL}${PATH_COLOR_THEME}`,
    dataHandler: colorThemeHandler,
  },
  settings: {
    url: `${BASE_URL}${PATH_SETTINGS}`,
    dataHandler: () =>
      settingsHandler(new Headers({ [HEADER_AUTHENTICATED_SETTINGS]: "true" })),
  },
  settingsWithQuery: {
    url: `${BASE_URL}${PATH_SETTINGS_WITH_QUERY}`,
    dataHandler: () =>
      settingsHandler(new Headers({ [HEADER_AUTHENTICATED_SETTINGS]: "true" })),
  },
  settingsWithSocket: {
    url: `${BASE_URL}${PATH_SETTINGS_WITH_QUERY}`,
    dataHandler: () =>
      settingsHandler(
        new Headers({
          [HEADER_AUTHENTICATED_SETTINGS]: "true",
          [HEADER_AUTHENTICATED_WITH_SOCKET_SETTINGS]: "true",
        }),
      ),
  },
  self: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: selfHandler,
  },
  selfEmailActivated: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: selfHandler.bind(null, null, null, true),
  },
  selfEmailActivatedClient: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: selfHandler.bind(null, null, null, true, true),
  },
  selfAdminOnly: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: () => new Response(JSON.stringify(adminOnlySuccess)),
  },
  selfRoomAdminOnly: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: () => new Response(JSON.stringify(roomAdminSuccess)),
  },
  selfVisitorOnly: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: () => new Response(JSON.stringify(visitorSuccess)),
  },
  selfRegularUserOnly: {
    url: `${BASE_URL}${PATH_DELETE_USER}`,
    dataHandler: () => new Response(JSON.stringify(regularUserSuccess)),
  },
  build: {
    url: `${BASE_URL}${PATH_BUILD}`,
    dataHandler: buildHandler,
  },
  quota: {
    url: `${BASE_URL}${PATH_QUOTA}`,
    dataHandler: quotaHandler,
  },
  tariff: {
    url: `${BASE_URL}${PATH_TARIFF}`,
    dataHandler: () => tariffHandler(new Headers()),
  },
  aiConfig: {
    url: `${BASE_URL}${PATH_AI_CONFIG}`,
    dataHandler: () => aiConfigHandler(new Headers()),
  },
  aiConfigDisabled: {
    url: `${BASE_URL}${PATH_AI_CONFIG}`,
    dataHandler: () =>
      aiConfigHandler(
        new Headers({
          [HEADER_AI_DISABLED]: "true",
        }),
      ),
  },
  aiAgentsEmpty: {
    url: `${BASE_URL}${PATH_AI_AGENTS}`,
    dataHandler: () => aiAgentsHandler({}),
  },
  aiAgentsEmptyCreate: {
    url: `${BASE_URL}${PATH_AI_AGENTS}`,
    dataHandler: () => aiAgentsHandler({ withCreate: true }),
  },
  aiAgentsListCreate: {
    url: `${BASE_URL}${PATH_AI_AGENTS}`,
    dataHandler: () => aiAgentsHandler({ withListCreate: true }),
  },
  aiProvidersList: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS}`,
    dataHandler: aiProvidersHandler,
  },
  aiProvidersListNeedReset: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS}`,
    dataHandler: () => aiProvidersHandler({ needReset: true }),
  },
  aiProvidersEmptyList: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS}`,
    dataHandler: () => aiProvidersHandler({ isEmpty: true }),
  },
  createAiProvider: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS}`,
    dataHandler: aiProvidersPostHandler,
    method: "POST",
  },
  deleteAiProvider: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS}`,
    dataHandler: aiProvidersDeleteHandler,
    method: "DELETE",
  },
  updateAiProvider: {
    url: `${BASE_URL}${PATH_AI_PROVIDER}`,
    dataHandler: aiProvidersPutHandler,
    method: "PUT",
  },
  aiProvidersAvailable: {
    url: `${BASE_URL}${PATH_AI_PROVIDERS_AVAILABLE}`,
    dataHandler: aiProvidersAvailableHandler,
  },
  aiModelsClaude: {
    url: `${BASE_URL}${PATH_AI_MODELS}`,
    dataHandler: () => aiModelsHandler({ isClaude: true }),
  },
  aiModelsOpenAI: {
    url: `${BASE_URL}${PATH_AI_MODELS}`,
    dataHandler: () => aiModelsHandler({ isOpenAI: true }),
  },
  aiModelsTogether: {
    url: `${BASE_URL}${PATH_AI_MODELS}`,
    dataHandler: () => aiModelsHandler({ isTogetherAI: true }),
  },
  aiModelsOpenRouter: {
    url: `${BASE_URL}${PATH_AI_MODELS}`,
    dataHandler: () => aiModelsHandler({ isOpenRouter: true }),
  },
  aiModelsError: {
    url: `${BASE_URL}${PATH_AI_MODELS}`,
    dataHandler: () => aiModelsHandler({ isError: true }),
  },
  aiServer: {
    url: `${BASE_URL}${PATH_AI_SERVER}`,
    dataHandler: aiServerHandler,
  },
  aiServersAvailable: {
    url: `${BASE_URL}${PATH_AI_SERVERS_AVAILABLE}`,
    dataHandler: aiServersAvailableHandler,
  },
  aiServersList: {
    url: `${BASE_URL}${PATH_AI_SERVERS_WITH_FILTER}`,
    dataHandler: aiServersGetHandler,
  },
  aiServersListDisabled: {
    url: `${BASE_URL}${PATH_AI_SERVERS_WITH_FILTER}`,
    dataHandler: () => aiServersGetHandler("disabled"),
  },
  aiServersListNeedReset: {
    url: `${BASE_URL}${PATH_AI_SERVERS_WITH_FILTER}`,
    dataHandler: () => aiServersGetHandler("needReset"),
  },
  createAiServer: {
    url: `${BASE_URL}${PATH_AI_SERVERS}`,
    dataHandler: aiServersPostHandler,
    method: "POST",
  },
  deleteAiServer: {
    url: `${BASE_URL}${PATH_AI_SERVERS}`,
    dataHandler: aiServersDeleteHandler,
    method: "DELETE",
  },
  updateAiServer: {
    url: `${BASE_URL}${PATH_AI_SERVER}`,
    dataHandler: aiServerPutHandler,
    method: "PUT",
  },
  enableAiServer: {
    url: `${BASE_URL}${PATH_AI_SERVER_STATUS}`,
    dataHandler: () => aiServerStatusPutHandler("enable"),
    method: "PUT",
  },
  disableAiServer: {
    url: `${BASE_URL}${PATH_AI_SERVER_STATUS}`,
    dataHandler: () => aiServerStatusPutHandler("disable"),
    method: "PUT",
  },
  aiWebSearchEnabled: {
    url: `${BASE_URL}${PATH_AI_CONFIG_WEB_SEARCH}`,
    dataHandler: () => aiWebSearchGetHandler("enabled"),
  },
  aiWebSearchDisabled: {
    url: `${BASE_URL}${PATH_AI_CONFIG_WEB_SEARCH}`,
    dataHandler: () => aiWebSearchGetHandler("disabled"),
  },
  aiWebSearchNeedReset: {
    url: `${BASE_URL}${PATH_AI_CONFIG_WEB_SEARCH}`,
    dataHandler: () => aiWebSearchGetHandler("needReset"),
  },
  setWebSearchSettings: {
    url: `${BASE_URL}${PATH_AI_CONFIG_WEB_SEARCH}`,
    dataHandler: aiWebSearchPutHandler,
    method: "PUT",
  },
  aiVectorizationSettingsEnabled: {
    url: `${BASE_URL}${PATH_AI_CONFIG_VECTORIZATION}`,
    dataHandler: () => aiVectorizationGetHandler("enabled"),
  },
  aiVectorizationSettingsDisabled: {
    url: `${BASE_URL}${PATH_AI_CONFIG_VECTORIZATION}`,
    dataHandler: () => aiVectorizationGetHandler("disabled"),
  },
  aiVectorizationSettingsNeedReset: {
    url: `${BASE_URL}${PATH_AI_CONFIG_VECTORIZATION}`,
    dataHandler: () => aiVectorizationGetHandler("needReset"),
  },
  setVectorizationSettings: {
    url: `${BASE_URL}${PATH_AI_CONFIG_VECTORIZATION}`,
    dataHandler: aiVectorizationPutHandler,
    method: "PUT",
  },
  aiChat: {
    url: `${BASE_URL}${PATH_AI_CHAT}`,
    dataHandler: aiChatHandler,
  },
  aiChatMessages: {
    url: `${BASE_URL}${PATH_AI_CHAT_MESSAGES}`,
    dataHandler: aiChatMessagesHandler,
  },
  aiChatMessagesBaseElements: {
    url: `${BASE_URL}${PATH_AI_CHAT_MESSAGES}`,
    dataHandler: () => aiChatMessagesHandler("baseElements"),
  },
  aiChatMessagesCodeBlock: {
    url: `${BASE_URL}${PATH_AI_CHAT_MESSAGES}`,
    dataHandler: () => aiChatMessagesHandler("codeBlock"),
  },
  aiChatMessagesTable: {
    url: `${BASE_URL}${PATH_AI_CHAT_MESSAGES}`,
    dataHandler: () => aiChatMessagesHandler("table"),
  },
  aiChatMessagesMany: {
    url: `${BASE_URL}${PATH_AI_CHAT_MESSAGES}`,
    dataHandler: () => aiChatMessagesHandler("many"),
  },
  aiRoomsChatsConfigAllEnabled: {
    url: `${BASE_URL}${PATH_AI_ROOMS_CHATS_CONFIG}`,
    dataHandler: aiRoomsChatsConfigHandler,
  },
  aiRoomsServersEmpty: {
    url: `${BASE_URL}${PATH_AI_ROOMS_SERVERS}`,
    dataHandler: aiRoomsServersHandler,
  },
  aiRoomsChatsEmpty: {
    url: `${BASE_URL}${PATH_AI_ROOMS_CHATS}`,
    dataHandler: () => aiRoomsChatsHandler("empty"),
  },
  aiRoomsChats: {
    url: `${BASE_URL}${PATH_AI_ROOMS_CHATS}`,
    dataHandler: aiRoomsChatsHandler,
  },
  additionalSettings: {
    url: `${BASE_URL}${PATH_SETTINGS_ADDITIONAL}`,
    dataHandler: settingsAdditionalHandler,
  },
  companyInfo: {
    url: `${BASE_URL}${COMPANY_INFO_PATH}`,
    dataHandler: companyInfoHandler,
  },
  root: {
    url: `${BASE_URL}${ROOT_PATH}`,
    dataHandler: rootHandler,
  },
  filesSettings: {
    url: `${BASE_URL}${PATH_FILES_SETTINGS}`,
    dataHandler: filesSettingsHandler,
  },
  getPortal: {
    url: `${PATH_PORTAL_GET}`,
    dataHandler: getPortalHandler,
  },
  cultures: {
    url: `${BASE_URL}${PATH_CULTURES}`,
    dataHandler: culturesHandler,
  },
  invitationSettings: {
    url: `${BASE_URL}${INVITATION_SETTINGS_PATH}`,
    dataHandler: invitationSettingsHandler,
  },
  webPlugins: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}`,
    dataHandler: () => webPluginsHandler("empty"),
    method: "GET",
  },
  webPluginsWithData: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}`,
    dataHandler: () => webPluginsHandler("withData"),
    method: "GET",
  },
  webPluginsWithLocale: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}`,
    dataHandler: () => webPluginsHandler("withLocale"),
    method: "GET",
  },
  webPluginsAdd: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}`,
    dataHandler: webPluginsAddHandler,
    method: "POST",
  },
  webPluginsUpdate: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}/*`,
    dataHandler: webPluginsUpdateHandler,
    method: "PUT",
  },
  webPluginsDelete: {
    url: `${BASE_URL}${PATH_WEB_PLUGINS}/*`,
    dataHandler: webPluginsDeleteHandler,
    method: "DELETE",
  },
  thirdPartyCapabilities: {
    url: `${BASE_URL}${PATH_THIRD_PARTY_CAPABILITIES}`,
    dataHandler: thirdPartyCapabilitiesHandler,
  },
  thirdParty: {
    url: `${BASE_URL}${PATH_THIRD_PARTY}`,
    dataHandler: thirdPartyHandler,
  },
  docService: {
    url: `${BASE_URL}${PATH_DOC_SERVICE}`,
    dataHandler: docServiceHandler,
  },
  sharedWithMe: {
    url: PATH_SHARED_WITH_ME,
    dataHandler: sharedWithMeHandler.bind(null, "success"),
  },
  sharedWithMeEmpty: {
    url: PATH_SHARED_WITH_ME,
    dataHandler: sharedWithMeHandler.bind(null, "empty"),
  },
  shareDelete: {
    url: `${BASE_URL}${PATH_SHARE}`,
    dataHandler: shareHandler.bind(null, "Delete"),
  },
  shareLink: {
    url: LINK_FILE_PATH,
    dataHandler: LinkHandler,
    method: "POST",
  },
  shareToUser: {
    url: PATH_SHARE_TO_USERS_FILE,
    dataHandler: shareToUserHandle,
  },
  peopleList: {
    url: `${BASE_URL}${PATH_PEOPLE_LIST}*`,
    dataHandler: peopleListHandler,
  },
  peopleListAccessDenied: {
    url: `${BASE_URL}${PATH_PEOPLE_LIST}*`,
    dataHandler: peopleListAccessDeniedHandler,
  },
  emptyTags: {
    url: `${BASE_URL}${PATH_TAGS}`,
    dataHandler: roomTagsHandler,
  },
  settingsWithPlugins: {
    url: `${BASE_URL}${PATH_SETTINGS_WITH_QUERY}`,
    dataHandler: () =>
      settingsHandler(
        new Headers({
          [HEADER_AUTHENTICATED_SETTINGS]: "true",
          [HEADER_PLUGINS_SETTINGS]: "true",
        }),
      ),
  },

  recentEmpty: {
    url: PATH_RECENT,
    dataHandler: recentEmptyHandler,
  },
  recent: {
    url: PATH_RECENT,
    dataHandler: recentHandler,
  },
  favorites: {
    url: PATH_FAVORITES,
    dataHandler: favoritesHandler.bind(null, "success"),
  },
  favoritesEmpty: {
    url: PATH_FAVORITES,
    dataHandler: favoritesHandler.bind(null, "empty"),
  },
  favoritesDelete: {
    url: PATH_DELETE_FAVORITES,
    dataHandler: favoritesHandler.bind(null, "delete"),
    method: "DELETE",
  },
  favoritesMany: {
    url: PATH_FAVORITES,
    dataHandler: favoritesHandler.bind(null, "success_many"),
  },
  getFile: {
    url: PATH_GET_FILE,
    dataHandler: getFileHandler,
  },
  addToFavorites: {
    url: PATH_ADD_TO_FAVORITES,
    dataHandler: favoritesHandler.bind(null, "mark"),
    method: "POST",
  },
  myDocuments: {
    url: PATH_MY_DOCUMENTS,
    dataHandler: myDocumentsHandler,
  },
  getFileInfo: {
    url: PATH_GET_FILE_INFO,
    dataHandler: getFileInfoHandler,
  },
  registerPortal: {
    url: `${API_SYSTEM_URL}${PATH_PORTAL_REGISTER}`,
    dataHandler: registerHandler,
    method: "POST",
  },
  removePortal: {
    url: PATH_PORTAL_REMOVE,
    dataHandler: removePortalHandler,
    method: "DELETE",
  },
  whiteLabelLogos: {
    url: `${BASE_URL}/${PATH_WHITELABEL_LOGOS}`,
    dataHandler: whiteLabelLogosHandler,
  },
  whiteLabelLogoText: {
    url: `${BASE_URL}/${PATH_WHITELABEL_LOGOTEXT}`,
    dataHandler: whiteLabelLogoTextHandler,
  },
  whiteLabelLogosIsDefault: {
    url: `${BASE_URL}/${PATH_WHITELABEL_LOGOS_IS_DEFAULT}`,
    dataHandler: whiteLabelLogosIsDefaultHandler,
  },
  paymentSettings: {
    url: `${BASE_URL}/${PATH_PAYMENT_SETTINGS}`,
    dataHandler: paymentSettingsHandler,
  },
  licenseQuota: {
    url: `${API_SYSTEM_URL}/${PATH_LICENSE_QUOTA}`,
    dataHandler: licenseQuotaHandler,
  },
  thirdPartyBackup: {
    url: `${BASE_URL}/${PATH_THIRDPARTY_BACKUP}`,
    dataHandler: thirdPartyBackupHandler,
  },
  backupSchedule: {
    url: `${BASE_URL}/${PATH_BACKUP_SCHEDULE}`,
    dataHandler: backupScheduleHandler,
  },
  backupStorage: {
    url: `${BASE_URL}/${PATH_BACKUP_STORAGE}`,
    dataHandler: backupStorageHandler,
  },
  storageRegions: {
    url: `${BASE_URL}/${PATH_STORAGE_REGIONS}`,
    dataHandler: storageRegionsHandler,
  },
  backupProgress: {
    url: `${BASE_URL}/${PATH_BACKUP_PROGRESS}`,
    dataHandler: backupProgressHandler,
  },
  encryptionSettings: {
    url: `${BASE_URL}/${PATH_ENCRYPTION_SETTINGS}`,
    dataHandler: () => encryptionSettingsHandler(new Headers()),
  },
  setDomain: {
    url: `${API_SYSTEM_URL}/${PATH_SET_DOMAIN}`,
    dataHandler: setDomainHandler,
    method: "POST",
  },
} satisfies TEndpoints;
