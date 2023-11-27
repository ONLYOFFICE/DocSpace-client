import styled, { css } from "styled-components";

import Base from "../../themes/base";
import NoUserSelect from "../../utils/commonStyles";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/triangle.dow... Remove this comment to see the full error message
import TriangleDownIcon from "PUBLIC_DIR/images/triangle.down.react.svg";
import commonIconsStyles from "../../utils/common-icons-style";

import Loader from "../../loader";

const StyledTriangleDownIcon = styled(TriangleDownIcon)`
  ${commonIconsStyles}
`;

const modernViewButton = css`
  height: ${(props) => props.theme.comboBox.button.heightModernView};
  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    props.isOpen || props.isLoading
      ? props.theme.comboBox.button.focusBackgroundModernView
      : props.theme.comboBox.button.backgroundModernView};

  border: none !important;
`;

const hoverModernViewButton = css`
  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemePro... Remove this comment to see the full error message
    props.isOpen || props.isLoading
      ? props.theme.comboBox.button.focusBackgroundModernView
      : props.theme.comboBox.button.hoverBackgroundModernView} !important;
`;

const StyledComboButton = styled.div`
  display: flex;
  align-items: center;
  // @ts-expect-error TS(2339): Property 'type' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  gap: ${(props) => props.type && "4px"};
  justify-content: center;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  height: ${(props) =>
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    props.noBorder
      ? props.theme.comboBox.button.height
      : props.theme.comboBox.button.heightWithBorder};
  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'scaled' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    (props.scaled && "100%") ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "base" && props.theme.comboBox.width.base) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "middle" && props.theme.comboBox.width.middle) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "big" && props.theme.comboBox.width.big) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "huge" && props.theme.comboBox.width.huge) ||
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    (props.size === "content" && "fit-content")};

  ${NoUserSelect};

  padding-left: ${(props) =>
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    props.size === "content"
      ? props.theme.comboBox.button.paddingLeft
      : props.theme.comboBox.button.selectPaddingLeft};

  padding-right: ${(props) =>
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    props.size === "content"
      // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
      ? props.displayArrow
        ? props.theme.comboBox.button.paddingRight
        : props.theme.comboBox.button.paddingRightNoArrow
      // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
      : props.displayArrow
      ? props.theme.comboBox.button.selectPaddingRight
      : props.theme.comboBox.button.selectPaddingRightNoArrow};
  ${(props) => {
    return (
      props.theme.interfaceDirection === "rtl" &&
      css`
        padding-right: ${(props) =>
          // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemeProps... Remove this comment to see the full error message
          props.size === "content"
            ? props.theme.comboBox.button.paddingLeft
            : props.theme.comboBox.button.selectPaddingLeft};

        padding-left: ${(props) =>
          // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
          props.size === "content"
            // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
            ? props.displayArrow
              ? props.theme.comboBox.button.paddingRight
              : props.theme.comboBox.button.paddingRightNoArrow
            // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
            : props.displayArrow
            ? props.theme.comboBox.button.selectPaddingRight
            : props.theme.comboBox.button.selectPaddingRightNoArrow};
      `
    );
  }}

  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    !props.noBorder
      ? props.theme.comboBox.button.background
      : props.theme.comboBox.button.backgroundWithBorder};

  color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled
      ? props.theme.comboBox.button.disabledColor
      : props.theme.comboBox.button.color};

  box-sizing: border-box;

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    !props.noBorder &&
    // @ts-expect-error TS(2339): Property 'type' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    !props.type &&
    `
    border:  ${props.theme.comboBox.button.border};
    border-radius: ${props.theme.comboBox.button.borderRadius};
  `}

  border-color: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    props.isOpen && props.theme.comboBox.button.openBorderColor};

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled &&
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    !props.noBorder &&
    `
    border-color: ${props.theme.comboBox.button.disabledBorderColor};
    background: ${props.theme.comboBox.button.disabledBackground};
  `}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
    !props.noBorder &&
    `
    height: 32px;
  `}

  // @ts-expect-error TS(2339): Property 'modernView' does not exist on type 'Them... Remove this comment to see the full error message
  ${(props) => props.modernView && modernViewButton}


  // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Omit<D... Remove this comment to see the full error message
  ${({ fillIcon }) =>
    fillIcon &&
    css`
      .optionalBlock {
        svg {
          path {
            fill: ${(props) =>
              // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemePro... Remove this comment to see the full error message
              props.isOpen
                ? props.theme.iconButton.hoverColor
                : props.theme.iconButton.color};
          }
        }
      }
    `};

  :hover {
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      props.isOpen
        ? props.theme.comboBox.button.hoverBorderColorOpen
        : props.theme.comboBox.button.hoverBorderColor};
    cursor: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled ||
      // @ts-expect-error TS(2339): Property 'containOptions' does not exist on type '... Remove this comment to see the full error message
      (!props.containOptions && !props.withAdvancedOptions) ||
      // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Theme... Remove this comment to see the full error message
      props.isLoading
        ? "default"
        : "pointer"};

    ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled &&
      `
      border-color: ${props.theme.comboBox.button.hoverDisabledBorderColor};
    `}

    // @ts-expect-error TS(2339): Property 'modernView' does not exist on type 'Them... Remove this comment to see the full error message
    ${(props) => props.modernView && hoverModernViewButton}

      // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Omit<D... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Theme... Remove this comment to see the full error message
    visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
    margin-right: ${(props) =>
      // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
      props.noBorder
        ? props.theme.comboBox.label.marginRight
        : props.theme.comboBox.label.marginRightWithBorder};
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 0;
        margin-left: ${(props) =>
          // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'ThemeP... Remove this comment to see the full error message
          props.noBorder
            ? props.theme.comboBox.label.marginRight
            : props.theme.comboBox.label.marginRightWithBorder};
      `}
    color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? props.theme.comboBox.label.disabledColor
        // @ts-expect-error TS(2339): Property 'isSelected' does not exist on type 'Them... Remove this comment to see the full error message
        : props.isSelected
        ? props.theme.comboBox.label.selectedColor
        : props.theme.comboBox.label.color};

    max-width: ${(props) =>
      // @ts-expect-error TS(2339): Property 'scaled' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      props.scaled ? "100%" : props.theme.comboBox.label.maxWidth};

    ${(props) =>
      // @ts-expect-error TS(2339): Property 'noBorder' does not exist on type 'Themed... Remove this comment to see the full error message
      props.noBorder &&
      `
      line-height: ${props.theme.comboBox.label.lineHeightWithoutBorder};
    `}
  }

  :focus {
    outline: none;
    border-color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      props.isOpen
        ? props.theme.comboBox.button.hoverBorderColorOpen
        : props.theme.comboBox.button.hoverBorderColor};

    // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Omit<D... Remove this comment to see the full error message
    ${({ fillIcon }) =>
      fillIcon &&
      css`
        .optionalBlock {
          svg {
            path {
              fill: ${(props) =>
                // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemePro... Remove this comment to see the full error message
                props.isOpen
                  ? props.theme.iconButton.hoverColor
                  : props.theme.iconButton.color};
            }
          }
        }
      `}
  }
