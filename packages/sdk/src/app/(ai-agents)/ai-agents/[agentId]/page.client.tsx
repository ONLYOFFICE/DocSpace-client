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
  useKnowledgeFilesStore,
  useResultFilesStore,
} from "../../_store";
import type { AiRoomTab } from "../../_store";
import useAiAgentsPageInit from "../../_hooks/useAiAgentsPageInit";
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
  const knowledgeFilesStore = useKnowledgeFilesStore();
  const resultFilesStore = useResultFilesStore();

  useAiAgentsPageInit();
  useAiRoomSocket(aiRoomStore.knowledgeId);
  useAiRoomSocket(aiRoomStore.resultId);

  React.useEffect(() => {
    if (roomId) aiRoomStore.setRoomId(roomId);
    // Read the tab from the LIVE URL, not the SSR `initialTab` prop. AiRoomTabs
    // keeps `?tab=` in sync via history.replaceState on every tab click, but
    // the SSR prop is frozen at mount. Under dev StrictMode / concurrent
    // AiAgentProviders mounts this effect re-runs on a second instance with the
    // stale prop (e.g. "chat") and would otherwise stomp the user's current
    // tab back. The live URL always reflects the latest selection.
    const liveTab = new URLSearchParams(window.location.search).get("tab");
    const tab: AiRoomTab =
      liveTab === "knowledge" || liveTab === "result" ? liveTab : "chat";
    if (aiRoomStore.currentTab !== tab) aiRoomStore.setCurrentTab(tab);
    if (initialResultFileId)
      aiRoomStore.setSelectedResultFileId(initialResultFileId);
  }, [roomId, initialTab, initialResultFileId, aiRoomStore]);

  // Fetch the agent — if it 404s or the user has no access, flip the
  // not-available flag so AiAgentView falls back to <NoAccessAgent />.
  // Mirrors client `FilesStore.fetchFiles`: a single getFolder call yields
  // both the agent's metadata (data.current.title) and its Knowledge /
  // ResultStorage subfolders. AbortController cancels in-flight requests
  // when the user fast-switches between agents — the aborted promise
  // rejects and the catch path skips the not-available flag.
  React.useEffect(() => {
    if (!roomId) return;
    aiRoomStore.setIsErrorAIAgentNotAvailable(false);
    // Clear the previous agent's folder IDs / title immediately — without
    // this, the @header slot would flash the stale name and AiAgentView
    // would keep rendering the old agent's knowledge/result files until
    // the new getFolder() resolves.
    aiRoomStore.setKnowledgeId(null);
    aiRoomStore.setResultId(null);
    aiRoomStore.setTitle("");
    loadingStore.setIsSectionBodyLoading(true);

    const controller = new AbortController();

    void api.files
      .getFolder(roomId, FilesFilter.getDefault(), controller.signal)
      .then((data) => {
        aiRoomStore.setTitle(data.current?.title ?? "");
        const knowledge = data.folders.find(
          (f) => f.type === FolderType.Knowledge,
        );
        const result = data.folders.find(
          (f) => f.type === FolderType.ResultStorage,
        );
        aiRoomStore.setKnowledgeId(knowledge ? knowledge.id : null);
        aiRoomStore.setResultId(result ? result.id : null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        aiRoomStore.setIsErrorAIAgentNotAvailable(true);
      })
      .finally(() => {
        if (!controller.signal.aborted)
          loadingStore.setIsSectionBodyLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [roomId, aiRoomStore, loadingStore]);

  // Reset Knowledge / Result file stores immediately on roomId change so
  // the previous agent's files don't flash inside the tabs while the new
  // ids are still being discovered.
  React.useEffect(() => {
    knowledgeFilesStore.reset();
    resultFilesStore.reset();
  }, [roomId, knowledgeFilesStore, resultFilesStore]);

  // Once knowledge / result folder ids are resolved, point the per-tab
  // stores at the new folder. `setFolder` aborts in-flight requests,
  // clears state, and re-fetches in one call.
  React.useEffect(() => {
    if (aiRoomStore.knowledgeId) {
      knowledgeFilesStore.setFolder(aiRoomStore.knowledgeId);
    }
  }, [aiRoomStore.knowledgeId, knowledgeFilesStore]);

  React.useEffect(() => {
    if (aiRoomStore.resultId) {
      resultFilesStore.setFolder(aiRoomStore.resultId);
    }
  }, [aiRoomStore.resultId, resultFilesStore]);

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
