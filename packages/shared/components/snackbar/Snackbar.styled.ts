import styled, { css } from "styled-components";

import { Box } from "../box";
import { tablet } from "../../utils";

const StyledIframe = styled.iframe<{ sectionWidth: number }>`
  border: none;
  height: 60px;
  width: 100%;

  @media ${tablet} {
    min-width: ${(props) => `${props.sectionWidth + 40}px`};
  }
`;

const StyledSnackBar = styled(Box)<{
  opacity?: number;
  backgroundColor: string;
  backgroundImg?: string;
  textalign?: string;
}>`
  transition: all 500ms ease;
  transition-property: top, right, bottom, left, opacity;
  font-family:
    Open Sans,
    sans-serif,
    Arial;
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  min-height: 14px;
  position: relative;
  display: flex;
  align-items: flex-start;
  color: white;
  line-height: 16px;
  padding: 12px 20px;
  margin: 0;
  opacity: ${(props) => props.opacity || 0};
  width: 100%;
  background-color: ${(props) => props.backgroundColor};
  background-image: url(${(props) => props.backgroundImg || ""});

  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: ${(props) => props.textalign};

    .header-body {
      width: 100%;
      height: fit-content;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      justify-content: start;

      .text-header {
        font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
        line-height: 16px;
        font-weight: 600;

        margin: 0;
      }
    }

    .text-body {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: ${(props) => props.textalign};

      .text {
        font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
        line-height: 16px;
        font-weight: 400;
      }
    }
  }

  .action {
    background: inherit;
    display: inline-block;
    border: none;
    font-size: inherit;
    color: "#333";
    margin: 0px 4px 4px 24px;

    padding: 0;

    min-width: min-content;
    cursor: pointer;
    margin-left: 12px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-right: 12px;
        margin-left: 4px;
      `}
    text-decoration: underline;
  }

  .button {
    background: inherit;
    border: none;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    color: "#000";
    cursor: pointer;
    line-height: 14px;

    text-decoration: underline;
  }
`;

const StyledAction = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  background: inherit;
  display: inline-block;
  border: none;
  font-size: inherit;
  color: "#333";
  cursor: pointer;
  text-decoration: underline;
  @media ${tablet} {
    right: 14px;
  }
`;

export { StyledAction, StyledSnackBar, StyledIframe };
