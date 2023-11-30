import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";

import { Wrapper } from "../StyledStepper";

const ButtonsWrapper = styled.div`
  max-width: 445px;
  display: flex;
  align-items: center;
  column-gap: 8px;
`;

const SeventhStep = ({
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
    <Wrapper>
      <Text fontSize="12px">
        {t("Settings:ImportedUsers", {
          selectedUsers: importResult.succeedUsers,
          importedUsers: importResult.failedUsers,
        })}
      </Text>
      {importResult.failedUsers > 0 && (
        <Text fontSize="12px" color="#F21C0E" className="mt-8">
          {t("Settings:ErrorsWereFound", { errors: importResult.failedUsers })}
        </Text>
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
          tooltipContent={<Text fontSize="12px">{t("Settings:WelcomeLetterTooltip")}</Text>}
        />
      </div>

      <ButtonsWrapper>
        <Button size="small" label={t("Common:Finish")} primary onClick={onFinishClick} />
        <Button size="small" label={t("Settings:DownloadLog")} onClick={onDownloadLog} />
      </ButtonsWrapper>
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const { importResult, getMigrationLog, clearCheckedAccounts, sendWelcomeLetter } =
    importAccountsStore;

  return {
    importResult,
    getMigrationLog,
    clearCheckedAccounts,
    sendWelcomeLetter,
  };
})(observer(SeventhStep));
