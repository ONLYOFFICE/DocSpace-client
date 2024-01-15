import React from "react";
import styled, { css } from "styled-components";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";

import { IconButton } from "../../icon-button";
import { mobile } from "../../../utils";
import { Base } from "../../../themes";

import { ModalDialogCloseButtonProps } from "../ModalDialog.types";
import { ModalDialogType } from "../ModalDialog.enums";

const StyledCloseButtonWrapper = styled.div<{
  currentDisplayType: ModalDialogType;
}>`
  width: 17px;
  height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  position: absolute;

  ${(props) =>
    props.currentDisplayType === "modal"
      ? css`
          top: 18px;

          ${props.theme.interfaceDirection === "rtl"
            ? `left: -30px;`
            : `right: -30px;`}

          @media ${mobile} {
            ${props.theme.interfaceDirection === "rtl"
              ? `left: 10px;`
              : `right: 10px;`}
            top: -27px;
          }
        `
      : css`
          top: 18px;
          ${props.theme.interfaceDirection === "rtl"
            ? `right: -27px;`
            : `left: -27px;`}
          @media ${mobile} {
            top: -27px;
            ${props.theme.interfaceDirection === "rtl"
              ? css`
                  right: auto;
                  left: 10px;
                `
              : css`
                  left: auto;
                  right: 10px;
                `}
          }
        `}

  .close-button, .close-button:hover {
    cursor: pointer;
    path {
      stroke: ${(props) => props.theme.modalDialog.closeButton.fillColor};
    }
  }
`;

StyledCloseButtonWrapper.defaultProps = { theme: Base };

const CloseButton = ({
  currentDisplayType,

  onClick,
}: ModalDialogCloseButtonProps) => {
  return (
    <StyledCloseButtonWrapper
      onClick={onClick}
      currentDisplayType={currentDisplayType}
      className="modal-close"
    >
      <IconButton
        size={17}
        className="close-button"
        iconName={CrossIconReactSvgUrl}
      />
    </StyledCloseButtonWrapper>
  );
};

export { CloseButton };
