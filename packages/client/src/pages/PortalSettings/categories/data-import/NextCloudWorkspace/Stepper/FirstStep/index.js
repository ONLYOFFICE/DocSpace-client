import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { isTablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import FileInput from "@docspace/components/file-input";
import ProgressBar from "@docspace/components/progress-bar";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Box from "@docspace/components/box";
import Link from "@docspace/components/link";
// import { mockRes } from "./tempMock";

const Wrapper = styled.div`
  max-width: 700px;
  margin-top: 16px;

  .choose-backup-file {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 12px;

    .icon-button_svg {
      svg {
        path {
          fill: ${(props) =>
            props.theme.client.settings.migration.fileInputIconColor};
        }
      }
    }
  }

  .upload-back-buttons {
    margin-top: 16px;
  }

  .select-file-progress-text {
    margin: 12px 0;
  }

  .select-file-progress-bar {
    margin: 12px 0 16px;
  }
`;

const FileUploadContainer = styled.div`
  max-width: 350px;
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

const FirstStep = ({
  t,
  incrementStep,
  cancelDialogVisible,
  setCancelDialogVisibile,
  initMigrationName,
  singleFileUploading,
  getMigrationStatus,
  setUsers,
  isFileLoading,
  setIsFileLoading,
  cancelMigration,
}) => {
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const [isFileError, setIsFileError] = useState(false);
  const uploadInterval = useRef(null);
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  const onUploadFile = async (file) => {
    await singleFileUploading(file, setProgress);
    await initMigrationName(searchParams.get("service"));

    uploadInterval.current = setInterval(async () => {
      const res = await getMigrationStatus();
      // const res = {
      //   parseResult: mockRes,
      //   failedArchives: [],
      //   isCompleted: true,
      // };

      if (!res || res.parseResult.failedArchives.length > 0 || res.error) {
        setIsFileError(true);
        setIsFileLoading(false);
        clearInterval(uploadInterval.current);
      } else if (res.isCompleted) {
        setIsFileLoading(false);
        clearInterval(uploadInterval.current);
        setUsers(res.parseResult);
        setIsSaveDisabled(false);
      }
    }, 1000);
  };

  const onSelectFile = (file) => {
    setProgress(0);
    setIsFileError(false);
    setIsSaveDisabled(true);
    setIsFileLoading(true);
    try {
      onUploadFile(file);
    } catch (error) {
      console.log(error);
      setIsFileLoading(false);
    }
  };

  const onDownloadArchives = async () => {
    try {
      await getMigrationStatus()
        .then(
          (res) =>
            new Blob([res.parseResult.failedArchives], {
              type: "text/csv;charset=utf-8",
            })
        )
        .then((blob) => {
          let a = document.createElement("a");
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "unsupported_archives";
          a.click();
          window.URL.revokeObjectURL(url);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onCancel = () => {
    setCancelDialogVisibile(true);
    setProgress(0);
    setIsFileLoading(false);
  };

  const handleCancelMigration = () => {
    clearInterval(uploadInterval.current);
    cancelMigration();
  };

  const hideCancelDialog = () => setCancelDialogVisibile(false);

  return (
    <Wrapper>
      <FileUploadContainer>
        <Text className="choose-backup-file">
          {t("Settings:ChooseBackupFile")}
        </Text>
        <FileInput
          scale
          onInput={onSelectFile}
          className="upload-backup-input"
          placeholder={t("Settings:BackupFile")}
          isDisabled={isFileLoading}
          accept={[".zip"]}
        />
      </FileUploadContainer>
      {isFileLoading ? (
        <FileUploadContainer>
          <ProgressBar
            percent={progress}
            className="select-file-progress-bar"
            label={t("Settings:BackupFileUploading")}
          />
          <Button
            size={isTablet() ? "medium" : "small"}
            label={t("Common:CancelButton")}
            onClick={onCancel}
          />
        </FileUploadContainer>
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
                onClick={onDownloadArchives}
              >
                {t("Settings:DownloadUnsupportedArchives")}
              </Link>
            </Box>
          )}
          <SaveCancelButtons
            className="upload-back-buttons"
            onSaveClick={incrementStep}
            onCancelClick={goBack}
            saveButtonLabel={t("Settings:UploadToServer")}
            cancelButtonLabel={t("Common:Back")}
            displaySettings
            showReminder
            saveButtonDisabled={isSaveDisabled}
          />
        </ErrorBlock>
      )}

      {cancelDialogVisible && (
        <CancelUploadDialog
          visible={cancelDialogVisible}
          loading={isFileLoading}
          onClose={hideCancelDialog}
          cancelMigration={handleCancelMigration}
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
    cancelMigration,
  } = importAccountsStore;
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
    dialogsStore;

  return {
    initMigrationName,
    singleFileUploading,
    getMigrationStatus,
    setUsers,
    isFileLoading,
    setIsFileLoading,
    cancelMigration,
    cancelDialogVisible: cancelUploadDialogVisible,
    setCancelDialogVisibile: setCancelUploadDialogVisible,
  };
})(observer(FirstStep));
