import styled from "styled-components";
import { getCorrectFourValuesStyle, mobileMore } from "@docspace/shared/utils";

const StyledBreakpointWarning = styled.div`
  padding: ${({ theme }) =>
    getCorrectFourValuesStyle("24px 44px 0 24px", theme.interfaceDirection)};
  display: flex;
  flex-direction: column;

  .description {
    display: flex;
    flex-direction: column;
    padding-top: 32px;
    white-space: break-spaces;
  }

  .text-breakpoint {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    line-height: 22px;
    padding-bottom: 8px;
    max-width: 348px;
  }

  .text-prompt {
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    line-height: 16px;
  }

  img {
    width: 72px;
    height: 72px;
  }

  @media ${mobileMore} {
    flex-direction: row;

    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("65px 0 0 104px", theme.interfaceDirection)};

    .description {
      padding: ${({ theme }) =>
        getCorrectFourValuesStyle("0 0 0 32px", theme.interfaceDirection)};
    }

    img {
      width: 100px;
      height: 100px;
    }
  }
`;

export default StyledBreakpointWarning;
