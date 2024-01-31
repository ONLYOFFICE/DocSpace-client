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
}: UseFilesHelpersProps) => {
  const requestRunning = React.useRef(false);

  const getFileList = React.useCallback(
    async (
      startIndex: number,
      search: string | null | undefined,
      itemId: number | string | undefined,
      isInit?: boolean,
    ) => {
      if (requestRunning.current) return;

      requestRunning.current = true;
      setIsNextPageLoading(true);

      const currentSearch =
        search || (search === null ? "" : searchValue || "");

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

      const id = itemId || selectedItemId || "";

      filter.folder = id.toString();

      const setSettings = async (
        folderId: string | number,
        isErrorPath = false,
      ) => {
        if (isInit && getRootData) {
          const folder = await getFolderInfo(folderId, true);

          const isArchive = folder.rootFolderType === FolderType.Archive;

          if (folder.rootFolderType === FolderType.TRASH || isArchive) {
            if (isRoomsOnly && getRoomList) {
              await getRoomList(0, null, true, true);
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
          disabledItems,
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

        if (isInit) {
          let foundParentId = false;
          let currentFolderIndex = -1;

          const breadCrumbs: TBreadCrumb[] = pathParts.map(
            ({
              id: breadCrumbId,
              title,
              roomType,
            }: {
              id: number | string;
              title: string;
              roomType?: number;
            }) => {
              if (!foundParentId) {
                currentFolderIndex = disabledItems.findIndex((x) => x === id);
              }

              if (!foundParentId && currentFolderIndex !== -1) {
                foundParentId = true;
                setIsSelectedParentFolder(true);
              }
              requestRunning.current = false;
              return {
                label: title,
                id: breadCrumbId,
                isRoom: roomsFolderId === id,
                roomType,
              };
            },
          );

          if (!isThirdParty && !isRoomsOnly)
            breadCrumbs.unshift({ ...DEFAULT_BREAD_CRUMB });

          onSetBaseFolderPath?.(isErrorPath ? [] : breadCrumbs);

          setBreadCrumbs(breadCrumbs);
          setIsBreadCrumbsLoading(false);
        }

        if (isFirstLoad || startIndex === 0) {
          setTotal(total);
          setItems(itemList);
        } else {
          setItems((prevState) => {
            if (prevState) return [...prevState, ...itemList];
            return [...itemList];
          });
        }
        setIsRoot(false);
        setIsNextPageLoading(false);
      };

      try {
        await setSettings(id);
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
      disabledItems,
      getIcon,
      setHasNextPage,
      setSelectedTreeNode,
      isFirstLoad,
      setIsRoot,
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
