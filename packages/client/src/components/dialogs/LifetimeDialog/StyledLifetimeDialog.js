import { tablet, getCorrectFourValuesStyle } from "@docspace/shared/utils";
import styled from "styled-components";

const StyledBodyContent = styled.div`
  display: grid;
  gap: 18px;

  .modal-dialog-aside-header {
    margin: ${({ theme }) =>
      getCorrectFourValuesStyle("0 -24px 0 -16px", theme.interfaceDirection)};
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("0 0 0 16px", theme.interfaceDirection)};
  }

  .button-dialog-accept {
    @media ${tablet} {
      width: 100%;
    }
  }

  .button-dialog {
    @media ${tablet} {
      width: 100%;
    }

    display: inline-block;
  }
`;

const StyledFooterContent = styled.div`
  width: 100%;

  .modal-dialog_lifetime-buttons {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .modal-dialog_lifetime-checkbox {
    margin-top: -6px;
    margin-bottom: 26px;
  }
`;

export { StyledBodyContent, StyledFooterContent };
