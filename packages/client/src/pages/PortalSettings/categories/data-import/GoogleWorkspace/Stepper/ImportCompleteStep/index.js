import { useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import Button from "@docspace/components/button";
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

const ButtonsWrapper = styled.div`
  max-width: 445px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 8px;

  @media ${tablet} {
    max-width: 462px;

    .finish-button,
    .download-button,
    .delete-button {
      height: 40px;
      font-size: 14px;
    }
  }
`;

const ImportCompleteStep = ({ t, getMigrationLog }) => {
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

  const selectedUsers = 70;
  const importedUsers = 70;

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <>
      <StyledText>
        {t("Settings:ImportedUsers", { selectedUsers, importedUsers })}
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

      <ButtonsWrapper>
        <Button
          size="small"
          className="finish-button"
          label={t("Common:Finish")}
          primary
          onClick={() => navigate(-1)}
        />
        <Button
          size="small"
          className="download-button"
          label={t("Settings:DownloadLog")}
          onClick={onDownloadLog}
        />
        <Button
          size="small"
          className="delete-button"
          label={t("Settings:DeleteTemporaryFile")}
        />
      </ButtonsWrapper>
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { getMigrationLog } = importAccountsStore;

  return {
    getMigrationLog,
  };
})(observer(ImportCompleteStep));
