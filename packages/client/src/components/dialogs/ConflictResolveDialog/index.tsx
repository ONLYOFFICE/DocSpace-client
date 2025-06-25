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

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import ConflictResolve from "@docspace/shared/dialogs/conflict-resolve";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { ConflictResolveType, RoomsType } from "@docspace/shared/enums";
import type { TFile } from "@docspace/shared/api/files/types";

import {
  ConflictResolveDialogProps,
  TActiveItem,
} from "./ConflictResolveDialog.types";

const ConflictResolveDialog = (props: ConflictResolveDialogProps) => {
  const {
    visible,
    setConflictResolveDialogVisible,
    conflictResolveDialogData,
    items,
    itemOperationToFolder,
    activeFiles,
    activeFolders,
    setActiveFiles,
    setActiveFolders,
    updateActiveFiles,
    updateActiveFolders,
    setSelected,
    setMoveToPanelVisible,
    setRestorePanelVisible,
    setCopyPanelVisible,
    setRestoreAllPanelVisible,
    setMoveToPublicRoomVisible,
    conflictDialogUploadHandler,
    openFileAction,
    isFileDialog,
    isFolderDialog,
    files,
    folders,
    cancelUploadAction,
    setFillPDFDialogData,
    setIsShareFormData,
    setAssignRolesDialogData,
  } = props;

  const { t, ready } = useTranslation(["Common"]);

  const {
    destFolderId,
    folderIds,
    fileIds,
    deleteAfter,
    isCopy,
    translations,
    isUploadConflict,
    selectedFolder,
    fromShareCollectSelector,
    createDefineRoomType,
    destFolderInfo,
    toFillOut,
  } = conflictResolveDialogData;

  const onClose = () => {
    setMoveToPublicRoomVisible(false);
    setConflictResolveDialogVisible(false);
  };
  const onClosePanels = () => {
    setConflictResolveDialogVisible(false);
    setMoveToPanelVisible(false);
    setRestorePanelVisible(false);
    setCopyPanelVisible(false);
    setRestoreAllPanelVisible(false);
    setMoveToPublicRoomVisible(false);
    setFillPDFDialogData(false);
    setIsShareFormData({ visible: false });
  };

  const differenceArray = (
    activeItems: TActiveItem[],
    ids: (number | string)[],
  ) => {
    return activeItems.filter((item) => {
      const itemId =
        typeof item !== "number" && typeof item !== "string" && "id" in item
          ? item.id
          : item;

      return !ids.includes(itemId);
    });
  };

  const onCloseDialog = () => {
    const newActiveFiles = differenceArray(activeFiles, fileIds);
    const newActiveFolder = differenceArray(activeFolders, folderIds);

    setActiveFiles(newActiveFiles);
    setActiveFolders(newActiveFolder);
    onClose();
  };

  const onAcceptType = async (conflictResolveType: ConflictResolveType) => {
    let newFileIds = fileIds;
    let newFolderIds = folderIds;
    let newActiveFiles = activeFiles;
    let newActiveFolders = activeFolders;
    if (conflictResolveType === ConflictResolveType.Skip) {
      files.forEach((file) => {
        newFileIds = newFileIds.filter((x) => x !== file.id);
        newActiveFiles = newActiveFiles.filter((f) => f.id !== file.id);
      });
      folders.forEach((folder) => {
        newFolderIds = newFolderIds.filter((x) => x !== folder.id);
        newActiveFolders = newActiveFolders.filter((f) => f.id !== folder.id);
      });
    }

    updateActiveFiles(newActiveFiles);
    updateActiveFolders(newActiveFiles);
    if (!newFolderIds.length && !newFileIds.length) {
      setSelected("none");
      onClosePanels();
      return;
    }

    const data = {
      destFolderId,
      destFolderInfo,
      folderIds,
      fileIds: newFileIds,
      conflictResolveType,
      deleteAfter,
      isCopy,
      translations,
      itemsCount: items.length,
      ...(items.length === 1 && {
        title: items[0].title,
        isFolder: items[0].isFolder,
      }),
      toFillOut,
    };

    setSelected("none");
    onClosePanels();
    try {
      if (fromShareCollectSelector) {
        openFileAction(selectedFolder, t);
      }

      sessionStorage.setItem("filesSelectorPath", `${destFolderId}`);
      const result = await itemOperationToFolder(data);

      if (
        result &&
        selectedFolder &&
        fromShareCollectSelector &&
        result.files?.length === 1 &&
        createDefineRoomType === RoomsType.VirtualDataRoom
      ) {
        const [resultFile] = result.files;
        setAssignRolesDialogData(true, selectedFolder.title, resultFile);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const onAcceptUploadType = async (
    conflictResolveType: ConflictResolveType,
  ) => {
    let data = conflictResolveDialogData.newUploadData;

    if (conflictResolveType === ConflictResolveType.Skip) {
      setSelected("none");
      cancelUploadAction();
      onClosePanels();
      return;
    }

    let filesSize = 0;
    const newFiles = [];

    for (let i = 0; i < data.files.length; i += 1) {
      // @ts-expect-error need rewrite stores to typescript for fix this
      if (!items.includes(data.files[i].file.name)) {
        filesSize += +data.files[i].file.size;
        newFiles.push(data.files[i]);
      }
    }

    data = { ...data, files: newFiles, filesSize };

    setSelected("none");
    onClosePanels();

    if (data.files.length === 0) return;
    try {
      conflictDialogUploadHandler(
        data,
        t,
        conflictResolveType === ConflictResolveType.Duplicate,
      );
    } catch (error) {
      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);
      toastr.error(message);
    }
  };

  const getMessageText = () => {
    const singleFileMessage = (
      <Trans
        t={t}
        ns="Common"
        i18nKey="FileActionRequired"
        values={{ fileName: items[0].title }}
        components={{ 1: <span className="bold truncate" /> }}
      />
    );

    const singleFolderMessage = (
      <Trans
        t={t}
        ns="Common"
        i18nKey="FolderActionRequired"
        values={{ folderName: items[0].title }}
        components={{ 1: <span className="bold" /> }}
      />
    );

    return isFileDialog
      ? items.length === 1
        ? singleFileMessage
        : t("Common:FilesAlreadyContains")
      : isFolderDialog
        ? items.length === 1
          ? singleFolderMessage
          : t("Common:FoldersAlreadyContains")
        : t("Common:FilesAndFoldersAlreadyContains");
  };

  const getOverwriteTitle = () => {
    return isFileDialog
      ? t("Common:OverwriteTitle")
      : isFolderDialog
        ? t("Common:MergeFolders")
        : t("Common:MergeAndOverwrite");
  };

  const getOverwriteDescription = () => {
    return isFileDialog
      ? t("Common:OverwriteDescription")
      : isFolderDialog
        ? t("Common:MergeFoldersDescription")
        : t("Common:MultiplyOverwrite");
  };

  const getDuplicateTitle = () => {
    return isFileDialog
      ? t("Common:CreateFileCopy")
      : isFolderDialog
        ? t("Common:CopyAndKeepBothFolders")
        : t("Common:CopyAndKeepAll");
  };
  const getDuplicateDescription = () => {
    return isFileDialog
      ? t("Common:CreateDescription")
      : isFolderDialog
        ? t("Common:CreateFolderDescription")
        : t("Common:FoldersAndFilesWillBeCopied");
  };
  const getSkipDescription = () => {
    return isFileDialog
      ? t("Common:SkipDescription")
      : isFolderDialog
        ? t("Common:SkipFolderDescription")
        : t("Common:FilesAndFolderWillNotBeCopied");
  };

  const onCloseConflictDialog = () => {
    if (isUploadConflict) {
      cancelUploadAction();
      onClose();
    } else onCloseDialog();
  };

  const messageText = getMessageText();
  const overwriteTitle = getOverwriteTitle();
  const overwriteDescription = getOverwriteDescription();
  const duplicateTitle = getDuplicateTitle();
  const duplicateDescription = getDuplicateDescription();
  const skipDescription = getSkipDescription();

  return (
    <ConflictResolve
      visible={visible}
      headerLabel={t("Common:ActionRequired")}
      isLoading={!ready}
      onSubmit={isUploadConflict ? onAcceptUploadType : onAcceptType}
      onClose={onCloseConflictDialog}
      cancelButtonLabel={t("CancelButton")}
      submitButtonLabel={t("OKButton")}
      messageText={messageText}
      selectActionText={t("Common:ConflictResolveSelectAction")}
      overwriteTitle={overwriteTitle}
      overwriteDescription={overwriteDescription}
      duplicateTitle={duplicateTitle}
      duplicateDescription={duplicateDescription}
      skipTitle={t("Common:SkipTitle")}
      skipDescription={skipDescription}
    />
  );
};

export default inject<TStore>(
  ({ dialogsStore, uploadDataStore, filesStore, filesActionsStore }) => {
    const {
      conflictResolveDialogVisible: visible,
      setConflictResolveDialogVisible,
      conflictResolveDialogData,
      conflictResolveDialogItems: items,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      setRestoreAllPanelVisible,
      setCopyPanelVisible,
      setMoveToPublicRoomVisible,
      setFillPDFDialogData,
      setIsShareFormData,
      setAssignRolesDialogData,
    } = dialogsStore;

    const { openFileAction } = filesActionsStore;

    const {
      itemOperationToFolder,
      conflictDialogUploadHandler,
      cancelUploadAction,
    } = uploadDataStore;
    const {
      activeFiles,
      activeFolders,
      setActiveFiles,
      setActiveFolders,
      updateActiveFiles,
      updateActiveFolders,
      setSelected,
    } = filesStore;

    const files = items
      ? (items as TFile[]).filter((f: TFile) => {
          return f.isFile || f.fileExst || f.contentLength;
        })
      : [];
    const folders = items
      ? (items as TFile[]).filter((f: TFile) => {
          return !f.fileExst && !f.contentLength && !f.isFile;
        })
      : [];

    return {
      items,
      visible,
      conflictResolveDialogData,
      setConflictResolveDialogVisible,
      itemOperationToFolder,
      activeFiles,
      activeFolders,
      setActiveFiles,
      setActiveFolders,
      updateActiveFiles,
      updateActiveFolders,
      setSelected,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      setRestoreAllPanelVisible,
      setCopyPanelVisible,
      setMoveToPublicRoomVisible,
      conflictDialogUploadHandler,
      openFileAction,
      files,
      folders,
      isFileDialog: !folders.length,
      isFolderDialog: !files.length,
      cancelUploadAction,
      setFillPDFDialogData,
      setIsShareFormData,
      setAssignRolesDialogData,
    };
  },
)(observer(ConflictResolveDialog));
