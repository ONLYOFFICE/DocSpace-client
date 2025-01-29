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
import { isMobile, isMobileOnly } from "react-device-detect";

import CursorPalmReactSvgUrl from "PUBLIC_DIR/images/cursor.palm.react.svg?url";

import { mobile, tablet, injectDefaultTheme, desktop } from "../utils";
import { globalColors } from "../themes";
import { Row, RowContent } from "../components/rows";

const marginStyles = css`
  margin-inline: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline: -16px;
    padding-inline: 16px;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const StyledWrapper = styled.div<{
  checked: boolean;
  isActive: boolean;
  isIndexEditingMode: boolean;
  isFirstElem: boolean;
  isIndexUpdated: boolean;
  isDragging: boolean;
  showHotkeyBorder: boolean;
  isHighlight: boolean;
}>`
  .files-item {
    border-inline: none;
    margin-inline-start: 0;
  }
  height: 59px;
  box-sizing: border-box;

  border-bottom: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  border-top: ${(props) =>
    `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
  margin-top: -1px;

  ${(props) =>
    (props.checked || props.isActive) &&
    !props.isIndexEditingMode &&
    checkedStyle};
  ${(props) =>
    (props.checked || props.isActive) &&
    props.isFirstElem &&
    css`
      border-top-color: ${props.theme.filesSection.tableView.row
        .borderColor} !important;
    `};

  ${(props) =>
    props.isIndexUpdated &&
    css`
      background: ${props.isIndexEditingMode
        ? `${props.theme.filesSection.tableView.row.indexUpdate} !important`
        : `${props.theme.filesSection.tableView.row.backgroundActive} !important`};

      &:hover {
        background: ${({ theme }) =>
          `${theme.filesSection.tableView.row.indexActive} !important`};
      }

      ${marginStyles}
    `}

  ${(props) =>
    !isMobile &&
    !props.isDragging &&
    !props.isIndexEditingMode &&
    css`
      :hover {
        cursor: pointer;
        ${checkedStyle}
      }
    `};

  ${(props) =>
    !isMobile &&
    props.isIndexEditingMode &&
    css`
      :hover {
        cursor: pointer;
        background: ${({ theme }) =>
          theme.filesSection.tableView.row.indexActive};
        ${marginStyles}
      }
    `};

  ${(props) =>
    props.showHotkeyBorder &&
    css`
      border-color: ${globalColors.lightSecondMain} !important;
      z-index: 1;
      position: relative;

      margin-inline: -24px;
      padding-inline: 24px;
    `}

  ${(props) =>
    props.isHighlight &&
    css`
      ${marginStyles}
      animation: Highlight 2s 1;

      @keyframes Highlight {
        0% {
          background: ${({ theme }) => theme.filesSection.animationColor};
        }

        100% {
          background: none;
        }
      }
    `}

    ${(props) =>
    props.isFirstElem &&
    css`
      height: 57px;

      margin-top: 1px;
      border-top: 1px solid transparent;

      .styled-checkbox-container {
        padding-bottom: 5px;
      }

      .row_content {
        padding-bottom: 5px;
      }
    `}
`;

const StyledSimpleFilesRow = styled(Row).attrs(injectDefaultTheme)<{
  isThirdPartyFolder?: boolean;
  checked?: boolean;
  isActive?: boolean;
  isIndexEditingMode?: boolean;
  isFirstElem?: boolean;
  isIndexUpdated?: boolean;
  isDragging?: boolean;
  showHotkeyBorder?: boolean;
  isHighlight?: boolean;
  canDrag?: boolean;
  isEdit?: boolean;
  sectionWidth: number;
  folderCategory?: unknown;
  withAccess?: boolean;
}>`
  height: 56px;

  position: unset;
  cursor: ${(props) =>
    !props.isThirdPartyFolder &&
    (props.checked || props.isActive) &&
    props.canDrag &&
    `url(${CursorPalmReactSvgUrl}) 8 0, auto`};
  ${(props) =>
    props.inProgress &&
    css`
      pointer-events: none;
      /* cursor: wait; */
    `}

  margin-top: 0px;

  ${(props) =>
    (!props.contextOptions || props.isEdit) &&
    `
    & > div:last-child {
        width: 0px;
        overflow: hidden;
      }
  `}

  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .styled-element {
    height: 32px;
    margin-inline-end: 12px;
  }

  .row_content {
    ${(props) =>
      props.sectionWidth > 500 && `max-width: fit-content;`}//min-width: auto
  }

  .badges {
    display: flex;
    align-items: center;

    .badge-version {
      &:hover {
        cursor: pointer;
      }
    }
  }

  .tablet-row-copy-link {
    display: none;
  }

  @media ${tablet} {
    .tablet-row-copy-link {
      display: block;
    }

    .row-copy-link {
      display: none;
    }
  }

  @media ${mobile} {
    .tablet-row-copy-link {
      display: none;
    }

    .row-copy-link {
      display: block;

      ${isMobileOnly &&
      css`
        :hover {
          svg path {
            fill: ${({ theme }) => theme.iconButton.color};
          }
        }
      `}
    }
  }

  .favorite {
    cursor: pointer;
    margin-top: 1px;
  }

  .row_context-menu-wrapper {
    width: min-content;
    justify-content: space-between;
    flex: 0 1 auto;
  }

  .row_content {
    max-width: none;
    min-width: 0;
  }

  .badges {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .temp-badges {
    margin-top: 0px;
  }

  .lock-file {
    cursor: ${(props) => (props.withAccess ? "pointer" : "default")};
    svg {
      height: 16px;
    }
  }

  .expandButton {
    margin-inline-start: ${(props) =>
      !props.folderCategory ? "17px" : "24px"};
    padding-top: 0px;
  }
  .expandButton > div:first-child {
    ${(props) =>
      !!props.folderCategory && `padding-inline-start: 0 !important;`}
  }

  .badges {
    flex-direction: row-reverse;
    gap: 24px;
  }

  .file__badges,
  .room__badges,
  .folder__badges {
    margin-top: 0px;

    > div {
      margin-top: 0px;
      margin-inline: 0;
    }
  }

  @media ${mobile} {
    .lock-file {
      svg {
        height: 12px;
      }
    }

    .badges {
      gap: 8px;
    }

    /* .badges__quickButtons:not(:empty) {
      margin-inline-start: 8px;
    } */
    .room__badges:empty,
    .file__badges:empty,
    .folder__badges:empty,
    .badges__quickButtons:empty {
      display: none;
    }

    .badges,
    .folder__badges,
    .room__badges,
    .file__badges {
      margin-top: 0px;
      align-items: center;
      height: 100%;
    }

    .room__badges,
    .folder__badges {
      > div {
        margin-top: 0px;
      }
    }
  }
`;

const SimpleFilesRowContent = styled(RowContent).attrs(injectDefaultTheme)`
  .row-main-container-wrapper {
    width: 100%;
    max-width: min-content;
    min-width: inherit;
    margin-inline-end: 0;

    @media ${desktop} {
      margin-top: 0px;
    }
  }

  .row_update-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .new-items {
    min-width: 12px;
    width: max-content;
    margin: 0 -2px -2px;
  }

  .badge-version {
    width: max-content;
    margin-block: -2px;
    margin-inline: -2px 6px;
  }

  .bagde_alert {
    margin-inline-end: 8px;
  }

  .badge-new-version {
    width: max-content;
  }

  .row-content-link {
    padding-block: 12px 0;
    padding-inline: 0 12px;
    margin-top: ${(props) =>
      props.theme.interfaceDirection === "rtl" ? "-14px" : "-12px"};
  }

  .item-file-exst {
    color: ${(props) => props.theme.filesSection.tableView.fileExstColor};
  }

  @media ${tablet} {
    .row-main-container-wrapper {
      display: flex;
      justify-content: space-between;
      max-width: inherit;
    }

    .badges {
      flex-direction: row-reverse;
    }

    .tablet-badge {
      margin-top: 5px;
    }

    .tablet-edit,
    .can-convert {
      margin-top: 6px;
      margin-inline-end: 24px;
    }

    .badge-version {
      margin-inline-end: 22px;
    }

    .new-items {
      min-width: 16px;
      margin-block: 5px 0;
      margin-inline: 0 24px;
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
    }

    .additional-badges {
      margin-top: 0;
    }

    .tablet-edit,
    .new-items,
    .tablet-badge {
      margin: 0;
    }

    .can-convert {
      margin: 0 1px;
    }

    .row-content-link {
      padding: 12px 0px 0px;
    }
  }
`;

export { StyledWrapper, StyledSimpleFilesRow, SimpleFilesRowContent };
