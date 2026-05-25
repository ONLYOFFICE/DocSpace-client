// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import AliasFilesFilter from "../../../_components/alias-files-filter";
import { useRecentFilesStore } from "../../../_store";

// Recent-specific config: Type group excludes Folders/Files/Archives
// (mirrors client's `!isRecentFolder` gate in Home/Section/Filter).
export default function RecentFilter() {
  return (
    <AliasFilesFilter
      config={{
        useStore: useRecentFilesStore,
        includeFoldersFilesArchivesInType: false,
        isRecentFolder: true,
      }}
    />
  );
}
