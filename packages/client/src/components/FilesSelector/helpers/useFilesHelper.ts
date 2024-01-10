import React from "react";

// @ts-ignore
import { getFolder, getFolderInfo } from "@docspace/common/api/files";
// @ts-ignore
import FilesFilter from "@docspace/common/api/files/filter";
// @ts-ignore
import { iconSize32 } from "@docspace/common/utils/image-helpers";

import { PAGE_COUNT, defaultBreadCrumb } from "../utils";

import {
  useFilesHelpersProps,
  Item,
  BreadCrumb,
  Security,
} from "../FilesSelector.types";
import {
  ApplyFilterOption,
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
} from "@docspace/shared/enums";
//@ts-ignore
import { toastr } from "@docspace/shared/components/toast";

const DEFAULT_FILE_EXTS = "file";

export const convertFoldersToItems = (
  folders: any,
  disabledItems: any[],
  filterParam?: string
) => {
  const items = folders.map((room: any) => {
    const {
      id,
      title,
      roomType,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
    }: {
      id: number;
      title: string;
      roomType: number;
      filesCount: number;
      foldersCount: number;
      security: Security;
      parentId: number;
      rootFolderType: number;
    } = room;

    const icon = iconSize32.get("folder.svg");

    return {
      id,
      label: title,
      title,
      icon,
      filesCount,
      foldersCount,
      security,
      parentId,
      rootFolderType,
      isFolder: true,
      roomType,
      isDisabled: !!filterParam ? false : disabledItems.includes(id),
    };
  });

  return items;
};

export const convertFilesToItems = (
  files: any,
  getIcon: (size: number, fileExst: string) => string,
  filterParam?: string
) => {
  const items = files.map((file: any) => {
    const {
      id,
      title,
      security,
      parentId,
      folderId,
      rootFolderType,
      fileExst,
    } = file;

    const icon = getIcon(32, fileExst || DEFAULT_FILE_EXTS);
    const label = title.replace(fileExst, "") || fileExst;

    return {
      id,
      label,
      title,
      icon,
      security,
      parentId: parentId || folderId,
      rootFolderType,
      isFolder: false,
      isDisabled: !filterParam,
      fileExst,
    };
  });
  return items;
};

export const useFilesHelper = ({
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
  onSelectTreeNode,
  setSelectedTreeNode,
  filterParam,
  getRootData,
  onSetBaseFolderPath,
  isRoomsOnly,
  rootThirdPartyId,
  getRoomList,
  getIcon,
  t,
  setIsSelectedParentFolder,
  roomsFolderId,
}: useFilesHelpersProps) => {
  const getFileList = React.useCallback(
    async (
      startIndex: number,
      itemId: number | string | undefined,
      isInit?: boolean,
      search?: string | null
    ) => {
      setIsNextPageLoading(true);

      const currentSearch = search
        ? search
        : search === null
          ? ""
          : searchValue || "";

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
        }
      }

      const id = itemId ? itemId : selectedItemId || "";

      filter.folder = id.toString();

      const setSettings = async (
        folderId: string | number,
        isErrorPath = false
      ) => {
        if (isInit && getRootData) {
          const folder = await getFolderInfo(folderId, true);

          const isArchive = folder.rootFolderType === FolderType.Archive;

          if (folder.rootFolderType === FolderType.TRASH || isArchive) {
            if (isRoomsOnly && getRoomList) {
              await getRoomList(0, true, null, true);
              toastr.error(
                t("Files:ArchivedRoomAction", { name: folder.title })
              );
              return;
            }
            await getRootData();

            if (onSetBaseFolderPath && isArchive) {
              onSetBaseFolderPath && onSetBaseFolderPath([]);
              toastr.error(
                t("Files:ArchivedRoomAction", { name: folder.title })
              );
            }

            return;
          }
        }

        const currentFolder = await getFolder(folderId, filter);

        const { folders, files, total, count, pathParts, current } =
          currentFolder;

        setSelectedItemSecurity(current.security);

        const foldersList: Item[] = convertFoldersToItems(
          folders,
          disabledItems,
          filterParam
        );

        const filesList: Item[] = convertFilesToItems(
          files,
          getIcon,
          filterParam
        );

        const itemList = [...foldersList, ...filesList];

        setHasNextPage(count === PAGE_COUNT);

        onSelectTreeNode &&
          setSelectedTreeNode({ ...current, path: pathParts });

        if (isInit) {
          let foundParentId = false,
            currentFolderIndex = -1;

          const breadCrumbs: BreadCrumb[] = pathParts.map(
            ({
              id,
              title,
              roomType,
            }: {
              id: number | string;
              title: string;
              roomType?: number;
            }) => {
              // const folderInfo: any = await getFolderInfo(folderId);

              // const { title, id, parentId, rootFolderType, roomType } =
              //   folderInfo;

              if (!foundParentId) {
                currentFolderIndex = disabledItems.findIndex((x) => x === id);
              }

              if (!foundParentId && currentFolderIndex !== -1) {
                foundParentId = true;
                setIsSelectedParentFolder(true);
              }

              return {
                label: title,
                id: id,
                isRoom: roomsFolderId === id,
                roomType,
              };
            }
          );

          !isThirdParty &&
            !isRoomsOnly &&
            breadCrumbs.unshift({ ...defaultBreadCrumb });

          onSetBaseFolderPath &&
            onSetBaseFolderPath(isErrorPath ? [] : breadCrumbs);

          setBreadCrumbs(breadCrumbs);
          setIsBreadCrumbsLoading(false);
        }

        if (isFirstLoad || startIndex === 0) {
          setTotal(total);
          setItems(itemList);
        } else {
          setItems((prevState: Item[] | null) => {
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

          toastr.error(e);
          return;
        }

        if (isRoomsOnly && getRoomList) {
          await getRoomList(0, true, null, true);

          toastr.error(e);
          return;
        }

        getRootData && getRootData();

        if (onSetBaseFolderPath) {
          onSetBaseFolderPath([]);
          toastr.error(e);
        }
      }
    },
    [selectedItemId, searchValue, isFirstLoad, disabledItems, roomsFolderId]
  );

  return { getFileList };
};

export default useFilesHelper;
