// (c) Copyright Ascensio System SIA 2009-2024
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

import {
  TBreadCrumb,
  TSelectorItem,
} from "../../../components/selector/Selector.types";
import {
  TFolderSecurity,
  TFileSecurity,
  TFolder,
  TFile,
} from "../../../api/files/types";
import { TRoom, TRoomSecurity } from "../../../api/rooms/types";
import { TTranslation } from "../../../types";
import { FileType, FolderType } from "../../../enums";

import { FilesSelectorProps, TFilesSelectorInit } from "../FilesSelector.types";
import {
  convertFoldersToItems,
  convertRoomsToItems,
  convertFilesToItems,
} from "../../utils";
import { SettingsContext } from "../../utils/contexts/Settings";

type UseSelectorStateProps = Pick<
  FilesSelectorProps,
  | "checkCreating"
  | "filterParam"
  | "disabledItems"
  | "withCreate"
  | "disableBySecurity"
>;

const transformInitItems = (
  items: (TFolder | TFile | TRoom)[],
  disabledItems: (string | number)[],
  withCreate: boolean,
  t: TTranslation,
  getIcon: (fileExst: string) => string,
  initSelectedItemType?: string,
  filterParam?: string | number,
  disableBySecurity?: string,
) => {
  const rooms = convertRoomsToItems(
    items.filter((item) => "roomType" in item && item.roomType) as TRoom[],
    t,
  );
  const folders = convertFoldersToItems(
    items.filter(
      (item) => "parentId" in item && item.parentId && !item.roomType,
    ) as TFolder[],
    disabledItems,
    filterParam,
  );
  const files = convertFilesToItems(
    items.filter((item) => "folderId" in item && item.folderId) as TFile[],
    getIcon,
    filterParam,
    undefined,
    disableBySecurity,
  );

  return [
    ...((withCreate && [
      {
        isCreateNewItem: true,
        label: initSelectedItemType === "files" ? t("NewFolder") : t("NewRoom"),
        id: "create-folder-item",
        key: "create-folder-item",
        hotkey: "f",
        onBackClick: () => {},
      },
    ]) ||
      []),
    ...rooms,
    ...folders,
    ...files,
  ];
};

const useSelectorState = ({
  checkCreating,
  disabledItems,
  filterParam,
  withCreate,

  withInit,
  initBreadCrumbs,
  initHasNextPage,
  initItems,
  initSearchValue,
  initSelectedItemId,
  initSelectedItemType,
  initTotal,

  disableBySecurity,
}: UseSelectorStateProps & TFilesSelectorInit) => {
  const { t } = useTranslation(["Common"]);
  const { getIcon } = use(SettingsContext);

  const [breadCrumbs, setBreadCrumbs] = React.useState<TBreadCrumb[]>(
    withInit ? initBreadCrumbs : [],
  );
  const [searchValue, setSearchValue] = React.useState<string>(
    withInit && initSearchValue ? initSearchValue : "",
  );
  const [items, setItems] = React.useState<TSelectorItem[]>(
    withInit
      ? transformInitItems(
          initItems,
          disabledItems,
          withCreate,
          t,
          getIcon,
          initSelectedItemType,
          filterParam,
          disableBySecurity,
        )
      : [],
  );
  const [selectedItemType, setSelectedItemType] = React.useState<
    "rooms" | "files" | "agents" | undefined
  >(withInit ? initSelectedItemType : undefined);
  const [selectedItemId, setSelectedItemId] = React.useState<
    number | string | undefined
  >(withInit ? initSelectedItemId : undefined);
  const [selectedItemSecurity, setSelectedItemSecurity] = React.useState<
    TRoomSecurity | TFolderSecurity | TFileSecurity | undefined
  >(undefined);
  const [selectedTreeNode, setSelectedTreeNode] = React.useState({} as TFolder);
  const [selectedFileInfo, setSelectedFileInfo] = React.useState<{
    id: number | string;
    title: string;
    path?: string[];
    fileExst?: string;
    fileType?: FileType;
    viewUrl?: string;
    inPublic?: boolean;
  } | null>(null);
  const [total, setTotal] = React.useState<number>(withInit ? initTotal : 0);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(
    withInit ? initHasNextPage : false,
  );
  const [isSelectedParentFolder, setIsSelectedParentFolder] =
    React.useState<boolean>(false);
  const [isDisabledFolder, setIsDisabledFolder] = React.useState<
    boolean | undefined
  >(checkCreating);
  const [isInit, setIsInit] = React.useState<boolean>(!withInit);
  const [isInsideKnowledge, setIsInsideKnowledge] =
    React.useState<boolean>(false);
  const [isInsideResultStorage, setIsInsideResultStorage] =
    React.useState<boolean>(false);

  const [withCreateState, setWithCreateState] =
    React.useState<boolean>(withCreate);

  React.useEffect(() => {
    const isInsideKnowledgeState = !!selectedTreeNode?.path?.find(
      (f) => f.folderType === FolderType.Knowledge,
    );
    const isInsideResultStorageState = !!selectedTreeNode?.path?.find(
      (f) => f.folderType === FolderType.ResultStorage,
    );
    setWithCreateState(
      withCreate && !isInsideKnowledgeState && !isInsideResultStorageState,
    );
    setIsInsideKnowledge(isInsideKnowledgeState);
    setIsInsideResultStorage(isInsideResultStorageState);
  }, [selectedTreeNode, withCreate]);

  return {
    breadCrumbs,
    setBreadCrumbs,
    searchValue,
    setSearchValue,
    items,
    setItems,
    selectedItemType,
    setSelectedItemType,
    selectedItemId,
    setSelectedItemId,
    selectedItemSecurity,
    setSelectedItemSecurity,
    selectedTreeNode,
    setSelectedTreeNode,
    selectedFileInfo,
    setSelectedFileInfo,
    total,
    setTotal,
    hasNextPage,
    setHasNextPage,
    isSelectedParentFolder,
    setIsSelectedParentFolder,
    isDisabledFolder,
    setIsDisabledFolder,
    isInit,
    setIsInit,
    isInsideKnowledge,
    setIsInsideKnowledge,
    isInsideResultStorage,
    setIsInsideResultStorage,
    withCreateState,
  };
};

export default useSelectorState;
