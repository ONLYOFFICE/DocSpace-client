import styled, { css } from "styled-components";

import Base from "../themes/base";

const StyledContainer = styled.div`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .toggle-container {
    display: inline-block;
  }

  .span-toggle-content {
    cursor: pointer;
    user-select: none;

    display: grid;
    grid-template-columns: ${(props) =>
      // @ts-expect-error TS(2339): Property 'enableToggle' does not exist on type 'Th... Remove this comment to see the full error message
      props.enableToggle ? "16px 1fr" : "1fr"};
    grid-column-gap: 9px;
    max-width: 660px;

    svg {
      ${(props) =>
        // @ts-expect-error TS(2339): Property 'enableToggle' does not exist on type 'Th... Remove this comment to see the full error message
        !props.enableToggle &&
        css`
          display: none;
        `}

      path {
        fill: ${(props) => props.theme.toggleContent.iconColor};
      }
    }
  }

  .arrow-toggle-content {
    margin: auto 0;
    transform: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      props.isOpen && props.theme.toggleContent.transform};
  }

  .heading-toggle-content {
    display: inline-block;
    height: ${(props) => props.theme.toggleContent.headingHeight};
    line-height: ${(props) => props.theme.toggleContent.headingHeight};
    box-sizing: border-box;
    font-style: normal;

    ${(props) =>
      // @ts-expect-error TS(2339): Property 'enableToggle' does not exist on type 'Th... Remove this comment to see the full error message
      props.enableToggle
        ? css`
            &:hover {
              border-bottom: ${(props) =>
                props.theme.toggleContent.hoverBorderBottom};
            }
          `
        : css`
            cursor: default;
          `}
  }
`;
StyledContainer.defaultProps = { theme: Base };

const StyledContent = styled.div`
  color: ${(props) => props.theme.toggleContent.childrenContent.color};
  padding-top: ${(props) =>
    props.theme.toggleContent.childrenContent.paddingTop};
  // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'ThemedSt... Remove this comment to see the full error message
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

StyledContent.defaultProps = { theme: Base };

export { StyledContent, StyledContainer };
