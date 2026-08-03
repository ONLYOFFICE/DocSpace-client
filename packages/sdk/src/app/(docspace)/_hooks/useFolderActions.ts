/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { useRouter } from "next/navigation";

import FilesFilter from "@docspace/shared/api/files/filter";
import api from "@docspace/shared/api";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TTranslation } from "@docspace/shared/types";

import { OpenFolderContext } from "../_contexts/OpenFolderContext";
import { useNavigationStore } from "../_store/NavigationStore";
import { useFilesSelectionStore } from "../_store/FilesSelectionStore";
import { useFilesListStore } from "../_store/FilesListStore";
import { useSettingsStore } from "../_store/SettingsStore";

type UseFolderActionsProps = { t: TTranslation };

export default function useFolderActions({ t }: UseFolderActionsProps) {
  const {
    updateNavigationItems,
    setCurrentFolderId,
    setCurrentTitle,
    setCurrentIsRootRoom,
  } = useNavigationStore();
  const { setSelection } = useFilesSelectionStore();
  const { setHighlightFileId } = useFilesListStore();
  const { shareKey } = useSettingsStore();
  const openFolderOverride = React.useContext(OpenFolderContext);
  const router = useRouter();

  const openFolder = React.useCallback(
    (folderId: number | string, title: string) => {
      if (openFolderOverride && openFolderOverride(folderId, title)) {
        return;
      }

      const filter = FilesFilter.getDefault();

      filter.folder = folderId.toString();

      const filterUrl = `?${shareKey ? `key=${shareKey}&` : ""}${filter.toUrlParams()}`;

      updateNavigationItems(folderId);
      setCurrentFolderId(folderId);
      setCurrentTitle(title);
      setCurrentIsRootRoom(false);
      setSelection([]);

      window.history.pushState({}, "", `${window.location.pathname}${filterUrl}`);
    },
    [
      openFolderOverride,
      shareKey,
      updateNavigationItems,
      setCurrentFolderId,
      setCurrentTitle,
      setCurrentIsRootRoom,
      setSelection,
    ],
  );

  const openLocation = React.useCallback(
    (
      folderId: number | string,
      fileId: number | string,
      search: string,
      targetPath?: string,
    ) => {
      const filter = FilesFilter.getDefault();
      filter.folder = folderId.toString();
      filter.search = search;

      const filterUrl = `?${shareKey ? `key=${shareKey}&` : ""}${filter.toUrlParams()}`;

      setCurrentFolderId(folderId);
      setCurrentTitle("");
      setCurrentIsRootRoom(false);
      setSelection([]);

      if (targetPath) {
        router.push(`${targetPath}${filterUrl}`);
      } else {
        window.history.pushState(
          {},
          "",
          `${window.location.pathname}${filterUrl}`,
        );
      }

      setHighlightFileId(fileId);
    },
    [
      router,
      shareKey,
      setCurrentFolderId,
      setCurrentTitle,
      setCurrentIsRootRoom,
      setSelection,
      setHighlightFileId,
    ],
  );

  const copyFolderLink = React.useCallback(
    async (itemId: number) => {
      const itemLink = await api.files.getFolderLink(itemId);
      copyShareLink(itemLink.sharedTo.shareLink);
      toastr.success(t("Common:LinkCopySuccess"));
    },
    [t],
  );

  return { openFolder, openLocation, copyFolderLink };
}

