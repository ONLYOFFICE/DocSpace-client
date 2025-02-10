// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";

import {
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
  getCorrectTextAlign,
} from "../../utils";
import { TInterfaceDirection } from "../../themes";

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
  interfaceDirection: string | TInterfaceDirection = "ltr",
) => {
  const styles = [];

  if (typeof borderProp === "string") {
    return `border: ${borderProp};`;
  }

  if (borderProp.style)
    styles.push(
      `border-style: ${getCorrectFourValuesStyle(
        borderProp.style,
        interfaceDirection,
      )};`,
    );

  if (borderProp.width)
    styles.push(
      `border-width: ${getCorrectFourValuesStyle(
        borderProp.width,
        interfaceDirection,
      )};`,
    );

  if (borderProp.color)
    styles.push(
      `border-color: ${getCorrectFourValuesStyle(
        borderProp.color,
        interfaceDirection,
      )};`,
    );

  if (borderProp.radius)
    styles.push(
      `border-radius: ${getCorrectBorderRadius(
        borderProp.radius,
        interfaceDirection,
      )};`,
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
const gapStyle = (gapProp: string) => `gap: ${gapProp};`;

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
        props.theme.interfaceDirection,
      ),
    )}
  outline: none;

  ${(props) => props.overflowProp && overflowStyle(props.overflowProp)}
  ${(props) =>
    props.paddingProp &&
    paddingStyle(
      getCorrectFourValuesStyle(
        props.paddingProp,
        props.theme.interfaceDirection,
      ),
    )}
  ${(props) =>
    props.textAlign &&
    textAlignStyle(
      getCorrectTextAlign(props.textAlign, props.theme.interfaceDirection),
    )}
  
  ${(props) => props.widthProp && widthStyle(props.widthProp)}
  ${(props) => props.gapProp && gapStyle(props.gapProp)}
`;

export { StyledBox };
