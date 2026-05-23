// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { CategoryType } from "@docspace/shared/constants";

import { createAliasFilesStoreBinding } from "./AliasFilesStore";

// Per-agent Knowledge subfolder store. Initial folderId is empty — the
// AiAgentDetailPage effect calls `store.setFolder(knowledgeId)` once the
// parent agent is fetched and on every agent-switch.
const { Provider, useStore } = createAliasFilesStoreBinding(
  "",
  CategoryType.AIAgents,
  "useKnowledgeFilesStore",
);

export const KnowledgeFilesStoreContextProvider = Provider;
export const useKnowledgeFilesStore = useStore;
