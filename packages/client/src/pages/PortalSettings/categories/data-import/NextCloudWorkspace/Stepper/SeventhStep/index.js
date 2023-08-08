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
`;

const SeventhStep = ({ t }) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <Wrapper>
      <Text fontSize="12px">67/70 users were imported successfully.</Text>
      <Text fontSize="12px" color="#F21C0E" className="mt-8">
        3 errors were found.
      </Text>

      <Box displayProp="flex" alignItems="center" marginProp="17px 0 16px">
        <Checkbox label="Send welcome letter" isChecked={isChecked} onChange={onChangeCheckbox} />
        <HelpButton
          place="right"
          offsetRight={0}
          style={{ marginLeft: "4px" }}
          tooltipContent={
            <Text fontSize="12px">
              If checked, all new users will receive welcome letter with authorization details.
            </Text>
          }
        />
      </Box>

      <ButtonsWrapper>
        <Button size="small" label="Finish" primary onClick={() => navigate(-1)} />
        <Button size="small" label="Download log" />
        <Button size="small" label="Delete temporary file" />
      </ButtonsWrapper>
    </Wrapper>
  );
};

export default SeventhStep;
