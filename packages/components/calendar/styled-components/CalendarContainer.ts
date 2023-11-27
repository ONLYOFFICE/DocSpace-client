import styled, { css } from "styled-components";

export const CalendarContainer = styled.div`
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    !props.isMobile &&
    css`
      width: 306px;
      height: 276px;
    `}

  box-sizing: border-box;

  display: grid;
  row-gap: ${(props) =>
    // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
    props.big
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      ? props.isMobile
        ? "26.7px"
        : "10px"
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      : props.isMobile
      ? "9px"
      : "0"};
  column-gap: ${(props) =>
    // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
    props.big
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      ? props.isMobile
        ? "8%"
        : "31.33px"
      // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
      : props.isMobile
      ? "2%"
      : "14px"};
  grid-template-columns: ${(props) =>
    // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
    props.big ? "repeat(4, 1fr)" : "repeat(7, 1fr)"};
  box-sizing: border-box;
  // @ts-expect-error TS(2339): Property 'big' does not exist on type 'ThemedStyle... Remove this comment to see the full error message
  padding: ${(props) => (props.big ? "14px 6px 6px 6px" : "0 6px")};
`;
