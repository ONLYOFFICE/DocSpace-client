// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { CategoryType } from "@docspace/shared/constants";

import { createAliasFilesStoreBinding } from "./AliasFilesStore";

// Favorites — virtual aggregation `/api/2.0/files/@favorites`. Unlike
// Recent, the portal does emit socket updates for Favorites
// (TreeFoldersStore.listenTreeFolders subscribes to DIR-{favoritesFolderId});
// SDK currently relies on page-level refetch for parity simplicity.
const { Provider, useStore } = createAliasFilesStoreBinding(
  "@favorites",
  CategoryType.Favorite,
  "useFavoritesFilesStore",
);

export const FavoritesFilesStoreContextProvider = Provider;
export const useFavoritesFilesStore = useStore;
