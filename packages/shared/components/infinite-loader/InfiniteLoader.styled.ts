// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { List } from "react-virtualized";
import styled, { css } from "styled-components";

import { Base } from "../../themes";
import { desktop, mobile, tablet } from "../../utils";
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

const paddingCss = css`
  @media ${desktop} {
    margin-inline-start: 1px;
    padding-inline-end: 0;
  }

  @media ${tablet} {
    margin-inline-start: -1px;
  }
`;

const StyledItem = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
  gap: 14px 16px;
  width: 100%;

  @media ${tablet} {
    gap: 14px;
  }

  ${paddingCss};
`;

export { StyledScroll, StyledList, StyledItem };
