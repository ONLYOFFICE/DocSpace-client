"use client";

import React from "react";
import { useTheme } from "styled-components";

import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";
import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/empty_screen_alt.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_alt_dark.svg?url";

import { TRoomSecurity } from "../../api/rooms/types";
import { TFileSecurity, TFolder, TFolderSecurity } from "../../api/files/types";

import { FolderType, RoomsType, DeviceType } from "../../enums";

import { Selector, TSelectorItem } from "../../components/selector";
import { Aside } from "../../components/aside";
import { Backdrop } from "../../components/backdrop";
import { Portal } from "../../components/portal";
import {
  RowLoader,
  SearchLoader,
  BreadCrumbsLoader,
} from "../../skeletons/selector";
import { TBreadCrumb } from "../../components/selector/Selector.types";

import useFilesHelper from "./hooks/useFilesHelper";
import useLoadersHelper from "./hooks/useLoadersHelper";
import useRoomsHelper from "./hooks/useRoomsHelper";
import useRootHelper from "./hooks/useRootHelper";
import useSocketHelper from "./hooks/useSocketHelper";
import { FilesSelectorProps } from "./FilesSelector.types";
import useFilesSettings from "./hooks/useFilesSettings";

const FilesSelector = ({
  socketHelper,
  socketSubscribers,
  disabledItems,
  filterParam,
  getIcon: getIconProp,

  treeFolders,
  onSetBaseFolderPath,
  isUserOnly,
  isRoomsOnly,
  isThirdParty,
  rootThirdPartyId,
  roomsFolderId,
  currentFolderId,
  parentId,
  rootFolderType,

  onClose,
  onAccept,

  getIsDisabled,

  withHeader,
  headerLabel,
  searchPlaceholder,
  acceptButtonLabel,
  withCancelButton,
  cancelButtonLabel,
  onCloseAction,
  emptyScreenHeader,
  emptyScreenDescription,
  searchEmptyScreenHeader,
  searchEmptyScreenDescription,
  withFooterInput,
  withFooterCheckbox,
  footerInputHeader,
  currentFooterInputValue,
  footerCheckboxLabel,
  descriptionText,
  acceptButtonId,
  cancelButtonId,
  embedded,
  isPanelVisible,
  currentDeviceType,
  getFilesArchiveError,
  setIsDataReady,
}: FilesSelectorProps) => {
  const theme = useTheme();

  const [breadCrumbs, setBreadCrumbs] = React.useState<TBreadCrumb[]>([]);
  const [items, setItems] = React.useState<TSelectorItem[]>([]);

  const [selectedItemType, setSelectedItemType] = React.useState<
    "rooms" | "files" | undefined
  >(undefined);
  const [selectedItemId, setSelectedItemId] = React.useState<
    number | string | undefined
  >(undefined);
  const [selectedItemSecurity, setSelectedItemSecurity] = React.useState<
    TRoomSecurity | TFolderSecurity | TFileSecurity | undefined
  >(undefined);
  const [selectedTreeNode, setSelectedTreeNode] = React.useState({} as TFolder);
  const [selectedFileInfo, setSelectedFileInfo] = React.useState<{
    id: number | string;
    title: string;
    path?: string[];
    fileExst?: string;
    inPublic?: boolean;
  } | null>(null);

  const [total, setTotal] = React.useState<number>(0);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(false);
  const [isSelectedParentFolder, setIsSelectedParentFolder] =
    React.useState<boolean>(false);
  const [searchValue, setSearchValue] = React.useState<string>("");

  const { getIcon } = useFilesSettings(getIconProp);

  const { subscribe, unsubscribe } = useSocketHelper({
    socketHelper,
    socketSubscribers,
    setItems,
    setBreadCrumbs,
    setTotal,
    disabledItems,
    filterParam,
    getIcon,
  });

  const {
    setIsBreadCrumbsLoading,
    isNextPageLoading,
    setIsNextPageLoading,
    isFirstLoad,
    setIsFirstLoad,
    showBreadCrumbsLoader,
    showLoader,
  } = useLoadersHelper({ items });

  const { isRoot, setIsRoot, getRootData } = useRootHelper({
    setIsBreadCrumbsLoading,
    setBreadCrumbs,
    setTotal,
    setItems,
    treeFolders,
    setHasNextPage,
    setIsNextPageLoading,

    isUserOnly,
  });

  const { getRoomList } = useRoomsHelper({
    setIsBreadCrumbsLoading,
    setBreadCrumbs,
    setIsNextPageLoading,
    setHasNextPage,
    setTotal,
    setItems,
    isFirstLoad,
    setIsRoot,
    searchValue,
    isRoomsOnly,
    onSetBaseFolderPath,
  });

  const { getFileList } = useFilesHelper({
    setIsBreadCrumbsLoading,
    setBreadCrumbs,
    setIsNextPageLoading,
    setHasNextPage,
    setTotal,
    setItems,
    selectedItemId,
    isFirstLoad,
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
  });

  const onSelectAction = (item: TSelectorItem) => {
    const inPublic =
      breadCrumbs.findIndex((f) => f.roomType === RoomsType.PublicRoom) > -1;
    if (item.isFolder) {
      setIsFirstLoad(true);
      setItems([]);
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

      if (item.parentId === 0 && item.rootFolderType === FolderType.Rooms) {
        setSelectedItemType("rooms");
        getRoomList(0, null, false);
      } else {
        setSelectedItemType("files");
        getFileList(0, null, item.id, false);
      }
    } else if (item.id && item.title)
      setSelectedFileInfo({
        id: item.id,
        title: item.title,
        fileExst: item.fileExst,
        inPublic,
      });
  };

  React.useEffect(() => {
    if (!selectedItemId) return;
    if (selectedItemId && isRoot) return unsubscribe(+selectedItemId);

    subscribe(+selectedItemId);
  }, [selectedItemId, isRoot, unsubscribe, subscribe]);

  React.useEffect(() => {
    const getRoomSettings = () => {
      setSelectedItemType("rooms");
      getRoomList(0, null, true);
    };

    const needRoomList = isRoomsOnly && !currentFolderId;

    if (needRoomList) {
      getRoomSettings();
      return;
    }

    if (!currentFolderId) {
      getRootData();
      return;
    }

    setSelectedItemId(currentFolderId);

    if (
      needRoomList ||
      (!isThirdParty &&
        parentId === roomsFolderId &&
        rootFolderType === FolderType.Rooms)
    ) {
      getRoomSettings();

      return;
    }

    setSelectedItemType("files");
    getFileList(0, null, currentFolderId, true);
    // TODO: refactoring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickBreadCrumb = (item: TBreadCrumb) => {
    if (!isFirstLoad) {
      setSearchValue("");
      setIsFirstLoad(true);

      if (+item.id === 0) {
        setSelectedItemSecurity(undefined);
        setSelectedItemType(undefined);
        getRootData();
      } else {
        setItems([]);

        const idx = breadCrumbs.findIndex(
          (value) => value.id.toString() === item.id.toString(),
        );

        const maxLength = breadCrumbs.length - 1;
        let foundParentId = false;
        let currentFolderIndex = -1;

        const newBreadCrumbs = breadCrumbs.map((i, index) => {
          if (!foundParentId) {
            currentFolderIndex = disabledItems.findIndex((id) => id === i?.id);
          }

          if (index !== maxLength && currentFolderIndex !== -1) {
            foundParentId = true;
            if (!isSelectedParentFolder) setIsSelectedParentFolder(true);
          }

          if (index === maxLength && !foundParentId && isSelectedParentFolder)
            setIsSelectedParentFolder(false);

          return { ...i };
        });

        newBreadCrumbs.splice(idx + 1, newBreadCrumbs.length - idx - 1);

        setBreadCrumbs(newBreadCrumbs);

        setSelectedItemId(item.id);
        if (item.isRoom) {
          setSelectedItemType("rooms");
          getRoomList(0, null, false);
        } else {
          setSelectedItemType("files");
          getFileList(0, null, item.id, false);
        }
      }
    }
  };

  const onSearchAction = (value: string, callback?: Function) => {
    setIsFirstLoad(true);
    setItems([]);
    if (selectedItemType === "rooms") {
      getRoomList(0, value === "" ? null : value, false);
    } else {
      getFileList(0, value === "" ? null : value, selectedItemId, false);
    }

    setSearchValue(value);
    callback?.();
  };

  const onClearSearchAction = (callback?: Function) => {
    setIsFirstLoad(true);
    setItems([]);
    if (selectedItemType === "rooms") {
      getRoomList(0, null, false);
    } else {
      getFileList(0, null, selectedItemId, false);
    }

    setSearchValue("");
    callback?.();
  };

  React.useEffect(() => {
    if (setIsDataReady) setIsDataReady(!showLoader);
  }, [setIsDataReady, showLoader]);

  const onAcceptAction = async (
    i: unknown,
    accessRights: unknown,
    fileName: string,
    isChecked: boolean,
  ) => {
    const isPublic =
      breadCrumbs.findIndex((f) => f.roomType === RoomsType.PublicRoom) > -1;
    const folderTitle = breadCrumbs[breadCrumbs.length - 1].label;

    onAccept(
      selectedItemId,
      folderTitle,
      isPublic,
      breadCrumbs,
      fileName,
      isChecked,
      selectedTreeNode,
      selectedFileInfo,
    );
  };

  const SelectorBody = (
    <Selector
      withHeader={withHeader}
      headerLabel={headerLabel}
      withoutBackButton
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearch={onSearchAction}
      onClearSearch={onClearSearchAction}
      items={items}
      onSelect={onSelectAction}
      acceptButtonLabel={acceptButtonLabel}
      onAccept={onAcceptAction}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel}
      onCancel={onClose}
      emptyScreenImage={
        theme?.isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl
      }
      emptyScreenHeader={emptyScreenHeader}
      emptyScreenDescription={emptyScreenDescription}
      searchEmptyScreenImage={
        theme?.isBase
          ? EmptyScreenFilterAltSvgUrl
          : EmptyScreenFilterAltDarkSvgUrl
      }
      searchEmptyScreenHeader={searchEmptyScreenHeader}
      searchEmptyScreenDescription={searchEmptyScreenDescription}
      withBreadCrumbs
      breadCrumbs={breadCrumbs}
      onSelectBreadCrumb={onClickBreadCrumb}
      isLoading={showLoader}
      isBreadCrumbsLoading={showBreadCrumbsLoader}
      withSearch={!isRoot && items ? items.length > 0 : !isRoot && isFirstLoad}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isUser={isRoot}
          isContainer={showLoader}
        />
      }
      searchLoader={<SearchLoader />}
      breadCrumbsLoader={<BreadCrumbsLoader />}
      alwaysShowFooter
      isNextPageLoading={isNextPageLoading}
      hasNextPage={hasNextPage}
      totalItems={total}
      loadNextPage={
        isRoot ? null : selectedItemType === "rooms" ? getRoomList : getFileList
      }
      disableAcceptButton={getIsDisabled(
        isFirstLoad,
        isSelectedParentFolder,
        selectedItemId,
        selectedItemType,
        isRoot,
        selectedItemSecurity,
        selectedFileInfo,
      )}
      withFooterInput={withFooterInput}
      withFooterCheckbox={withFooterCheckbox}
      footerInputHeader={footerInputHeader}
      currentFooterInputValue={currentFooterInputValue}
      footerCheckboxLabel={footerCheckboxLabel}
      descriptionText={descriptionText}
      acceptButtonId={acceptButtonId}
      cancelButtonId={cancelButtonId}
    />
  );

  const selectorComponent = embedded ? (
    SelectorBody
  ) : (
    <>
      <Backdrop
        visible={isPanelVisible}
        isAside
        withBackground
        zIndex={309}
        onClick={onCloseAction}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={310}
        onClose={onCloseAction}
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

export default FilesSelector;
