import styled, { css } from "styled-components";

import Base from "../themes/base";
import { tablet } from "../utils/device";

const itemTruncate = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const fontStyle = css`
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
`;

const disabledAndHeaderStyle = css`
  color: ${(props) => props.theme.dropDownItem.disableColor};

  &:hover {
    cursor: default;
    background-color: ${(props) =>
      props.theme.dropDownItem.hoverDisabledBackgroundColor};
  }
`;

const WrapperBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin-inline-start: auto;
`;

const WrapperToggle = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: auto;
  width: 36px;

  & label {
    position: static;
  }
`;

const StyledDropdownItem = styled.div`
  display: ${(props) => (props.textOverflow ? "block" : "flex")};
  width: ${(props) => props.theme.dropDownItem.width};
  max-width: ${(props) => props.theme.dropDownItem.maxWidth};
  ${(props) =>
    props.minWidth &&
    css`
      min-width: ${props.minWidth};
    `};
  border: ${(props) => props.theme.dropDownItem.border};
  cursor: pointer;
  margin: ${(props) => props.theme.dropDownItem.margin};
  padding: ${(props) =>
    props.isModern ? "0 8px" : props.theme.dropDownItem.padding};
  line-height: ${(props) => props.theme.dropDownItem.lineHeight};
  box-sizing: border-box;
  background: none;
  text-decoration: none;
  user-select: none;
  outline: 0 !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .drop-down-item_icon {
    svg {
      path[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      path[stroke] {
        stroke: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      circle[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }

      rect[fill] {
        fill: ${(props) =>
          props.disabled
            ? props.theme.dropDownItem.icon.disableColor
            : props.theme.dropDownItem.icon.color};
      }
    }
  }

  ${fontStyle}

  font-weight: ${(props) => props.theme.dropDownItem.fontWeight};
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(props.theme.dropDownItem.fontSize)};
  color: ${(props) => props.theme.dropDownItem.color};
  text-transform: none;

  ${itemTruncate}

  &:hover {
    ${(props) =>
      !props.noHover &&
      !props.isHeader &&
      css`
        background-color: ${(props) =>
          props.theme.dropDownItem.hoverBackgroundColor};
        text-align: left;
        ${(props) =>
          props.theme.interfaceDirection === "rtl" &&
          css`
            text-align: right;
          `}
      `}
  }

  &:active {
    ${({ isHeader, theme }) =>
      !isHeader &&
      css`
        background-color: ${theme.dropDownItem.hoverBackgroundColor};
      `}
  }

  ${(props) =>
    props.isSeparator &&
    css`
      padding: ${props.theme.dropDownItem.separator.padding};
      border-bottom: ${props.theme.dropDownItem.separator.borderBottom};
      cursor: default;
      margin: ${props.theme.dropDownItem.separator.margin};
      line-height: ${props.theme.dropDownItem.separator.lineHeight};
      height: ${props.theme.dropDownItem.separator.height};
      width: ${props.theme.dropDownItem.separator.width};

      &:hover {
        cursor: default;
      }
    `}

  .back-arrow {
    cursor: pointer;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  ${({ isHeader, theme }) =>
    isHeader &&
    css`
      align-items: center;
      height: 48px;
      padding: 13px 16px 18.2px 16px;
      margin: 0 0 6px 0;
      border-bottom: ${theme.dropDownItem.separator.borderBottom};
      font-size: ${(props) => props.theme.getCorrectFontSize("15px")};
      font-weight: 600;
      line-height: 16px !important;
      cursor: default;
      &:hover {
        background-color: none !important;
      }
    `}

  @media ${tablet} {
    line-height: ${(props) => props.theme.dropDownItem.tabletLineHeight};
    padding: ${(props) => props.theme.dropDownItem.tabletPadding};
  }

  ${(props) =>
    props.isActiveDescendant &&
    !props.disabled &&
    css`
      background-color: ${(props) =>
        props.theme.dropDownItem.hoverBackgroundColor};
    `}

  ${(props) => props.disabled && !props.isSelected && disabledAndHeaderStyle}

  ${(props) =>
    ((props.disabled && props.isSelected) || props.isActive) &&
    css`
      background-color: ${(props) =>
        props.theme.dropDownItem.selectedBackgroundColor};
    `}

  .submenu-arrow {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `margin-right: auto;
           transform: scaleX(-1);
        `
        : `margin-left: auto;`}
    ${(props) =>
      props.isActive &&
      css`
        transform: rotate(90deg);
        height: auto;
      `}
    width:12px;
    height: 12px;
    margin-inline-end: 0;
    align-self: center;
    line-height: normal;

    .drop-down-item_icon {
      height: 12px;
    }
  }

  max-width: 100%;
`;
StyledDropdownItem.defaultProps = { theme: Base };

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  width: ${(props) => props.theme.dropDownItem.icon.width};
  margin-right: ${(props) => props.theme.dropDownItem.icon.marginRight};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      margin-right: 0;
      margin-left: ${(props) => props.theme.dropDownItem.icon.marginRight};
    `}

  height: 20px;

  div {
    height: 16px;
  }
  svg {
    &:not(:root) {
      width: 100%;
      height: 100%;
    }
  }
  img {
    width: 100%;
    max-width: 16px;
    height: 100%;
    max-height: 16px;
    margin-top: 12px;
  }
`;
IconWrapper.defaultProps = { theme: Base };

export { StyledDropdownItem, IconWrapper, WrapperToggle, WrapperBadge };
