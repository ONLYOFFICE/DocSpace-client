import styled, { css } from "styled-components";

import TriangleDownIcon from "PUBLIC_DIR/images/triangle.down.react.svg";

import { Base, TColorScheme, TTheme } from "../../themes";
import { mobile, NoUserSelect, commonIconsStyles } from "../../utils";

import { Loader } from "../loader";

import { ComboBoxSize } from "./Combobox.enums";
import { TCombobox } from "./Combobox.types";

const StyledComboBox = styled.div<{
  scaled?: boolean;
  size?: ComboBoxSize;
  withoutPadding?: boolean;
  isOpen?: boolean;
  noBorder?: boolean;
  advancedOptions?: React.ReactNode;
  disableMobileView?: boolean;
}>`
  width: ${(props) =>
    (props.scaled && "100%") ||
    (props.size === ComboBoxSize.base && props.theme.comboBox.width.base) ||
    (props.size === ComboBoxSize.middle && props.theme.comboBox.width.middle) ||
    (props.size === ComboBoxSize.big && props.theme.comboBox.width.big) ||
    (props.size === ComboBoxSize.huge && props.theme.comboBox.width.huge) ||
    (props.size === ComboBoxSize.content && "fit-content")};

  position: relative;
  outline: 0;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  padding: ${(props) => (props.withoutPadding ? "0" : "4px 0")};

  ${(props) =>
    props.isOpen &&
    props.noBorder &&
    css`
      background: ${props.theme.comboBox.background};
      border-radius: 3px;
    `}

  .dropdown-container {
    padding: ${(props) =>
      props.advancedOptions && props.theme.comboBox.padding};

    ${(props) =>
      !props.disableMobileView &&
      css`
        @media ${mobile} {
          position: fixed;
          top: unset !important;
          right: 0;
          left: 0;
          bottom: 0 !important;
          width: 100%;
          width: -moz-available;
          width: -webkit-fill-available;
          width: fill-available;
          border: none;
          border-radius: 6px 6px 0px 0px;
        }
      `}
  }

  -webkit-user-select: none;

  .backdrop-active {
    z-index: 210;
  }
`;

StyledComboBox.defaultProps = {
  theme: Base,
};

export { StyledComboBox };

const StyledTriangleDownIcon = styled(TriangleDownIcon)`
  ${commonIconsStyles}
`;

const modernViewButton = css<{ isOpen?: boolean; isLoading?: boolean }>`
  height: ${(props) => props.theme.comboBox.button.heightModernView};
  background: ${(props) =>
    props.isOpen || props.isLoading
      ? props.theme.comboBox.button.focusBackgroundModernView
      : props.theme.comboBox.button.backgroundModernView};

  border: none !important;
`;

const hoverModernViewButton = css<{
  isOpen?: boolean;
  isLoading?: boolean;
}>`
  background: ${(props) =>
    props.isOpen || props.isLoading
      ? props.theme.comboBox.button.focusBackgroundModernView
      : props.theme.comboBox.button.hoverBackgroundModernView} !important;
`;

