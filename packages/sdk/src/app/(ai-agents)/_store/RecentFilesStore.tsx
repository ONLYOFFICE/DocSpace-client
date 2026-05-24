// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { CategoryType } from "@docspace/shared/constants";

import { createAliasFilesStoreBinding } from "./AliasFilesStore";

export type { AliasViewAs as RecentViewAs } from "./AliasFilesStore";

// Recent — virtual aggregation `/api/2.0/files/@recent`. No socket
// subscription (mirrors client TreeFoldersStore.listenTreeFolders which
// excludes FolderType.Recent).
const { Provider, useStore } = createAliasFilesStoreBinding(
  "@recent",
  CategoryType.Recent,
  "useRecentFilesStore",
);

export const RecentFilesStoreContextProvider = Provider;
export const useRecentFilesStore = useStore;
