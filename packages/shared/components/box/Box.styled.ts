import styled from "styled-components";
import { TInterfaceDirection } from "../../types";
import {
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
  getCorrectTextAlign,
} from "../../utils";

import { BoxProps } from "./Box.types";

const alignContentStyle = (alignContent: string) =>
  `align-content: ${alignContent};`;
const alignItemsStyle = (alignItems: string) => `align-items: ${alignItems};`;
const alignSelfStyle = (alignSelf: string) => `align-self: ${alignSelf};`;
const backgroundStyle = (backgroundProp: string) =>
  `background: ${backgroundProp};`;

const borderStyle = (
  borderProp:
    | string
    | { style: string; width: string; color: string; radius?: string },
  interfaceDirection: TInterfaceDirection = "ltr"
) => {
  const styles = [];

  if (typeof borderProp === "string") {
    return `border: ${borderProp};`;
  }

  if (borderProp.style)
    styles.push(
      `border-style: ${getCorrectFourValuesStyle(
        borderProp.style,
        interfaceDirection
      )};`
    );

  if (borderProp.width)
    styles.push(
      `border-width: ${getCorrectFourValuesStyle(
        borderProp.width,
        interfaceDirection
      )};`
    );

  if (borderProp.color)
    styles.push(
      `border-color: ${getCorrectFourValuesStyle(
        borderProp.color,
        interfaceDirection
      )};`
    );

  if (borderProp.radius)
    styles.push(
      `border-radius: ${getCorrectBorderRadius(
        borderProp.radius,
        interfaceDirection
      )};`
    );

  return styles.join("\n");
};

const displayStyle = (displayProp: string) => `display: ${displayProp};`;
const flexBasisStyle = (flexBasis: string) => `flex-basis: ${flexBasis};`;
const flexDirectionStyle = (flexDirection: string) =>
  `flex-direction: ${flexDirection};`;
const flexStyle = (flexProp: string) => `flex: ${flexProp};`;
const flexWrapStyle = (flexWrap: string) => `flex-wrap: ${flexWrap};`;
const gridAreaStyle = (gridArea: string) => `grid-area: ${gridArea};`;
const heightStyle = (heightProp: string) => `height: ${heightProp};`;
const justifyContentStyle = (justifyContent: string) =>
  `justify-content: ${justifyContent};`;
const justifyItemsStyle = (justifyItems: string) =>
  `justify-items: ${justifyItems};`;
const justifySelfStyle = (justifySelf: string) =>
  `justify-self: ${justifySelf};`;
const marginStyle = (marginProp: string) => `margin: ${marginProp};`;
const overflowStyle = (overflowProp: string) => `overflow: ${overflowProp};`;
const paddingStyle = (paddingProp: string) => `padding: ${paddingProp};`;
const textAlignStyle = (textAlign: string) => `text-align: ${textAlign};`;
const widthStyle = (widthProp: string) => `width: ${widthProp};`;

const StyledBox = styled.div<BoxProps>`
  ${(props) => props.alignContent && alignContentStyle(props.alignContent)}

  ${(props) => props.alignItems && alignItemsStyle(props.alignItems)}
  
  ${(props) => props.alignSelf && alignSelfStyle(props.alignSelf)}
  
  ${(props) => props.backgroundProp && backgroundStyle(props.backgroundProp)}
  ${(props) =>
    props.borderProp &&
    borderStyle(props.borderProp, props.theme.interfaceDirection)}
  box-sizing: border-box;

  ${(props) => props.displayProp && displayStyle(props.displayProp)}

  ${(props) => props.flexBasis && flexBasisStyle(props.flexBasis)}
  
  ${(props) => props.flexDirection && flexDirectionStyle(props.flexDirection)}
  
  ${(props) => props.flexProp && flexStyle(props.flexProp)}
  
  ${(props) => props.flexWrap && flexWrapStyle(props.flexWrap)}
  
  ${(props) => props.gridArea && gridAreaStyle(props.gridArea)}
  
  ${(props) => props.heightProp && heightStyle(props.heightProp)}
  ${(props) =>
    props.justifyContent && justifyContentStyle(props.justifyContent)}
  
  ${(props) => props.justifyItems && justifyItemsStyle(props.justifyItems)}
  
  ${(props) => props.justifySelf && justifySelfStyle(props.justifySelf)}
  ${(props) =>
    props.marginProp &&
    marginStyle(
      getCorrectFourValuesStyle(
        props.marginProp,
        props.theme.interfaceDirection
      )
    )}
  outline: none;

  ${(props) => props.overflowProp && overflowStyle(props.overflowProp)}
  ${(props) =>
    props.paddingProp &&
    paddingStyle(
      getCorrectFourValuesStyle(
        props.paddingProp,
        props.theme.interfaceDirection
      )
    )}
  ${(props) =>
    props.textAlign &&
    textAlignStyle(
      getCorrectTextAlign(props.textAlign, props.theme.interfaceDirection)
    )}
  
  ${(props) => props.widthProp && widthStyle(props.widthProp)}
`;

export { StyledBox };
