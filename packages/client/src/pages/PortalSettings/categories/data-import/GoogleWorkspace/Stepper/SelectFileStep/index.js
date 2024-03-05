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
import { toastr } from "@docspace/shared/components/toast";

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
  cancelDialogVisible,
  setCancelDialogVisible,
  initMigrationName,
  multipleFileUploading,
  singleFileUploading,
  getMigrationStatus,
  setUsers,
  isFileLoading,
  setIsFileLoading,
  cancelMigration,
}) => {
  const [progress, setProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const [isFileError, setIsFileError] = useState(false);
  const uploadInterval = useRef(null);
  const navigate = useNavigate();

  const isAbort = useRef(false);

  const [fileName, setFileName] = useState(null);

  const goBack = () => {
    cancelMigration();
    setTimeout(() => navigate(-1), 100);
  };

  useEffect(() => {
    setShowReminder(false);
    try {
      getMigrationStatus().then((res) => {
        if (!res || res.parseResult.migratorName !== "GoogleWorkspace") return;

        if (res.parseResult.operation === "parse" && !res.isCompleted) {
          setProgress(res.progress);
          setIsFileLoading(true);
        }

        setIsFileError(false);
        setShowReminder(true);

        res.parseResult.files.length > 0 &&
          setFileName(res.parseResult.files.join(", "));

        uploadInterval.current = setInterval(async () => {
          const res = await getMigrationStatus();

          if (!res || res.parseResult.failedArchives.length > 0 || res.error) {
            toastr.error(res.error);
            setIsFileError(true);
            setIsFileLoading(false);
            clearInterval(uploadInterval.current);
          } else if (res.isCompleted || res.progress === 100) {
            setIsFileLoading(false);
            clearInterval(uploadInterval.current);
            setUsers(res.parseResult);
            setShowReminder(true);
          }
        }, 1000);
      });
    } catch (error) {
      toastr.error(error);
    }

    return () => clearInterval(uploadInterval.current);
  }, []);

  const hideCancelDialog = () => setCancelDialogVisible(false);

  const onUploadFile = async (file) => {
    try {
      if (file.length) {
        await multipleFileUploading(file, setProgress, isAbort);
      } else {
        await singleFileUploading(file, setProgress, isAbort);
      }
      await initMigrationName(searchParams.get("service"));

      uploadInterval.current = setInterval(async () => {
        const res = await getMigrationStatus();

        if (!res || res.parseResult.failedArchives.length > 0 || res.error) {
          toastr.error(res.error);
          setIsFileError(true);
          setIsFileLoading(false);
          clearInterval(uploadInterval.current);
        } else if (res.isCompleted || res.parseResult.progress === 100) {
          setIsFileLoading(false);
          clearInterval(uploadInterval.current);
          setUsers(res.parseResult);
          setShowReminder(true);
        }
      }, 1000);
    } catch (error) {
      toastr.error(error.message);
      setIsFileError(true);
      setIsFileLoading(false);
      if (uploadInterval.current) {
        clearInterval(uploadInterval.current);
      }
    }
  };

  const onSelectFile = (file) => {
    setProgress(0);
    setIsFileError(false);
    setShowReminder(false);
    setIsFileLoading(true);
    try {
      onUploadFile(file);
    } catch (error) {
      toastr.error(error);
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
      toastr.error(error);
      console.log(error);
    }
  };

  const onCancel = () => {
    setCancelDialogVisible(true);
  };

  const handleCancelMigration = () => {
    isAbort.current = true;
    setProgress(0);
    setIsFileLoading(false);
    clearInterval(uploadInterval.current);
    cancelMigration();
  };

  return (
    <>
      <Wrapper>
        <Text className="select-file-title">
          {t("Settings:ChooseBackupFiles")}
        </Text>
        <FileInput
          scale
          onInput={onSelectFile}
          className="select-file-input"
          placeholder={fileName || t("Settings:BackupFiles")}
          isDisabled={isFileLoading}
          accept={[".zip"]}
        />
      </Wrapper>

      {isFileLoading ? (
        <Wrapper>
          <ProgressBar
            percent={progress}
            className="select-file-progress-bar"
            label={t("Settings:BackupFilesUploading")}
          />
          <Button
            size={isTablet() ? "medium" : "small"}
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
                {t("Settings:UnsupportedFilesDescription")}
              </Text>
              <Link
                type="action"
                isHovered
                fontWeight={600}
                onClick={onDownloadArchives}
              >
                {t("Settings:CheckUnsupportedFiles")}
              </Link>
            </Box>
          )}

          {!isFileError ? (
            <SaveCancelButtons
              className="save-cancel-buttons"
              onSaveClick={onNextStep}
              onCancelClick={goBack}
              saveButtonLabel={t("Settings:NextStep")}
              cancelButtonLabel={t("Common:Back")}
              displaySettings
              saveButtonDisabled={!showReminder}
              showReminder
            />
          ) : (
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
          )}
        </ErrorBlock>
      )}

      {cancelDialogVisible && (
        <CancelUploadDialog
          visible={cancelDialogVisible}
          // loading={isFileLoading}
          onClose={hideCancelDialog}
          cancelMigration={handleCancelMigration}
        />
      )}
    </>
  );
};

export default inject(({ dialogsStore, importAccountsStore }) => {
  const {
    initMigrationName,
    singleFileUploading,
    multipleFileUploading,
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
    multipleFileUploading,
    getMigrationStatus,
    setUsers,
    isFileLoading,
    setIsFileLoading,
    cancelMigration,
    cancelDialogVisible: cancelUploadDialogVisible,
    setCancelDialogVisible: setCancelUploadDialogVisible,
  };
})(observer(SelectFileStep));
