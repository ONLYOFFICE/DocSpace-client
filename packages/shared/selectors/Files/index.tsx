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
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

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
import {
  TBreadCrumb,
  TSelectorBreadCrumbs,
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorInput,
  TSelectorSearch,
  TSelectorSubmitButton,
} from "../../components/selector/Selector.types";

import useFilesHelper from "./hooks/useFilesHelper";
import useRoomsHelper from "./hooks/useRoomsHelper";
import useRootHelper from "./hooks/useRootHelper";
import useSocketHelper from "./hooks/useSocketHelper";

import { FilesSelectorProps } from "./FilesSelector.types";
import { SettingsContextProvider } from "./contexts/Settings";
import { LoadersContext, LoadersContextProvider } from "./contexts/Loaders";

const FilesSelectorComponent = ({
  disabledItems,
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
  withHeader,
  headerLabel,
  submitButtonLabel,
  withCancelButton,
  withFooterInput,
  withFooterCheckbox,
  footerInputHeader,
  currentFooterInputValue,
  footerCheckboxLabel,
  descriptionText,
  submitButtonId,
  cancelButtonId,
  embedded,
  isPanelVisible,
  currentDeviceType,
  getFilesArchiveError,
  setIsDataReady,
  withSearch: withSearchProp,
  withBreadCrumbs: withBreadCrumbsProp,

  cancelButtonLabel,

  withCreate,
  createDefineRoomLabel,
  createDefineRoomType,
  withInfoBar,
  infoBarData,
  headerProps,
  shareKey,
}: FilesSelectorProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["Common"]);
  const {
    isFirstLoad,
    setIsFirstLoad,
    showLoader,
    showBreadCrumbsLoader,
    isNextPageLoading,
  } = useContext(LoadersContext);

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
    viewUrl?: string;
    inPublic?: boolean;
  } | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(false);
  const [isSelectedParentFolder, setIsSelectedParentFolder] =
    React.useState<boolean>(false);
  const [searchValue, setSearchValue] = React.useState<string>("");

  const afterSearch = React.useRef(false);

  const [isInit, setIsInit] = React.useState(true);

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

    searchValue,
    isRoomsOnly,
    isInit,
    withCreate,
    createDefineRoomLabel,
    createDefineRoomType,
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
    isThirdParty,
    filterParam,
    isRoomsOnly,
    isUserOnly,
    rootThirdPartyId,
    roomsFolderId,
    isInit,
    withCreate,
    shareKey,
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
          // setItems([]);

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
      setIsFirstLoad,
    ],
  );

  const onSelectAction = React.useCallback(
    (
      item: TSelectorItem,
      isDoubleClick: boolean,
      doubleClickCallback: () => Promise<void>,
    ) => {
      if (item.isFolder) {
        if (isDoubleClick) return;

        setIsFirstLoad(true);

        // setItems([]);
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
          viewUrl: item.viewUrl,
          inPublic,
        });

        if (isDoubleClick) {
          doubleClickCallback();
        }
      }
    },
    [breadCrumbs, setIsFirstLoad],
  );

  React.useEffect(() => {
    if (!selectedItemId) return;
    if (selectedItemId && isRoot) return unsubscribe(+selectedItemId);

    subscribe(+selectedItemId);
  }, [selectedItemId, isRoot, unsubscribe, subscribe]);

  React.useEffect(() => {
    setSelectedItemId(currentFolderId);
  }, [currentFolderId]);

  React.useEffect(() => {
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
    // setSelectedItemId(currentFolderId);

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
  ]);

  const onSearchAction = React.useCallback(
    (value: string, callback?: Function) => {
      setIsFirstLoad(true);
      setItems([]);

      setSearchValue(value);

      callback?.();
      afterSearch.current = true;
    },
    [setIsFirstLoad],
  );

  const onClearSearchAction = React.useCallback(
    (callback?: Function) => {
      if (!searchValue) return;
      setIsFirstLoad(true);
      setItems([]);

      setSearchValue("");

      callback?.();
      afterSearch.current = true;
    },
    [searchValue, setIsFirstLoad],
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
      const isPublic =
        breadCrumbs.findIndex((f) => f.roomType === RoomsType.PublicRoom) >
          -1 && rootFolderType !== FolderType.Rooms;

      const folderTitle = breadCrumbs[breadCrumbs.length - 1].label;

      await onSubmit(
        selectedItemId,
        folderTitle,
        isPublic,
        breadCrumbs,
        fileName,
        isChecked,
        selectedTreeNode,
        selectedFileInfo,
      );
    },
    [
      breadCrumbs,
      rootFolderType,
      onSubmit,
      selectedItemId,
      selectedTreeNode,
      selectedFileInfo,
    ],
  );

  React.useEffect(() => {
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
  ]);

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel,
          onCloseClick: onCancel,
        },
      }
    : {};

  const withSearch = withSearchProp
    ? isRoot
      ? false
      : searchValue
        ? true
        : isFirstLoad
          ? true
          : afterSearch.current || !!items.length
    : false;

  const searchProps: TSelectorSearch = withSearch
    ? {
        withSearch,
        searchLoader: <SearchLoader />,
        searchPlaceholder: t("Common:Search"),
        searchValue,
        isSearchLoading: showBreadCrumbsLoader,
        onSearch: onSearchAction,
        onClearSearch: onClearSearchAction,
      }
    : {};

  const submitButtonProps: TSelectorSubmitButton = {
    onSubmit: onSubmitAction,
    submitButtonLabel,
    submitButtonId,
    disableSubmitButton: getIsDisabled(
      isFirstLoad && showLoader,
      isSelectedParentFolder,
      selectedItemId,
      selectedItemType,
      isRoot,
      selectedItemSecurity,
      selectedFileInfo,
    ),
  };

  const cancelButtonProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton,
        cancelButtonLabel: cancelButtonLabel || t("Common:CancelButton"),
        cancelButtonId,
        onCancel,
      }
    : {};

  const footerInputProps: TSelectorInput = withFooterInput
    ? {
        withFooterInput,
        footerInputHeader,
        currentFooterInputValue,
      }
    : {};

  const footerCheckboxProps: TSelectorCheckbox = withFooterCheckbox
    ? {
        withFooterCheckbox,
        footerCheckboxLabel,
        isChecked: false,
      }
    : {};

  const breadCrumbsProps: TSelectorBreadCrumbs = withBreadCrumbsProp
    ? {
        breadCrumbs,
        breadCrumbsLoader: <BreadCrumbsLoader />,
        isBreadCrumbsLoading: showBreadCrumbsLoader,
        withBreadCrumbs: true,
        onSelectBreadCrumb: onClickBreadCrumb,
      }
    : {};

  const SelectorBody = (
    <Selector
      {...headerSelectorProps}
      {...searchProps}
      {...submitButtonProps}
      {...cancelButtonProps}
      {...footerInputProps}
      {...footerCheckboxProps}
      {...breadCrumbsProps}
      isMultiSelect={false}
      items={items}
      onSelect={onSelectAction}
      emptyScreenImage={
        theme?.isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl
      }
      emptyScreenHeader={t("Common:SelectorEmptyScreenHeader")}
      emptyScreenDescription=""
      searchEmptyScreenImage={
        theme?.isBase
          ? EmptyScreenFilterAltSvgUrl
          : EmptyScreenFilterAltDarkSvgUrl
      }
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("Common:EmptyFilterDescriptionText")}
      isLoading={showLoader}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isUser={isRoot}
          isContainer={showLoader}
        />
      }
      alwaysShowFooter
      isNextPageLoading={isNextPageLoading}
      hasNextPage={hasNextPage}
      totalItems={total}
      loadNextPage={
        isRoot
          ? async () => {}
          : selectedItemType === "rooms"
            ? getRoomList
            : getFileList
      }
      descriptionText={descriptionText}
      disableFirstFetch
      withInfoBar={withInfoBar}
      infoBarData={infoBarData}
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
  const { filesSettings, getIcon } = props;
  return (
    <LoadersContextProvider>
      <SettingsContextProvider settings={filesSettings} getIcon={getIcon}>
        <FilesSelectorComponent {...props} />
      </SettingsContextProvider>
    </LoadersContextProvider>
  );
};

export default FilesSelector;
