// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

// Store fetcher conventions:
// - Read-only fetchers (Tags, AIConfig, Quota) use inflight-promise de-dup
//   so concurrent callers share one in-flight request and idempotent re-mounts
//   skip the round-trip.
// - List/search fetchers (AgentsListStore, AISettingsStore.checkUnavailableProviders)
//   use AbortController because their results are cancellable and the
//   in-flight request can be invalidated by a newer filter.

import React from "react";

import { AgentLoadingStoreContextProvider } from "./AgentLoadingStore";
import { AgentTagsStoreContextProvider } from "./AgentTagsStore";
import { AvatarEditorStoreContextProvider } from "./AvatarEditorStore";
import { AgentDialogsStoreContextProvider } from "./AgentDialogsStore";
import { AiRoomStoreContextProvider } from "./AiRoomStore";
import { CreateEditAgentStoreContextProvider } from "./CreateEditAgentStore";
import { AgentsListStoreContextProvider } from "./AgentsListStore";
import { AgentsUserStoreContextProvider } from "./AgentsUserStore";
import { AgentsQuotaStoreContextProvider } from "./AgentsQuotaStore";
import { AgentsAIConfigStoreContextProvider } from "./AgentsAIConfigStore";
import { AISettingsStoreContextProvider } from "./AISettingsStore";
import { AgentFilesStoreContextProvider } from "./AgentFilesStore";
import { AgentInfoPanelStoreContextProvider } from "./AgentInfoPanelStore";
import { RecentFilesStoreContextProvider } from "./RecentFilesStore";
import { FavoritesFilesStoreContextProvider } from "./FavoritesFilesStore";
import { TrashFilesStoreContextProvider } from "./TrashFilesStore";

export const AiAgentsStoreProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AgentLoadingStoreContextProvider>
      <AgentTagsStoreContextProvider>
        <AvatarEditorStoreContextProvider>
          <AgentDialogsStoreContextProvider>
            <AiRoomStoreContextProvider>
              <CreateEditAgentStoreContextProvider>
                <AgentsUserStoreContextProvider>
                  <AgentsQuotaStoreContextProvider>
                    <AgentsAIConfigStoreContextProvider>
                      <AISettingsStoreContextProvider>
                        <AgentFilesStoreContextProvider>
                          <RecentFilesStoreContextProvider>
                            <FavoritesFilesStoreContextProvider>
                              <TrashFilesStoreContextProvider>
                                <AgentInfoPanelStoreContextProvider>
                                  <AgentsListStoreContextProvider>
                                    {children}
                                  </AgentsListStoreContextProvider>
                                </AgentInfoPanelStoreContextProvider>
                              </TrashFilesStoreContextProvider>
                            </FavoritesFilesStoreContextProvider>
                          </RecentFilesStoreContextProvider>
                        </AgentFilesStoreContextProvider>
                      </AISettingsStoreContextProvider>
                    </AgentsAIConfigStoreContextProvider>
                  </AgentsQuotaStoreContextProvider>
                </AgentsUserStoreContextProvider>
              </CreateEditAgentStoreContextProvider>
            </AiRoomStoreContextProvider>
          </AgentDialogsStoreContextProvider>
        </AvatarEditorStoreContextProvider>
      </AgentTagsStoreContextProvider>
    </AgentLoadingStoreContextProvider>
  );
};

export { useAgentLoadingStore } from "./AgentLoadingStore";
export { useAgentTagsStore } from "./AgentTagsStore";
export { useAvatarEditorStore } from "./AvatarEditorStore";
export { useAgentDialogsStore } from "./AgentDialogsStore";
export { useAiRoomStore } from "./AiRoomStore";
export type { AiRoomTab } from "./AiRoomStore";
export { useCreateEditAgentStore } from "./CreateEditAgentStore";
export { useAgentsListStore } from "./AgentsListStore";
export type { AgentsViewAs } from "./AgentsListStore";
export { useAgentsUserStore } from "./AgentsUserStore";
export { useAgentsQuotaStore } from "./AgentsQuotaStore";
export { useAgentsAIConfigStore } from "./AgentsAIConfigStore";
export { useAISettingsStore } from "./AISettingsStore";
export { useAgentFilesStore } from "./AgentFilesStore";
export { useRecentFilesStore } from "./RecentFilesStore";
export { useFavoritesFilesStore } from "./FavoritesFilesStore";
export { useTrashFilesStore } from "./TrashFilesStore";
export type { default as AliasFilesStore, AliasViewAs } from "./AliasFilesStore";
export { useAgentInfoPanelStore } from "./AgentInfoPanelStore";
export type { AgentInfoPanelView } from "./AgentInfoPanelStore";
