import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Link from "@docspace/components/link";
import Button from "@docspace/components/button";
import FileInput from "@docspace/components/file-input";
import ProgressBar from "@docspace/components/progress-bar";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const Wrapper = styled.div`
  max-width: 350px;

  .select-file-title {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .select-file-input {
    height: 32px;
    margin-bottom: 16px;

    .icon-button_svg {
      svg {
        path {
          fill: ${(props) =>
            props.theme.client.settings.migration.fileInputIconColor};
        }
      }
    }
  }

  .select-file-progress-bar {
    margin: 12px 0 16px;
    width: 350px;
  }
`;

const ErrorBlock = styled.div`
  max-width: 700px;

  .complete-progress-bar {
    margin: 12px 0 16px;
    max-width: 350px;
  }

  .error-text {
    font-size: 12px;
    margin-bottom: 10px;
    color: ${(props) => props.theme.client.settings.migration.errorTextColor};
  }

  .save-cancel-buttons {
    margin-top: 16px;
  }
`;

const SelectFileStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  setShowReminder,
  cancelDialogVisble,
  setCancelDialogVisbile,
  initMigrationName,
  localFileUploading,
  getMigrationStatus,
  setUsers,
  setData,
  isFileLoading,
  setIsFileLoading,
  cancelMigration,
}) => {
  const [searchParams] = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isFileError, setIsFileError] = useState(false);

  const onUploadFile = async (file) => {
    await localFileUploading(file, setProgress);
    await initMigrationName(searchParams.get("service"));
    const interval = setInterval(async () => {
      const res = await getMigrationStatus();

      if (!res || res.parseResult.failedArchives.length > 0) {
        setIsFileError(true);
        setIsFileLoading(false);
        clearInterval(interval);
      } else if (res.isCompleted) {
        setIsFileLoading(false);
        clearInterval(interval);
        setData(res);
        setUsers(res);
        setShowReminder(true);
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
    <>
      <Wrapper>
        <Text className="select-file-title">
          {t("Settings:ChooseBackupFile")}
        </Text>
        <FileInput
          scale
          onInput={onSelectFile}
          className="select-file-input"
          placeholder={t("Settings:BackupFile")}
          isDisabled={isFileLoading}
          accept=".zip"
        />
      </Wrapper>

      {isFileLoading ? (
        <Wrapper>
          <ProgressBar
            percent={progress}
            className="select-file-progress-bar"
            label={t("Settings:BackupFileUploading")}
          />
          <Button
            size="small"
            label={t("Common:CancelButton")}
            onClick={onCancel}
          />
        </Wrapper>
      ) : (
        <ErrorBlock>
          {isFileError && (
            <Box>
              <ProgressBar
                percent={100}
                className="complete-progress-bar"
                label={t("Common:LoadingIsComplete")}
              />
              <Text className="error-text">
                {t("Settings:UnsupportedArchivesDescription")}
              </Text>
              <Link
                type="action"
                isHovered
                fontWeight={600}
                onClick={() => console.log("download")}
              >
                {t("Settings:DownloadUnsupportedArchives")}
              </Link>
            </Box>
          )}
          <SaveCancelButtons
            className="save-cancel-buttons"
            onSaveClick={onNextStep}
            onCancelClick={onPrevStep}
            saveButtonLabel={t("Settings:UploadToServer")}
            cancelButtonLabel={t("Common:Back")}
            displaySettings
            saveButtonDisabled={!showReminder}
            showReminder
          />
        </ErrorBlock>
      )}

      {cancelDialogVisble && (
        <CancelUploadDialog
          visible={cancelDialogVisble}
          loading={isFileLoading}
          onClose={() => setCancelDialogVisbile(false)}
          cancelMigration={cancelMigration}
        />
      )}
    </>
  );
};

export default inject(({ dialogsStore, importAccountsStore }) => {
  const {
    initMigrationName,
    localFileUploading,
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
    cancelMigration,
    setUsers,
    setData,
    localFileUploading,
    getMigrationStatus,
    initMigrationName,
    cancelDialogVisble: cancelUploadDialogVisible,
    setCancelDialogVisbile: setCancelUploadDialogVisible,
    isFileLoading,
    setIsFileLoading,
  };
})(observer(SelectFileStep));
