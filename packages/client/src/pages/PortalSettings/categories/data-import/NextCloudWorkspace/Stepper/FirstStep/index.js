import React, { useState } from "react";
import Text from "@docspace/components/text";
import FileInput from "@docspace/components/file-input";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import styled from "styled-components";

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
`;

const FirstStep = ({ t, incrementStep, decrementStep }) => {
  const [showReminder, setShowReminder] = useState(false);

  const onClickInput = (file) => {
    let data = new FormData();
    data.append("file", file);
    setShowReminder(true);
  };

  return (
    <Wrapper>
      <Text className="choose-backup-file">{t("Settings:ChooseBackupFile")}</Text>
      <FileInput
        onInput={onClickInput}
        className="upload-backup-input"
        placeholder={t("Settings:BackupFile")}
        scale
      />
      <SaveCancelButtons
        className="upload-back-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:UploadToServer")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </Wrapper>
  );
};

export default FirstStep;