const StyledComboButton = styled.div<{
  type?: TCombobox;
  noBorder?: boolean;
  scaled?: boolean;
  size?: ComboBoxSize;
  displayArrow?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  modernView?: boolean;
  fillIcon?: boolean;
  containOptions?: number;
  withAdvancedOptions?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
}>`
  display: flex;
  align-items: center;

  gap: ${(props) => props.type && "4px"};
  justify-content: center;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  height: ${(props) =>
    props.noBorder
      ? props.theme.comboBox.button.height
      : props.theme.comboBox.button.heightWithBorder};
  width: ${(props) =>
    (props.scaled && "100%") ||
    (props.size === ComboBoxSize.base && props.theme.comboBox.width.base) ||
    (props.size === ComboBoxSize.middle && props.theme.comboBox.width.middle) ||
    (props.size === ComboBoxSize.big && props.theme.comboBox.width.big) ||
    (props.size === ComboBoxSize.huge && props.theme.comboBox.width.huge) ||
    (props.size === ComboBoxSize.content && "fit-content")};

  ${NoUserSelect};

  padding-left: ${(props) =>
    props.size === "content"
      ? props.theme.comboBox.button.paddingLeft
      : props.theme.comboBox.button.selectPaddingLeft};

  padding-right: ${(props) =>
    props.size === "content"
      ? props.displayArrow
        ? props.theme.comboBox.button.paddingRight
        : props.theme.comboBox.button.paddingRightNoArrow
      : props.displayArrow
        ? props.theme.comboBox.button.selectPaddingRight
        : props.theme.comboBox.button.selectPaddingRightNoArrow};
  ${(props) => {
    return (
      props.theme.interfaceDirection === "rtl" &&
      css`
        padding-right: ${props.size === "content"
          ? props.theme.comboBox.button.paddingLeft
          : props.theme.comboBox.button.selectPaddingLeft};

        padding-left: ${props.size === "content"
          ? props.displayArrow
            ? props.theme.comboBox.button.paddingRight
            : props.theme.comboBox.button.paddingRightNoArrow
          : props.displayArrow
            ? props.theme.comboBox.button.selectPaddingRight
            : props.theme.comboBox.button.selectPaddingRightNoArrow};
      `
    );
  }}

  background: ${(props) =>
    !props.noBorder
      ? props.theme.comboBox.button.background
      : props.theme.comboBox.button.backgroundWithBorder};

  color: ${(props) =>
    props.isDisabled
      ? props.theme.comboBox.button.disabledColor
      : props.theme.comboBox.button.color};

  box-sizing: border-box;

  ${(props) =>
    !props.noBorder &&
    !props.type &&
    `
    border:  ${props.theme.comboBox.button.border};
    border-radius: ${props.theme.comboBox.button.borderRadius};
  `}

  border-color: ${(props) =>
    props.isOpen && props.theme.comboBox.button.openBorderColor};

  ${(props) =>
    props.isDisabled &&
    !props.noBorder &&
    `
    border-color: ${props.theme.comboBox.button.disabledBorderColor};
    background: ${props.theme.comboBox.button.disabledBackground};
  `}

  ${(props) =>
    !props.noBorder &&
    `
    height: 32px;
  `}

  
  ${(props) => props.modernView && modernViewButton}


  
  ${(props) =>
    props.fillIcon &&
    css`
      .optionalBlock {
        svg {
          path {
            fill: ${props.isOpen
              ? props.theme.iconButton.hoverColor
              : props.theme.iconButton.color};
          }
        }
      }
    `};

  :hover {
    border-color: ${(props) =>
      props.isOpen
        ? props.theme.comboBox.button.hoverBorderColorOpen
        : props.theme.comboBox.button.hoverBorderColor};
    cursor: ${(props) =>
      props.isDisabled ||
      (!props.containOptions && !props.withAdvancedOptions) ||
      props.isLoading
        ? "default"
        : "pointer"};

    ${(props) =>
      props.isDisabled &&
      `
      border-color: ${props.theme.comboBox.button.hoverDisabledBorderColor};
    `}

    ${(props) => props.modernView && hoverModernViewButton}

      
      ${({ fillIcon }) =>
      fillIcon &&
      css`
        .optionalBlock {
          svg {
            path {
              fill: ${(props) => props.theme.iconButton.hoverColor};
            }
          }
        }
      `}
  }
  .combo-button-label {
    visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
    margin-right: ${(props) =>
      props.noBorder
        ? props.theme.comboBox.label.marginRight
        : props.theme.comboBox.label.marginRightWithBorder};
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 0;
        margin-left: ${props.noBorder
          ? props.theme.comboBox.label.marginRight
          : props.theme.comboBox.label.marginRightWithBorder};
      `}
    color: ${(props) =>
      props.isDisabled
        ? props.theme.comboBox.label.disabledColor
        : props.isSelected
          ? props.theme.comboBox.label.selectedColor
          : props.theme.comboBox.label.color};

    max-width: ${(props) =>
      props.scaled ? "100%" : props.theme.comboBox.label.maxWidth};

    ${(props) =>
      props.noBorder &&
      `
      line-height: ${props.theme.comboBox.label.lineHeightWithoutBorder};
    `}
  }

  :focus {
    outline: none;
    border-color: ${(props) =>
      props.isOpen
        ? props.theme.comboBox.button.hoverBorderColorOpen
        : props.theme.comboBox.button.hoverBorderColor};

    ${(props) =>
      props.fillIcon &&
      css`
        .optionalBlock {
          svg {
            path {
              fill: ${props.isOpen
                ? props.theme.iconButton.hoverColor
                : props.theme.iconButton.color};
            }
          }
        }
      `}
  }
