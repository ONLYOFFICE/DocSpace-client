// (c) Copyright Ascensio System SIA 2010-2024
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

import React from "react";

import { getFolder, getFolderInfo } from "../../../api/files";
import FilesFilter from "../../../api/files/filter";
import {
  ApplyFilterOption,
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
} from "../../../enums";
import { toastr } from "../../../components/toast";
import { TSelectorItem } from "../../../components/selector";
import { TData } from "../../../components/toast/Toast.type";
import { TBreadCrumb } from "../../../components/selector/Selector.types";

import { PAGE_COUNT, DEFAULT_BREAD_CRUMB } from "../FilesSelector.constants";
import { UseFilesHelpersProps } from "../FilesSelector.types";
import {
  convertFilesToItems,
  convertFoldersToItems,
} from "../FilesSelector.utils";

const useFilesHelper = ({
  setIsNextPageLoading,
  setHasNextPage,
  setTotal,
  setItems,
  setBreadCrumbs,
  setIsBreadCrumbsLoading,
  isFirstLoad,
  selectedItemId,
  setIsRoot,
  searchValue,
  disabledItems,
  setSelectedItemSecurity,
  isThirdParty,
  setSelectedTreeNode,
  filterParam,
  getRootData,
  onSetBaseFolderPath,
  isRoomsOnly,
  rootThirdPartyId,
  getRoomList,
  getIcon,
  setIsSelectedParentFolder,
  roomsFolderId,
  getFilesArchiveError,
  isInit,
  setIsInit,
}: UseFilesHelpersProps) => {
  const requestRunning = React.useRef(false);
  const initRef = React.useRef(isInit);
  const firstLoadRef = React.useRef(isFirstLoad);
  const disabledItemsRef = React.useRef(disabledItems);

  React.useEffect(() => {
    disabledItemsRef.current = disabledItems;
  }, [disabledItems]);

  React.useEffect(() => {
    firstLoadRef.current = isFirstLoad;
  }, [isFirstLoad]);

  React.useEffect(() => {
    initRef.current = isInit;
  }, [isInit]);

  const getFileList = React.useCallback(
    async (startIndex: number) => {
      if (requestRunning.current) return;

      requestRunning.current = true;
      setIsNextPageLoading(true);

      const currentSearch = searchValue || "";

      const page = startIndex / PAGE_COUNT;

      const filter = FilesFilter.getDefault();

      filter.page = page;
      filter.pageCount = PAGE_COUNT;
      filter.search = currentSearch;
      filter.applyFilterOption = null;
      filter.withSubfolders = false;
      if (filterParam) {
        filter.applyFilterOption = ApplyFilterOption.Files;
        switch (filterParam) {
          case FilesSelectorFilterTypes.DOCX:
            filter.extension = FilesSelectorFilterTypes.DOCX;
            break;

          case FilesSelectorFilterTypes.IMG:
            filter.filterType = FilterType.ImagesOnly;
            break;

          case FilesSelectorFilterTypes.BackupOnly:
            filter.extension = "gz,tar";
            break;

          case FilesSelectorFilterTypes.DOCXF:
            filter.filterType = FilterType.OFormTemplateOnly;
            break;

          case FilesSelectorFilterTypes.XLSX:
            filter.filterType = FilterType.SpreadsheetsOnly;
            break;

          case FilesSelectorFilterTypes.ALL:
            filter.filterType = FilterType.FilesOnly;
            break;

          default:
        }
      }

      const id = selectedItemId || "";

      filter.folder = id.toString();

      const setSettings = async (
        folderId: string | number,
        isErrorPath = false,
      ) => {
        if (initRef.current && getRootData) {
          const folder = await getFolderInfo(folderId, true);

          const isArchive = folder.rootFolderType === FolderType.Archive;

          if (folder.rootFolderType === FolderType.TRASH || isArchive) {
            if (isRoomsOnly && getRoomList) {
              await getRoomList(0);
              onSetBaseFolderPath?.([]);
              const error = getFilesArchiveError(folder.title);
              toastr.error(error);

              requestRunning.current = false;
              return;
            }

            await getRootData();

            if (onSetBaseFolderPath && isArchive) {
              onSetBaseFolderPath?.([]);
              const error = getFilesArchiveError(folder.title);
              toastr.error(error);
            }
            requestRunning.current = false;
            return;
          }
        }

        const currentFolder = await getFolder(folderId, filter);

        const { folders, files, total, count, pathParts, current } =
          currentFolder;

        setSelectedItemSecurity(current.security);

        const foldersList: TSelectorItem[] = convertFoldersToItems(
          folders,
          disabledItemsRef.current,
          filterParam,
        );

        const filesList: TSelectorItem[] = convertFilesToItems(
          files,
          getIcon,
          filterParam,
        );

        const itemList = [...foldersList, ...filesList];

        setHasNextPage(count === PAGE_COUNT);

        setSelectedTreeNode?.({ ...current, path: pathParts });

        if (initRef.current) {
          let foundParentId = false;
          let currentFolderIndex = -1;

          const breadCrumbs: TBreadCrumb[] = pathParts.map(
            (
              {
                id: breadCrumbId,
                title,
                roomType,
              }: {
                id: number | string;
                title: string;
                roomType?: number;
              },
              index,
            ) => {
              if (!foundParentId && disabledItemsRef.current) {
                currentFolderIndex = disabledItemsRef.current.findIndex(
                  (x) => x === id,
                );
              }

              if (!foundParentId && currentFolderIndex !== -1) {
                foundParentId = true;
                setIsSelectedParentFolder(true);
              }

              const nextItem = pathParts[index + 1];

              return {
                label: title,
                id: breadCrumbId,
                isRoom:
                  roomsFolderId === id ||
                  (index === 0 && typeof nextItem?.roomType !== "undefined"),
                roomType,
              };
            },
          );

          breadCrumbs.forEach((item, idx) => {
            if (item.roomType) breadCrumbs[idx].isRoom = true;
          });

          if (!isThirdParty && !isRoomsOnly)
            breadCrumbs.unshift({ ...DEFAULT_BREAD_CRUMB });

          onSetBaseFolderPath?.(isErrorPath ? [] : breadCrumbs);

          setBreadCrumbs(breadCrumbs);
          setIsBreadCrumbsLoading(false);
        }

        if (firstLoadRef.current || startIndex === 0) {
          setTotal(total);
          setItems(itemList);
        } else {
          setItems((prevState) => {
            if (prevState) return [...prevState, ...itemList];
            return [...itemList];
          });
        }
        setIsRoot(false);
        setIsInit(false);
        setIsNextPageLoading(false);
      };

      try {
        await setSettings(id);

        requestRunning.current = false;
      } catch (e) {
        sessionStorage.removeItem("filesSelectorPath");
        if (isThirdParty && rootThirdPartyId) {
          await setSettings(rootThirdPartyId, true);

          toastr.error(e as TData);
          requestRunning.current = false;
          return;
        }

        if (isRoomsOnly && getRoomList) {
          await getRoomList(0, null, true, true);

          toastr.error(e as TData);
          requestRunning.current = false;
          return;
        }

        requestRunning.current = false;

        getRootData?.();

        if (onSetBaseFolderPath) {
          onSetBaseFolderPath([]);
          toastr.error(e as TData);
        }
      }
    },
    [
      setIsNextPageLoading,
      searchValue,
      filterParam,
      selectedItemId,
      getRootData,
      setSelectedItemSecurity,
      getIcon,
      setHasNextPage,
      setSelectedTreeNode,
      setIsRoot,
      setIsInit,
      isRoomsOnly,
      getRoomList,
      onSetBaseFolderPath,
      getFilesArchiveError,
      isThirdParty,
      setBreadCrumbs,
      setIsBreadCrumbsLoading,
      roomsFolderId,
      setIsSelectedParentFolder,
      setTotal,
      setItems,
      rootThirdPartyId,
    ],
  );

  return { getFileList };
};

export default useFilesHelper;
