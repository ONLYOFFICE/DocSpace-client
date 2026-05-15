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

import { filesSettingsHandler } from "./filesSettings";
import { foldersTreeHandler } from "./foldersTree";
import { folderHandler, folderInfoHandler } from "./folder";
import {
  validatePublicRoomKeyHandler,
  validatePublicRoomKeyPasswordHandler,
} from "./validatePublicRoomKey";
import { validatePublicRoomPasswordHandler } from "./validatePublicRoomPassword";
import {
  roomListHandler,
  roomListResolver,
  createRoomHandler,
} from "./roomList";
import {
  externalLinksHandler,
  primaryLinkHandler,
  editExternalLinkHandler,
} from "./externalLinks";
import { thirdPartyCapabilitiesHandler } from "./thirdPartyCapabilities";
import { thirdPartyHandler } from "./thirdParty";
import { sharedWithMeHandler } from "./sharedWithMe";
import { shareHandler } from "./share";
import { rootHandler } from "./root";
import { recentHandler } from "./recent";
import { myDocumentsHandler, myHandler, getFileInfoHandler } from "./documents";
import { docServiceHandlers } from "./docservice";
import {
  favoritesHandler,
  addFileToFavoritesHandler,
  getFileHandler,
  deleteFavoritesHandler,
} from "./favorites";
import {
  agentFolderChatHandler,
  agentFolderInfoHandler,
  agentFolderResultStorageHandler,
  agentFolderKnowledgeHandler,
} from "./agentFolder";
import {
  resultStorageFolderHandler,
  resultStorageFolderInfoHandler,
} from "./resultStorageFolder";
import {
  defaultTemplatesHandler,
  defaultTemplatesSetHandler,
  defaultTemplatesResetHandler,
} from "./defaultTemplates";
import {
  filesWithEditorsHandler,
  filesWithManyEditorsHandler,
} from "./editorsTooltip";
import {
  roomGroupsHandler,
  roomGroupByIdHandler,
  createRoomGroupHandler,
  updateRoomGroupHandler,
  deleteRoomGroupHandler,
  updateRoomGroupIconHandler,
} from "./roomGroups";

export { TypeFolder } from "./folder";
export { TypeRoomList } from "./roomList";

export {
  foldersTreeHandler,
  filesSettingsHandler,
  validatePublicRoomKeyHandler,
  roomListHandler,
  folderHandler,
  folderInfoHandler,
  validatePublicRoomPasswordHandler,
  roomListResolver,
  externalLinksHandler,
  primaryLinkHandler,
  editExternalLinkHandler,
  createRoomHandler,
  thirdPartyCapabilitiesHandler,
  thirdPartyHandler,
  sharedWithMeHandler,
  shareHandler,
  rootHandler,
  recentHandler,
  myDocumentsHandler,
  myHandler,
  getFileInfoHandler,
  docServiceHandlers,
  favoritesHandler,
  addFileToFavoritesHandler,
  getFileHandler,
  deleteFavoritesHandler,
  agentFolderChatHandler,
  agentFolderInfoHandler,
  agentFolderResultStorageHandler,
  agentFolderKnowledgeHandler,
  resultStorageFolderHandler,
  resultStorageFolderInfoHandler,
  validatePublicRoomKeyPasswordHandler,
  defaultTemplatesHandler,
  defaultTemplatesSetHandler,
  defaultTemplatesResetHandler,
  filesWithEditorsHandler,
  filesWithManyEditorsHandler,
  roomGroupsHandler,
  roomGroupByIdHandler,
  createRoomGroupHandler,
  updateRoomGroupHandler,
  deleteRoomGroupHandler,
  updateRoomGroupIconHandler,
};

// Note: recentHandler, sharedWithMeHandler, favoritesHandler are NOT included here
// because they use files/:id pattern which conflicts with folderHandler.
// They should be added explicitly in tests that need them.

export const filesHandlers = (port: string) => [
  //foldersTreeHandler(port),
  // agentFolderResultStorageHandler, agentFolderKnowledgeHandler and agentFolderChatHandler filter by searchArea parameter
  agentFolderResultStorageHandler(port),
  agentFolderKnowledgeHandler(port),
  agentFolderChatHandler(port),
  resultStorageFolderHandler(port),
  rootHandler(port),
  filesSettingsHandler(port),
  validatePublicRoomKeyHandler(port),
  roomListHandler(port),
  agentFolderInfoHandler(port),
  resultStorageFolderInfoHandler(port),
  folderHandler(port),
  folderInfoHandler(port),
  validatePublicRoomPasswordHandler(port),
  thirdPartyCapabilitiesHandler(port),
  thirdPartyHandler(port),
  shareHandler(port),
  getFileInfoHandler(port),
  docServiceHandlers(port),
  addFileToFavoritesHandler(port),
  getFileHandler(port),
  deleteFavoritesHandler(port),
  validatePublicRoomKeyPasswordHandler(port),
  defaultTemplatesHandler(port),
  defaultTemplatesSetHandler(port),
  roomGroupsHandler(port, false),
  updateRoomGroupIconHandler(port),
  roomGroupByIdHandler(port),
  createRoomGroupHandler(port),
  updateRoomGroupHandler(port),
  deleteRoomGroupHandler(port),
];
