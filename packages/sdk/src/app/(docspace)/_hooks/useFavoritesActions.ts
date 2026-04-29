// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useCallback } from "react";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TTranslation } from "@docspace/shared/types";

import { useFilesListStore } from "../_store/FilesListStore";
import type { TFileItem, TFolderItem } from "./useItemList";

type UseFavoritesActionsProps = { t: TTranslation };

export default function useFavoritesActions({ t }: UseFavoritesActionsProps) {
  const filesListStore = useFilesListStore();

  const markAsFavorite = useCallback(
    async (item: TFileItem | TFolderItem) => {
      try {
        const fileIds = item.isFolder ? [] : [item.id as number];
        const folderIds = item.isFolder ? [item.id as number] : [];
        await api.files.markAsFavorite(fileIds, folderIds);
        filesListStore.updateItemFavorite(item.id, true);
        toastr.success(t("Common:MarkedAsFavorite"));
      } catch {
        toastr.error(t("Common:UnexpectedError"));
      }
    },
    [t, filesListStore],
  );

  const removeFromFavorites = useCallback(
    async (item: TFileItem | TFolderItem) => {
      try {
        const fileIds = item.isFolder ? [] : [item.id as number];
        const folderIds = item.isFolder ? [item.id as number] : [];
        await api.files.removeFromFavorite(fileIds, folderIds);
        filesListStore.updateItemFavorite(item.id, false);
        toastr.success(t("Common:RemovedFromFavorites"));
      } catch {
        toastr.error(t("Common:UnexpectedError"));
      }
    },
    [t, filesListStore],
  );

  const removeFromRecent = useCallback(
    async (item: TFileItem) => {
      try {
        await api.files.deleteFilesFromRecent([item.id as number]);
        filesListStore.removeItem(item.id);
        toastr.success(t("Common:RemovedFromList"));
      } catch {
        toastr.error(t("Common:UnexpectedError"));
      }
    },
    [t, filesListStore],
  );

  return { markAsFavorite, removeFromFavorites, removeFromRecent };
}
