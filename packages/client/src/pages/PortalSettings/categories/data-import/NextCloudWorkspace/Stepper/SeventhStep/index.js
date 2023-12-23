import { useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";

import { Wrapper } from "../StyledStepper";

const ErrorText = styled(Text)`
  font-size: 12px;
  color: ${(props) => props.theme.client.settings.migration.errorTextColor};
  margin-bottom: 16px;
`;

const SeventhStep = ({
  t,
  checkedUsers,
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
    <Wrapper>
      <Text fontSize="12px">
        {t("Settings:ImportedUsers", {
          selectedUsers: importResult.succeedUsers,
          importedUsers: checkedUsers.result.length,
        })}
      </Text>

      {importResult.failedUsers > 0 && (
        <ErrorText>
          {t("Settings:ErrorsWereFound", { errors: importResult.failedUsers })}
        </ErrorText>
      )}

      <div className="sendLetterBlockWrapper">
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
      </div>

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onFinishClick}
        onCancelClick={onDownloadLog}
        saveButtonLabel={t("Common:Finish")}
        cancelButtonLabel={t("Settings:DownloadLog")}
        displaySettings
        showReminder
      />
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    checkedUsers,
    importResult,
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
  } = importAccountsStore;

  return {
    checkedUsers,
    importResult,
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
  };
})(observer(SeventhStep));
