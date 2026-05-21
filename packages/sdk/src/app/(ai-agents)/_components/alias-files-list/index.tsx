// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import type {
  TFile,
  TFilesSettings,
  TFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

import List from "@/app/(docspace)/(files)/_components/list";

// Thin wrapper around the docspace files List — same row/tile/table views,
// same EmptyView (which already branches on `current.rootFolderType` to
// render the Recent / Favorites empty states from EmptyViewContainer.utils).
// We just feed it the SSR-fetched payload we already gather in the alias
// `/page.tsx` server components.
//
// The docspace store stack (FilesListStore / FilesSelectionStore /
// SettingsStore / NavigationStore / …) is provided one level up in
// (ai-agents)/layout.client.tsx so both the body and the filter slot share
// the same SettingsStore — switching view-as in the filter is observed by
// the List immediately.

type Props = {
  folders: TFolder[];
  files: TFile[];
  current: TFolder;
  total: number;
  filesSettings: TFilesSettings;
  portalSettings: TSettings;
  filesFilter: string;
};

const AliasFilesList = ({
  folders,
  files,
  current,
  total,
  filesSettings,
  portalSettings,
  filesFilter,
}: Props) => {
  return (
    <List
      folders={folders}
      files={files}
      current={current}
      total={total}
      filesSettings={filesSettings}
      portalSettings={portalSettings}
      filesFilter={filesFilter}
    />
  );
};

export default AliasFilesList;
