/* eslint-disable no-restricted-syntax */
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { FolderType } from "@docspace/shared/enums";
import FilesSelector from "@docspace/shared/selectors/Files";
import { toastr } from "@docspace/shared/components/toast";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TTranslation } from "@docspace/shared/types";

import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";
import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import UploadDataStore from "SRC_DIR/store/UploadDataStore";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import { FilesSelectorProps } from "./FilesSelector.types";
import { getAcceptButtonLabel, getHeaderLabel, getIsDisabled } from "./utils";

const FilesSelectorWrapper = ({
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
  withHeader = true,
  withCancelButton = true,
  cancelButtonLabel,
  acceptButtonLabel,
  getIcon,
  isRoomBackup,

  roomsFolderId,
}: FilesSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation([
    "Files",
    "Common",
    "Translations",
  ]);

  const [isRequestRunning, setIsRequestRunning] =
    React.useState<boolean>(false);

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

  const getFilesArchiveError = (name: string) =>
    t("Common:ArchivedRoomAction", { name });

  const onAccept = async (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => {
    if ((isMove || isCopy || isRestore || isRestoreAll) && !isEditorDialog) {
      const fileIds: number[] = [];
      const folderIds: number[] = [];

      for (const item of selection) {
        if (
          ("fileExst" in item && item.fileExst) ||
          ("contentLength" in item && item.contentLength)
        ) {
          fileIds.push(item.id);
        } else if (item.id === selectedItemId) {
          toastr.error(t("Common:MoveToFolderMessage"));
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
            move: t("Common:MoveToOperation"),
          },
        };

        if (isPublic) {
          setMoveToPublicRoomVisible(true, operationData);
          return;
        }

        setSelectedItems();
        try {
          const conflicts = (await checkFileConflicts(
            selectedItemId,
            folderIds,
            fileIds,
          )) as [];

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
        } catch (e: unknown) {
          toastr.error(e as TData);
          setIsRequestRunning(false);
          clearActiveOperations(fileIds, folderIds);
        }
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

      if (onSelectFolder) onSelectFolder(selectedItemId, breadCrumbs);
      if (onSave && selectedItemId)
        onSave(null, selectedItemId, fileName, isChecked);
      if (onSelectTreeNode) onSelectTreeNode(selectedTreeNode);
      if (onSelectFile && selectedFileInfo)
        onSelectFile(selectedFileInfo, breadCrumbs);
      if (!embedded) onCloseAndDeselectAction();
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

  const getIsDisabledAction = (
    isFirstLoad: boolean,
    isSelectedParentFolder: boolean,
    selectedItemId: string | number | undefined,
    selectedItemType: "rooms" | "files" | undefined,
    isRoot: boolean,
    selectedItemSecurity:
      | TFileSecurity
      | TFolderSecurity
      | TRoomSecurity
      | undefined,
    selectedFileInfo: TSelectedFileInfo,
  ) => {
    return getIsDisabled(
      isFirstLoad,
      isSelectedParentFolder,
      fromFolderId === selectedItemId,
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
  };

  return (
    <FilesSelector
      socketHelper={socketHelper}
      socketSubscribers={socketSubscribers}
      disabledItems={disabledItems}
      filterParam={filterParam}
      getIcon={getIcon}
      setIsDataReady={setIsDataReady}
      treeFolders={treeFolders}
      onSetBaseFolderPath={onSetBaseFolderPath}
      isUserOnly={isUserOnly}
      isRoomsOnly={isRoomsOnly}
      isThirdParty={isThirdParty}
      rootThirdPartyId={rootThirdPartyId}
      roomsFolderId={roomsFolderId}
      currentFolderId={currentFolderId || 0}
      parentId={parentId}
      rootFolderType={rootFolderType || FolderType.Rooms}
      currentDeviceType={currentDeviceType}
      onCancel={onCloseAction}
      onSubmit={onAccept}
      getIsDisabled={getIsDisabledAction}
      withHeader={withHeader}
      headerLabel={headerLabel}
      submitButtonLabel={acceptButtonLabel || defaultAcceptButtonLabel}
      withCancelButton={withCancelButton}
      isPanelVisible={isPanelVisible}
      embedded={embedded}
      withFooterInput={withFooterInput || false}
      withFooterCheckbox={withFooterCheckbox || false}
      footerInputHeader={footerInputHeader || ""}
      currentFooterInputValue={currentFooterInputValue || ""}
      footerCheckboxLabel={footerCheckboxLabel || ""}
      withoutBackButton
      cancelButtonLabel={cancelButtonLabel}
      withBreadCrumbs={withBreadCrumbs}
      withSearch={withSearch}
      descriptionText={
        !withSubtitle || !filterParam || filterParam === "ALL"
          ? ""
          : descriptionText ?? t("Common:SelectDOCXFormat")
      }
      submitButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-submit" : ""
      }
      cancelButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-cancel" : ""
      }
      getFilesArchiveError={getFilesArchiveError}
    />
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
    }: {
      settingsStore: SettingsStore;
      selectedFolderStore: SelectedFolderStore;
      filesActionsStore: FilesActionStore;
      uploadDataStore: UploadDataStore;
      treeFoldersStore: TreeFoldersStore;
      dialogsStore: DialogsStore;
      filesStore: FilesStore;
      infoPanelStore: InfoPanelStore;
    },
    {
      isCopy,
      isRestoreAll,
      isMove,
      isRestore,
      isPanelVisible,
      id,
      currentFolderId,
    }: FilesSelectorProps,
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

    const { socketHelper, currentDeviceType } = settingsStore;

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
    const { isVisible: infoPanelIsVisible, infoPanelSelection } =
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

    const sessionPath = window.sessionStorage.getItem("filesSelectorPath");

    const selectionsWithoutEditing = isRestoreAll
      ? filesList
      : isCopy
        ? selections
        : selections.filter((f) => f && !f?.isEditing);

    const disabledItems: (string | number)[] = [];

    selectionsWithoutEditing.forEach((item) => {
      if ((item?.isFolder || item?.parentId) && item?.id) {
        disabledItems.push(item.id);
      }
    });

    const includeFolder =
      selectionsWithoutEditing.filter((i) => i.isFolder).length > 0;

    const fromFolderId =
      id ||
      (rootFolderType === FolderType.Archive ||
      rootFolderType === FolderType.TRASH
        ? undefined
        : selectedId === selectionsWithoutEditing[0]?.id
          ? parentId
          : selectedId);

    const folderId =
      currentFolderId ||
      (sessionPath && (isMove || isCopy || isRestore || isRestoreAll)
        ? +sessionPath
        : fromFolderId);

    return {
      fromFolderId,
      parentId,
      rootFolderType,
      treeFolders,
      isPanelVisible:
        isPanelVisible ||
        ((moveToPanelVisible ||
          copyPanelVisible ||
          restorePanelVisible ||
          restoreAllPanelVisible) &&
          !conflictResolveDialogVisible),
      setMoveToPanelVisible,
      setRestorePanelVisible,

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
      currentFolderId: folderId,
    };
  },
)(observer(FilesSelectorWrapper));
