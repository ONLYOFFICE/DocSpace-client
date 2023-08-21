import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";

const StyledText = styled(Text)`
  margin-top: -8px;
  margin-bottom: 16px;
`;

const ButtonsWrapper = styled.div`
  max-width: 445px;
  display: flex;
  align-items: center;
  justify-content: space-between;

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

const ImportCompleteStep = ({ t }) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

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

      <Box displayProp="flex" alignItems="center" marginProp="0 0 16px">
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
      </Box>

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

export default ImportCompleteStep;
