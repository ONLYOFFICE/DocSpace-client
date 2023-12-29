import styled, { css } from "styled-components";

import { Base } from "../../themes";
import { NoUserSelect, commonTextStyles } from "../../utils";

import { StyledTextProps, TextProps } from "./Text.types";

const styleCss = css<TextProps & StyledTextProps>`
  font-size: ${(props) =>
    props.fontSizeProp && props.theme.getCorrectFontSize(props.fontSizeProp)};
  outline: 0 !important;
  margin: 0;
  font-weight: ${(props) =>
    props.fontWeightProp
      ? props.fontWeightProp
      : props.isBold
        ? 700
        : props.theme.text.fontWeight};

  ${(props) =>
    props.isItalic &&
    css`
      font-style: italic;
    `}
  ${(props) =>
    props.backgroundColor &&
    css`
      background-color: ${props.backgroundColor};
    `}
  ${(props) =>
    props.isInline
      ? css`
          display: inline-block;
        `
      : props.display &&
        css`
          display: ${props.display};
        `}
  ${(props) =>
    props.lineHeight &&
    css`
      line-height: ${props.lineHeight};
    `}
`;
const StyledText = styled.p<TextProps & StyledTextProps>`
  ${styleCss};

  ${commonTextStyles};

  ${(props) => props.noSelect && NoUserSelect}
`;

StyledText.defaultProps = { theme: Base };

export default StyledText;
