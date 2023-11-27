import styled, { css } from "styled-components";
import { ReactSVG } from "react-svg";

import Text from "../text";
import Base from "../themes/base";

const StyledTag = styled.div`
  width: fit-content;

  // @ts-expect-error TS(2339): Property 'tagMaxWidth' does not exist on type 'The... Remove this comment to see the full error message
  max-width: ${(props) => (props.tagMaxWidth ? props.tagMaxWidth : "100%")};

  display: flex;
  align-items: center;

  box-sizing: border-box;

  padding: 2px 10px;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          // @ts-expect-error TS(2339): Property 'isLast' does not exist on type 'ThemedSt... Remove this comment to see the full error message
          margin-left: ${props.isLast ? "0" : "4px"};
        `
      : css`
          // @ts-expect-error TS(2339): Property 'isLast' does not exist on type 'ThemedSt... Remove this comment to see the full error message
          margin-right: ${props.isLast ? "0" : "4px"};
        `}

  background: ${(props) =>
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    props.isDisabled
      ? props.theme.tag.disabledBackground
      // @ts-expect-error TS(2339): Property 'isNewTag' does not exist on type 'Themed... Remove this comment to see the full error message
      : props.isNewTag
      ? props.theme.tag.newTagBackground
      : props.theme.tag.background};

  border-radius: 6px;

  .tag-text {
    color: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isDefault' does not exist on type 'Theme... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2339): Property 'isClickable' does not exist on type 'The... Remove this comment to see the full error message
    props.isClickable &&
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    !props.isDisabled &&
    css`
      cursor: pointer;
      &:hover {
        background: ${(props) => props.theme.tag.hoverBackground};
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
