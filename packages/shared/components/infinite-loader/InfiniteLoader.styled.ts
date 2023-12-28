import { List } from "react-virtualized";
import styled, { css } from "styled-components";

import { Base } from "../../themes";
import { mobile, tablet } from "../../utils";
import { TViewAs } from "../../types";

const StyledScroll = styled.div`
  overflow: scroll;

  /* Chrome, Edge и Safari */

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.scrollbar.bgColor};
    border-radius: 3px;

    :hover {
      background-color: ${({ theme }) => theme.scrollbar.hoverBgColor};
    }
  }

  /* Firefox */

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.scrollbar.pressBgColor};
`;

StyledScroll.defaultProps = { theme: Base };

const rowStyles = css<{ width: number }>`
  margin-inline-start: -20px;
  width: ${({ width }) => `${width + 40}px !important`};

  .ReactVirtualized__Grid__innerScrollContainer {
    max-width: ${({ width }) => `${width + 40}px !important`};
  }

  @media ${tablet} {
    width: ${({ width }) => `${width + 36}px !important`};

    .ReactVirtualized__Grid__innerScrollContainer {
      max-width: ${({ width }) => `${width + 36}px !important`};
    }
  }

  @media ${mobile} {
    margin-inline-start: -16px;
    width: ${({ width }) => `${width + 32}px !important`};

    .ReactVirtualized__Grid__innerScrollContainer {
      max-width: ${({ width }) => `${width + 32}px !important`};
    }
  }

  // !important styles override inline styles from react-virtualized
  .row-list-item,
  .row-loader {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" &&
      `left: unset !important;
        right: 0 !important;`}
    padding-inline-start: 16px;
    width: calc(100% - 32px) !important;

    @media ${tablet} {
      padding-inline-start: 20px;
      width: calc(100% - 36px) !important;
    }

    @media ${mobile} {
      padding-inline-start: 16px;
      width: calc(100% - 32px) !important;
    }
  }
`;

const tableStyles = css<{ width: number }>`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-right: -20px;`
      : `margin-left: -20px;`}
  width: ${({ width }) => `${width + 40}px !important`};

  .ReactVirtualized__Grid__innerScrollContainer {
    max-width: ${({ width }) => `${width + 40}px !important`};
  }
  .table-container_body-loader {
    width: calc(100% - 48px) !important;
  }

  // !important styles override inline styles from react-virtualized
  .table-list-item,
  .table-container_body-loader {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `
        padding-right: 20px;
        left: unset !important;
        right: 0 !important;
        `
        : `padding-left: 20px;`}
  }
`;

const tileStyles = css`
  .files_header {
    padding-top: 11px;
  }
`;

const StyledList = styled(List)<{ viewAs: TViewAs; width: number }>`
  outline: none;
  overflow: hidden !important;
  // Override inline direction from react-virtualized
  direction: inherit !important;

  ${({ viewAs }) =>
    viewAs === "row"
      ? rowStyles
      : viewAs === "table"
        ? tableStyles
        : tileStyles}
`;

StyledScroll.defaultProps = {
  theme: Base,
};

export { StyledScroll, StyledList };
