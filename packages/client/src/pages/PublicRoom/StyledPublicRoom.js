import styled, { css } from "styled-components";

import { tablet, mobile } from "@docspace/shared/utils";
import Headline from "@docspace/common/components/Headline";

const StyledHeadline = styled(Headline)`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
  line-height: 24px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 18px;
        `
      : css`
          margin-left: 18px;
        `}

  @media ${tablet} {
    font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    line-height: 28px;
  }
`;

const StyledContainer = styled.div`
  width: 100%;
  height: 32px;
  display: flex;

  align-items: center;

  .public-room-header_separator {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 0 15px 0 16px;
            border-right: 1px solid #dfe2e3;
          `
        : css`
            margin: 0 16px 0 15px;
            border-left: 1px solid #dfe2e3;
          `}
    height: 21px;
  }

  @media ${tablet} {
    width: 100%;
    padding: 16px 0 0px;
  }

  @media ${mobile} {
    width: 100%;
    padding: 12px 0 0;
  }
`;

export { StyledHeadline, StyledContainer };
