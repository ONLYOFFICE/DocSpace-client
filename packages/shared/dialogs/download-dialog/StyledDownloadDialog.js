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

const StyledBodyContent = styled.div`
  margin-top: 24px;
  margin-bottom: 16px;
  line-height: 20px;
  min-height: 40px;

  .download-dialog-convert-message {
    margin-top: 16px;
  }
`;

const StyledDownloadContent = styled.div`
  .download-dialog_content-wrapper {
    ${({ isOpen }) =>
      isOpen &&
      css`
        background: ${(props) => props.theme.downloadDialog.background};
        margin: 0 -16px;
        padding: 0 16px;
      `}

    .download-dialog-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .download-dialog-icon {
      width: 12px;
      height: 12px;
      transform: ${({ isOpen }) =>
        isOpen ? "rotate(270deg)" : "rotate(90deg)"};
      svg {
        path {
          fill: ${(props) => props.theme.downloadDialog.iconFill};
        }
      }
    }
  }

  .download-dialog_hidden-items {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    border-bottom: ${(props) =>
      `1px solid ${props.theme.modalDialog.headerBorderColor}`};
    margin-bottom: 16px;
  }

  .download-dialog-row {
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: 48px;

    .remove-icon {
      padding-right: 8px;
    }
    .enter-password {
      text-decoration: underline dashed;
      cursor: pointer;
    }

    .download-dialog-main-content {
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      width: 100%;

      svg {
        margin: 0 !important;
      }
      .download-dialog-checkbox {
        padding: 8px;
      }
      .download-dialog-icon-contatiner {
        padding: 0 8px;
        max-height: 32px;
        max-width: 32px;
      }
      .download-dialog-title {
        min-width: 0;
        width: 100%;
      }
    }
    .password-content {
      cursor: pointer;
      .password-title {
        margin-left: 8px;
      }
    }

    .download-dialog-actions {
      .download-dialog-link {
        width: max-content;
        a {
          padding-inline-end: 0;
          text-underline-offset: 1px;
        }

        .expander {
          svg {
            padding-bottom: 2px;
          }
        }
      }
      .download-dialog-other-text {
        text-align: end;
        color: ${(props) => props.theme.downloadDialog.textColor};
      }
    }
  }

  .password-input {
    display: flex;
  }
  #conversion-button {
    margin-inline-start: 8px;
    width: 100%;
    max-width: 78px;
  }
`;

const StyledPasswordContent = styled.div`
  margin-top: 16px;

  .password-row-wrapper {
    .password-info-text {
      display: flex;
      height: 36px;
      align-items: center;
    }
    .warning-color {
      p {
        color: ${(props) => props.theme.downloadDialog.warningColor};
      }
    }
  }
`;

const StyledSinglePasswordFile = styled.div`
  .single-password_content {
    display: flex;
    justify-content: space-between;
    background: ${(props) => props.theme.downloadDialog.background};
    height: 48px;
    align-items: center;
    border-radius: 6px;
    padding: 0 16px;
    margin: 16px 0;

    .single-password_row {
      display: flex;
      align-items: center;
    }
  }
`;
export {
  StyledDownloadContent,
  StyledBodyContent,
  StyledPasswordContent,
  StyledSinglePasswordFile,
};
