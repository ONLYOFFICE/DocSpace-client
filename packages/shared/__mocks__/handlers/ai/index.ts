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

import { aiAgentsHandler } from "./agents";
import { aiConfigHandler } from "./config";
import { aiModelsHandler } from "./models";
import {
  aiProvidersHandler,
  aiProvidersDeleteHandler,
  aiProvidersPostHandler,
  aiProvidersPutHandler,
  aiProvidersPreviewHandler,
} from "./providers";
import {
  aiServerHandler,
  aiServerPutHandler,
  aiServerStatusPutHandler,
} from "./server";
import {
  aiServersGetHandler,
  aiServersPostHandler,
  aiServersDeleteHandler,
  aiServersAvailableHandler,
} from "./servers";
import { aiChatHandler, aiChatPutHandler, aiChatDeleteHandler } from "./chat";
import {
  aiChatMessagesExportHandler,
  aiChatMessagesHandler,
} from "./chatMessages";
import { aiMessagesExportHandler } from "./messages";
import { aiProvidersAvailableHandler } from "./providersAvailable";
import { aiRoomsChatsHandler, aiRoomsChatsStreamHandler } from "./roomsChats";
import {
  aiRoomsChatsConfigHandler,
  aiRoomsChatsConfigPutHandler,
} from "./roomsChatsConfig";
import { aiRoomsServersHandler } from "./roomsServers";
import {
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
} from "./vectorization";
import { aiWebSearchGetHandler, aiWebSearchPutHandler } from "./webSearch";
import { aiProvidersDefaultHandler } from "./providersDefault";

export {
  aiAgentsHandler,
  aiConfigHandler,
  aiModelsHandler,
  aiProvidersHandler,
  aiProvidersDeleteHandler,
  aiProvidersPostHandler,
  aiProvidersPutHandler,
  aiProvidersPreviewHandler,
  aiServerHandler,
  aiServersGetHandler,
  aiServersPostHandler,
  aiServersDeleteHandler,
  aiServersAvailableHandler,
  aiChatHandler,
  aiChatPutHandler,
  aiChatDeleteHandler,
  aiChatMessagesExportHandler,
  aiChatMessagesHandler,
  aiMessagesExportHandler,
  aiProvidersAvailableHandler,
  aiRoomsChatsHandler,
  aiRoomsChatsStreamHandler,
  aiRoomsChatsConfigHandler,
  aiRoomsChatsConfigPutHandler,
  aiRoomsServersHandler,
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
  aiWebSearchGetHandler,
  aiWebSearchPutHandler,
  aiServerPutHandler,
  aiServerStatusPutHandler,
  aiProvidersDefaultHandler,
};

export const aiHandlers = (port: string) => [
  aiAgentsHandler(port),
  aiConfigHandler(port),
  aiModelsHandler(port),
  aiProvidersHandler(port),
  aiProvidersDeleteHandler(port),
  aiProvidersPostHandler(port),
  aiProvidersPutHandler(port),
  aiProvidersPreviewHandler(port),
  aiServersGetHandler(port),
  aiServersPostHandler(port),
  aiServersDeleteHandler(port),
  aiServersAvailableHandler(port),
  aiServerHandler(port),
  aiChatMessagesExportHandler(port),
  aiChatMessagesHandler(port),
  aiChatHandler(port),
  aiChatPutHandler(port),
  aiChatDeleteHandler(port),
  aiMessagesExportHandler(port),
  aiProvidersAvailableHandler(port),
  aiRoomsChatsHandler(port),
  aiRoomsChatsStreamHandler(port),
  aiRoomsChatsConfigHandler(port),
  aiRoomsServersHandler(port),
  aiVectorizationGetHandler(port),
  aiVectorizationPutHandler(port),
  aiWebSearchGetHandler(port),
  aiWebSearchPutHandler(port),
  aiServerStatusPutHandler(port),
  aiServerPutHandler(port),
];
