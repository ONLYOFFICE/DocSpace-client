import React, { useState } from "react";
import styled from "styled-components";

import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import FileInput from "@docspace/components/file-input";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import ProgressBar from "@docspace/components/progress-bar";
import Button from "@docspace/components/button";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";

import { useSearchParams } from "react-router-dom";

const Wrapper = styled.div`
  max-width: 350px;
  margin-top: 16px;

  .choose-backup-file {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
  }

  .upload-back-buttons {
    margin-top: 16px;
  }

  .select-file-progress-text {
    margin: 12px 0;
  }

  .select-file-progress-bar {
    margin-bottom: 16px;
  }
`;

const FirstStep = ({
  t,
  incrementStep,
  decrementStep,
  cancelUploadDialogVisible,
  setCancelUploadDialogVisible,
  initMigrationName,
  singleFileUploading,
  getMigrationStatus,
  setUsers,
  isFileLoading,
  setIsFileLoading,
}) => {
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [searchParams] = useSearchParams();

  const [progress, setProgress] = useState(0);

  const onUploadFile = async (file) => {
    await singleFileUploading(file, setProgress);
    await initMigrationName(searchParams.get("service"));
    const interval = setInterval(async () => {
      const res = await getMigrationStatus();

      if (!res || res.parseResult.failedArchives.length > 0) {
        console.error("something went wrong");
        setIsFileLoading(false);
        clearInterval(interval);
      } else if (res.isCompleted) {
        setIsFileLoading(false);
        clearInterval(interval);
        setUsers(res);
        setIsSaveDisabled(true);
      }
    }, 1000);
  };

  const onSelectFile = (file) => {
    setIsFileLoading(true);
    try {
      onUploadFile(file);
    } catch (error) {
      console.log(error);
      setIsFileLoading(false);
    }
  };

  const onCancel = () => {
    setCancelUploadDialogVisible(true);
    setProgress(0);
    setIsFileLoading(false);
  };

  return (
    <Wrapper>
      <Text className="choose-backup-file">{t("Settings:ChooseBackupFile")}</Text>
      <FileInput
        onInput={onSelectFile}
        className="upload-backup-input"
        placeholder={t("Settings:BackupFile")}
        scale
      />
      {isFileLoading ? (
        <>
          <Text className="select-file-progress-text">{t("Settings:BackupFileUploading")}</Text>
          <ProgressBar percent={progress} className="select-file-progress-bar" />
          <Button size="small" label={t("Common:CancelButton")} onClick={onCancel} />
        </>
      ) : (
        <SaveCancelButtons
          className="upload-back-buttons"
          onSaveClick={incrementStep}
          onCancelClick={decrementStep}
          saveButtonLabel={t("Settings:UploadToServer")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings
          saveButtonDisabled={!isSaveDisabled}
          isSaveButtonDisabled
        />
      )}

      {cancelUploadDialogVisible && (
        <CancelUploadDialog
          visible={cancelUploadDialogVisible}
          loading={isFileLoading}
          onClose={() => setCancelUploadDialogVisible(false)}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ dialogsStore, importAccountsStore }) => {
  const {
    initMigrationName,
    singleFileUploading,
    getMigrationStatus,
    setUsers,
    isFileLoading,
    setIsFileLoading,
  } = importAccountsStore;
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } = dialogsStore;

  return {
    setUsers,
    singleFileUploading,
    getMigrationStatus,
    initMigrationName,
    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
    isFileLoading,
    setIsFileLoading,
  };
})(observer(FirstStep));
