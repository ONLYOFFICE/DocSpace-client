import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";

const StyledInputWrapper = styled.div`
  width: 100%;
  max-width: ${(props) => props.maxWidth || "520px"};

  @media ${mobile} {
    max-width: 100%;
  }

  .field-input {
    ::placeholder {
      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      font-weight: 400;
    }
  }

  .field-label-icon {
    align-items: center;
    margin-bottom: 4px;
    max-width: 520px;
  }

  .field-label {
    display: flex;
    align-items: center;
    height: auto;
    font-weight: 600;
    line-height: 20px;
    overflow: visible;
    white-space: normal;
  }
`;

export default StyledInputWrapper;
