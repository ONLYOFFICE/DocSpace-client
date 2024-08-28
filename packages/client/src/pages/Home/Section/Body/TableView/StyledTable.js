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

import styled, { css } from "styled-components";
import { Base, globalColors } from "@docspace/shared/themes";
import { TableRow } from "@docspace/shared/components/table";
import DragAndDrop from "@docspace/shared/components/drag-and-drop/DragAndDrop";
import CursorPalmSvgUrl from "PUBLIC_DIR/images/cursor.palm.react.svg?url";

const hotkeyBorderStyle = css`
  border-image-slice: 1;
  border-image-source: linear-gradient(
    to left,
    ${globalColors.lightSecondMain} 24px,
    ${globalColors.lightSecondMain} 24px
  );
`;

const rowCheckboxDraggingStyle = css`
  margin-inline-start: -20px;
  padding-inline-start: 20px;

  border-bottom: 1px solid;
  border-image-slice: 1;
  border-image-source: ${(props) => `linear-gradient(to right, 
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
`;

const contextMenuWrapperDraggingStyle = css`
  margin-inline-end: -20px;
  padding-inline-end: 20px;

  border-bottom: 1px solid;
  border-image-slice: 1;
  border-image-source: ${(props) => `linear-gradient(to left,
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
`;

const StyledTableRow = styled(TableRow)`
  .table-container_cell:not(.table-container_element-wrapper) {
    border-top: ${(props) =>
      `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    margin-top: -1px;
    border-inline: 0; //for Safari
  }

  .table-container_cell:not(.table-container_element-wrapper) {
    height: auto;
    max-height: 48;
  }

  .table-container_row-context-menu-wrapper {
    height: 49px !important;
    max-height: none !important;
    box-sizing: border-box;

    ${(props) =>
      props.showHotkeyBorder &&
      css`
        position: relative;
      `}
  }

  ${(props) =>
    props.isRoom &&
    css`
      .table-container_cell {
        height: 48px;
        max-height: 48px;
      }
    `}
  ${(props) =>
    !props.isDragging &&
    css`
      :hover {
        .table-container_cell {
          cursor: pointer;
          background: ${(props) =>
            `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
        }
        .table-container_file-name-cell {
          margin-inline-start: -24px;
          padding-inline-start: 24px;
        }
        .table-container_row-context-menu-wrapper {
          margin-inline-end: -20px;
          padding-inline-end: 20px;
        }
      }
    `}
  .table-container_cell {
    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
    cursor: ${(props) =>
      !props.isThirdPartyFolder &&
      (props.checked || props.isActive) &&
      props.canDrag &&
      `url(${CursorPalmSvgUrl}) 8 0, auto !important`};

    ${(props) =>
      props.inProgress &&
      css`
        pointer-events: none;
        /* cursor: wait; */
      `}

    ${(props) =>
      props.showHotkeyBorder &&
      css`
        z-index: 1;
        border-color: ${globalColors.lightSecondMain} !important;
      `}
  }

  .table-container_element-wrapper {
  }

  .table-container_element-wrapper,
  .table-container_row-loader {
    min-width: 40px;
    border-bottom: unset;
    margin-inline-start: -20px;
    padding-inline-start: 20px;
  }

  .table-container_element-container {
    width: 32px;
    height: 32px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .table-container_row-loader {
    svg {
      margin-inline-start: 8px;
    }
  }

  .table-container_row-checkbox {
    width: 12px;
  }

  .table-container_file-name-cell {
    ${(props) =>
      props.showHotkeyBorder &&
      css`
        margin-inline-start: -24px;
        padding-inline-start: 24px;

        ${hotkeyBorderStyle}
      `};
    ${(props) => props.dragging && rowCheckboxDraggingStyle};
  }

  .table-container_row-context-menu-wrapper {
    padding-inline-end: 0;
    justify-content: flex-end;

    ${(props) => props.dragging && contextMenuWrapperDraggingStyle};
    ${(props) =>
      props.showHotkeyBorder &&
      css`
        margin-inline-end: -20px;
        padding-inline-end: 20px;

        ${hotkeyBorderStyle}
      `};
  }

  .edit {
    svg:not(:root) {
      width: 12px;
      height: 12px;
    }
  }

  .item-file-name {
    padding-block: 14px;
    padding-inline: 0 8px;
  }

  ${(props) =>
    props.isHighlight &&
    css`
      .table-container_cell:not(.table-container_element-wrapper) {
        animation: Highlight 2s 1;

        @keyframes Highlight {
          0% {
            background: ${(props) => props.theme.filesSection.animationColor};
          }

          100% {
            background: none;
          }
        }
      }

      .table-container_file-name-cell {
        margin-inline-start: -24px;
        padding-inline-start: 24px;
      }
      .table-container_row-context-menu-wrapper {
        margin-inline-end: -20px;
        padding-inline-end: 20px;
      }
    `}

  .no-extra-space {
    p {
      margin-inline-end: 8px !important;
    }
  }
`;

const StyledDragAndDrop = styled(DragAndDrop)`
  display: contents;
`;

const StyledBadgesContainer = styled.div`
  display: flex;
  align-items: center;

  .badges {
    display: flex;
    align-items: center;
    margin-inline-end: 12px;
  }

  .badges:last-child {
    margin-inline-start: 0;
  }

  .badge {
    cursor: pointer;
    margin-inline-end: 8px;
  }

  .new-items {
    min-width: 12px;
    width: max-content;
    margin: 0 -2px -2px;
  }

  .row-copy-link,
  .tablet-row-copy-link,
  .tablet-row-create-room {
    display: none;
  }

  .badge-version {
    width: max-content;
    margin-block: 0 -2px;
    margin-inline: -2px 5px;

    > div {
      padding-block: 0;
      padding-inline: 4px 3.3px;
      p {
        letter-spacing: 0.5px;
        font-size: 9px;
        font-weight: 800;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }

  .bagde_alert {
    margin-block: 0 -2px;
    margin-inline: -2px 5px;
  }

  .badge-new-version {
    width: max-content;
  }
`;

const StyledQuickButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;

  .badges {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .badge {
    padding: 12px 8px;
  }

  .lock-file {
    svg {
      height: 12px;
    }
  }

  .favorite {
    margin-top: 1px;
  }

  .share-button-icon:hover {
    cursor: pointer;
    path {
      fill: ${(props) =>
        props.theme.filesSection.tableView.row.shareHoverColor};
    }
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  }
`;

StyledQuickButtonsContainer.defaultProps = { theme: Base };

export {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
  StyledTableRow,
  StyledDragAndDrop,
};
