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

import React from "react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FolderType } from "@docspace/shared/enums";

import {
  useAiRoomStore,
  useAgentDialogsStore,
  useAgentLoadingStore,
} from "../../_store";
import type { AiRoomTab } from "../../_store";
import useAiAgentsPageInit from "../../_hooks/useAiAgentsPageInit";
import useAiAgentsFrameBridge from "../../_hooks/useAiAgentsFrameBridge";
import useAiRoomSocket from "../../_hooks/useAiRoomSocket";

import AiAgentView from "../../_components/ai-agent-view";

const CreateAgentEvent = dynamic(
  () => import("../../_components/agent-events/CreateAgentEvent"),
  { ssr: false },
);
const EditAgentEvent = dynamic(
  () => import("../../_components/agent-events/EditAgentEvent"),
  { ssr: false },
);

type Props = {
  roomId: number | null;
  initialTab: AiRoomTab;
  initialResultFileId: number | null;
};

const AiAgentDetailPage = ({
  roomId,
  initialTab,
  initialResultFileId,
}: Props) => {
  const aiRoomStore = useAiRoomStore();
  const dialogsStore = useAgentDialogsStore();
  const loadingStore = useAgentLoadingStore();

  useAiAgentsPageInit();
  useAiAgentsFrameBridge(true, aiRoomStore.currentTab);
  useAiRoomSocket(aiRoomStore.knowledgeId);
  useAiRoomSocket(aiRoomStore.resultId);

  React.useEffect(() => {
    if (roomId) aiRoomStore.setRoomId(roomId);
    // Guard against re-entrant tab writes: if the bridge or AiRoomTabs
    // already pushed a new URL, `initialTab` flips and this effect would
    // otherwise stomp the latest tab. Treat the write as idempotent.
    if (aiRoomStore.currentTab !== initialTab)
      aiRoomStore.setCurrentTab(initialTab);
    if (initialResultFileId)
      aiRoomStore.setSelectedResultFileId(initialResultFileId);
  }, [roomId, initialTab, initialResultFileId, aiRoomStore]);

  // Fetch the agent — if it 404s or the user has no access, flip the
  // not-available flag so AiAgentView falls back to <NoAccessAgent />.
  React.useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    aiRoomStore.setIsErrorAIAgentNotAvailable(false);
    // Clear the previous agent's folder IDs immediately — without this,
    // AiAgentView keeps rendering the old agent's knowledge/result files
    // until the new getFolder() resolves (visible flash on fast nav).
    aiRoomStore.setKnowledgeId(null);
    aiRoomStore.setResultId(null);
    // Clear the previous agent's title — the @header parallel route reads
    // from `aiRoomStore.title` and would otherwise flash the stale name
    // while getAIAgent resolves.
    aiRoomStore.setTitle("");
    loadingStore.setIsSectionBodyLoading(true);
    // Capture the room id this effect was started for — every async write
    // back into the store is guarded against it, so a fast switch between
    // agents can't have an in-flight response from the previous agent
    // clobber the new agent's state.
    const requestedRoomId = roomId;
    const isStale = () => cancelled || aiRoomStore.roomId !== requestedRoomId;

    void api.ai
      .getAIAgent(roomId)
      .then(async (agent) => {
        if (isStale()) return;
        aiRoomStore.setIsErrorAIAgentNotAvailable(false);
        aiRoomStore.setTitle(agent?.title ?? "");
        // Discover the agent's Knowledge / ResultStorage subfolders so the
        // corresponding tabs can list their files. Matches the client
        // FilesStore flow where folder.type drives setKnowledgeId/setResultId.
        try {
          const folderData = await api.files.getFolder(
            roomId,
            FilesFilter.getDefault(),
          );
          if (isStale()) return;
          const knowledge = folderData.folders.find(
            (f) => f.type === FolderType.Knowledge,
          );
          const result = folderData.folders.find(
            (f) => f.type === FolderType.ResultStorage,
          );
          aiRoomStore.setKnowledgeId(knowledge ? knowledge.id : null);
          aiRoomStore.setResultId(result ? result.id : null);
        } catch {
          // Tab file lists will show "no folder configured" — chat tab
          // remains usable, so we don't escalate to NoAccessAgent.
        }
      })
      .catch(() => {
        if (isStale()) return;
        aiRoomStore.setIsErrorAIAgentNotAvailable(true);
      })
      .finally(() => {
        if (!isStale()) loadingStore.setIsSectionBodyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, aiRoomStore, loadingStore]);

  return (
    <>
      <AiAgentView />

      {dialogsStore.createAgentDialogVisible ? (
        <CreateAgentEvent
          visible={dialogsStore.createAgentDialogVisible}
          onClose={() => dialogsStore.setCreateAgentDialogVisible(false)}
        />
      ) : null}

      {dialogsStore.editAgentDialogVisible && dialogsStore.editingAgent ? (
        <EditAgentEvent
          visible={dialogsStore.editAgentDialogVisible}
          onClose={() =>
            dialogsStore.setEditAgentDialogVisible(false, null)
          }
          item={dialogsStore.editingAgent}
        />
      ) : null}
    </>
  );
};

export default observer(AiAgentDetailPage);
