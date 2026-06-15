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
        // Crossing into another route group (e.g. recent -> /rooms/:id)
        // remounts the layout and its FilesListStore, so the in-memory
        // highlight set below is lost. Carry the target file id in the URL;
        // the destination list re-applies it once the row renders (see the
        // `?highlight=` reader in (files)/_components/list).
        router.push(`${targetPath}${filterUrl}&highlight=${fileId}`);
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

