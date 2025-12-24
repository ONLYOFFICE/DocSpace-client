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

export { aiAgentsHandler, PATH_AI_AGENTS } from "./agents";

export { aiConfigHandler, PATH_AI_CONFIG } from "./config";

export { aiModelsHandler, PATH_AI_MODELS } from "./models";

export {
  aiProvidersHandler,
  aiProvidersPostHandler,
  aiProvidersDeleteHandler,
  aiProvidersPutHandler,
  PATH_AI_PROVIDERS,
  PATH_AI_PROVIDER,
} from "./providers";

export {
  aiProvidersAvailableHandler,
  PATH_AI_PROVIDERS_AVAILABLE,
} from "./providersAvailable";

export {
  aiServerHandler,
  PATH_AI_SERVER,
  aiServerPutHandler,
  aiServerStatusPutHandler,
  PATH_AI_SERVER_STATUS,
} from "./server";

export {
  PATH_AI_CONFIG_WEB_SEARCH,
  aiWebSearchGetHandler,
  aiWebSearchPutHandler,
} from "./webSearch";

export {
  aiServersAvailableHandler,
  PATH_AI_SERVERS_AVAILABLE,
  aiServersGetHandler,
  PATH_AI_SERVERS,
  PATH_AI_SERVERS_WITH_FILTER,
  aiServersPostHandler,
  aiServersDeleteHandler,
} from "./servers";

export {
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
  PATH_AI_CONFIG_VECTORIZATION,
} from "./vectorization";

export * from "./roomsChatsConfig";

export * from "./roomsServers";

export * from "./roomsChats";

export * from "./chat";

export * from "./chatMessages";
