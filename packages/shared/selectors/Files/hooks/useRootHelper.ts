// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { use } from "react";

import { useTranslation } from "react-i18next";
import { FolderType } from "../../../enums";
import { getFoldersTree } from "../../../api/files";
import { TFolder } from "../../../api/files/types";
import { getCatalogIconUrlByType } from "../../../utils/catalogIconHelper";
import { TSelectorItem } from "../../../components/selector";
import { getDefaultBreadCrumb } from "../../utils";
import { LoadersContext } from "../../utils/contexts/Loaders";

import { UseRootHelperProps } from "../FilesSelector.types";

const useRootHelper = ({
  setBreadCrumbs,

  setItems,
  treeFolders,
  withRecentTreeFolder,
  withFavoritesTreeFolder,

  setTotal,
  setHasNextPage,
  isUserOnly,
  setIsInit,
}: UseRootHelperProps) => {
  const { t } = useTranslation(["Common"]);

  const { setIsBreadCrumbsLoading, setIsNextPageLoading, setIsFirstLoad } =
    use(LoadersContext);

  const [isRoot, setIsRoot] = React.useState<boolean>(false);
  const requestRunning = React.useRef(false);

  const getRootData = React.useCallback(async () => {
    if (requestRunning.current) return;

    requestRunning.current = true;
    setBreadCrumbs([getDefaultBreadCrumb(t)]);
    setIsRoot(true);
    setIsNextPageLoading(true);
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
        folder.rootFolderType === FolderType.USER ||
        (withRecentTreeFolder && folder.rootFolderType === FolderType.Recent) ||
        (withFavoritesTreeFolder &&
          folder.rootFolderType === FolderType.Favorites)
      ) {
        newItems.push({
          label: folder.title,
          id: folder.id,
          parentId: folder.parentId,
          rootFolderType: folder.rootFolderType,
          filesCount: folder.filesCount,
          foldersCount: folder.foldersCount,
          security: folder.security,
          isFolder: true,
          avatar,
          disableMultiSelect: true,
        });
      }
    });

    setItems(newItems);
    setTotal(newItems.length);
    setHasNextPage(false);
    setIsNextPageLoading(false);
    setIsInit(false);
    setIsFirstLoad(false);
    requestRunning.current = false;
  }, [
    isUserOnly,
    setIsFirstLoad,
    setBreadCrumbs,
    setHasNextPage,
    setIsBreadCrumbsLoading,
    setIsInit,
    setIsNextPageLoading,
    setItems,
    setTotal,
    treeFolders,
    withRecentTreeFolder,
    withFavoritesTreeFolder,
    t,
  ]);

  return { isRoot, setIsRoot, getRootData };
};

export default useRootHelper;
