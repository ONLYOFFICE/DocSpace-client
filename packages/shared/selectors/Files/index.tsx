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

"use client";

import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import { createFile, deleteFile } from "../../api/files";

import { FolderType, RoomsType, DeviceType, RoomSearchArea } from "../../enums";

import { TSelectorItem } from "../../components/selector";
import { Aside } from "../../components/aside";
import { Backdrop } from "../../components/backdrop";
import { Portal } from "../../components/portal";
import { toastr } from "../../components/toast";
import { TBreadCrumb } from "../../components/selector/Selector.types";

import useFilesHelper from "./hooks/useFilesHelper";
import useRoomsHelper from "./hooks/useRoomsHelper";
import useRootHelper from "./hooks/useRootHelper";
import useSocketHelper from "./hooks/useSocketHelper";
import useSelectorBody from "./hooks/useSelectorBody";
import useSelectorState from "./hooks/useSelectorState";

import { FilesSelectorProps } from "./FilesSelector.types";
import { SettingsContextProvider } from "./contexts/Settings";
import { LoadersContext, LoadersContextProvider } from "./contexts/Loaders";
import { getDefaultBreadCrumb } from "./FilesSelector.utils";

const FilesSelectorComponent = (props: FilesSelectorProps) => {
  const {
    disabledItems,
    includedItems,
    filterParam,

    treeFolders,
    onSetBaseFolderPath,
    isUserOnly,
    isRoomsOnly,
    openRoot,
    isThirdParty,
    rootThirdPartyId,
    roomsFolderId,
    currentFolderId,
    parentId,
    rootFolderType,
    onSubmit,
    onCancel,
    getIsDisabled,

    embedded,
    isPanelVisible,
    currentDeviceType,
    getFilesArchiveError,
    setIsDataReady,
    withSearch: withSearchProp,

    withCreate,
    createDefineRoomLabel,
    createDefineRoomType,

    shareKey,
    formProps,

    folderIsShared,
    checkCreating,

    withInit,
    initItems,
    initBreadCrumbs,
    initSelectedItemType,
    initSelectedItemId,
    initSearchValue,
    initTotal,
    initHasNextPage,

    applyFilterOption,
    onSelectItem,
  } = props;
  const { t } = useTranslation(["Common"]);
  const { isFirstLoad, setIsFirstLoad, showLoader } =
    useContext(LoadersContext);

  const currentSelectedItemId = React.useRef<undefined | number | string>(
    undefined,
  );
  const afterSearch = React.useRef(false);
  const ssrRendered = React.useRef(false);
  const ssrTypeRendered = React.useRef(false);

  const withInitProps = withInit
    ? {
        withInit,
        initItems,
        initBreadCrumbs: [getDefaultBreadCrumb(t), ...initBreadCrumbs],
        initSelectedItemType,
        initSelectedItemId,
        initSearchValue,
        initTotal,
        initHasNextPage,
      }
    : {};

  const {
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
  } = useSelectorState({
    checkCreating,
    disabledItems,
    filterParam,
    withCreate,
    ...withInitProps,
  });

  const { subscribe, unsubscribe } = useSocketHelper({
    disabledItems,
    filterParam,
    withCreate,
    setItems,
    setBreadCrumbs,
    setTotal,
  });

  const { isRoot, setIsRoot, getRootData } = useRootHelper({
    treeFolders,
    isUserOnly,

    setBreadCrumbs,
    setTotal,
    setItems,
    setHasNextPage,
    setIsInit,
  });

  let rootFolderTypeItem;
  const rootFolderTypeIndex = breadCrumbs.findIndex((tp) => tp.rootFolderType);
  if (rootFolderTypeIndex > -1) {
    rootFolderTypeItem = breadCrumbs[rootFolderTypeIndex].rootFolderType;
  }

  let searchArea;
  if ((rootFolderType ?? rootFolderTypeItem) === FolderType.RoomTemplates) {
    searchArea = RoomSearchArea.Templates;
  }

  const { getRoomList } = useRoomsHelper({
    setBreadCrumbs,
    setHasNextPage,
    setTotal,
    setItems,
    setIsRoot,
    onSetBaseFolderPath,
    setIsInit,
    getRootData,
    setSelectedItemType,
    subscribe,
    setSelectedItemSecurity,

    searchValue,
    isRoomsOnly,
    isInit,
    withCreate,
    createDefineRoomLabel,
    createDefineRoomType,
    searchArea,

    withInit,
  });

  const { getFileList } = useFilesHelper({
    setBreadCrumbs,
    setHasNextPage,
    setTotal,
    setItems,
    setIsRoot,
    setSelectedItemSecurity,
    setSelectedTreeNode,
    getRootData,
    onSetBaseFolderPath,
    getRoomList,
    setIsSelectedParentFolder,
    getFilesArchiveError,
    setIsInit,
    setSelectedItemId,
    setSelectedItemType,

    selectedItemId,
    searchValue,
    disabledItems,
    includedItems,
    isThirdParty,
    filterParam,
    isRoomsOnly,
    isUserOnly,
    rootThirdPartyId,
    roomsFolderId,
    isInit,
    withCreate,
    shareKey,

    withInit,
    applyFilterOption,
  });

  const onClickBreadCrumb = React.useCallback(
    (item: TBreadCrumb) => {
      if (!isFirstLoad) {
        afterSearch.current = false;
        setSearchValue("");
        setIsFirstLoad(true);
        if (+item.id === 0) {
          setSelectedItemSecurity(undefined);
          setSelectedItemType(undefined);
          getRootData();
        } else {
          setBreadCrumbs((bc) => {
            const idx = bc.findIndex(
              (value) => value.id.toString() === item.id.toString(),
            );

            const maxLength = bc.length - 1;
            let foundParentId = false;
            let currentFolderIndex = -1;

            const newBreadCrumbs = bc.map((i, index) => {
              if (!foundParentId) {
                currentFolderIndex = disabledItems.findIndex(
                  (id) => id === i?.id,
                );
              }

              if (index !== maxLength && currentFolderIndex !== -1) {
                foundParentId = true;
                if (!isSelectedParentFolder) setIsSelectedParentFolder(true);
              }

              if (
                index === maxLength &&
                !foundParentId &&
                isSelectedParentFolder
              )
                setIsSelectedParentFolder(false);

              return { ...i };
            });

            newBreadCrumbs.splice(idx + 1, newBreadCrumbs.length - idx - 1);
            return newBreadCrumbs;
          });

          setSelectedItemId(item.id);
          setSelectedFileInfo(null);
          if (item.isRoom) {
            setSelectedItemType("rooms");
          } else {
            setSelectedItemType("files");
          }
        }
      }
    },
    [
      disabledItems,
      getRootData,
      isFirstLoad,
      isSelectedParentFolder,
      setBreadCrumbs,
      setIsFirstLoad,
      setIsSelectedParentFolder,
      setSearchValue,
      setSelectedFileInfo,
      setSelectedItemId,
      setSelectedItemSecurity,
      setSelectedItemType,
    ],
  );

  const onSelectAction = React.useCallback(
    async (
      item: TSelectorItem,
      isDoubleClick: boolean,
      doubleClickCallback: () => Promise<void>,
    ) => {
      onSelectItem?.(item);
      if (item.isFolder) {
        if (isDoubleClick) return;

        const isFormRoom = item.roomType === RoomsType.FormRoom;

        if (isFormRoom && formProps?.isRoomFormAccessible === false)
          return toastr.warning(formProps.message);

        setIsFirstLoad(true);

        setBreadCrumbs((value) => [
          ...value,
          {
            label: item.label,
            id: item.id,
            isRoom:
              item.parentId === 0 && item.rootFolderType === FolderType.Rooms,
            roomType: item.roomType,
            shared: item.shared,
          } as TBreadCrumb,
        ]);
        setSelectedItemId(item.id);
        setSearchValue("");
        setSelectedFileInfo(null);

        if (item.parentId === 0 && item.rootFolderType === FolderType.Rooms) {
          setSelectedItemType("rooms");
        } else {
          setSelectedItemType("files");
        }

        if (checkCreating && item.id) {
          try {
            const fileInfo = await createFile(item.id, t("Common:NewDocument"));
            await deleteFile(fileInfo.id, true, true);
            setIsDisabledFolder(false);
          } catch (e) {
            console.log(e);
            setIsDisabledFolder(true);
          }
        }
      } else if (item.id && item.label) {
        const inPublic =
          breadCrumbs.findIndex(
            (f) =>
              f.roomType === RoomsType.PublicRoom ||
              f.roomType === RoomsType.FormRoom ||
              (f.roomType === RoomsType.CustomRoom && f.shared),
          ) > -1;

        setSelectedFileInfo({
          id: item.id,
          title: item.label,
          fileExst: item.fileExst,
          fileType: item.fileType,
          viewUrl: item.viewUrl,
          inPublic,
        });

        if (isDoubleClick) {
          doubleClickCallback();
        }
      }
    },
    [
      formProps?.isRoomFormAccessible,
      formProps?.message,
      setIsFirstLoad,
      setBreadCrumbs,
      setSelectedItemId,
      setSearchValue,
      setSelectedFileInfo,
      checkCreating,
      breadCrumbs,
      setSelectedItemType,
      t,
      setIsDisabledFolder,
      onSelectItem,
    ],
  );

  React.useEffect(() => {
    if (!selectedItemId) return;
    if (selectedItemId && isRoot) return unsubscribe(+selectedItemId);

    subscribe(+selectedItemId);
  }, [selectedItemId, isRoot, unsubscribe, subscribe]);

  React.useEffect(() => {
    if (initSelectedItemId === currentFolderId) return;

    setSelectedItemId(currentFolderId);
  }, [currentFolderId, initSelectedItemId, setSelectedItemId]);

  React.useEffect(() => {
    if (withInit && !ssrTypeRendered.current) {
      ssrTypeRendered.current = true;
      return;
    }

    setIsFirstLoad(true);

    const needRoomList = isRoomsOnly && !currentFolderId;

    if (needRoomList) {
      setSelectedItemType("rooms");
      return;
    }

    if (!currentFolderId && !isUserOnly && !openRoot) {
      setSelectedItemType("rooms");
      return;
    }

    if (
      needRoomList ||
      (+currentFolderId === roomsFolderId &&
        rootFolderType === FolderType.Rooms)
    ) {
      setSelectedItemType("rooms");

      return;
    }

    setSelectedItemType("files");
  }, [
    currentFolderId,
    isRoomsOnly,
    isThirdParty,
    isUserOnly,
    parentId,
    roomsFolderId,
    rootFolderType,
    openRoot,
    setIsFirstLoad,
    setSelectedItemType,
    withInit,
  ]);

  React.useEffect(() => {
    currentSelectedItemId.current = selectedItemId;
  }, [selectedItemId]);

  const onSearchAction = (value: string, callback?: VoidFunction) => {
    if (selectedItemId !== currentSelectedItemId.current) {
      setSearchValue("");
      return;
    }
    setSearchValue(value);

    callback?.();
    afterSearch.current = true;
  };

  React.useEffect(() => {
    if (!selectedItemType) return;

    if (searchValue) {
      setIsFirstLoad(true);
      setItems([]);
    }
  }, [searchValue, selectedItemType, setIsFirstLoad, setItems]);

  const onClearSearchAction = React.useCallback(
    (callback?: VoidFunction) => {
      if (!searchValue) return;
      setIsFirstLoad(true);
      setItems([]);

      setSearchValue("");

      callback?.();
      afterSearch.current = true;
    },
    [searchValue, setIsFirstLoad, setItems, setSearchValue],
  );

  React.useEffect(() => {
    if (setIsDataReady) setIsDataReady(!showLoader);
  }, [setIsDataReady, showLoader]);

  const onSubmitAction = React.useCallback(
    async (
      i: unknown,
      accessRights: unknown,
      fileName: string,
      isChecked: boolean,
    ) => {
      const inPublicRoom = breadCrumbs.findIndex((f) => f.shared) > -1;
      const showMoveToPublicDialog = inPublicRoom && !folderIsShared;

      const folderTitle = breadCrumbs[breadCrumbs.length - 1].label;

      await onSubmit(
        selectedItemId,
        folderTitle,
        showMoveToPublicDialog,
        breadCrumbs,
        fileName,
        isChecked,
        selectedTreeNode,
        selectedFileInfo,
      );
    },
    [
      breadCrumbs,
      onSubmit,
      selectedItemId,
      selectedTreeNode,
      selectedFileInfo,
      folderIsShared,
    ],
  );

  React.useEffect(() => {
    if (withInit && !ssrRendered.current) {
      ssrRendered.current = true;
      return;
    }

    if (selectedItemType === "rooms") {
      getRoomList(0);
      return;
    }
    if (openRoot && !selectedItemId) {
      getRootData();
      return;
    }

    if (selectedItemType === "files" && (selectedItemId || isUserOnly))
      getFileList(0);
  }, [
    getFileList,
    getRoomList,
    selectedItemType,
    selectedItemId,
    getRootData,
    openRoot,
    isUserOnly,
    withInit,
  ]);

  const withSearch = withSearchProp
    ? isRoot
      ? false
      : searchValue
        ? true
        : isFirstLoad
          ? true
          : afterSearch.current || !!items.length
    : false;

  const SelectorBody = useSelectorBody({
    ...props,

    withSearch,
    searchValue,
    onSearch: onSearchAction,
    onClearSearch: onClearSearchAction,

    onSubmit: onSubmitAction,
    disableSubmitButton: getIsDisabled(
      isFirstLoad && showLoader,
      isSelectedParentFolder,
      selectedItemId,
      selectedItemType,
      isRoot,
      selectedItemSecurity,
      selectedFileInfo,
      isDisabledFolder,
    ),

    breadCrumbs,
    onSelectBreadCrumb: onClickBreadCrumb,

    loadNextPage: isRoot
      ? async () => {}
      : selectedItemType === "rooms"
        ? getRoomList
        : getFileList,

    items,
    onSelect: onSelectAction,

    hasNextPage,
    totalItems: total,

    isRoot,
  });

  const selectorComponent = embedded ? (
    SelectorBody
  ) : (
    <>
      <Backdrop
        visible={isPanelVisible}
        isAside
        withBackground
        zIndex={309}
        onClick={onCancel}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={310}
        onClose={onCancel}
        withoutHeader
      >
        {SelectorBody}
      </Aside>
    </>
  );

  return currentDeviceType === DeviceType.mobile && !embedded ? (
    <Portal visible={isPanelVisible} element={<div>{selectorComponent}</div>} />
  ) : (
    selectorComponent
  );
};

const FilesSelector = (props: FilesSelectorProps) => {
  const { filesSettings, getIcon, withInit } = props;

  return (
    <LoadersContextProvider withInit={withInit}>
      <SettingsContextProvider settings={filesSettings} getIcon={getIcon}>
        <FilesSelectorComponent {...props} />
      </SettingsContextProvider>
    </LoadersContextProvider>
  );
};

export default FilesSelector;
