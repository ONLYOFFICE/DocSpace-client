import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

// @ts-ignore
import Loaders from "@docspace/common/components/Loaders";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { DeviceType } from "@docspace/shared/enums";

import { Selector } from "@docspace/shared/components/selector";
import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Portal } from "@docspace/shared/components/portal";
import { toastr } from "@docspace/shared/components/toast";

import { RowLoader, SearchLoader } from "@docspace/shared/skeletons/selector";

import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";
import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/empty_screen_alt.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_alt_dark.svg?url";

import {
  BreadCrumb,
  FilesSelectorProps,
  Item,
  Security,
} from "./FilesSelector.types";

import useRootHelper from "./helpers/useRootHelper";
import useRoomsHelper from "./helpers/useRoomsHelper";
import useLoadersHelper from "./helpers/useLoadersHelper";
import useFilesHelper from "./helpers/useFilesHelper";
import { getAcceptButtonLabel, getHeaderLabel, getIsDisabled } from "./utils";
import useSocketHelper from "./helpers/useSocketHelper";

const FilesSelector = ({
  isPanelVisible = false,
  // withoutImmediatelyClose = false,
  isThirdParty = false,
  isRoomsOnly = false,
  isUserOnly = false,
  isEditorDialog = false,
  rootThirdPartyId,
  filterParam,

  onClose,

  withSearch = true,
  withBreadCrumbs = true,
  withSubtitle = true,

  isMove,
  isCopy,
  isRestore,
  isRestoreAll,
  isSelect,

  currentFolderId,
  fromFolderId,
  parentId,
  rootFolderType,

  treeFolders,

  theme,

  selection,
  disabledItems,
  setConflictDialogData,
  checkFileConflicts,
  itemOperationToFolder,
  clearActiveOperations,
  setMovingInProgress,
  setSelected,
  setMoveToPanelVisible,
  setRestorePanelVisible,
  setCopyPanelVisible,
  setRestoreAllPanelVisible,

  onSelectFolder,
  onSetBaseFolderPath,
  // onSetNewFolderPath,
  setIsDataReady,
  onSelectTreeNode,
  onSave,
  onSelectFile,

  withFooterInput,
  withFooterCheckbox,
  footerInputHeader,
  currentFooterInputValue,
  footerCheckboxLabel,

  descriptionText,
  setSelectedItems,

  includeFolder,

  socketHelper,
  socketSubscribers,
  setMoveToPublicRoomVisible,
  setBackupToPublicRoomVisible,
  setInfoPanelIsMobileHidden,
  currentDeviceType,

  embedded,
  withHeader,
  withCancelButton = true,
  cancelButtonLabel,
  acceptButtonLabel,
  getIcon,
  isRoomBackup,

  roomsFolderId,
}: FilesSelectorProps) => {
  const { t } = useTranslation(["Files", "Common", "Translations"]);

  const [breadCrumbs, setBreadCrumbs] = React.useState<BreadCrumb[]>([]);
  const [items, setItems] = React.useState<Item[] | null>(null);

  const [selectedItemType, setSelectedItemType] = React.useState<
    "rooms" | "files" | undefined
  >(undefined);
  const [selectedItemId, setSelectedItemId] = React.useState<
    number | string | undefined
  >(undefined);
  const [selectedItemSecurity, setSelectedItemSecurity] = React.useState<
    Security | undefined
  >(undefined);
  const [selectedTreeNode, setSelectedTreeNode] = React.useState(null);
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

  const [isRequestRunning, setIsRequestRunning] =
    React.useState<boolean>(false);

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

  useEffect(() => {
    setIsDataReady?.(!showLoader);
  }, [showLoader, setIsDataReady]);

  const { isRoot, setIsRoot, getRootData } = useRootHelper({
    setIsBreadCrumbsLoading,
    setBreadCrumbs,
    setTotal,
    setItems,
    treeFolders,
    setHasNextPage,
    setIsNextPageLoading,
    onSetBaseFolderPath,
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
  });

  const onSelectAction = (item: Item) => {
    const inPublic =
      breadCrumbs.findIndex((f: any) => f.roomType === RoomsType.PublicRoom) >
      -1;
    if (item.isFolder) {
      setIsFirstLoad(true);
      setItems(null);
      setBreadCrumbs((value) => [
        ...value,
        {
          label: item.label,
          id: item.id,
          isRoom:
            item.parentId === 0 && item.rootFolderType === FolderType.Rooms,
          roomType: item.roomType,
          shared: item.shared,
        },
      ]);
      setSelectedItemId(item.id);
      setSearchValue("");

      if (item.parentId === 0 && item.rootFolderType === FolderType.Rooms) {
        setSelectedItemType("rooms");
        getRoomList(0, false, null);
      } else {
        setSelectedItemType("files");
        getFileList(0, item.id, false, null);
      }
    } else {
      setSelectedFileInfo({
        id: item.id,
        title: item.title,
        fileExst: item.fileExst,
        inPublic: inPublic,
      });
    }
  };

  React.useEffect(() => {
    if (!selectedItemId) return;
    if (selectedItemId && isRoot) return unsubscribe(+selectedItemId);

    subscribe(+selectedItemId);
  }, [selectedItemId, isRoot]);

  React.useEffect(() => {
    const sessionPath = window.sessionStorage.getItem("filesSelectorPath");
    let folderId = currentFolderId
      ? currentFolderId
      : sessionPath && (isMove || isCopy || isRestore || isRestoreAll)
      ? +sessionPath
      : fromFolderId;

    const getRoomSettings = () => {
      setSelectedItemType("rooms");
      getRoomList(0, true);
    };

    const needRoomList = isRoomsOnly && !folderId;

    if (needRoomList) {
      getRoomSettings();
      return;
    }

    if (!folderId) {
      getRootData();
      return;
    }

    setSelectedItemId(folderId);

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
    getFileList(0, folderId, true);
  }, [currentFolderId]);

  const onClickBreadCrumb = (item: BreadCrumb) => {
    if (!isFirstLoad) {
      setSearchValue("");
      setIsFirstLoad(true);

      if (+item.id === 0) {
        setSelectedItemSecurity(undefined);
        setSelectedItemType(undefined);
        getRootData();
      } else {
        setItems(null);

        const idx = breadCrumbs.findIndex(
          (value) => value.id.toString() === item.id.toString(),
        );

        const maxLength = breadCrumbs.length - 1;
        let foundParentId = false,
          currentFolderIndex = -1;
        const newBreadCrumbs = breadCrumbs.map((item, index) => {
          if (!foundParentId) {
            currentFolderIndex = disabledItems.findIndex(
              (id) => id === item?.id,
            );
          }

          if (index !== maxLength && currentFolderIndex !== -1) {
            foundParentId = true;
            !isSelectedParentFolder && setIsSelectedParentFolder(true);
          }

          if (index === maxLength && !foundParentId && isSelectedParentFolder)
            setIsSelectedParentFolder(false);

          return { ...item };
        });

        newBreadCrumbs.splice(idx + 1, newBreadCrumbs.length - idx - 1);

        setBreadCrumbs(newBreadCrumbs);
        setSelectedItemId(item.id);
        if (item.isRoom) {
          setSelectedItemType("rooms");
          getRoomList(0, false, null);
        } else {
          setSelectedItemType("files");
          getFileList(0, item.id, false, null);
        }
      }
    }
  };

  const onCloseAction = () => {
    setInfoPanelIsMobileHidden(false);

    if (onClose) {
      onClose();
      return;
    }

    if (isCopy) {
      setCopyPanelVisible(false);
    } else if (isRestoreAll) {
      setRestoreAllPanelVisible(false);
    } else if (isRestore) {
      setRestorePanelVisible(false);
    } else {
      setMoveToPanelVisible(false);
    }
  };

  const onCloseAndDeselectAction = () => {
    setSelected("none");
    onCloseAction();
  };

  const onSearchAction = (value: string, callback?: Function) => {
    setIsFirstLoad(true);
    setItems(null);
    if (selectedItemType === "rooms") {
      getRoomList(0, false, value === "" ? null : value);
    } else {
      getFileList(0, selectedItemId, false, value === "" ? null : value);
    }

    setSearchValue(value);
    callback?.();
  };

  const onClearSearchAction = (callback?: Function) => {
    setIsFirstLoad(true);
    setItems(null);
    if (selectedItemType === "rooms") {
      getRoomList(0, false, null);
    } else {
      getFileList(0, selectedItemId, false, null);
    }

    setSearchValue("");
    callback?.();
  };

  const onAcceptAction = (
    items: any,
    accessRights: any,
    fileName: string,
    isChecked: boolean,
  ) => {
    const isPublic =
      breadCrumbs.findIndex((f: any) => f.roomType === RoomsType.PublicRoom) >
      -1;

    if ((isMove || isCopy || isRestore || isRestoreAll) && !isEditorDialog) {
      const folderTitle = breadCrumbs[breadCrumbs.length - 1].label;

      let fileIds: any[] = [];
      let folderIds: any[] = [];

      for (let item of selection) {
        if (item.fileExst || item.contentLength) {
          fileIds.push(item.id);
        } else if (item.id === selectedItemId) {
          toastr.error(t("MoveToFolderMessage"));
        } else {
          folderIds.push(item.id);
        }
      }

      if (folderIds.length || fileIds.length) {
        const operationData = {
          destFolderId: selectedItemId,
          folderIds,
          fileIds,
          deleteAfter: false,
          isCopy,
          folderTitle,
          translations: {
            copy: t("Common:CopyOperation"),
            move: t("Translations:MoveToOperation"),
          },
        };

        if (isPublic) {
          setMoveToPublicRoomVisible(true, operationData);
          return;
        }

        setIsRequestRunning(true);
        setSelectedItems();
        checkFileConflicts(selectedItemId, folderIds, fileIds)
          .then(async (conflicts: any) => {
            if (conflicts.length) {
              setConflictDialogData(conflicts, operationData);
              setIsRequestRunning(false);
            } else {
              setIsRequestRunning(false);
              onCloseAndDeselectAction();
              const move = !isCopy;
              if (move) setMovingInProgress(move);
              sessionStorage.setItem("filesSelectorPath", `${selectedItemId}`);
              await itemOperationToFolder(operationData);
            }
          })
          .catch((e: any) => {
            toastr.error(e);
            setIsRequestRunning(false);
            clearActiveOperations(fileIds, folderIds);
          });
      } else {
        toastr.error(t("Common:ErrorEmptyList"));
      }
    } else {
      if (isRoomBackup && isPublic) {
        setBackupToPublicRoomVisible(true, {
          selectedItemId,
          breadCrumbs,
          onSelectFolder,
          onClose,
        });

        return;
      }
      //setIsRequestRunning(true);
      //onSetNewFolderPath && onSetNewFolderPath(breadCrumbs);
      onSelectFolder && onSelectFolder(selectedItemId, breadCrumbs);
      onSave &&
        selectedItemId &&
        onSave(null, selectedItemId, fileName, isChecked);
      onSelectTreeNode && onSelectTreeNode(selectedTreeNode);
      onSelectFile && onSelectFile(selectedFileInfo!, breadCrumbs);
      !embedded && onCloseAndDeselectAction();
      //!withoutImmediatelyClose &&  onCloseAction();
    }
  };

  const headerLabel = getHeaderLabel(
    t,
    isEditorDialog,
    isCopy,
    isRestoreAll,
    isMove,
    isSelect,
    filterParam,
    isRestore,
  );

  const defaultAcceptButtonLabel = getAcceptButtonLabel(
    t,
    isEditorDialog,
    isCopy,
    isRestoreAll,
    isMove,
    isSelect,
    filterParam,
    isRestore,
  );

  const isDisabled = getIsDisabled(
    isFirstLoad,
    isSelectedParentFolder,
    fromFolderId == selectedItemId,
    selectedItemType === "rooms",
    isRoot,
    isCopy,
    isMove,
    isRestoreAll,
    isRequestRunning,
    selectedItemSecurity,
    filterParam,
    !!selectedFileInfo,
    includeFolder,
    isRestore,
  );

  const SelectorBody = (
    <Selector
      withHeader={withHeader}
      headerLabel={headerLabel}
      withoutBackButton
      searchPlaceholder={t("Common:Search")}
      searchValue={searchValue}
      onSearch={onSearchAction}
      onClearSearch={onClearSearchAction}
      items={items ? items : []}
      onSelect={onSelectAction}
      acceptButtonLabel={acceptButtonLabel || defaultAcceptButtonLabel}
      onAccept={onAcceptAction}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel || t("Common:CancelButton")}
      onCancel={onCloseAction}
      emptyScreenImage={
        theme.isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl
      }
      emptyScreenHeader={t("SelectorEmptyScreenHeader")}
      emptyScreenDescription=""
      searchEmptyScreenImage={
        theme.isBase
          ? EmptyScreenFilterAltSvgUrl
          : EmptyScreenFilterAltDarkSvgUrl
      }
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("EmptyFilterDescriptionText")}
      withBreadCrumbs={withBreadCrumbs}
      breadCrumbs={breadCrumbs}
      onSelectBreadCrumb={onClickBreadCrumb}
      isLoading={showLoader}
      isBreadCrumbsLoading={showBreadCrumbsLoader}
      withSearch={withSearch && !isRoot && items ? items.length > 0 : !isRoot && isFirstLoad}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isUser={isRoot}
          isContainer={showLoader}
        />
      }
      searchLoader={<SearchLoader />}
      breadCrumbsLoader={<Loaders.SelectorBreadCrumbsLoader />}
      alwaysShowFooter={true}
      isNextPageLoading={isNextPageLoading}
      hasNextPage={hasNextPage}
      totalItems={total}
      loadNextPage={
        isRoot ? null : selectedItemType === "rooms" ? getRoomList : getFileList
      }
      disableAcceptButton={isDisabled}
      withFooterInput={withFooterInput}
      withFooterCheckbox={withFooterCheckbox}
      footerInputHeader={footerInputHeader}
      currentFooterInputValue={currentFooterInputValue}
      footerCheckboxLabel={footerCheckboxLabel}
      descriptionText={
        !withSubtitle || !filterParam || filterParam === "ALL"
          ? ""
          : descriptionText ?? t("Common:SelectDOCXFormat")
      }
      acceptButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-submit" : ""
      }
      cancelButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-cancel" : ""
      }
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

