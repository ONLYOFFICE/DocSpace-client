import styled from "styled-components";

const StyledRowContainer = styled.div`
  user-select: none;
  height: ${(props) =>
    // @ts-expect-error TS(2339): Property 'useReactWindow' does not exist on type '... Remove this comment to see the full error message
    props.useReactWindow
      // @ts-expect-error TS(2339): Property 'manualHeight' does not exist on type 'Th... Remove this comment to see the full error message
      ? props.manualHeight
        // @ts-expect-error TS(2339): Property 'manualHeight' does not exist on type 'Th... Remove this comment to see the full error message
        ? props.manualHeight
        : "100%"
      : "auto"};
  position: relative;
`;

export default StyledRowContainer;
