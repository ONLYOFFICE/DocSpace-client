import React from "react";

import { FolderType } from "@docspace/common/constants";
// @ts-ignore
import { getFoldersTree } from "@docspace/common/api/files";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import CatalogUserReactSvgUrl from "PUBLIC_DIR/images/catalog.user.react.svg?url";

import { useRootHelperProps, Item } from "../FilesSelector.types";

import { defaultBreadCrumb } from "../utils";
import { getCatalogIconUrlByType } from "@docspace/common/utils/catalogIcon.helper";

const useRootHelper = ({
  setBreadCrumbs,
  setIsBreadCrumbsLoading,
  setItems,
  treeFolders,
  setIsNextPageLoading,
  setTotal,
  setHasNextPage,
  isUserOnly,
}: useRootHelperProps) => {
  const [isRoot, setIsRoot] = React.useState<boolean>(false);

  const getRootData = React.useCallback(async () => {
    setBreadCrumbs([defaultBreadCrumb]);
    setIsRoot(true);
    setIsBreadCrumbsLoading(false);
    const newItems: Item[] = [];

    let currentTree: Item[] | null = null;

    if (treeFolders && treeFolders?.length > 0) {
      currentTree = treeFolders;
    } else {
      currentTree = await getFoldersTree();
    }

    currentTree?.forEach((folder) => {
      const avatar = getCatalogIconUrlByType(folder.rootFolderType);

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
  }, [treeFolders]);

  return { isRoot, setIsRoot, getRootData };
};

export default useRootHelper;
