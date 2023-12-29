import { css } from "styled-components";
import { getCorrectTextAlign } from "./rtlUtils";

export const commonTextStyles = css<{
  textAlign?: string;
  colorProp?: string;
  truncate?: boolean;
}>`
  font-family: ${(props) => props.theme.fontFamily};
  text-align: ${(props) =>
    getCorrectTextAlign(props.textAlign || "", props.theme.interfaceDirection)};
  color: ${(props) =>
    props.colorProp ? props.colorProp : props.theme.text.color};
  ${(props) =>
    props.truncate &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;
