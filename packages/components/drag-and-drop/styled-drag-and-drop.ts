import styled from "styled-components";

import Base from "../themes/base";
import { tablet } from "../utils/device";

const StyledDragAndDrop = styled.div`
  /*-webkit-touch-callout: none;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;*/
  height: ${(props) => props.theme.dragAndDrop.height};
  border: ${(props) => props.theme.dragAndDrop.transparentBorder};

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-right: -2px;`
      : `margin-left: -2px;`}
  position: relative;

  @media ${tablet} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 0;`
        : `margin-left: 0;`}
  }
  outline: none;
  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'dragging' does not exist on type 'Themed... Remove this comment to see the full error message
    props.dragging
      // @ts-expect-error TS(2339): Property 'isDragAccept' does not exist on type 'Th... Remove this comment to see the full error message
      ? props.isDragAccept
        ? props.theme.dragAndDrop.acceptBackground
        : props.theme.dragAndDrop.background
      : "none !important"};

  .droppable-hover {
    background: ${(props) => props.theme.dragAndDrop.acceptBackground};
  }
`;

StyledDragAndDrop.defaultProps = { theme: Base };

export default StyledDragAndDrop;
