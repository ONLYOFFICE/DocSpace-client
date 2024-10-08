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
import { Row } from "@docspace/shared/components/row";
import { tablet, getCorrectFourValuesStyle } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

const StyledBody = styled.div`
  height: 100%;
  width: 100%;
  .version-list {
    height: 100%;
    width: 100%;
  }

  .loader-history-rows {
    padding-top: 12px;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-left: 16px;`
        : `padding-right: 16px;`}
  }
`;

const StyledVersionList = styled.div`
  .row_context-menu-wrapper {
    .expandButton {
      ${(props) =>
        props.isRestoreProcess &&
        `
        touch-action: none;
        pointer-events: none;
        `}
      svg {
        path {
          ${(props) =>
            props.isRestoreProcess &&
            `
              fill: ${(props) =>
                props.theme.filesVersionHistory.versionList.fill};
            `};
        }
      }
    }
  }

  .row_content {
    .version_link,
    .version-link-file,
    .version_content-length,
    .version_link-action,
    .row_context-menu-wrapper,
    .version_text {
      ${(props) =>
        props.isRestoreProcess &&
        `
          color:${(props) => props.theme.filesVersionHistory.versionList.color};
          touch-action: none;
          pointer-events: none;
        `};
    }

    .versioned,
    .not-versioned {
      ${(props) =>
        props.isRestoreProcess &&
        `
        touch-action: none;
        pointer-events: none;
        `};
    }

    .versioned {
      svg {
        path {
          ${(props) =>
            props.isRestoreProcess &&
            `
              fill: ${(props) =>
                props.theme.filesVersionHistory.versionList.fill};
            `};
        }
      }
    }

    .not-versioned {
      svg {
        path {
          ${(props) =>
            props.isRestoreProcess &&
            `
              stroke: ${(props) =>
                props.theme.filesVersionHistory.versionList.stroke};
            `};
        }
      }
    }
  }
  .icon-link {
    ${(props) =>
      props.isRestoreProcess &&
      `
        touch-action: none;
        pointer-events: none;
        `}
    svg {
      path {
        ${(props) =>
          props.isRestoreProcess &&
          `fill: ${(props) =>
            props.theme.filesVersionHistory.versionList.fill}`}
      }
    }
  }
`;

StyledVersionList.defaultProps = { theme: Base };

const StyledVersionRow = styled(Row)`
  .row_content {
    position: relative;
    padding-top: 13px;
    padding-bottom: 12px;
    height: auto;
    ${(props) =>
      !props.isTabletView &&
      (props.theme.interfaceDirection === "rtl"
        ? "padding-left:16px"
        : "padding-right:16px")};
  }

  .version_badge {
    cursor: ${(props) => (props.canEdit ? "pointer" : "default")};

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
            margin-right: 0;
          `
        : css`
            margin-right: 16px;
            margin-left: 0;
          `}

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}
    }

    @media ${tablet} {
      margin-top: 0px;
    }
  }

  .version-link-file {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .version-link-file:first-child {
    margin-bottom: 4px;
  }

  .icon-link {
    width: 10px;
    height: 10px;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 9px;
            margin-left: 32px;
          `
        : css`
            margin-left: 9px;
            margin-right: 32px;
          `}
    @media ${tablet} {
      margin-top: -1px;
    }
  }

  .version_edit-comment {
    display: block;
  }

  .textarea-wrapper {
    margin: ${({ theme }) =>
      getCorrectFourValuesStyle("6px 31px 1px -7px", theme.interfaceDirection)};
    width: 100%;
  }

  .version_content-length {
    display: block;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}

    @media ${tablet} {
      display: none;
    }
  }

  .version_link {
    display: ${(props) =>
      props.showEditPanel ? "none" : props.canEdit ? "block" : "none"};
    /* text-decoration: underline dashed; */
    white-space: break-spaces;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: -7px;`
        : `margin-left: -7px;`}
    margin-top: 4px;

    cursor: ${(props) => (props.isEditing ? "default" : "pointer")};

    @media ${tablet} {
      display: none;
      text-decoration: none;
    }
  }

  .version_text {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: -7px;`
        : `margin-left: -7px;`}
    margin-top: 5px;

    @media ${tablet} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: -7px;`
          : `margin-left: -7px;`}
      margin-top: 5px;
    }

    word-break: break-word;
    display: ${(props) => (props.showEditPanel ? "none" : "-webkit-box")};
    display: ${(props) => (props.showEditPanel ? "none" : "-moz-box")};
    display: ${(props) => (props.showEditPanel ? "none" : "-ms-box")};
    text-overflow: ellipsis;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: inherit;
  }

  .version-comment-wrapper {
    white-space: normal !important;
  }

  .row_context-menu-wrapper {
    display: block;
    position: absolute;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `left: 13px !important;`
        : `right: 13px !important;`}
    top: 6px;

    .expandButton {
      ${(props) =>
        props.isSavingComment &&
        `
        touch-action: none;
        pointer-events: none;
        `}
      svg {
        path {
          ${(props) =>
            props.isSavingComment &&
            `
              fill: ${(props) =>
                props.theme.filesVersionHistory.versionList.fill};
            `};
        }
      }
    }
  }

  .row_content {
    display: block;

    .version_link-action {
      ${(props) =>
        props.isSavingComment &&
        `
          color: ${(props) =>
            props.theme.filesVersionHistory.versionList.color};
          touch-action: none;
          pointer-events: none;
        `}
    }
  }

  .modal-dialog-aside-footer {
    width: 90%;

    .version_save-button {
      width: 100%;
    }
  }

  .version_edit-comment-button-primary {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 8px;`
        : `margin-right: 8px;`}
    width: 87px;
  }
  .version_edit-comment-button-second {
    width: 87px;
  }
  .version_modal-dialog .modal-dialog-aside-header {
    border-bottom: unset;
  }
  .version_modal-dialog .modal-dialog-aside-body {
    margin-top: -24px;
  }

  .row-header {
    max-width: 350px;
  }
`;

StyledVersionRow.defaultProps = { theme: Base };

export { StyledBody, StyledVersionRow, StyledVersionList };
