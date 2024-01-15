import styled, { css } from "styled-components";
import { ReactSVG } from "react-svg";

import { Text } from "../text";

import { Base } from "../../themes";

const StyledTag = styled.div<{
  tagMaxWidth?: string;
  isLast?: boolean;
  isDisabled?: boolean;
  isNewTag?: boolean;
  isDefault?: boolean;
  isClickable?: boolean;
}>`
  width: fit-content;

  max-width: ${(props) => (props.tagMaxWidth ? props.tagMaxWidth : "100%")};

  display: flex;
  align-items: center;

  box-sizing: border-box;

  padding: 2px 10px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: ${props.isLast ? "0" : "4px"};
        `
      : css`
          margin-right: ${props.isLast ? "0" : "4px"};
        `}

  background: ${(props) =>
    props.isDisabled
      ? props.theme.tag.disabledBackground
      : props.isNewTag
        ? props.theme.tag.newTagBackground
        : props.theme.tag.background};

  border-radius: 6px;

  .tag-text {
    color: ${(props) =>
      props.isDefault
        ? props.theme.tag.defaultTagColor
        : props.theme.tag.color};
    line-height: 20px;
    pointer-events: none;
  }

  .tag-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 12px;
          `
        : css`
            margin-left: 12px;
          `}

    cursor: pointer;
  }

  .third-party-tag {
    width: 16px;
    height: 16px;
  }

  ${(props) =>
    props.isClickable &&
    !props.isDisabled &&
    css`
      cursor: pointer;
      &:hover {
        background: ${props.theme.tag.hoverBackground};
      }
    `}
`;

StyledTag.defaultProps = { theme: Base };

const StyledDropdownIcon = styled(ReactSVG)`
  display: flex;
  align-items: center;

  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      transform: scaleX(-1);
    `}

  pointer-events: none;

  svg {
    path:first-child {
      stroke: ${(props) => props.theme.tag.color};
    }
    path:last-child {
      fill: ${(props) => props.theme.tag.color};
    }
  }
`;

const StyledDropdownText = styled(Text)`
  line-height: 30px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 8px !important;
        `
      : css`
          margin-left: 8px !important;
        `}

  display: block;

  pointer-events: none;
`;

export { StyledTag, StyledDropdownText, StyledDropdownIcon };
