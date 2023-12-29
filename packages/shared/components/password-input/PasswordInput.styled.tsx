import React from "react";
import styled, { css } from "styled-components";
import { tablet, mobile } from "../../utils";
import { Base } from "../../themes";

import { Text } from "../text";

import { TPasswordValidation } from "./PasswordInput.types";

const SimpleInput = ({
  onValidateInput,
  $isFullWidth,
  ...props
}: {
  onValidateInput?: (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => void;
  $isFullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => <div {...props} />;

const StyledInput = styled(SimpleInput)<{
  $isFullWidth?: boolean;
  isDisabled?: boolean;
}>`
  display: ${(props) => (props.$isFullWidth ? "block" : "flex")};
  align-items: center;
  line-height: ${(props) => props.theme.passwordInput.lineHeight};
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;

  input {
    flex: inherit;
    width: calc(100% - 40px);
    text-align: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "right" : "left"};
    &::-ms-reveal {
      display: none;
    }
  }

  .input-relative {
    svg {
      path {
        fill: ${(props) =>
          props.isDisabled
            ? props.theme.passwordInput.disableColor
            : props.theme.passwordInput.iconColor} !important;
      }
    }

    &:hover {
      svg {
        path {
          fill: ${(props) =>
            props.isDisabled
              ? props.theme.passwordInput.disableColor
              : props.theme.passwordInput.hoverIconColor} !important;
        }
      }
    }
  }

  @media ${tablet} {
    flex-wrap: wrap;
  }

  .input-block-icon {
    height: 42px;
  }

  .append {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 8px;
            left: 16px;
          `
        : css`
            padding-right: 8px;
            right: -16px;
          `}
  }

  .prepend-children {
    padding: 0;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .text-tooltip {
    line-height: ${(props) => props.theme.passwordInput.text.lineHeight};
    margin-top: ${(props) => props.theme.passwordInput.text.marginTop};
  }

  .password-field-wrapper {
    display: flex;
    width: auto;

    @media ${mobile} {
      width: 100%;
    }
  }
`;
StyledInput.defaultProps = { theme: Base };

const PasswordProgress = styled.div<{ inputWidth?: string }>`
  ${(props) =>
    props.inputWidth ? `width: ${props.inputWidth};` : `flex: auto;`}
  .input-relative {
    position: relative;
    svg {
      overflow: hidden;
      vertical-align: middle;
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
PasswordProgress.defaultProps = { theme: Base };

const TooltipStyle = styled.div`
  width: 294px;

  @media ${mobile} {
    width: 320px;
  }

  .__react_component_tooltip {
  }
`;

const StyledTooltipContainer = styled(Text)`
  // margin: 8px 16px 16px 16px;
  color: ${(props) => props.theme.passwordInput.tooltipTextColor};

  .generate-btn-container {
    margin-top: 10px;
  }
`;

StyledTooltipContainer.defaultProps = { theme: Base };

const StyledTooltipItem = styled(Text)<{ valid?: boolean }>`
  //height: 24px;
  color: ${(props) => (props.valid ? "#44bb00" : "#B40404")} !important;
`;

export {
  PasswordProgress,
  StyledInput,
  TooltipStyle,
  StyledTooltipContainer,
  StyledTooltipItem,
};
