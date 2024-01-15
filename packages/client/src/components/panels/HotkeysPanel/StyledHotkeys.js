import styled, { css } from "styled-components";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Base } from "@docspace/shared/themes";
import { tablet, mobile } from "@docspace/shared/utils";

const StyledHotkeysPanel = styled.div`
  .hotkeys-panel {
    .scroll-body {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-left: 0 !important;
            `
          : css`
              padding-right: 0 !important;
            `}
    }
  }

  .hotkeys_header {
    padding: 0 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .hotkeys_heading {
      font-weight: 700;
      font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    }
  }

  .hotkeys_sub-header {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 16px;
          `
        : css`
            padding-left: 16px;
          `}
    margin: 20px 0 6px 0;
  }

  .hotkeys_row {
    width: calc(100% - 32px);
    min-height: 41px;
    margin: 0 16px;
    box-sizing: border-box;
    border-bottom: none;

    .row_content {
      margin: 12px 0 12px 0px;

      @media ${tablet} {
        height: unset;
      }
    }
  }

  .hotkey-key-description {
    max-width: 320px;
    width: 100%;

    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;

    @media ${mobile} {
      max-width: 140px;
      word-wrap: break-word;
      white-space: normal;
    }
  }

  .hotkeys-key {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 0 0 0 auto;
          `
        : css`
            margin: 0 auto 0 0;
          `}

    @media ${mobile} {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 0 auto 0 0;
            `
          : css`
              margin: 0 0 0 auto;
            `}
      width: fit-content;
    }
  }
`;

StyledHotkeysPanel.defaultProps = { theme: Base };

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100vh - 87px) !important;
`;

export { StyledHotkeysPanel, StyledScrollbar };
