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

import React, { useContext } from "react";

import { useTranslation } from "react-i18next";

import FolderSvgUrl from "PUBLIC_DIR/images/icons/32/folder.svg?url";

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

import { SettingsContext } from "../contexts/Settings";
import { LoadersContext } from "../contexts/Loaders";

import { PAGE_COUNT } from "../FilesSelector.constants";
import { UseFilesHelpersProps } from "../FilesSelector.types";
import {
  convertFilesToItems,
  convertFoldersToItems,
  getDefaultBreadCrumb,
} from "../FilesSelector.utils";
import useInputItemHelper from "./useInputItemHelper";

const useFilesHelper = ({
  setHasNextPage,
  setTotal,
  setItems,
  setBreadCrumbs,

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
  isUserOnly,
  rootThirdPartyId,
  getRoomList,

  setIsSelectedParentFolder,
  roomsFolderId,
  getFilesArchiveError,
  isInit,
  setIsInit,

  withCreate,
  setSelectedItemId,
  setSelectedItemType,
}: UseFilesHelpersProps) => {
  const { t } = useTranslation(["Common"]);
  const {
    isFirstLoad,
    setIsFirstLoad,
    setIsNextPageLoading,
    setIsBreadCrumbsLoading,
  } = useContext(LoadersContext);

  const { getIcon, extsWebEdited, filesSettingsLoading } =
    useContext(SettingsContext);

  const { addInputItem } = useInputItemHelper({
    withCreate,
    selectedItemId,
    setItems,
  });

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
    async (sIndex: number) => {
      if (requestRunning.current || filesSettingsLoading) return;

      requestRunning.current = true;
      setIsNextPageLoading(true);

      let startIndex = sIndex;

      if (withCreate) {
        startIndex -= startIndex % 100;
      }

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

          case FilesSelectorFilterTypes.XLSX:
            filter.filterType = FilterType.SpreadsheetsOnly;
            break;

          case FilesSelectorFilterTypes.PDF:
            filter.filterType = FilterType.Pdf;
            break;

          case FilterType.DocumentsOnly:
            filter.filterType = FilterType.DocumentsOnly;
            break;

          case FilterType.PDFForm:
            filter.filterType = FilterType.PDFForm;
            break;

          case FilterType.PresentationsOnly:
            filter.filterType = FilterType.PresentationsOnly;
            break;

          case FilterType.SpreadsheetsOnly:
            filter.filterType = FilterType.SpreadsheetsOnly;
            break;

          case FilterType.ImagesOnly:
            filter.filterType = FilterType.ImagesOnly;
            break;

          case FilterType.MediaOnly:
            filter.filterType = FilterType.MediaOnly;
            break;

          case FilterType.ArchiveOnly:
            filter.filterType = FilterType.ArchiveOnly;
            break;

          case FilterType.FoldersOnly:
            filter.filterType = FilterType.FoldersOnly;
            break;

          case FilterType.FilesOnly:
            filter.filterType = FilterType.FilesOnly;
            break;

          case FilesSelectorFilterTypes.ALL:
            filter.applyFilterOption = ApplyFilterOption.All;
            filter.filterType = FilterType.None;
            break;

          case "EditorSupportedTypes":
            filter.extension = extsWebEdited
              .map((extension) => extension.slice(1))
              .join(",");
            break;

          default:
        }
      }

      const id = selectedItemId ?? (isUserOnly ? "@my" : "");

      filter.folder = id.toString();

      const setSettings = async (
        folderId: string | number,
        isErrorPath = false,
      ) => {
        if (initRef.current && getRootData && folderId !== "@my") {
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

          // breadCrumbs.forEach((item, idx) => {
          //   if (item.roomType) breadCrumbs[idx].isRoom = true;
          // });

          if (!isThirdParty && !isRoomsOnly && !isUserOnly)
            breadCrumbs.unshift({ ...getDefaultBreadCrumb(t) });

          onSetBaseFolderPath?.(isErrorPath ? [] : breadCrumbs);

          setBreadCrumbs(breadCrumbs);
          setIsBreadCrumbsLoading(false);
        }

        if (firstLoadRef.current || startIndex === 0) {
          const { security } = current;

          if (withCreate && security.Create) {
            setTotal(total + 1);
            itemList.unshift({
              isCreateNewItem: true,
              label: t("NewFolder"),
              id: "create-folder-item",
              key: "create-folder-item",
              hotkey: "f",
              onCreateClick: () => addInputItem(t("NewFolder"), FolderSvgUrl),
              onBackClick: () => {
                let isRooms;
                setBreadCrumbs((val) => {
                  const newVal = [...val];

                  const item = newVal.pop();

                  isRooms = !!item?.roomType;

                  return newVal;
                });

                if (isRooms) setSelectedItemType("rooms");

                setSelectedItemId(current.parentId);
              },
            });
          } else {
            setTotal(total);
          }
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
        setIsFirstLoad(false);
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
        }
        setIsFirstLoad(false);
        toastr.error(e as TData);
      }
    },
    [
      filesSettingsLoading,
      setIsNextPageLoading,
      withCreate,
      searchValue,
      filterParam,
      selectedItemId,
      isUserOnly,
      extsWebEdited,
      getRootData,
      setSelectedItemSecurity,
      getIcon,
      setHasNextPage,
      setSelectedTreeNode,
      setIsRoot,
      setIsInit,
      setIsFirstLoad,
      isRoomsOnly,
      getRoomList,
      onSetBaseFolderPath,
      getFilesArchiveError,
      isThirdParty,
      setBreadCrumbs,
      setIsBreadCrumbsLoading,
      roomsFolderId,
      setIsSelectedParentFolder,
      setItems,
      setTotal,
      t,
      addInputItem,
      setSelectedItemType,
      setSelectedItemId,
      rootThirdPartyId,
    ],
  );

  return { getFileList };
};

export default useFilesHelper;
