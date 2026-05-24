// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import AliasFilesFilter from "../../../_components/alias-files-filter";
import { useTrashFilesStore } from "../../../_store";

// Trash-specific config: full Type group (including Folders / Files /
// Archives like Favorites, since deleted items can be any type), Author
// hidden (every trashed item belongs to the current user).
export default function TrashFilter() {
  return (
    <AliasFilesFilter
      config={{
        useStore: useTrashFilesStore,
        includeFoldersFilesArchivesInType: true,
        hideAuthor: true,
      }}
    />
  );
}
