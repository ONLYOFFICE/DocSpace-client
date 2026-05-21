// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { observer } from "mobx-react";

import AgentsFilter from "../../../_components/agents-filter";
import { useAgentsAIConfigStore } from "../../../_store";

export default observer(function SectionFilter() {
  const aiConfigStore = useAgentsAIConfigStore();
  const aiUnavailable = aiConfigStore.isLoaded && !aiConfigStore.aiReady;
  if (aiUnavailable) return null;
  return <AgentsFilter showMainButton={false} />;
});
