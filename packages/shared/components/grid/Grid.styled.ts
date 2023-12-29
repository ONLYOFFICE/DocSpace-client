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
