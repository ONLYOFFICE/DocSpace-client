import React from "react";

import { FolderType } from "../../../enums";
import { getFoldersTree } from "../../../api/files";
import { TFolder } from "../../../api/files/types";
import { getCatalogIconUrlByType } from "../../../utils/catalogIconHelper";
import { TSelectorItem } from "../../../components/selector";

import { UseRootHelperProps } from "../FilesSelector.types";
import { DEFAULT_BREAD_CRUMB } from "../FilesSelector.constants";

const useRootHelper = ({
  setBreadCrumbs,
  setIsBreadCrumbsLoading,
  setItems,
  treeFolders,
  setIsNextPageLoading,
  setTotal,
  setHasNextPage,
  isUserOnly,
}: UseRootHelperProps) => {
  const [isRoot, setIsRoot] = React.useState<boolean>(false);

  const getRootData = React.useCallback(async () => {
    setBreadCrumbs([DEFAULT_BREAD_CRUMB]);
    setIsRoot(true);
    setIsBreadCrumbsLoading(false);
    const newItems: TSelectorItem[] = [];

    let currentTree: TFolder[] | null = null;

    if (treeFolders && treeFolders?.length > 0) {
      currentTree = treeFolders;
    } else {
      const folders = await getFoldersTree();
      currentTree = folders;
    }

    currentTree?.forEach((folder) => {
      let avatar = "";
      if (folder.rootFolderType)
        avatar = getCatalogIconUrlByType(folder.rootFolderType);

      if (
        (!isUserOnly && folder.rootFolderType === FolderType.Rooms) ||
        folder.rootFolderType === FolderType.USER
      ) {
        newItems.push({
          label: folder.title,
          title: folder.title,
          id: folder.id,
          parentId: folder.parentId,
          rootFolderType: folder.rootFolderType,
          filesCount: folder.filesCount,
          foldersCount: folder.foldersCount,
          security: folder.security,
          isFolder: true,
          avatar,
        });
      }
    });

    setItems(newItems);
    setTotal(newItems.length);
    setHasNextPage(false);
    setIsNextPageLoading(false);
  }, [
    isUserOnly,
    setBreadCrumbs,
    setHasNextPage,
    setIsBreadCrumbsLoading,
    setIsNextPageLoading,
    setItems,
    setTotal,
    treeFolders,
  ]);

  return { isRoot, setIsRoot, getRootData };
};

export default useRootHelper;
