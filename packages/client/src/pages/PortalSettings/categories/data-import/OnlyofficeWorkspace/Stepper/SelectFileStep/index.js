import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { isTablet } from "@docspace/shared/utils/device";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { Button } from "@docspace/shared/components/button";
import { FileInput } from "@docspace/shared/components/file-input";
import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

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
  showReminder,
  setShowReminder,
  cancelDialogVisble,
  setCancelDialogVisible,
  initMigrationName,
  singleFileUploading,
  getMigrationStatus,
  setUsers,
  isFileLoading,
  setIsFileLoading,
  cancelMigration,
  setStep,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFileError, setIsFileError] = useState(false);
  const [searchParams] = useSearchParams();
  const uploadInterval = useRef(null);
  const navigate = useNavigate();

  const goBack = () => {
    cancelMigration();
    navigate(-1);
  };

  useEffect(() => {
    setShowReminder(false);

    getMigrationStatus().then((res) => {
      if (
        !res ||
        res.parseResult.successedUsers + res.parseResult.failedUsers > 0
      )
        return;

      setIsFileError(false);
      setShowReminder(true);

      uploadInterval.current = setInterval(async () => {
        const res = await getMigrationStatus();

        if (!res || res.parseResult.failedArchives.length > 0 || res.error) {
          setIsFileError(true);
          setIsFileLoading(false);
          clearInterval(uploadInterval.current);
        } else if (res.isCompleted) {
          setIsFileLoading(false);
          clearInterval(uploadInterval.current);
          setUsers(res.parseResult);
          setShowReminder(false);
        }
      }, 1000);
    });
    return () => clearInterval(uploadInterval.current);
  }, []);

  const onUploadFile = async (file) => {
    await singleFileUploading(file, setProgress);
    await initMigrationName(searchParams.get("service"));

    uploadInterval.current = setInterval(async () => {
      const res = await getMigrationStatus();

      if (!res || res.parseResult.failedArchives.length > 0 || res.error) {
        setIsFileError(true);
        setIsFileLoading(false);
        clearInterval(uploadInterval.current);
      } else if (res.isCompleted) {
        setIsFileLoading(false);
        clearInterval(uploadInterval.current);
        setUsers(res.parseResult);
        setShowReminder(true);
      }
    }, 1000);
  };

  const onDownloadArchives = async () => {
    try {
      await getMigrationStatus()
        .then(
          (res) =>
            new Blob([res.parseResult.failedArchives], {
              type: "text/csv;charset=utf-8",
            }),
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

  const onSelectFile = (file) => {
    setProgress(0);
    setIsFileLoading(true);
    setIsFileError(false);
    try {
      onUploadFile(file);
    } catch (error) {
      console.log(error);
      setIsFileLoading(false);
    }
  };

  // const onCancel = () => {
  //   setCancelDialogVisible(true);
  // };

  // const handleCancelMigration = () => {
  //   setProgress(0);
  //   setIsFileLoading(false);
  //   clearInterval(uploadInterval.current);
  //   cancelMigration();
  // };

  // const hideCancelDialog = () => setCancelDialogVisible(false);

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
          accept={[".zip", ".tar", ".tar.gz"]}
        />
      </Wrapper>

      {isFileLoading ? (
        <Wrapper>
          <ProgressBar
            percent={progress}
            className="select-file-progress-bar"
            label={t("Settings:BackupFileUploading")}
          />
          {/* <Button
            size={isTablet() ? "medium" : "small"}
            label={t("Common:CancelButton")}
            onClick={onCancel}
          /> */}
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
                onClick={onDownloadArchives}
              >
                {t("Settings:DownloadUnsupportedArchives")}
              </Link>
            </Box>
          )}
          <SaveCancelButtons
            className="save-cancel-buttons"
            onSaveClick={onNextStep}
            onCancelClick={goBack}
            saveButtonLabel={t("Settings:UploadToServer")}
            cancelButtonLabel={t("Common:Back")}
            displaySettings
            saveButtonDisabled={!showReminder}
            showReminder
          />
        </ErrorBlock>
      )}

      {/* {cancelDialogVisble && (
        <CancelUploadDialog
          visible={cancelDialogVisble}
          // loading={isFileLoading}
          onClose={hideCancelDialog}
          cancelMigration={handleCancelMigration}
        />
      )} */}
    </>
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
    cancelDialogVisble: cancelUploadDialogVisible,
    setCancelDialogVisible: setCancelUploadDialogVisible,
  };
})(observer(SelectFileStep));
