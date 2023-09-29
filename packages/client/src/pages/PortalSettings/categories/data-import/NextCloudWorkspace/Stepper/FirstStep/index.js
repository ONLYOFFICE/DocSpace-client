import { useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import FileInput from "@docspace/components/file-input";
import ProgressBar from "@docspace/components/progress-bar";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

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
  cancelDialogVisble,
  setCancelDialogVisbile,
  initMigrationName,
  singleFileUploading,
  getMigrationStatus,
  setUsers,
  setData,
  isFileLoading,
  setIsFileLoading,
  cancelMigration,
}) => {
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onUploadFile = async (file) => {
    await singleFileUploading(file, setProgress);
    await initMigrationName(searchParams.get("service"));
    const interval = setInterval(async () => {
      const res = await getMigrationStatus();

      if (!res || res.parseResult.failedArchives.length > 0) {
        setIsFileLoading(false);
        clearInterval(interval);
      } else if (res.isCompleted) {
        setIsFileLoading(false);
        clearInterval(interval);
        setData(res);
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
    setCancelDialogVisbile(true);
    setProgress(0);
    setIsFileLoading(false);
  };

  return (
    <Wrapper>
      <Text className="choose-backup-file">
        {t("Settings:ChooseBackupFile")}
      </Text>
      <FileInput
        scale
        onInput={onSelectFile}
        className="upload-backup-input"
        placeholder={t("Settings:BackupFile")}
        isDisabled={isFileLoading}
        accept=".zip"
      />
      {isFileLoading ? (
        <>
          <Text className="select-file-progress-text">
            {t("Settings:BackupFileUploading")}
          </Text>
          <ProgressBar
            percent={progress}
            className="select-file-progress-bar"
          />
          <Button
            size="small"
            label={t("Common:CancelButton")}
            onClick={onCancel}
          />
        </>
      ) : (
        <SaveCancelButtons
          className="upload-back-buttons"
          onSaveClick={incrementStep}
          onCancelClick={() => navigate(-1)}
          saveButtonLabel={t("Settings:UploadToServer")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings
          saveButtonDisabled={!isSaveDisabled}
          isSaveButtonDisabled
        />
      )}

      {cancelDialogVisble && (
        <CancelUploadDialog
          visible={cancelDialogVisble}
          loading={isFileLoading}
          onClose={() => setCancelDialogVisbile(false)}
          cancelMigration={cancelMigration}
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
    setData,
    isFileLoading,
    setIsFileLoading,
    cancelMigration,
  } = importAccountsStore;
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
    dialogsStore;

  return {
    initMigrationName,
    singleFileUploading,
    getMigrationStatus,
    setUsers,
    setData,
    isFileLoading,
    setIsFileLoading,
    cancelMigration,
    cancelDialogVisble: cancelUploadDialogVisible,
    setCancelDialogVisbile: setCancelUploadDialogVisible,
  };
})(observer(FirstStep));