`;
StyledComboButton.defaultProps = { theme: Base };

const StyledOptionalItem = styled.div<{
  isLoading?: boolean;
  fillIcon?: boolean;
  defaultOption?: boolean;
  isDisabled?: boolean;
}>`
  margin-right: ${(props) => props.theme.comboBox.childrenButton.marginRight};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: 0;
      margin-left: ${props.theme.comboBox.childrenButton.marginRight};
    `}

  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};

  ${(props) =>
    props.fillIcon &&
    css`
      path {
        fill: ${props.defaultOption
          ? props.isDisabled
            ? props.theme.comboBox.childrenButton.defaultDisabledColor
            : props.theme.comboBox.childrenButton.defaultColor
          : props.isDisabled
            ? props.theme.comboBox.childrenButton.disabledColor
            : props.theme.comboBox.childrenButton.color};
      }
    `}
`;
StyledOptionalItem.defaultProps = { theme: Base };

const StyledIcon = styled.div<{
  isLoading?: boolean;
  defaultOption?: boolean;
  isDisabled?: boolean;
  isSelected?: boolean;
}>`
  margin-right: ${(props) => props.theme.comboBox.childrenButton.marginRight};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: 0;
      margin-left: ${props.theme.comboBox.childrenButton.marginRight};
    `}
  width: ${(props) => props.theme.comboBox.childrenButton.width};
  height: ${(props) => props.theme.comboBox.childrenButton.height};

  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      transform: scaleX(-1);
    `}
  .combo-button_selected-icon {
    path {
      fill: ${(props) =>
        props.defaultOption
          ? props.isDisabled
            ? props.theme.comboBox.childrenButton.defaultDisabledColor
            : props.theme.comboBox.childrenButton.defaultColor
          : props.isDisabled
            ? props.theme.comboBox.childrenButton.disabledColor
            : props.isSelected
              ? props.theme.comboBox.childrenButton.selectedColor
              : props.theme.comboBox.childrenButton.color};
    }
  }
  svg {
    &:not(:root) {
      width: 100%;
      height: 100%;
    }
  }
`;
StyledIcon.defaultProps = { theme: Base };

const StyledArrowIcon = styled.div<{
  isLoading?: boolean;
  displayArrow?: boolean;
  isOpen?: boolean;
}>`
  display: flex;
  align-self: center;

  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};

  .combo-buttons_expander-icon {
    path {
      fill: ${(props) => props.theme.comboBox.label.selectedColor};
    }
  }

  width: ${(props) =>
    props.displayArrow ? props.theme.comboBox.arrow.width : "0px"};
  flex: ${(props) =>
    props.displayArrow ? props.theme.comboBox.arrow.flex : "0px"};
  margin-right: ${(props) =>
    props.displayArrow ? props.theme.comboBox.arrow.marginRight : "0px"};
  margin-left: ${(props) =>
    props.displayArrow ? props.theme.comboBox.arrow.marginLeft : "0px"};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: ${props.displayArrow
        ? props.theme.comboBox.arrow.marginLeft
        : "0px"};
      margin-left: ${props.displayArrow
        ? props.theme.comboBox.arrow.marginRight
        : "0px"};
    `}

  ${(props) =>
    props.isOpen &&
    `
    transform: scale(1, -1);
  `}
`;

StyledArrowIcon.defaultProps = { theme: Base };

const StyledLoader = styled(Loader)<{ displaySize?: ComboBoxSize }>`
  position: absolute;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: ${props.displaySize === "content" ? "-16px" : "-8px"};
        `
      : css`
          margin-left: ${props.displaySize === "content" ? "-16px" : "-8px"};
        `}
  margin-top: 2px;
`;

const getDefaultStyles = ({
  $currentColorScheme,
  isOpen,
  theme,
}: {
  $currentColorScheme?: TColorScheme;
  theme: TTheme;
  isOpen?: boolean;
}) =>
  $currentColorScheme &&
  theme.isBase &&
  css`
    border-color: ${isOpen && $currentColorScheme?.main.accent};

    :focus {
      border-color: ${isOpen && $currentColorScheme?.main.accent};
    }
  `;

const StyledThemeComboButton = styled(StyledComboButton)(getDefaultStyles);

export {
  StyledArrowIcon,
  StyledIcon,
  StyledOptionalItem,
  StyledComboButton,
  StyledTriangleDownIcon,
  StyledLoader,
  StyledThemeComboButton,
};
