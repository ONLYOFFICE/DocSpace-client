import Text from "@docspace/components/text";
import FileInput from "@docspace/components/file-input";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import styled from "styled-components";

const Wrapper = styled.div`
  max-width: 350px;

  .choose-backup-file {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 16px;
  }
`;

const FirstStep = ({
  t,
  onNextStepClick,
  onPrevStepClick,
  showReminder,
  setShowReminder,
}) => {
  const onClickInput = (file) => {
    let data = new FormData();
    data.append("file", file);
    setShowReminder(true);
  };

  return (
    <>
      <Wrapper>
        <Text className="choose-backup-file">
          {t("Settings:ChooseBackupFile")}
        </Text>
        <FileInput
          onInput={onClickInput}
          className="upload-backup-input"
          placeholder={t("Settings:BackupFile")}
          scale
        />
      </Wrapper>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStepClick}
        onCancelClick={onPrevStepClick}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:UploadToServer")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </>
  );
};

export default FirstStep;
