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
import Base from "@docspace/shared/themes/base";
import { TableRow } from "@docspace/shared/components/table";
import DragAndDrop from "@docspace/shared/components/drag-and-drop/DragAndDrop";
import CursorPalmSvgUrl from "PUBLIC_DIR/images/cursor.palm.react.svg?url";

const hotkeyBorderStyle = css`
  border-image-slice: 1;
  border-image-source: linear-gradient(to left, #2da7db 24px, #2da7db 24px);
`;

const rowCheckboxDraggingStyle = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: -20px;
          padding-right: 20px;
        `
      : css`
          margin-left: -20px;
          padding-left: 20px;
        `}

  border-bottom: 1px solid;
  border-image-slice: 1;
  border-image-source: ${(props) => `linear-gradient(to right, 
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
`;

const contextMenuWrapperDraggingStyle = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: -20px;
          padding-left: 20px;
        `
      : css`
          margin-right: -20px;
          padding-right: 20px;
        `}

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
    border-left: 0; //for Safari
    border-right: 0; //for Safari
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
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  margin-right: -24px;
                  padding-right: 24px;
                `
              : css`
                  margin-left: -24px;
                  padding-left: 24px;
                `}
        }
        .table-container_row-context-menu-wrapper {
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  margin-left: -20px;
                  padding-left: 20px;
                `
              : css`
                  margin-right: -20px;
                  padding-right: 20px;
                `}
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
        border-color: #2da7db !important;
      `}
  }

  .table-container_element-wrapper,
  .table-container_quick-buttons-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
  }

  .table-container_element-wrapper,
  .table-container_row-loader {
    min-width: 40px;
    border-bottom: unset;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -20px;
            padding-right: 20px;
          `
        : css`
            margin-left: -20px;
            padding-left: 20px;
          `}
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
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }
  }

  .table-container_row-checkbox {
    width: 12px;
  }

  .table-container_file-name-cell {
    ${(props) =>
      props.showHotkeyBorder &&
      css`
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: -24px;
                padding-right: 24px;
              `
            : css`
                margin-left: -24px;
                padding-left: 24px;
              `}

        ${hotkeyBorderStyle}
      `};
    ${(props) => props.dragging && rowCheckboxDraggingStyle};
  }

  .table-container_row-context-menu-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
    justify-content:flex-end;

    ${(props) => props.dragging && contextMenuWrapperDraggingStyle};
    ${(props) =>
      props.showHotkeyBorder &&
      css`
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: -20px;
                padding-left: 20px;
              `
            : css`
                margin-right: -20px;
                padding-right: 20px;
              `}

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
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: -24px;
                padding-right: 24px;
              `
            : css`
                margin-left: -24px;
                padding-left: 24px;
              `}
      }
      .table-container_row-context-menu-wrapper {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: -20px;
                padding-left: 20px;
              `
            : css`
                margin-right: -20px;
                padding-right: 20px;
              `}
      }
    `}
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }

  .badges:last-child {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0px;
          `
        : css`
            margin-left: 0px;
          `}
  }

  .badge {
    cursor: pointer;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }

  .new-items {
    min-width: 12px;
    width: max-content;
    margin: 0 -2px -2px -2px;
  }

  .row-copy-link,
  .tablet-row-copy-link {
    display: none;
  }

  .badge-version {
    width: max-content;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 0 -2px -2px 5px;
          `
        : css`
            margin: 0 5px -2px -2px;
          `}

    > div {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding: 0 4px 0 3.3px;
            `
          : css`
              padding: 0 3.3px 0 4px;
            `}
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 0 -2px -2px 5px;
          `
        : css`
            margin: 0 5px -2px -2px;
          `}
  }

  .badge-new-version {
    width: max-content;
  }
`;

const StyledQuickButtonsContainer = styled.div`
  width: 100%;

  .badges {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .badge {
    padding: 12px 7px;
  }

  .badge:last-child {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 3px;
          `
        : css`
            margin-right: 3px;
          `}
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
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`;

StyledQuickButtonsContainer.defaultProps = { theme: Base };

export {
  StyledBadgesContainer,
  StyledQuickButtonsContainer,
  StyledTableRow,
  StyledDragAndDrop,
};
