import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";

import { Wrapper } from "../StyledStepper";

const ButtonsWrapper = styled.div`
  max-width: 445px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 8px;
`;

const SeventhStep = ({ t }) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <Wrapper>
      <Text fontSize="12px">
        {t("Settings:ImportedUsers", { selectedUsers: 67, importedUsers: 70 })}
      </Text>
      <Text fontSize="12px" color="#F21C0E" className="mt-8">
        {t("Settings:ErrorsWereFound", { errors: 3 })}
      </Text>

      <Box displayProp="flex" alignItems="center" marginProp="17px 0 16px">
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
      </Box>

      <ButtonsWrapper>
        <Button size="small" label={t("Common:Finish")} primary onClick={() => navigate(-1)} />
        <Button size="small" label={t("Settings:DownloadLog")} />
        <Button size="small" label={t("Settings:DeleteTemporaryFile")} />
      </ButtonsWrapper>
    </Wrapper>
  );
};

export default SeventhStep;
