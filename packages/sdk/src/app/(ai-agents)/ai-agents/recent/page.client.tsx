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

import AliasFilesList from "../../_components/alias-files-list";

type Props = {
  folders: TFolder[];
  files: TFile[];
  current: TFolder | null;
  total: number;
  filesSettings: TFilesSettings | null;
  portalSettings: TSettings | null;
  filesFilter: string;
};

// Bail out if any of the required SSR pieces failed to load — `List` needs
// them all (filesSettings drives icon resolution, portalSettings drives the
// socket URL, `current` drives the EmptyView branch).
export default function RecentPage({
  current,
  filesSettings,
  portalSettings,
  ...rest
}: Props) {
  if (!current || !filesSettings || !portalSettings) return null;
  return (
    <AliasFilesList
      current={current}
      filesSettings={filesSettings}
      portalSettings={portalSettings}
      {...rest}
    />
  );
}
