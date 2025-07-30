import React from "react";

import FilesFilter from "@docspace/shared/api/files/filter";
import api from "@docspace/shared/api";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/shared/components/toast";
import { TTranslation } from "@docspace/shared/types";

import { useNavigationStore } from "../_store/NavigationStore";
import { useFilesSelectionStore } from "../_store/FilesSelectionStore";
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
  const { shareKey } = useSettingsStore();

  const openFolder = React.useCallback(
    (folderId: number | string, title: string) => {
      const filter = FilesFilter.getDefault();

      filter.folder = folderId.toString();

      const filterUrl = `?${shareKey ? `key=${shareKey}&` : ""}${filter.toUrlParams()}`;

      updateNavigationItems(folderId);
      setCurrentFolderId(folderId);
      setCurrentTitle(title);
      setCurrentIsRootRoom(false);
      setSelection([]);

      window.history.pushState({}, "", filterUrl);
    },
    [
      shareKey,
      updateNavigationItems,
      setCurrentFolderId,
      setCurrentTitle,
      setCurrentIsRootRoom,
      setSelection,
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

  return { openFolder, copyFolderLink };
}
