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

import { useAiRoomStore, useAgentDialogsStore } from "../_store";
import type { AiRoomTab } from "../_store";
import useAiAgentsPageInit from "../_hooks/useAiAgentsPageInit";
import useAiAgentsFrameBridge from "../_hooks/useAiAgentsFrameBridge";
import useAiRoomSocket from "../_hooks/useAiRoomSocket";

import AiRoomTabs from "../_components/ai-room-tabs";
import AiAgentView from "../_components/ai-agent-view";

const CreateAgentEvent = dynamic(
  () => import("../_components/agent-events/CreateAgentEvent"),
  { ssr: false },
);
const EditAgentEvent = dynamic(
  () => import("../_components/agent-events/EditAgentEvent"),
  { ssr: false },
);

type Props = {
  roomId: number | null;
  initialTab: AiRoomTab;
  initialResultFileId: number | null;
};

const AiAgentsPage = ({ roomId, initialTab, initialResultFileId }: Props) => {
  const aiRoomStore = useAiRoomStore();
  const dialogsStore = useAgentDialogsStore();

  useAiAgentsPageInit();
  useAiAgentsFrameBridge(true, aiRoomStore.currentTab);
  useAiRoomSocket(aiRoomStore.knowledgeId);
  useAiRoomSocket(aiRoomStore.resultId);

  // Sync URL-derived params into the room store. Runs on every props
  // change so browser back/forward and direct link navigations stay
  // consistent with the store.
  React.useEffect(() => {
    if (roomId) aiRoomStore.setRoomId(roomId);
    aiRoomStore.setCurrentTab(initialTab);
    if (initialResultFileId)
      aiRoomStore.setSelectedResultFileId(initialResultFileId);
  }, [roomId, initialTab, initialResultFileId, aiRoomStore]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AiRoomTabs />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <AiAgentView />
      </div>

      {dialogsStore.createAgentDialogVisible ? (
        <CreateAgentEvent
          title=""
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
    </div>
  );
};

export default observer(AiAgentsPage);
