import React from "react";
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
}: FilesSelectorProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["Common"]);

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

  const afterSearch = React.useRef(false);

  const [isInit, setIsInit] = React.useState(true);

  const { getIcon } = useFilesSettings(getIconProp);

  const { subscribe, unsubscribe } = useSocketHelper({
    socketHelper,
    socketSubscribers,
    disabledItems,
    filterParam,
    getIcon,
    setItems,
    setBreadCrumbs,
    setTotal,
  });

  const {
    setIsBreadCrumbsLoading,
    isNextPageLoading,
    setIsNextPageLoading,
    isFirstLoad,
    setIsFirstLoad,
    showBreadCrumbsLoader,
    showLoader,
  } = useLoadersHelper({ items, isInit });

  const { isRoot, setIsRoot, getRootData } = useRootHelper({
    setIsBreadCrumbsLoading,
    setBreadCrumbs,
    setTotal,
    setItems,
    treeFolders,
    setHasNextPage,
    setIsNextPageLoading,
    isUserOnly,
    setIsInit,
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
    isInit,
    setIsInit,
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
    isInit,
    setIsInit,
  });

  const onSelectAction = React.useCallback(
    (item: TSelectorItem) => {
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
        } else {
          setSelectedItemType("files");
        }
      } else if (item.id && item.label) {
        const inPublic =
          breadCrumbs.findIndex((f) => f.roomType === RoomsType.PublicRoom) >
          -1;

        setSelectedFileInfo({
          id: item.id,
          title: item.label,
          fileExst: item.fileExst,
          inPublic,
        });
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
    setIsFirstLoad(true);
    const needRoomList = isRoomsOnly && !currentFolderId;

    if (needRoomList) {
      setSelectedItemType("rooms");
      return;
    }

    if (!currentFolderId) {
      setSelectedItemType("rooms");
      return;
    }

    setSelectedItemId(currentFolderId);

    if (
      needRoomList ||
      (!isThirdParty &&
        parentId === roomsFolderId &&
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
    parentId,
    roomsFolderId,
    rootFolderType,
    setIsFirstLoad,
  ]);

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
          setItems([]);

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
      setIsFirstLoad(true);
      setItems([]);

      setSearchValue("");

      callback?.();
      afterSearch.current = true;
    },
    [setIsFirstLoad],
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
        breadCrumbs.findIndex((f) => f.roomType === RoomsType.PublicRoom) > -1;
      const folderTitle = breadCrumbs[breadCrumbs.length - 1].label;

      onSubmit(
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
    [breadCrumbs, selectedFileInfo, selectedItemId, selectedTreeNode, onSubmit],
  );

  React.useEffect(() => {
    if (selectedItemType === "rooms") getRoomList(0);
    if (selectedItemType === "files" && typeof selectedItemId !== "undefined")
      getFileList(0);
  }, [getFileList, getRoomList, selectedItemType, selectedItemId]);

  const headerProps: TSelectorHeader = withHeader
    ? { withHeader, headerProps: { headerLabel } }
    : {};

  // const withSearch = withSearchProp
  //   ? prevWithSearch.current && isFirstLoad
  //     ? prevWithSearch.current
  //     : !!searchValue ||
  //       (!isRoot && items?.length ? items.length > 0 : !isRoot && isFirstLoad)
  //   : false;

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
      isFirstLoad,
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
        cancelButtonLabel: t("Common:CancelButton"),
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
        setIsChecked: () => {},
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
      {...headerProps}
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
