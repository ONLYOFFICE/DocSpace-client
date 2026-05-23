// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import AliasFilesFilter from "../../../_components/alias-files-filter";
import { useFavoritesFilesStore } from "../../../_store";

// Favorites-specific config: Type group includes Folders / Files / Archives
// (full file types — matches client where `!isRecentFolder` is true for
// Favorites). Location group differs in client too (Documents + Rooms,
// without AccessibleViaLink) but isn't part of our SDK filter surface yet.
export default function FavoritesFilter() {
  return (
    <AliasFilesFilter
      config={{
        useStore: useFavoritesFilesStore,
        includeFoldersFilesArchivesInType: true,
        isFavoritesFolder: true,
      }}
    />
  );
}
