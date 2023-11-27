import React from "react";
import PropTypes from "prop-types";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/icons/17/cro... Remove this comment to see the full error message
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import styled, { css } from "styled-components";
import { mobile } from "../../utils/device";
import IconButton from "../../icon-button";
import Base from "../../themes/base";

const StyledCloseButtonWrapper = styled.div`
  width: 17px;
  height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  position: absolute;

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'currentDisplayType' does not exist on ty... Remove this comment to see the full error message
    props.currentDisplayType === "modal"
      ? css`
          top: 18px;

          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? `left: -30px;`
              : `right: -30px;`}

          @media ${mobile} {
            ${(props) =>
              props.theme.interfaceDirection === "rtl"
                ? `left: 10px;`
                : `right: 10px;`}
            top: -27px;
          }
        `
      : css`
          top: 18px;
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? `right: -27px;`
              : `left: -27px;`}
          @media ${mobile} {
            top: -27px;
            ${(props) =>
              props.theme.interfaceDirection === "rtl"
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
  id,
  currentDisplayType,
  zIndex,
  onClick
}: any) => {
  return (
    <StyledCloseButtonWrapper
      // @ts-expect-error TS(2769): No overload matches this call.
      zIndex={zIndex}
      onClick={onClick}
      currentDisplayType={currentDisplayType}
      className="modal-close"
    >
      <IconButton
        // @ts-expect-error TS(2322): Type '{ size: string; className: string; iconName:... Remove this comment to see the full error message
        size="17px"
        className="close-button"
        iconName={CrossIconReactSvgUrl}
      />
    </StyledCloseButtonWrapper>
  );
};

CloseButton.propTypes = {
  currentDisplayType: PropTypes.oneOf(["modal", "aside"]),
  onClick: PropTypes.func,
};

export default CloseButton;
