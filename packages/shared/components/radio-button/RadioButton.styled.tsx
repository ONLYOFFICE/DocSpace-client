import React from "react";
import styled, { css } from "styled-components";

import RadioButtonReactSvg from "PUBLIC_DIR/images/radiobutton.react.svg";
import RadioButtonCheckedReactSvg from "PUBLIC_DIR/images/radiobutton.checked.react.svg";

import { NoUserSelect, commonIconsStyles } from "../../utils";
import { Base } from "../../themes";

export const RadioButtonIcon = styled(RadioButtonReactSvg)`
  ${commonIconsStyles}
`;
export const RadioButtonCheckedIcon = styled(RadioButtonCheckedReactSvg)`
  ${commonIconsStyles}
`;

const ClearLabel = ({
  spacing,
  isDisabled,
  orientation,
  ...props
}: {
  spacing?: string;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => <label {...props} />;

const Label = styled(ClearLabel)`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;

  ${NoUserSelect};

  cursor: ${(props) => !props.isDisabled && "pointer"};

  .radio-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: ${props.theme.radioButton.marginBeforeLabel};
          `
        : css`
            margin-right: ${props.theme.radioButton.marginBeforeLabel};
          `}

    path {
      fill: ${(props) =>
        props.isDisabled
          ? props.theme.radioButton.disableBackground
          : props.theme.radioButton.background};
    }
  }
  .radio-button_text {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.radioButton.textDisableColor
        : props.theme.radioButton.textColor};
  }

  ${(props) =>
    props.isDisabled
      ? css`
          cursor: default;
          path:first-child {
            stroke: ${props.theme.radioButton.disableBorderColor};
          }
          path:nth-child(even) {
            fill: ${props.theme.radioButton.disableFillColor};
          }
        `
      : css`
          cursor: pointer;
          svg {
            path:first-child {
              stroke: ${props.theme.radioButton.borderColor};
            }
            path:nth-child(even) {
              fill: ${props.theme.radioButton.fillColor};
            }
          }

          &:hover {
            svg {
              path:first-child {
                stroke: ${props.theme.radioButton.hoverBorderColor};
              }
            }
          }
        `}

  &:not(:first-child) {
    ${(props) =>
      props.orientation === "horizontal" &&
      (props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: ${props.spacing};
          `
        : css`
            margin-left: ${props.spacing};
          `)};
  }

  &:not(:last-child) {
    ${(props) =>
      props.orientation === "vertical" &&
      css`
        margin-bottom: ${props.spacing};
      `};
  }
`;
Label.defaultProps = { theme: Base };
const Input = styled.input`
  position: absolute;
  z-index: -1;
  opacity: 0.0001;
`;

export { Label, Input };
