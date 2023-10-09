import { mobile, tablet } from "@docspace/components/utils/device";
import { css } from "styled-components";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  @media ${tablet} {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -16px;
            margin-left: -8px;
            padding-right: 16px;
            padding-left: 8px;
          `
        : css`
            margin-left: -16px;
            margin-right: -8px;
            padding-left: 16px;
            padding-right: 8px;
          `}
  }
`;

export default marginStyles;
