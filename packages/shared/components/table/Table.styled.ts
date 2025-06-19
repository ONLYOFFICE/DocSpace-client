// (c) Copyright Ascensio System SIA 2009-2025
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

import styled, { css } from "styled-components";
import { injectDefaultTheme } from "../../utils";

const reactWindowContainerStyles = css`
  height: 100%;
  display: block;
`;

const reactWindowBodyStyles = css`
  display: block;
  height: 100%;
`;

const StyledTableContainer = styled.div.attrs(injectDefaultTheme)<{
  useReactWindow?: boolean;
}>`
  user-select: none;
  display: grid;
  width: 100%;
  max-width: 100%;
  margin-top: -25px;

  .table-column {
    user-select: none;
    position: relative;
    min-width: 10%;
  }

  .indexing-separator {
    background-color: ${(props) =>
      props.theme.tableContainer.indexingSeparator};
  }

  .table-container_group-menu,
  .table-container_header {
    z-index: 200;
    padding: 0 20px;

    border-bottom: 1px solid;
    border-image-slice: 1;
    border-image-source: ${(props) =>
      props.theme.tableContainer.header.borderImageSource};
    border-top: 0;

    border-inline-start: 0;
  }

  @media (hover: hover) {
    &:has(#table-container_caption-header:not(.hotkeys-lengthen-header)):has(
        .table-list-item:first-child .table-container_row:hover
      ) {
      .table-container_header,
      .table-container_group-menu {
        border-image-source: ${(props) =>
          props.theme.tableContainer.header.borderHoverImageSource};
      }
    }
  }

  .hotkeys-lengthen-header {
    border-bottom: ${(props) =>
      props.theme.tableContainer.header.hotkeyBorderBottom};
    border-image-source: none;
  }

  .content-container {
    overflow: hidden;
  }

  .children-wrap {
    display: flex;
    flex-direction: column;
  }

  .table-cell {
    height: 47px;
    border-bottom: ${(props) => props.theme.tableContainer.tableCellBorder};
  }

  .table-container_group-menu {
    .table-container_group-menu-checkbox {
      width: 22px;
    }
  }

  ${({ useReactWindow }) => useReactWindow && reactWindowContainerStyles}
`;

export { StyledTableContainer };
