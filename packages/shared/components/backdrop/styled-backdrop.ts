import styled, { css } from "styled-components";
import Base from "../themes/base";

const StyledBackdrop = styled.div`
  background-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'needBackground' does not exist on type '... Remove this comment to see the full error message
    props.needBackground
      ? props.theme.backdrop.backgroundColor
      : props.theme.backdrop.unsetBackgroundColor};
  ${(props) =>
    // @ts-expect-error TS(2339): Property 'needBackground' does not exist on type '... Remove this comment to see the full error message
    props.needBackground &&
    css`
      backdrop-filter: blur(3px);
    `};
  // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'ThemedS... Remove this comment to see the full error message
  display: ${(props) => (props.visible ? "block" : "none")};
  height: 100vh;
  position: fixed;
  width: 100vw;
  // @ts-expect-error TS(2339): Property 'zIndex' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  z-index: ${(props) => props.zIndex};
  left: 0;
  top: 0;
  cursor: ${(props) =>
    // @ts-expect-error TS(2339): Property 'needBackground' does not exist on type '... Remove this comment to see the full error message
    props.needBackground && !props.isModalDialog ? "pointer" : "default"}; ;
`;

StyledBackdrop.defaultProps = {
  theme: Base,
};

export default StyledBackdrop;
