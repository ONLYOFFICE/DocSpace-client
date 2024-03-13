import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { toastr } from "@docspace/shared/components/toast";

import { Wrapper } from "../StyledStepper";

const ErrorText = styled(Text)`
  font-size: 12px;
  color: ${(props) => props.theme.client.settings.migration.errorTextColor};
  margin-bottom: 16px;
`;

const ImportCompleteStep = ({
  t,
  getMigrationLog,
  clearCheckedAccounts,
  sendWelcomeLetter,
  clearMigration,
  getMigrationStatus,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [importResult, setImportResult] = useState({
    succeedUsers: 0,
    failedUsers: 0,
  });
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
    clearCheckedAccounts();
    clearMigration();
    setTimeout(() => navigate(-1), 1000);
  };

  useEffect(() => {
    try {
      getMigrationStatus().then((res) =>
        setImportResult({
          succeedUsers: res.parseResult.successedUsers,
          failedUsers: res.parseResult.failedUsers,
        }),
      );
    } catch (error) {
      toastr.error(error);
    }
  }, []);

  return (
    <Wrapper>
      <Text fontSize="12px">
        {t("Settings:ImportedUsers", {
          selectedUsers: importResult.succeedUsers,
          importedUsers: importResult.succeedUsers + importResult.failedUsers,
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
          style={{ margin: "0px 5px" }}
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
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
    clearMigration,
    getMigrationStatus,
  } = importAccountsStore;

  return {
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
    clearMigration,
    getMigrationStatus,
  };
})(observer(ImportCompleteStep));
