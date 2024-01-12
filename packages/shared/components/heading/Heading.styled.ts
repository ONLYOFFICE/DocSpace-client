import styled, { css } from "styled-components";

import { NoUserSelect, commonTextStyles } from "../../utils";

import { Base, TTheme } from "../../themes";
import { HeadingSize } from "./Heading.enums";

const fontSizeStyle = (props: { size: HeadingSize; theme: TTheme }) =>
  props.theme.heading.fontSize[props.size];

const styleCss = css<{
  size: HeadingSize;
  colorProp?: string;
  isInline?: boolean;
}>`
  font-size: ${(props) => props.theme.getCorrectFontSize(fontSizeStyle(props))};
  font-weight: ${(props) => props.theme.heading.fontWeight};

  color: ${(props) => props.colorProp || props.theme.heading.color}
    ${(props) =>
      props.isInline &&
      css`
        display: inline-block;
      `};
`;

const StyledHeading = styled.h1`
  ${styleCss};

  ${commonTextStyles};

  ${NoUserSelect};
`;

StyledHeading.defaultProps = { theme: Base };

export default StyledHeading;
