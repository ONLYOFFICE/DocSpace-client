import styled, { css } from "styled-components";
import Base from "../../themes/base";

export const ArrowIcon = styled.span`
  position: absolute;
  border-left: 2px solid;
  border-bottom: 2px solid;
  width: 5px;
  height: 5px;

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'next' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    props.next &&
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    (props.isMobile
      ? css`
          transform: rotate(-45deg);
          top: 11.5px;
          left: 12.5px;
        `
      : css`
          transform: rotate(-45deg);
          top: 9px;
          left: 9.5px;
        `)}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'previous' does not exist on type 'Themed... Remove this comment to see the full error message
    props.previous &&
    // @ts-expect-error TS(2339): Property 'isMobile' does not exist on type 'Themed... Remove this comment to see the full error message
    (props.isMobile
      ? css`
          transform: rotate(135deg);
          top: 14px;
          left: 12.5px;
        `
      : css`
          transform: rotate(135deg);
          top: 11px;
          left: 9.5px;
        `)}
`;

ArrowIcon.defaultProps = { theme: Base };
