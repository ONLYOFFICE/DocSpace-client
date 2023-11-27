import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { mobile } from "../../utils/device";

const backdropFilter = (props: any) => `${
  props.modalSwipeOffset
    ? `blur(${
        props.modalSwipeOffset < 0 && 8 - props.modalSwipeOffset * -0.0667
      }px)`
    : "blur(8px)"
}`;

const StyledModalBackdrop = styled.div.attrs((props) => ({
  style: {
    backdropFilter: backdropFilter(props),
    WebkitBackdropFilter: backdropFilter(props),
    background: `${
      // @ts-expect-error TS(2339): Property 'modalSwipeOffset' does not exist on type... Remove this comment to see the full error message
      props.modalSwipeOffset
        ? `rgba(6, 22, 38, ${
            // @ts-expect-error TS(2339): Property 'modalSwipeOffset' does not exist on type... Remove this comment to see the full error message
            props.modalSwipeOffset < 0 && 0.2 - props.modalSwipeOffset * -0.002
          })`
        : `rgba(6, 22, 38, 0.2)`
    }`,
  },
}))`
  display: block;
  height: 100%;
  min-height: fill-available;
  max-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  // @ts-expect-error TS(2339): Property 'zIndex' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  z-index: ${(props) => props.zIndex};

  @media ${mobile} {
    position: absolute;
  }

  transition: 0.2s;
  opacity: 0;
  &.modal-backdrop-active {
    opacity: 1;
  }
`;

const ModalBackdrop = ({
  className,
  zIndex,
  modalSwipeOffset,
  children
}: any) => {
  return (
    <StyledModalBackdrop
      // @ts-expect-error TS(2769): No overload matches this call.
      zIndex={zIndex}
      className={className}
      modalSwipeOffset={modalSwipeOffset}
    >
      {children}
    </StyledModalBackdrop>
  );
};

ModalBackdrop.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,

  zIndex: PropTypes.number,
  visible: PropTypes.bool,
  modalSwipeOffset: PropTypes.number,
};

export default ModalBackdrop;
