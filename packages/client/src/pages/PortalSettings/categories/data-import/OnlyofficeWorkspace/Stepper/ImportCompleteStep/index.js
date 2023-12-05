import { useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";

const Wrapper = styled.div`
  margin: 0 0 16px;
  display: flex;
  align-items: center;

  .checkbox-text {
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }
`;

const StyledText = styled(Text)`
  margin-top: -8px;
  margin-bottom: 16px;
  font-size: 12px;
  color: ${(props) => props.theme.client.settings.migration.subtitleColor};
`;

const ImportCompleteStep = ({
  t,
  importResult,
  getMigrationLog,
  clearCheckedAccounts,
  sendWelcomeLetter,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const onDownloadLog = async () => {
    try {
      await getMigrationLog()
        .then((response) => new Blob([response]))
        .then((blob) => {
          let a = document.createElement("a");
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = "migration.log";
          a.click();
          window.URL.revokeObjectURL(url);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const onFinishClick = () => {
    if (isChecked) {
      sendWelcomeLetter({ isSendWelcomeEmail: true });
    }
    navigate(-1);
    clearCheckedAccounts();
  };

  return (
    <>
      <StyledText>
        {t("Settings:ImportedUsers", {
          selectedUsers: importResult.succeedUsers,
          importedUsers: importResult.failedUsers,
        })}
      </StyledText>

      <Wrapper>
        <Checkbox
          label={t("Settings:SendWelcomeLetter")}
          isChecked={isChecked}
          onChange={onChangeCheckbox}
        />
        <HelpButton
          place="right"
          offsetRight={0}
          style={{ marginLeft: "4px" }}
          tooltipContent={
            <Text fontSize="12px">{t("Settings:WelcomeLetterTooltip")}</Text>
          }
        />
      </Wrapper>

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onFinishClick}
        onCancelClick={onDownloadLog}
        saveButtonLabel={t("Common:Finish")}
        cancelButtonLabel={t("Settings:DownloadLog")}
        displaySettings
        showReminder
      />
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    importResult,
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
  } = importAccountsStore;

  return {
    importResult,
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
  };
})(observer(ImportCompleteStep));
