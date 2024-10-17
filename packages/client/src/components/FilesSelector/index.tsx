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

/* eslint-disable no-restricted-syntax */
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { FolderType } from "@docspace/shared/enums";
import FilesSelector from "@docspace/shared/selectors/Files";
import { toastr } from "@docspace/shared/components/toast";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  TFile,
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import { TRoom, TRoomSecurity } from "@docspace/shared/api/rooms/types";
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

let disabledItems: (string | number)[] = [];

const FilesSelectorWrapper = ({
  isPanelVisible = false,
  // withoutImmediatelyClose = false,
  isThirdParty = false,
  isRoomsOnly = false,
  isUserOnly = false,
  isEditorDialog = false,
  isSelectFolder = false,
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
  isFormRoom,

  currentFolderId,
  fromFolderId,
  parentId,
  rootFolderType,

  treeFolders,

  selection,
  // disabledItems,
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
  openRoot,

  filesSettings,
  headerProps,
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

  const getFilesArchiveError = React.useCallback(
    (name: string) => t("Common:ArchivedRoomAction", { name }),
    [t],
  );

  React.useEffect(() => {
    return () => {
      disabledItems = [];
    };
  }, []);

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
    isFormRoom,
    isThirdParty,
    isSelectFolder,
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
    isFormRoom,
    isSelectFolder,
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
      fromFolderId === Number(selectedItemId),
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

  const openRootVar = openRoot || isRestore || isRestoreAll;

  return (
    <FilesSelector
      openRoot={openRootVar}
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
      currentFolderId={isFormRoom && openRootVar ? "" : currentFolderId}
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
          : (descriptionText ?? t("Common:SelectDOCXFormat"))
      }
      submitButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-submit" : ""
      }
      cancelButtonId={
        isMove || isCopy || isRestore ? "select-file-modal-cancel" : ""
      }
      getFilesArchiveError={getFilesArchiveError}
      withCreate={(isMove || isCopy || isRestore || isRestoreAll) ?? false}
      filesSettings={filesSettings}
      headerProps={headerProps}
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
      currentFolderId: currentFolderIdProp,
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

    const { currentDeviceType } = settingsStore;

    const {
      selection,
      bufferSelection,
      filesList,
      setMovingInProgress,
      setSelected,
      filesSettingsStore,
    } = filesStore;
    const { getIcon, filesSettings } = filesSettingsStore;
    const { isVisible: infoPanelIsVisible, infoPanelSelection } =
      infoPanelStore;

    const selections: (TFile | TFolder | TRoom) & { isEditing: boolean }[] =
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

    // const sessionPath = window.sessionStorage.getItem("filesSelectorPath");

    const selectionsWithoutEditing: (TFile | TFolder | TRoom)[] = isRestoreAll
      ? filesList
      : isCopy
        ? selections
        : selections.filter((f) => f && !f?.isEditing);

    selectionsWithoutEditing.forEach((item: TFile | TFolder | TRoom) => {
      if (
        (("isFolder" in item && item?.isFolder) ||
          ("parentId" in item && item?.parentId)) &&
        item?.id &&
        !disabledItems.includes(item.id)
      ) {
        disabledItems.push(item.id);
      }
    });

    const includeFolder =
      selectionsWithoutEditing.filter((i) => "isFolder" in i && i.isFolder)
        .length > 0;

    const fromFolderId =
      id ||
      (rootFolderType === FolderType.Archive ||
      rootFolderType === FolderType.TRASH
        ? undefined
        : selectedId === selectionsWithoutEditing[0]?.id &&
            "isFolder" in selectionsWithoutEditing[0] &&
            selectionsWithoutEditing[0]?.isFolder
          ? parentId
          : selectedId);

    const folderId = fromFolderId;

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

      setMoveToPublicRoomVisible,
      setBackupToPublicRoomVisible,
      currentDeviceType,
      getIcon,

      roomsFolderId,
      currentFolderId: folderId || currentFolderIdProp,
      filesSettings,
    };
  },
)(observer(FilesSelectorWrapper));
