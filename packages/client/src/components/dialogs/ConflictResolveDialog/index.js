import React, { useState } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ConflictResolveType } from "@docspace/common/constants";

import styled from "styled-components";

const StyledModalDialog = styled(ModalDialog)`
  .radio {
    padding-bottom: 8px;
  }

  .message {
    margin-bottom: 16px;

    .bold {
      font-weight: 600;
    }
  }

  .select-action {
    margin-bottom: 12px;
  }

  .conflict-resolve-radio-button {
    label {
      display: flex;
      align-items: flex-start;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    svg {
      overflow: visible;

      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-left: 8px;`
          : `margin-right: 8px;`}
      margin-top: 3px;
    }

    .radio-option-title {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
    }

    .radio-option-description {
      font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
      line-height: 16px;
      color: #a3a9ae;
    }
  }
`;

const ConflictResolveDialog = (props) => {
  const {
    t,
    tReady,
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

  const [resolveType, setResolveType] = useState("overwrite");

  const onSelectResolveType = (e) => setResolveType(e.target.value);
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

  const differenceArray = (activeItems, ids) => {
    return activeItems.filter((item) => !ids.includes(item.id ?? item));
  };

  const onCloseDialog = () => {
    const newActiveFiles = differenceArray(activeFiles, fileIds);
    const newActiveFolder = differenceArray(activeFolders, folderIds);

    setActiveFiles(newActiveFiles);
    setActiveFolders(newActiveFolder);
    onClose();
  };

  const getResolveType = () => {
    switch (resolveType) {
      case "skip":
        return ConflictResolveType.Skip;
      case "overwrite":
        return ConflictResolveType.Overwrite;
      case "create":
        return ConflictResolveType.Duplicate;

      default:
        return ConflictResolveType.Overwrite;
    }
  };

  const onAcceptType = async () => {
    const conflictResolveType = getResolveType();

    let newFileIds = fileIds;
    let newActiveFiles = activeFiles;
    if (conflictResolveType === ConflictResolveType.Skip) {
      for (let item of items) {
        newFileIds = newFileIds.filter((x) => x !== item.id);
        newActiveFiles = newActiveFiles.filter((f) => f.id !== item.id);
      }
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
    } catch (error) {
      toastr.error(error.message ? error.message : error);
    }
  };

  const onAcceptUploadType = async () => {
    const conflictResolveType = getResolveType();

    let data = conflictResolveDialogData.newUploadData;

    if (conflictResolveType === ConflictResolveType.Skip) {
      let filesSize = 0;
      const newFiles = [];

      for (let i = 0; i < data.files.length; i++) {
        if (!items.includes(data.files[i].file.name)) {
          filesSize += data.files[i].file.size;
          newFiles.push(data.files[i]);
        }
      }

      data = { ...data, files: newFiles, filesSize };
    }

    if (data.files.length === 0) {
      setSelected("none");
      onClosePanels();
      return;
    }

    setSelected("none");
    onClosePanels();
    try {
      handleFilesUpload(
        data,
        t,
        conflictResolveType === ConflictResolveType.Duplicate
      );
    } catch (error) {
      toastr.error(error.message ? error.message : error);
    }
  };

  const radioOptions = [
    {
      label: (
        <div>
          <Text className="radio-option-title">{t("OverwriteTitle")}</Text>
          <Text className="radio-option-description">
            {t("OverwriteDescription")}
          </Text>
        </div>
      ),
      value: "overwrite",
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">
            {t("Common:CreateFileCopy")}
          </Text>
          <Text className="radio-option-description">
            {t("CreateDescription")}
          </Text>
        </div>
      ),

      value: "create",
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">{t("SkipTitle")}</Text>
          <Text className="radio-option-description">
            {t("SkipDescription")}
          </Text>
        </div>
      ),
      value: "skip",
    },
  ];

  return (
    <StyledModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onCloseDialog}
      isLarge
      zIndex={312}
    >
      <ModalDialog.Header>{t("ConflictResolveTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text className="message">
          {items.length === 1 ? (
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
          )}
        </Text>
        <Text className="select-action">
          {t("ConflictResolveSelectAction")}
        </Text>
        <RadioButtonGroup
          className="conflict-resolve-radio-button"
          orientation="vertical"
          fontSize="13px"
          fontWeight="400"
          name="group"
          onClick={onSelectResolveType}
          options={radioOptions}
          selected="overwrite"
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={isUploadConflict ? onAcceptUploadType : onAcceptType}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseDialog}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ auth, dialogsStore, uploadDataStore, filesStore }) => {
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
  const { settingsStore } = auth;
  const { theme } = settingsStore;
  return {
    theme,
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
})(
  withTranslation(["ConflictResolveDialog", "Common"])(
    observer(ConflictResolveDialog)
  )
);
