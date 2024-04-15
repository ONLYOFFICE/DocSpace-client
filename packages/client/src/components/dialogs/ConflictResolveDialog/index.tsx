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

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import ConflictResolve from "@docspace/shared/dialogs/conflict-resolve";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { ConflictResolveType } from "@docspace/shared/enums";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import UploadDataStore from "SRC_DIR/store/UploadDataStore";
import FilesStore from "SRC_DIR/store/FilesStore";

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
    setSelected,
    setMoveToPanelVisible,
    setRestorePanelVisible,
    setCopyPanelVisible,
    setRestoreAllPanelVisible,
    setMoveToPublicRoomVisible,
    handleFilesUpload,
  } = props;

  const { t, ready } = useTranslation(["ConflictResolveDialog", "Common"]);

  const {
    destFolderId,
    folderIds,
    fileIds,
    deleteAfter,
    folderTitle,
    isCopy,
    translations,
    isUploadConflict,
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
    let newActiveFiles = activeFiles;
    if (conflictResolveType === ConflictResolveType.Skip) {
      items.forEach((item) => {
        newFileIds = newFileIds.filter((x) => x !== item.id);
        newActiveFiles = newActiveFiles.filter((f) => f.id !== item.id);
      });
    }

    updateActiveFiles(newActiveFiles);
    if (!folderIds.length && !newFileIds.length) {
      setSelected("none");
      onClosePanels();
      return;
    }

    const data = {
      destFolderId,
      folderIds,
      fileIds: newFileIds,
      conflictResolveType,
      deleteAfter,
      isCopy,
      translations,
    };

    setSelected("none");
    onClosePanels();
    try {
      sessionStorage.setItem("filesSelectorPath", `${destFolderId}`);
      await itemOperationToFolder(data);
    } catch (error: unknown) {
      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);
      toastr.error(message);
    }
  };

  const onAcceptUploadType = async (
    conflictResolveType: ConflictResolveType,
  ) => {
    let data = conflictResolveDialogData.newUploadData;

    if (conflictResolveType === ConflictResolveType.Skip) {
      setSelected("none");
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
      handleFilesUpload(
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

  const messageText =
    items.length === 1 ? (
      <Trans
        t={t}
        ns="ConflictResolveDialog"
        i18nKey="ConflictResolveDescription"
        values={{ file: items[0].title, folder: folderTitle }}
        components={{ 1: <span className="bold" /> }}
      />
    ) : (
      <Trans
        t={t}
        ns="ConflictResolveDialog"
        i18nKey="ConflictResolveDescriptionFiles"
        values={{ filesCount: items.length, folder: folderTitle }}
        components={{ 1: <span className="bold" /> }}
      />
    );

  return (
    <ConflictResolve
      visible={visible}
      headerLabel={t("ConflictResolveTitle")}
      isLoading={!ready}
      onSubmit={isUploadConflict ? onAcceptUploadType : onAcceptType}
      onClose={onCloseDialog}
      cancelButtonLabel={t("Common:CancelButton")}
      submitButtonLabel={t("Common:OKButton")}
      messageText={messageText}
      selectActionText={t("ConflictResolveSelectAction")}
      overwriteTitle={t("OverwriteTitle")}
      overwriteDescription={t("OverwriteDescription")}
      duplicateTitle={t("Common:CreateFileCopy")}
      duplicateDescription={t("CreateDescription")}
      skipTitle={t("SkipTitle")}
      skipDescription={t("SkipDescription")}
    />
  );
};

export default inject(
  ({
    dialogsStore,
    uploadDataStore,
    filesStore,
  }: {
    dialogsStore: DialogsStore;
    uploadDataStore: UploadDataStore;
    filesStore: FilesStore;
  }) => {
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
    } = dialogsStore;

    const { itemOperationToFolder, handleFilesUpload } = uploadDataStore;
    const {
      activeFiles,
      activeFolders,
      setActiveFiles,
      setActiveFolders,
      updateActiveFiles,
      setSelected,
    } = filesStore;

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
      setSelected,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      setRestoreAllPanelVisible,
      setCopyPanelVisible,
      setMoveToPublicRoomVisible,
      handleFilesUpload,
    };
  },
)(observer(ConflictResolveDialog));
