import React from "react";
import styled, { css } from "styled-components";
import { tablet, mobile } from "@docspace/shared/utils";

import { Base } from "@docspace/shared/themes";

const tabletProps = css`
  .section-body_header {
    width: 100%;
    position: sticky;
    top: 0;
    background: ${(props) =>
      props.viewAs === "profile" || props.viewAs === "settings"
        ? props.theme.section.header.backgroundColor
        : props.theme.section.header.background};

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0;
          `
        : css`
            padding-right: 0;
          `}
    z-index: 201;
  }
  .section-body_filter {
    display: block;
    margin: 0;
  }
`;

const closeIconSize = "24px";
const sizeBetweenIcons = "8px";

const StyledSectionContainer = styled.section`
  position: relative;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0 20px 0 0;
        `
      : css`
          padding: 0 0 0 20px;
        `}
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  user-select: none;

  width: 100%;
  max-width: 100%;

  @media ${tablet} {
    width: 100%;
    max-width: 100vw !important;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0 16px 0 0;
          `
        : css`
            padding: 0 0 0 16px;
          `}
    ${tabletProps};
  }

  @media ${mobile} {
    width: 100vw !important;
    max-width: 100vw !important;
  }

  .progress-bar_container {
    position: absolute;
    bottom: 0;

    display: grid;
    grid-gap: 24px;
    margin-bottom: 24px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 24px;
            left: 0;
          `
        : css`
            margin-right: 24px;
            right: 0;
          `}

    .layout-progress-bar_wrapper {
      position: static;
      width: fit-content;
      height: fit-content;
      display: flex;
      grid-template-columns: 1fr 1fr;
      flex-direction: row-reverse;
      align-items: center;

      .layout-progress-bar,
      .layout-progress-second-bar {
        ${(props) =>
          props.showTwoProgress &&
          css`
            ${props.theme.interfaceDirection === "rtl"
              ? `margin-right:calc(${closeIconSize} + ${sizeBetweenIcons}); `
              : `margin-left:calc(${closeIconSize} + ${sizeBetweenIcons})`}
          `}
      }

      .layout-progress-bar_close-icon {
        position: static;
        width: ${closeIconSize};
        height: ${closeIconSize};

        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: ${sizeBetweenIcons};
              `
            : css`
                margin-right: ${sizeBetweenIcons};
              `}

        ${(props) =>
          props.showTwoProgress &&
          css`
            ${props.theme.interfaceDirection === "rtl"
              ? `margin-left:-${closeIconSize}`
              : `margin-right:-${closeIconSize}`}
          `}
      }
    }
  }

  ${(props) =>
    !props.isSectionHeaderAvailable &&
    css`
      width: 100vw !important;
      max-width: 100vw !important;
      box-sizing: border-box;
    `}
`;

StyledSectionContainer.defaultProps = { theme: Base };

const SectionContainer = React.forwardRef((props, forwardRef) => {
  return <StyledSectionContainer ref={forwardRef} id="section" {...props} />;
});

export default SectionContainer;
