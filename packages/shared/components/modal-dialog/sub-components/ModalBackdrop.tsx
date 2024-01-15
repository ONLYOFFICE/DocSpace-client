import React from "react";
import styled from "styled-components";

import { mobile } from "../../../utils";

import { ModalDialogBackdropProps } from "../ModalDialog.types";

const backdropFilter = (props: { modalSwipeOffset?: number }) =>
  `${
    props.modalSwipeOffset
      ? `blur(${
          props.modalSwipeOffset < 0 && 8 - props.modalSwipeOffset * -0.0667
        }px)`
      : "blur(8px)"
  }`;

const StyledModalBackdrop = styled.div.attrs(
  (props: { modalSwipeOffset?: number; zIndex?: number }) => ({
    style: {
      backdropFilter: backdropFilter(props),
      WebkitBackdropFilter: backdropFilter(props),
      background: `${
        props.modalSwipeOffset
          ? `rgba(6, 22, 38, ${
              props.modalSwipeOffset < 0 &&
              0.2 - props.modalSwipeOffset * -0.002
            })`
          : `rgba(6, 22, 38, 0.2)`
      }`,
    },
  }),
)<{ modalSwipeOffset?: number; zIndex?: number }>`
  display: block;
  height: 100%;
  min-height: fill-available;
  max-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;

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
  children,
}: ModalDialogBackdropProps) => {
  return (
    <StyledModalBackdrop
      zIndex={zIndex}
      className={className}
      modalSwipeOffset={modalSwipeOffset}
    >
      {children}
    </StyledModalBackdrop>
  );
};

export { ModalBackdrop };
