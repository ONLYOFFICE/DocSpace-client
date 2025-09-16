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

import React, { useMemo } from "react";
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
import { getAcceptButtonLabel, getIsDisabled } from "./utils";

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
  withPadding,

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
  withRecentTreeFolder,
  withFavoritesTreeFolder,

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

  withCreate,
  folderIsShared,
  checkCreating,
  logoText,
  isPortalView = false,
  withoutDescriptionText = false,
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

  const formProps = useMemo(() => {
    let isRoomFormAccessible = true;

    if (isSelect || isFormRoom) return;

    if (isCopy || isMove)
      isRoomFormAccessible = selection.every(
        (item) => "isPDFForm" in item && item.isPDFForm,
      );

    // for backup
    if (!selection.length) {
      isRoomFormAccessible = false;
    }

    const getMessage = () => {
      const several = selection.length > 1;

      // for backup
      if (!selection.length) return t("Common:BackupNotAllowedInFormRoom");

      const option = { organizationName: logoText };

      if (isCopy)
        return several
          ? t("Files:WarningCopyToFormRoomServal", option)
          : t("Common:WarningCopyToFormRoom", option);

      if (isMove)
        return several
          ? t("Files:WarningMoveToFormRoomServal", option)
          : t("Files:WarningMoveToFormRoom", option);

      return "";
    };

    const message = getMessage();

    return {
      message,
      isRoomFormAccessible,
    };
  }, [selection, isCopy, isMove, isFormRoom, t]);

  const onAccept = async (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    showMoveToPublicDialog: boolean,
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
          destFolderInfo: selectedTreeNode,
          folderIds,
          fileIds,
          deleteAfter: false,
          isCopy,
          folderTitle,
          itemsCount: selection.length,
          ...(selection.length === 1 && {
            title: selection[0].title,
            isFolder: selection[0].isFolder,
          }),
        };

        if (showMoveToPublicDialog) {
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

            try {
              await itemOperationToFolder(operationData);
            } catch (error) {
              console.error(error);
            }
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
      if (isRoomBackup && showMoveToPublicDialog) {
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

  // const headerLabel = getHeaderLabel(
  //   t,
  //   isEditorDialog,
  //   isCopy,
  //   isRestoreAll,
  //   isMove,
  //   isSelect,
  //   filterParam,
  //   isRestore,
  //   isFormRoom,
  //   isThirdParty,
  //   isSelectFolder,
  // );

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
    isDisabledFolder?: boolean,
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
      isDisabledFolder,
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
      withRecentTreeFolder={withRecentTreeFolder}
      withFavoritesTreeFolder={withFavoritesTreeFolder}
      onSetBaseFolderPath={onSetBaseFolderPath}
      isUserOnly={isUserOnly}
      isRoomsOnly={isRoomsOnly}
      isThirdParty={isThirdParty}
      rootThirdPartyId={rootThirdPartyId}
      roomsFolderId={roomsFolderId}
      currentFolderId={isFormRoom && openRootVar ? "" : currentFolderId}
      parentId={parentId}
      rootFolderType={rootFolderType || FolderType.Rooms}
      folderIsShared={folderIsShared}
      currentDeviceType={currentDeviceType}
      onCancel={onCloseAction}
      onSubmit={onAccept}
      getIsDisabled={getIsDisabledAction}
      withHeader={withHeader}
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
      withPadding={withPadding}
      descriptionText={
        !withSubtitle ||
        !filterParam ||
        filterParam === "ALL" ||
        withoutDescriptionText
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
      withCreate={
        (isMove || isCopy || isRestore || isRestoreAll) ?? withCreate ?? false
      }
      filesSettings={filesSettings}
      headerProps={headerProps}
      formProps={formProps}
      checkCreating={checkCreating}
      isPortalView={isPortalView}
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
      isThirdParty,
      openRoot: openRootProp,
    }: FilesSelectorProps,
  ) => {
    const {
      id: selectedId,
      parentId,
      rootFolderType,
      shared,
    } = selectedFolderStore;

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

    const { currentDeviceType, logoText } = settingsStore;

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

    const getFolderIdForRecent = () => {
      // Don't know which folder should be selected. Can be files from different folders
      if (selectionsWithoutEditing.length !== 1) {
        return undefined;
      }

      const [selectedFile] = selectionsWithoutEditing;

      // File is shared via link
      if ("requestToken" in selectedFile && selectedFile.requestToken) {
        return undefined;
      }

      return "folderId" in selectedFile ? selectedFile?.folderId : undefined;
    };

    const fromFolderId =
      id ||
      (rootFolderType === FolderType.Archive ||
      rootFolderType === FolderType.TRASH
        ? undefined
        : rootFolderType === FolderType.Recent
          ? getFolderIdForRecent()
          : selectedId === selectionsWithoutEditing[0]?.id &&
              "isFolder" in selectionsWithoutEditing[0] &&
              selectionsWithoutEditing[0]?.isFolder
            ? parentId
            : selectedId);

    const folderId = fromFolderId;
    const openRoot =
      openRootProp || (rootFolderType === FolderType.Recent && !fromFolderId);

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
      currentFolderId:
        isThirdParty && currentFolderIdProp
          ? currentFolderIdProp
          : folderId || currentFolderIdProp,
      filesSettings,
      folderIsShared: shared,
      logoText,
      openRoot,
    };
  },
)(observer(FilesSelectorWrapper));
