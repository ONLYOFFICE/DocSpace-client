// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { CategoryType } from "@docspace/shared/constants";

import { createAliasFilesStoreBinding } from "./AliasFilesStore";

// Trash — virtual aggregation `/api/2.0/files/@trash`. Mirrors Recent /
// Favorites: list comes from `getFolder("@trash", filter)`, and Row /
// TableViewRow get the trash-specific context menu automatically because
// `useItemList` is called with `isTrashSection: true` (rootFolderType drives
// it). Restore / Delete-forever / Empty-trash live inside that context-menu
// builder, no extra wiring needed here.
const { Provider, useStore } = createAliasFilesStoreBinding(
  "@trash",
  CategoryType.Trash,
  "useTrashFilesStore",
);

export const TrashFilesStoreContextProvider = Provider;
export const useTrashFilesStore = useStore;
