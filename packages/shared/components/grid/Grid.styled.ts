// (c) Copyright Ascensio System SIA 2009-2024
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

import styled, { css } from "styled-components";
import { getCorrectFourValuesStyle } from "../../utils";
import { GridProps, TAreaProp, TColumnProp } from "./Grid.types";

const alignContentStyle = (alignContent: string) =>
  `align-content: ${alignContent};`;
const alignItemsStyle = (alignItems: string) => `align-items: ${alignItems};`;
const alignSelfStyle = (alignSelf: string) => `align-self: ${alignSelf};`;

const areasStyle = (props: {
  areasProp?: TAreaProp;
  rowsProp?: string | string[];
  columnsProp?: TColumnProp;
}) => {
  const areas = props.areasProp;
  if (Array.isArray(areas) && areas.every((area) => Array.isArray(area))) {
    return `grid-template-areas: ${areas
      .map((area) => Array.isArray(area) && `"${area.join(" ")}"`)
      .join(" ")};`;
  }

  const columnsProp = props.columnsProp;
  if (Array.isArray(props.rowsProp) && Array.isArray(columnsProp)) {
    const cells = props.rowsProp.map(() => columnsProp.map(() => "."));
    props.areasProp?.forEach((area) => {
      if ("start" in area) {
        for (let row = area.start[1]; row <= area.end[1]; row += 1) {
          for (let column = area.start[0]; column <= area.end[0]; column += 1) {
            cells[row][column] = area.name;
          }
        }
      }
    });
    return `grid-template-areas: ${cells
      .map((r: string[]) => `"${r.join(" ")}"`)
      .join(" ")};`;
  }
};

const getSizeValue = (value: string[] | string) =>
  Array.isArray(value) ? `minmax(${value[0]}, ${value[1]})` : value;

const columnsStyle = (props: { columnsProp?: TColumnProp }) => {
  if (Array.isArray(props.columnsProp)) {
    return css`
      grid-template-columns: ${props.columnsProp.map(getSizeValue).join(" ")};
    `;
  }
  if (typeof props.columnsProp === "object") {
    return css`
      grid-template-columns: repeat(
        ${props.columnsProp.count},
        ${getSizeValue(props.columnsProp.size)}
      );
    `;
  }
  return css`
    grid-template-columns: repeat(
      auto-fill,
      ${getSizeValue(props.columnsProp || "")}
    );
  `;
};

const gridAreaStyle = (gridArea: string) => `grid-area: ${gridArea};`;
const gridColumnGapStyle = (gridColumnGap: string) =>
  `grid-column-gap: ${gridColumnGap};`;
const gridGapStyle = (gridGap: string) => `grid-gap: ${gridGap};`;
const gridRowGapStyle = (gridRowGap: string) => `grid-row-gap: ${gridRowGap};`;
const heightStyle = (heightProp: string) => `height: ${heightProp};`;
const justifyContentStyle = (justifyContent: string) =>
  `justify-content: ${justifyContent};`;
const justifyItemsStyle = (justifyItems: string) =>
  `justify-items: ${justifyItems};`;
const justifySelfStyle = (justifySelf: string) =>
  `justify-self: ${justifySelf};`;
const marginStyle = (marginProp: string, interfaceDirection: string) =>
  `margin: ${getCorrectFourValuesStyle(marginProp, interfaceDirection)};`;
const paddingStyle = (paddingProp: string, interfaceDirection: string) =>
  `padding: ${getCorrectFourValuesStyle(paddingProp, interfaceDirection)};`;

const rowsStyle = (props: { rowsProp?: string | string[] }) => {
  if (Array.isArray(props.rowsProp)) {
    return css`
      grid-template-rows: ${props.rowsProp.map(getSizeValue).join(" ")};
    `;
  }
  return css`
    grid-auto-rows: ${props.rowsProp};
  `;
};

const widthStyle = (widthProp: string) => `width: ${widthProp};`;

const StyledGrid = styled.div<GridProps>`
  ${(props) => props.alignContent && alignContentStyle(props.alignContent)}
  ${(props) => props.alignItems && alignItemsStyle(props.alignItems)}
  ${(props) => props.alignSelf && alignSelfStyle(props.alignSelf)}
  ${(props) =>
    props.areasProp && props.rowsProp && props.columnsProp && areasStyle(props)}
  ${(props) => props.columnsProp && columnsStyle(props)}
  display: grid;
  ${(props) => props.gridArea && gridAreaStyle(props.gridArea)}
  ${(props) => props.gridColumnGap && gridColumnGapStyle(props.gridColumnGap)}
  ${(props) => props.gridGap && gridGapStyle(props.gridGap)}
  ${(props) => props.gridRowGap && gridRowGapStyle(props.gridRowGap)}
  ${(props) => props.heightProp && heightStyle(props.heightProp)}
  ${(props) =>
    props.justifyContent && justifyContentStyle(props.justifyContent)}
  ${(props) => props.justifyItems && justifyItemsStyle(props.justifyItems)}
  ${(props) => props.justifySelf && justifySelfStyle(props.justifySelf)}
  ${(props) =>
    props.marginProp &&
    marginStyle(props.marginProp, props.theme.interfaceDirection)}
  ${(props) =>
    props.paddingProp &&
    paddingStyle(props.paddingProp, props.theme.interfaceDirection)}
  ${(props) => props.rowsProp && rowsStyle(props)}
  ${(props) => props.widthProp && widthStyle(props.widthProp)}
`;

export default StyledGrid;
