// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import AgentsHeader from "../../../_components/agents-header";

export default function SettingsHeader() {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);

  const goToList = () => router.push("/ai-agents");

  return (
    <AgentsHeader
      title={t("Common:Settings")}
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
}
