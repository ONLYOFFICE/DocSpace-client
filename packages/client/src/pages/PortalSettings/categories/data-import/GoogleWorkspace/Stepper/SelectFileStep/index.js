import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import Text from "@docspace/components/text";
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

  .select-file-progress-text {
    font-size: 12px;
    margin-top: -4px;
    margin-bottom: 12px;
  }

  .select-file-progress-bar {
    margin: 12px 0 16px;
    width: 350px;
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
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const onUploadFile = async (file) => {
    await localFileUploading(file);
    await initMigrationName(searchParams.get("service"));
    const interval = setInterval(async () => {
      const res = await getMigrationStatus();
      res.isCompleted && clearInterval(interval);
      console.log(res);
      setUsers(res);
    }, 300);
  };

  const onSelectFile = (file) => {
    setIsLoading(true);
    try {
      onUploadFile(file);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setShowReminder(true);
    }
  };

  const onCancel = () => {
    setCancelDialogVisbile(true);
    setIsLoading(false);
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
        />
      </Wrapper>
      {isLoading ? (
        <Wrapper>
          <Text className="select-file-progress-text">
            {t("Settings:BackupFileUploading")}
          </Text>
          <ProgressBar percent={75} className="select-file-progress-bar" />
          <Button
            size="small"
            label={t("Common:CancelButton")}
            onClick={onCancel}
          />
        </Wrapper>
      ) : (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStep}
          onCancelClick={onPrevStep}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:UploadToServer")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      )}

      {cancelDialogVisble && (
        <CancelUploadDialog
          visible={cancelDialogVisble}
          loading={isLoading}
          onClose={() => setCancelDialogVisbile(false)}
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
  } = importAccountsStore;
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
    dialogsStore;

  return {
    setUsers,
    localFileUploading,
    getMigrationStatus,
    initMigrationName,
    cancelDialogVisble: cancelUploadDialogVisible,
    setCancelDialogVisbile: setCancelUploadDialogVisible,
  };
})(observer(SelectFileStep));