`;
StyledComboButton.defaultProps = { theme: Base };

const StyledOptionalItem = styled.div`
  margin-right: ${(props) => props.theme.comboBox.childrenButton.marginRight};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: 0;
      margin-left: ${(props) =>
        props.theme.comboBox.childrenButton.marginRight};
    `}
  // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Theme... Remove this comment to see the full error message
  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};

  // @ts-expect-error TS(2339): Property 'fillIcon' does not exist on type 'Omit<D... Remove this comment to see the full error message
  ${({ fillIcon }) =>
    fillIcon &&
    css`
      path {
        fill: ${(props) =>
          // @ts-expect-error TS(2339): Property 'defaultOption' does not exist on type 'T... Remove this comment to see the full error message
          props.defaultOption
            // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
            ? props.isDisabled
              ? props.theme.comboBox.childrenButton.defaultDisabledColor
              : props.theme.comboBox.childrenButton.defaultColor
            // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
            : props.isDisabled
            ? props.theme.comboBox.childrenButton.disabledColor
            : props.theme.comboBox.childrenButton.color};
      }
    `}
`;
StyledOptionalItem.defaultProps = { theme: Base };

const StyledIcon = styled.div`
  margin-right: ${(props) => props.theme.comboBox.childrenButton.marginRight};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: 0;
      margin-left: ${(props) =>
        props.theme.comboBox.childrenButton.marginRight};
    `}
  width: ${(props) => props.theme.comboBox.childrenButton.width};
  height: ${(props) => props.theme.comboBox.childrenButton.height};

  // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Theme... Remove this comment to see the full error message
  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      transform: scaleX(-1);
    `}
  .combo-button_selected-icon {
    path {
      fill: ${(props) =>
        // @ts-expect-error TS(2339): Property 'defaultOption' does not exist on type 'T... Remove this comment to see the full error message
        props.defaultOption
          // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
          ? props.isDisabled
            ? props.theme.comboBox.childrenButton.defaultDisabledColor
            : props.theme.comboBox.childrenButton.defaultColor
          // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
          : props.isDisabled
          ? props.theme.comboBox.childrenButton.disabledColor
          // @ts-expect-error TS(2339): Property 'isSelected' does not exist on type 'Them... Remove this comment to see the full error message
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

const StyledArrowIcon = styled.div`
  display: flex;
  align-self: center;

  // @ts-expect-error TS(2339): Property 'isLoading' does not exist on type 'Theme... Remove this comment to see the full error message
  visibility: ${(props) => (props.isLoading ? "hidden" : "visible")};

  .combo-buttons_expander-icon {
    path {
      fill: ${(props) => props.theme.comboBox.label.selectedColor};
    }
  }

  width: ${(props) =>
    // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
    props.displayArrow ? props.theme.comboBox.arrow.width : "0px"};
  flex: ${(props) =>
    // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
    props.displayArrow ? props.theme.comboBox.arrow.flex : "0px"};
  margin-right: ${(props) =>
    // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
    props.displayArrow ? props.theme.comboBox.arrow.marginRight : "0px"};
  margin-left: ${(props) =>
    // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
    props.displayArrow ? props.theme.comboBox.arrow.marginLeft : "0px"};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: ${(props) =>
        // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
        props.displayArrow ? props.theme.comboBox.arrow.marginLeft : "0px"};
      margin-left: ${(props) =>
        // @ts-expect-error TS(2339): Property 'displayArrow' does not exist on type 'Th... Remove this comment to see the full error message
        props.displayArrow ? props.theme.comboBox.arrow.marginRight : "0px"};
    `}

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    props.isOpen &&
    `
    transform: scale(1, -1);
  `}
`;

StyledArrowIcon.defaultProps = { theme: Base };

const StyledLoader = styled(Loader)`
  position: absolute;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: ${(props) =>
            // @ts-expect-error TS(2339): Property 'displaySize' does not exist on type 'The... Remove this comment to see the full error message
            props.displaySize === "content" ? "-16px" : "-8px"};
        `
      : css`
          margin-left: ${(props) =>
            // @ts-expect-error TS(2339): Property 'displaySize' does not exist on type 'The... Remove this comment to see the full error message
            props.displaySize === "content" ? "-16px" : "-8px"};
        `}
  margin-top: 2px;
`;

export {
  StyledArrowIcon,
  StyledIcon,
  StyledOptionalItem,
  StyledComboButton,
  StyledTriangleDownIcon,
  StyledLoader,
};
