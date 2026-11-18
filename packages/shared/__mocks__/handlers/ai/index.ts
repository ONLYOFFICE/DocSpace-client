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

import { aiAgentGetByIdHandler, aiAgentsHandler } from "./agents";
import {
  AI_ARBITER_PANEL_FOLDERS,
  AI_ARBITER_SESSION_ID,
  aiArbiterPanelHandler,
} from "./arbiter";
import { aiConfigHandler } from "./config";
import {
  aiDocumentAgentSettingsGetHandler,
  aiDocumentAgentSettingsPutHandler,
} from "./documentAgent";
import {
  AI_PROJECT_WITH_SOURCES,
  AI_PROJECT_WITHOUT_SOURCES,
  AI_PROJECTS,
  AiProjectMockAccess,
  aiProjectCreateHandler,
  aiProjectGetByIdHandler,
  aiProjectKnowledgeHandler,
  aiProjectMock,
  aiProjectInstructionsHandlers,
  aiProjectModelHandlers,
  aiProjectSkillsHandler,
  aiProjectSuggestionsHandlers,
  aiProjectSourcesHandlers,
  aiProjectsHandlers,
  AI_HUB_ROOMS,
  AI_HUB_ROOT_ID,
  aiHubRoomsHandler,
  aiRoomFolderHandler,
  aiSectionsHandlers,
  aiThreadFilesHandlers,
} from "./projects";
import { aiTemplateInstallHandler, aiTemplatesHandler } from "./templates";
import {
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
} from "./vectorization";
import {
  aiChatAssignmentsHandler,
  aiChatCustomServersHandler,
  aiChatDeepModeHandler,
  aiChatDisabledToolsHandler,
  aiChatEmptyStoreHandlers,
  aiChatProfilesListHandler,
  aiChatPromptsFoldersHandler,
  aiChatReadMessagesHandler,
  aiChatThreadGetByIdHandler,
  aiChatPromptsListHandler,
  aiChatReasoningLevelHandler,
  aiChatSendWithStreamHandler,
  aiChatServiceLimitExceededEvent,
  aiChatStoreHandlers,
  aiChatSystemToolsHandler,
  aiChatThreadsListHandler,
  aiChatWebSearchConfiguredHandler,
} from "./chatStores";

export {
  aiAgentGetByIdHandler,
  aiAgentsHandler,
  aiDocumentAgentSettingsGetHandler,
  aiDocumentAgentSettingsPutHandler,
  aiArbiterPanelHandler,
  AI_ARBITER_PANEL_FOLDERS,
  AI_ARBITER_SESSION_ID,
  aiConfigHandler,
  AI_PROJECT_WITH_SOURCES,
  AI_PROJECT_WITHOUT_SOURCES,
  AI_PROJECTS,
  AiProjectMockAccess,
  aiProjectCreateHandler,
  aiProjectGetByIdHandler,
  aiProjectKnowledgeHandler,
  aiProjectMock,
  aiProjectInstructionsHandlers,
  aiProjectModelHandlers,
  aiProjectSkillsHandler,
  aiProjectSuggestionsHandlers,
  aiProjectSourcesHandlers,
  aiProjectsHandlers,
  AI_HUB_ROOMS,
  AI_HUB_ROOT_ID,
  aiHubRoomsHandler,
  aiRoomFolderHandler,
  aiSectionsHandlers,
  aiThreadFilesHandlers,
  aiVectorizationGetHandler,
  aiVectorizationPutHandler,
  aiChatAssignmentsHandler,
  aiChatCustomServersHandler,
  aiChatDeepModeHandler,
  aiChatDisabledToolsHandler,
  aiChatEmptyStoreHandlers,
  aiChatProfilesListHandler,
  aiChatPromptsFoldersHandler,
  aiChatReadMessagesHandler,
  aiChatThreadGetByIdHandler,
  aiChatPromptsListHandler,
  aiChatReasoningLevelHandler,
  aiChatSendWithStreamHandler,
  aiChatServiceLimitExceededEvent,
  aiChatStoreHandlers,
  aiChatSystemToolsHandler,
  aiChatThreadsListHandler,
  aiChatWebSearchConfiguredHandler,
};

