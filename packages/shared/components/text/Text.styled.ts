import styled, { css } from "styled-components";
import commonTextStyles from "./common-text-styles";
import Base from "../themes/base";
import NoUserSelect from "../utils/commonStyles";

import { getCorrectTextAlign } from "../utils/rtlUtils";

const commonTextStyles = css`
  font-family: ${(props) => props.theme.fontFamily};
  text-align: ${(props) =>
    // @ts-expect-error TS(2339): Property 'textAlign' does not exist on type 'Theme... Remove this comment to see the full error message
    getCorrectTextAlign(props.textAlign, props.theme.interfaceDirection)};
  color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'colorProp' does not exist on type 'Theme... Remove this comment to see the full error message
    props.colorProp ? props.colorProp : props.theme.text.color};
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'truncate' does not exist on type 'Themed... Remove this comment to see the full error message
    props.truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const styleCss = css`
  // @ts-expect-error TS(2339): Property 'fontSizeProp' does not exist on type 'Th... Remove this comment to see the full error message
  font-size: ${(props) => props.theme.getCorrectFontSize(props.fontSizeProp)};
  outline: 0 !important;
  margin: 0;
  font-weight: ${(props) =>
    // @ts-expect-error TS(2339): Property 'fontWeightProp' does not exist on type '... Remove this comment to see the full error message
    props.fontWeightProp
      ? // @ts-expect-error TS(2339): Property 'fontWeightProp' does not exist on type '... Remove this comment to see the full error message
        props.fontWeightProp
      : // @ts-expect-error TS(2339): Property 'isBold' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      props.isBold == true
      ? 700
      : props.theme.text.fontWeight};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isItalic' does not exist on type 'Themed... Remove this comment to see the full error message
    props.isItalic == true &&
    css`
      font-style: italic;
    `}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
    props.backgroundColor &&
    css`
      // @ts-expect-error TS(2339): Property 'backgroundColor' does not exist on type ... Remove this comment to see the full error message
      background-color: ${(props) => props.backgroundColor};
    `}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isInline' does not exist on type 'Themed... Remove this comment to see the full error message
    props.isInline
      ? css`
          display: inline-block;
        `
      : // @ts-expect-error TS(2339): Property 'display' does not exist on type 'ThemedS... Remove this comment to see the full error message
        props.display &&
        css`
          // @ts-expect-error TS(2339): Property 'display' does not exist on type 'ThemePr... Remove this comment to see the full error message
          display: ${(props) => props.display};
        `}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'lineHeight' does not exist on type 'Them... Remove this comment to see the full error message
    props.lineHeight &&
    css`
      // @ts-expect-error TS(2339): Property 'lineHeight' does not exist on type 'Them... Remove this comment to see the full error message
      line-height: ${props.lineHeight};
    `}
`;
const StyledText = styled.p`
  ${styleCss};

  ${commonTextStyles};
  // @ts-expect-error TS(2551): Property 'noSelect' does not exist on type 'Themed... Remove this comment to see the full error message
  ${(props) => props.noSelect && NoUserSelect}
`;

StyledText.defaultProps = { theme: Base };

export default StyledText;
