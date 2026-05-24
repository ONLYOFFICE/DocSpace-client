// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { CategoryType } from "@docspace/shared/constants";

import { createAliasFilesStoreBinding } from "./AliasFilesStore";

// Per-agent ResultStorage subfolder store. Same pattern as
// KnowledgeFilesStore — folderId is swapped in via `store.setFolder` when
// the agent's ResultStorage subfolder id is discovered.
const { Provider, useStore } = createAliasFilesStoreBinding(
  "",
  CategoryType.AIAgents,
  "useResultFilesStore",
);

export const ResultFilesStoreContextProvider = Provider;
export const useResultFilesStore = useStore;
