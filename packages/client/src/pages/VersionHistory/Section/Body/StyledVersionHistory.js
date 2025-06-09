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
import { Row } from "@docspace/shared/components/rows";
import { injectDefaultTheme, tablet } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";

const StyledBody = styled.div`
  height: 100%;
  width: calc(100% + 16px);

  .version-list {
    height: 100%;
    width: 100%;
  }

  .loader-history-rows {
    padding-top: 12px;
    padding-inline-end: 16px;
  }
`;

const StyledVersionList = styled.div.attrs(injectDefaultTheme)`
  visibility: ${(props) => (props.showRows ? "visible" : "hidden")};

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
              fill: ${({ theme }) =>
                theme.filesVersionHistory.versionList.fill};
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
          color:${({ theme }) => theme.filesVersionHistory.versionList.color};
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
              fill: ${({ theme }) =>
                theme.filesVersionHistory.versionList.fill};
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
              stroke: ${({ theme }) =>
                theme.filesVersionHistory.versionList.stroke};
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
          `fill: ${({ theme }) => theme.filesVersionHistory.versionList.fill}`}
      }
    }
  }
`;

const StyledVersionRow = styled(Row).attrs(injectDefaultTheme)`
  .row_content {
    position: relative;
    padding-top: 13px;
    padding-bottom: 12px;
    height: auto;
    ${(props) => !props.isTabletView && "padding-inline-end: 16px"};
  }

  .version_badge {
    cursor: ${(props) => (props.canEdit ? "pointer" : "default")};

    margin-inline: 0 16px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}

      ${(props) =>
        props.versionDeleteRow &&
        css`
          path {
            fill: ${({ theme }) =>
              theme.filesVersionHistory.versionDisabled.fillDisabled};
            stroke: ${({ theme }) =>
              theme.filesVersionHistory.versionDisabled.fillDisabled};
          }
        `}
    }

    .version_badge-text {
      ${(props) =>
        props.versionDeleteRow &&
        !props.theme.isBase &&
        css`
          color: ${globalColors.darkGrayDark} !important;
        `}
    }

    @media ${tablet} {
      margin-top: 0px;
    }
  }

  .version-link-file {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ${(props) =>
      props.versionDeleteRow &&
      css`
        color: ${({ theme }) => theme.filesVersionHistory.versionLink.color};
      `}
  }
  .version-link-file:first-child {
    margin-bottom: 4px;
  }

  .icon-link {
    width: 10px;
    height: 10px;

    margin-inline: 9px 32px;

    @media ${tablet} {
      margin-top: -1px;
    }
  }

  .version_edit-comment {
    display: block;
  }

  .textarea-wrapper {
    margin-block: 6px 1px;
    margin-inline: -7px 31px;
    width: 100%;
  }

  .version_content-length {
    display: block;
    margin-inline-start: auto;

    @media ${tablet} {
      display: none;
    }
  }

  .version_link {
    display: ${(props) =>
      props.showEditPanel ? "none" : props.canEdit ? "block" : "none"};
    /* text-decoration: underline dashed; */
    white-space: break-spaces;

    margin-inline-start: -7px;
    margin-top: 4px;

    cursor: ${(props) => (props.isEditing ? "default" : "pointer")};

    @media ${tablet} {
      display: none;
      text-decoration: none;
    }
  }

  .version_text {
    margin-top: 5px;

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
    box-sizing: border-box;
    display: flex;
    margin-inline-start: 72px;
    white-space: normal !important;

    .version_text {
      color: ${(props) => props.theme.filesVersionHistory.commentColor};
    }
  }

  .row_context-menu-wrapper {
    display: block;
    position: absolute;

    inset-inline-end: 13px !important;
    top: 6px;

    .expandButton {
      ${(props) =>
        (props.isSavingComment || props.versionDeleteProcess) &&
        `
        touch-action: none;
        pointer-events: none;
        `}
      svg {
        path {
          ${(props) =>
            props.isSavingComment &&
            `
              fill: ${({ theme }) =>
                theme.filesVersionHistory.versionList.fill};
            `};

          ${(props) =>
            props.versionDeleteRow &&
            css`
              fill: ${({ theme }) =>
                theme.filesVersionHistory.versionDisabled.fillDisabled};
            `}
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
          color: ${({ theme }) => theme.filesVersionHistory.versionList.color};
          touch-action: none;
          pointer-events: none;
        `}
    }

    .version-link-file,
    .version_text,
    .versioned {
      ${(props) =>
        props.versionDeleteProcess &&
        `
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
    box-sizing: border-box;
    display: inline-block;
    margin-inline-end: 8px;
    width: 87px;
  }
  .version_edit-comment-button-second {
    box-sizing: border-box;
    display: inline-block;
    width: 87px;
  }
  .version_modal-dialog .modal-dialog-aside-header {
    border-bottom: unset;
  }
  .version_modal-dialog .modal-dialog-aside-body {
    margin-top: -24px;
  }

  .row-header {
    box-sizing: border-box;
    display: flex;
    max-width: 350px;

    .version-link-box {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin: -2px 0 0 0;
      width: 100%;
    }
  }
`;

export { StyledBody, StyledVersionRow, StyledVersionList };