export default inject(
  (
    {
      settingsStore,
      selectedFolderStore,
      filesActionsStore,
      uploadDataStore,
      treeFoldersStore,
      dialogsStore,
      filesStore,
      infoPanelStore,
    }: any,
    { isCopy, isRestoreAll, isMove, isRestore, isPanelVisible, id }: any,
  ) => {
    const { id: selectedId, parentId, rootFolderType } = selectedFolderStore;

    const { setConflictDialogData, checkFileConflicts, setSelectedItems } =
      filesActionsStore;
    const { itemOperationToFolder, clearActiveOperations } = uploadDataStore;

    const { treeFolders, roomsFolderId } = treeFoldersStore;

    const {
      restorePanelVisible,
      setRestorePanelVisible,
      moveToPanelVisible,
      setMoveToPanelVisible,
      copyPanelVisible,
      setCopyPanelVisible,
      restoreAllPanelVisible,
      setRestoreAllPanelVisible,
      conflictResolveDialogVisible,
      setMoveToPublicRoomVisible,
      setBackupToPublicRoomVisible,
    } = dialogsStore;

    const { setIsMobileHidden: setInfoPanelIsMobileHidden } = infoPanelStore;

    const { theme, socketHelper, currentDeviceType } = settingsStore;

    const socketSubscribesId = socketHelper.socketSubscribers;

    const {
      selection,
      bufferSelection,
      filesList,
      setMovingInProgress,
      setSelected,
      filesSettingsStore,
    } = filesStore;
    const { getIcon } = filesSettingsStore;
    const { isVisible: infoPanelIsVisible, selection: infoPanelSelection } =
      infoPanelStore;

    const selections =
      isMove || isCopy || isRestoreAll || isRestore
        ? isRestoreAll
          ? filesList
          : selection.length > 0 && selection?.[0] != null
            ? selection
            : bufferSelection != null
              ? [bufferSelection]
              : infoPanelIsVisible && infoPanelSelection != null
                ? [infoPanelSelection]
                : []
        : [];

    const selectionsWithoutEditing = isRestoreAll
      ? filesList
      : isCopy
        ? selections
        : selections.filter((f: any) => f && !f?.isEditing);

    const disabledItems: any[] = [];

    selectionsWithoutEditing.forEach((item: any) => {
      if ((item?.isFolder || item?.parentId) && item?.id) {
        disabledItems.push(item.id);
      }
    });

    const includeFolder =
      selectionsWithoutEditing.filter((i: any) => i.isFolder).length > 0;

    const fromFolderId = id
      ? id
      : rootFolderType === FolderType.Archive ||
          rootFolderType === FolderType.TRASH
        ? undefined
        : selectedId === selectionsWithoutEditing[0]?.id
          ? parentId
          : selectedId;


    return {
      fromFolderId,
      parentId,
      rootFolderType,
      treeFolders,
      isPanelVisible: isPanelVisible
        ? isPanelVisible
        : (moveToPanelVisible ||
            copyPanelVisible ||
            restorePanelVisible ||
            restoreAllPanelVisible) &&
          !conflictResolveDialogVisible,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      theme,
      selection: selectionsWithoutEditing,
      disabledItems,
      setConflictDialogData,
      checkFileConflicts,
      itemOperationToFolder,
      clearActiveOperations,
      setMovingInProgress,
      setSelected,
      setCopyPanelVisible,
      setRestoreAllPanelVisible,
      setSelectedItems,
      setInfoPanelIsMobileHidden,
      includeFolder,
      socketHelper,
      socketSubscribers: socketSubscribesId,
      setMoveToPublicRoomVisible,
      setBackupToPublicRoomVisible,
      currentDeviceType,
      getIcon,

      roomsFolderId,
    };
  },
)(observer(FilesSelector));