export {
  AI_CHAT_ASSIGNED,
  AI_CHAT_AUTO_PICKED,
  AI_CHAT_PROFILES,
  AiActionType,
} from "./chatStores";
export type { AiChatProfile, AssignmentMap } from "./chatStores";
export {
  AI_CHAT_PLACEHOLDER_TITLE,
  aiChatAssistantMessage,
  aiChatAttachmentsGetHandler,
  aiChatCreatedDocumentPart,
  aiChatFileAttachmentPart,
  aiChatGeneratedImagePart,
  aiChatImageAttachmentPart,
  aiChatMessageId,
  aiChatReplyEvents,
  aiChatRequestLog,
  aiChatThreadId,
  aiChatThreadsHandlers,
  aiChatToolCallPart,
  aiChatUserMessage,
} from "./chatThreads";
export type {
  AiChatContentPart,
  AiChatFilePart,
  AiChatImagePart,
  AiChatMessageMock,
  AiChatReplyMock,
  AiChatRequestLog,
  AiChatSendRequest,
  AiChatTextPart,
  AiChatThreadMock,
  AiChatThreadsMockOptions,
  AiChatToolCallPart,
} from "./chatThreads";
export type {
  AiProjectMock,
  AiHubRoomMock,
  AiThreadFileMock,
  AiThreadFilesMock,
} from "./projects";
export type { DocumentAgentSettingsMock } from "./documentAgent";
export {
  aiAgentDeleteHandler,
  aiAgentLeaveHandler,
  aiAgentSkillsRefusedHandler,
} from "./agentActions";
export {
  META_FILL_RESULT,
  META_GENERATE_RESULT,
  META_SERVICE_LIMIT_ERROR,
  aiMetaFillHandler,
  aiMetaGenerateHandler,
} from "./meta";

export {
  AI_TEMPLATE_AGENTS,
  AI_TEMPLATE_CATALOG,
  AI_TEMPLATE_COVERS,
  AI_TEMPLATE_KNOWLEDGE_BASES,
  AI_TEMPLATE_SKILL_SETS,
  aiTemplatesHandlers,
  roomCoversHandler,
} from "./templates";
export { aiTemplateInstallHandler, aiTemplatesHandler };

export {
  aiChatDraftSourcesStorage,
  aiChatRoomSkillsHandlers,
} from "./chatSources";
export type {
  AiChatRoomSkillMock,
  AiChatRoomSkillsLog,
  AiChatThreadSourceMock,
} from "./chatSources";
export { aiCopyToRoomHandlers } from "./saveToRoom";
export type { AiCopyRequest, AiCopyTargetRoomMock } from "./saveToRoom";
export {
  aiAgentReadDeniedHandlers,
  aiHubRoomsAsUserHandler,
  agentInviteSearchHandler,
} from "./agentAccess";
export type { AgentInviteAccount } from "./agentAccess";
export {
  DOCUMENT_SUMMARY,
  SKILL_SET_OWNERS,
  aiSkillSetContentHandlers,
  aiSkillSetsHandlers,
  aiSkillSetsListHandler,
  skillFileText,
  skillSetsMock,
  skillViewUrl,
} from "./skillSets";
export type {
  SkillMock,
  SkillSetMock,
  SkillSetsMockOptions,
} from "./skillSets";
export {
  KNOWLEDGE_BASES,
  KNOWLEDGE_BASE_FAILED_ID,
  KNOWLEDGE_BASE_INDEXED_ID,
  KNOWLEDGE_BASE_INDEXING_ID,
  KNOWLEDGE_FAILED_FILE_TITLE,
  KnowledgeFileMockStatus,
  aiKnowledgeBasesHandlers,
  knowledgeBaseFilesMock,
  knowledgeBaseFolderHandler,
} from "./knowledgeBases";
export type { KnowledgeFileMock } from "./knowledgeBases";

export const aiHandlers = (port: string) => [
  aiAgentsHandler(port),
  aiConfigHandler(port),
  aiVectorizationGetHandler(port),
  aiVectorizationPutHandler(port),
  // No document-agent settings saved yet: the tab shows its defaults.
  aiDocumentAgentSettingsGetHandler(port),
  aiDocumentAgentSettingsPutHandler(port),
  ...aiChatEmptyStoreHandlers(port),
  // The "AI rooms" section and its projects: empty until a spec seeds them.
  aiHubRoomsHandler(port, [], []),
  ...aiProjectsHandlers(port, []),
  // The Templates tab of the Agents list: the shipped catalog. The room
  // covers it is drawn with are left to the specs (roomCoversHandler).
  aiTemplatesHandler(port),
  aiTemplateInstallHandler(port),
];
export {
  aiHubRoomAsReader,
  aiHubRoomGetByIdHandler,
  aiProjectDeleteHandlers,
} from "./projects";
