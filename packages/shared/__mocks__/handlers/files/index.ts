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
