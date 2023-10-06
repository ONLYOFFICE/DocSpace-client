import React from "react";
import styled, { css } from "styled-components";
import { tablet, mobile } from "@docspace/components/utils/device";

import { Base } from "@docspace/components/themes";

const tabletProps = css`
  .section-body_header {
    position: sticky;
    top: 0;
    background: ${(props) => props.theme.section.header.background};
    z-index: 201;
  }
  .section-body_filter {
    display: block;
    margin: 4px 0 30px;
  }
`;

const StyledSectionContainer = styled.section`
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

  .layout-progress-bar_wrapper {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              left: 24px;
            }
          `
        : css`
            right: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              right: 24px;
            }
          `}
  }

  .layout-progress-bar {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              left: 24px;
            }
          `
        : css`
            right: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              right: 24px;
            }
          `}

    bottom: 24px;
  }

  .layout-progress-bar_close-icon {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: ${(props) => (props.isInfoPanelVisible ? "480px" : "80px")};

            @media ${tablet} {
              left: 80px;
            }
          `
        : css`
            right: ${(props) => (props.isInfoPanelVisible ? "480px" : "80px")};

            @right ${tablet} {
              left: 80px;
            }
          `}

    bottom: 36px;
  }
  .layout-progress-second-bar {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              left: 24px;
            }
          `
        : css`
            right: ${(props) => (props.isInfoPanelVisible ? "424px" : "24px")};

            @media ${tablet} {
              right: 24px;
            }
          `}

    bottom: 96px;
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
