// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import AgentsHeader from "../../../_components/agents-header";
import { useAiRoomStore } from "../../../_store";

export default observer(function AgentDetailHeader() {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const aiRoomStore = useAiRoomStore();

  const goToList = () => router.push("/ai-agents");

  return (
    <AgentsHeader
      title={aiRoomStore.title}
      navigationItems={[
        {
          id: "ai-agents",
          title: t("Common:AIAgents", { defaultValue: "AI Agents" }),
          isRootRoom: true,
        },
      ]}
      onBackToParentFolder={goToList}
      onClickFolder={() => goToList()}
    />
  );
});
