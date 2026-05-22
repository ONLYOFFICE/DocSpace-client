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
import { useFavoritesFilesStore } from "../../_store";

type Props = {
  folders: TFolder[];
  files: TFile[];
  current: TFolder | null;
  total: number;
  filesSettings: TFilesSettings | null;
  portalSettings: TSettings | null;
  filesFilter: string;
};

// See recent/page.client.tsx for the bail-out rationale.
export default function FavoritesPage({
  current,
  filesSettings,
  portalSettings,
  ...rest
}: Props) {
  if (!current || !filesSettings || !portalSettings) return null;
  return (
    <AliasFilesList
      useStore={useFavoritesFilesStore}
      current={current}
      filesSettings={filesSettings}
      portalSettings={portalSettings}
      {...rest}
    />
  );
}
