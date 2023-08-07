import { useState } from "react";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Checkbox from "@docspace/components/checkbox";
import HelpButton from "@docspace/components/help-button";
import styled from "styled-components";

const ButtonsWrapper = styled.div`
  max-width: 445px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SixthStep = ({ t }) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <>
      <Box displayProp="flex" alignItems="center" marginProp="0 0 16px">
        <Checkbox
          label="Send welcome letter"
          isChecked={isChecked}
          onChange={onChangeCheckbox}
        />
        <HelpButton
          place="right"
          offsetRight={0}
          style={{ marginLeft: "4px" }}
          tooltipContent={
            <Text fontSize="12px">
              If checked, all new users will receive welcome letter with
              authorization details.
            </Text>
          }
        />
      </Box>

      <ButtonsWrapper>
        <Button size="small" label="Finish" primary />
        <Button size="small" label="Download log" />
        <Button size="small" label="Delete temporary file" />
      </ButtonsWrapper>
    </>
  );
};

export default SixthStep;
