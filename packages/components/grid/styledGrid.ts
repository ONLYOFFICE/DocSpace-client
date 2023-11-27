import styled, { css } from "styled-components";
import { getCorrectFourValuesStyle } from "../utils/rtlUtils";

const alignContentStyle = (alignContent: any) => `align-content: ${alignContent};`;
const alignItemsStyle = (alignItems: any) => `align-items: ${alignItems};`;
const alignSelfStyle = (alignSelf: any) => `align-self: ${alignSelf};`;

const areasStyle = (props: any) => {
  if (
    Array.isArray(props.areasProp) &&
    props.areasProp.every((area: any) => Array.isArray(area))
  ) {
    return `grid-template-areas: ${props.areasProp
      .map((area: any) => `"${area.join(" ")}"`)
      .join(" ")};`;
  }
  const cells = props.rowsProp.map(() => props.columnsProp.map(() => "."));
  props.areasProp.forEach((area: any) => {
    for (let row = area.start[1]; row <= area.end[1]; row += 1) {
      for (let column = area.start[0]; column <= area.end[0]; column += 1) {
        cells[row][column] = area.name;
      }
    }
  });
  return `grid-template-areas: ${cells
    .map((r: any) => `"${r.join(" ")}"`)
    .join(" ")};`;
};

const getSizeValue = (value: any) => Array.isArray(value) ? `minmax(${value[0]}, ${value[1]})` : value;

const columnsStyle = (props: any) => {
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
      ${getSizeValue(props.columnsProp)}
    );
  `;
};

const gridAreaStyle = (gridArea: any) => `grid-area: ${gridArea};`;
const gridColumnGapStyle = (gridColumnGap: any) => `grid-column-gap: ${gridColumnGap};`;
const gridGapStyle = (gridGap: any) => `grid-gap: ${gridGap};`;
const gridRowGapStyle = (gridRowGap: any) => `grid-row-gap: ${gridRowGap};`;
const heightStyle = (heightProp: any) => `height: ${heightProp};`;
const justifyContentStyle = (justifyContent: any) => `justify-content: ${justifyContent};`;
const justifyItemsStyle = (justifyItems: any) => `justify-items: ${justifyItems};`;
const justifySelfStyle = (justifySelf: any) => `justify-self: ${justifySelf};`;
const marginStyle = (marginProp: any, interfaceDirection: any) =>
  `margin: ${getCorrectFourValuesStyle(marginProp, interfaceDirection)};`;
const paddingStyle = (paddingProp: any, interfaceDirection: any) =>
  `padding: ${getCorrectFourValuesStyle(paddingProp, interfaceDirection)};`;

const rowsStyle = (props: any) => {
  if (Array.isArray(props.rowsProp)) {
    return css`
      grid-template-rows: ${props.rowsProp.map(getSizeValue).join(" ")};
    `;
  }
  return css`
    grid-auto-rows: ${props.rowsProp};
  `;
};

const widthStyle = (widthProp: any) => `width: ${widthProp};`;

const StyledGrid = styled.div`
  // @ts-expect-error TS(2339): Property 'alignContent' does not exist on type 'Th... Remove this comment to see the full error message
  ${(props) => props.alignContent && alignContentStyle(props.alignContent)}
  // @ts-expect-error TS(2339): Property 'alignItems' does not exist on type 'Them... Remove this comment to see the full error message
  ${(props) => props.alignItems && alignItemsStyle(props.alignItems)}
  // @ts-expect-error TS(2339): Property 'alignSelf' does not exist on type 'Theme... Remove this comment to see the full error message
  ${(props) => props.alignSelf && alignSelfStyle(props.alignSelf)}
  // @ts-expect-error TS(2339): Property 'areasProp' does not exist on type 'Theme... Remove this comment to see the full error message
  ${(props) => props.areasProp && areasStyle(props)}
  // @ts-expect-error TS(2339): Property 'columnsProp' does not exist on type 'The... Remove this comment to see the full error message
  ${(props) => props.columnsProp && columnsStyle(props)}
  display: grid;
  // @ts-expect-error TS(2339): Property 'gridArea' does not exist on type 'Themed... Remove this comment to see the full error message
  ${(props) => props.gridArea && gridAreaStyle(props.gridArea)}
  // @ts-expect-error TS(2339): Property 'gridColumnGap' does not exist on type 'T... Remove this comment to see the full error message
  ${(props) => props.gridColumnGap && gridColumnGapStyle(props.gridColumnGap)}
  // @ts-expect-error TS(2339): Property 'gridGap' does not exist on type 'ThemedS... Remove this comment to see the full error message
  ${(props) => props.gridGap && gridGapStyle(props.gridGap)}
  // @ts-expect-error TS(2339): Property 'gridRowGap' does not exist on type 'Them... Remove this comment to see the full error message
  ${(props) => props.gridRowGap && gridRowGapStyle(props)}
  // @ts-expect-error TS(2339): Property 'heightProp' does not exist on type 'Them... Remove this comment to see the full error message
  ${(props) => props.heightProp && heightStyle(props.heightProp)}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'justifyContent' does not exist on type '... Remove this comment to see the full error message
    props.justifyContent && justifyContentStyle(props.justifyContent)}
  // @ts-expect-error TS(2339): Property 'justifyItems' does not exist on type 'Th... Remove this comment to see the full error message
  ${(props) => props.justifyItems && justifyItemsStyle(props.justifyItems)}
  // @ts-expect-error TS(2339): Property 'justifySelf' does not exist on type 'The... Remove this comment to see the full error message
  ${(props) => props.justifySelf && justifySelfStyle(props.justifySelf)}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'marginProp' does not exist on type 'Them... Remove this comment to see the full error message
    props.marginProp &&
    // @ts-expect-error TS(2339): Property 'marginProp' does not exist on type 'Them... Remove this comment to see the full error message
    marginStyle(props.marginProp, props.theme.interfaceDirection)}
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'paddingProp' does not exist on type 'The... Remove this comment to see the full error message
    props.paddingProp &&
    // @ts-expect-error TS(2339): Property 'paddingProp' does not exist on type 'The... Remove this comment to see the full error message
    paddingStyle(props.paddingProp, props.theme.interfaceDirection)}
  // @ts-expect-error TS(2339): Property 'rowsProp' does not exist on type 'Themed... Remove this comment to see the full error message
  ${(props) => props.rowsProp && rowsStyle(props)}
  // @ts-expect-error TS(2339): Property 'widthProp' does not exist on type 'Theme... Remove this comment to see the full error message
  ${(props) => props.widthProp && widthStyle(props.widthProp)}
`;

export default StyledGrid;
