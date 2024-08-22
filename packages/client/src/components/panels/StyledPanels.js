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
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Link } from "@docspace/shared/components/link";
import { desktop, mobile, tablet } from "@docspace/shared/utils";
import { isMobile } from "react-device-detect";
import { Base } from "@docspace/shared/themes";

const PanelStyles = css`
  .panel_combo-box {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 10px;
          `
        : css`
            margin-left: 10px;
          `}

    .optionalBlock {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 4px;
            `
          : css`
              margin-right: 4px;
            `}
      display: flex;
    }

    .combo-button {
      background: transparent;
      height: 36px;
    }

    .combo-button-label {
      margin: 0;
    }
  }

  .footer {
    padding: 16px;
    width: 100%;
    margin: auto;
    left: 0;
    right: 0;
  }
`;

const StyledAsidePanel = styled.div`
  z-index: 310;

  .sharing_panel-header {
    width: 100%;
    font-weight: 700;
    margin: 14px 0;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 10px;
          `
        : css`
            padding-right: 10px;
          `}
  }

  .modal-dialog-aside {
    padding: 0;
    transform: translateX(${(props) => (props.visible ? "0" : "500px")});
    width: 500px;

    @media ${mobile} {
      width: 320px;
      transform: translateX(${(props) => (props.visible ? "0" : "320px")});
    }
  }

  ${PanelStyles}
`;

StyledAsidePanel.defaultProps = { theme: Base };

const StyledVersionHistoryPanel = styled.div`
  ${PanelStyles}

  .version-history-modal-dialog {
    transition: unset;
    transform: translateX(${(props) => (props.visible ? "0" : "480px")});
    width: 480px;
    max-width: 480px;
  }

  .version-history-panel-header {
    height: 53px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0px;
          `
        : css`
            margin-left: 0px;
          `}
    .version-history-panel-heading {
      font-weight: 700;
      margin-bottom: 13px;
      margin-top: 12px;
    }
  }

  .version-history-panel-body {
    padding-bottom: ${(props) => (props.isLoading ? "0px" : null)};
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 16px;
          `
        : css`
            margin-left: 16px;
          `}

    height: calc(100% - 53px);
    box-sizing: border-box;

    .version-comment-wrapper {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 85px;
            `
          : css`
              margin-left: 85px;
            `}
    }

    .version_edit-comment {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 7px;
            `
          : css`
              padding-left: 7px;
            `}
    }
  }
`;

StyledVersionHistoryPanel.defaultProps = { theme: Base };

const StyledEmbeddingPanel = styled.div`
  ${PanelStyles}
`;

const StyledContent = styled.div`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${(props) =>
    props.theme.filesPanels.content.backgroundColor};

  .header_aside-panel-plus-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
  }

  .sharing-access-combo-box-icon {
    height: 16px;
    path {
      fill: ${(props) =>
        props.isDisabled
          ? props.theme.filesPanels.content.disabledFill
          : props.theme.filesPanels.content.fill};
    }

    svg {
      width: 16px;
      min-width: 16px;
      height: 16px;
      min-height: 16px;
    }
  }

  .panel-loader-wrapper {
    margin-top: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 32px;
          `
        : css`
            padding-left: 32px;
          `}
  }
  .panel-loader {
    display: inline;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 10px;
          `
        : css`
            margin-right: 10px;
          `}
  }

  .layout-progress-bar {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 15px;
          `
        : css`
            right: 15px;
          `}
    bottom: 21px;

    @media ${tablet} {
      bottom: 83px;
    }
  }
`;

StyledContent.defaultProps = { theme: Base };

const StyledBody = styled.div`
  &.files-operations-body {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0 16px 0 0;
          `
        : css`
            padding: 0 0 0 16px;
          `}
    box-sizing: border-box;
    width: 100%;
    height: calc(100vh - 125px);

    .styled-element {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -2px;
            `
          : css`
              margin-left: -2px;
            `}
    }
  }

  .change-owner_body {
    padding: 0 16px;
    display: flex;
    flex-direction: column;
  }

  .change-owner_owner-label {
    margin: 16px 0;
  }

  .selector-wrapper {
    position: fixed;
    height: calc(100%);
    width: 100%;

    .column-options {
      width: 100%;

      .header-options {
        .combo-button-label {
          max-width: 435px;

          @media ${mobile} {
            width: 255px;
          }
        }
      }

      .row-option {
        .option_checkbox {
          width: 440px;

          @media ${mobile} {
            width: 265px;
          }
        }
      }

      .body-options {
        width: 100%;
      }
    }
  }

  .sharing-access-combo-box-icon {
    path {
      fill: ${(props) => props.theme.filesPanels.body.fill};
    }
  }
`;

StyledBody.defaultProps = { theme: Base };

const StyledNewFilesBody = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .row_content {
    overflow: visible;
    height: auto;
  }
`;

const StyledFooter = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  padding: 16px;
  width: 100%;
  margin: auto;
  left: 0;
  right: 0;
  background-color: ${(props) =>
    props.theme.filesPanels.footer.backgroundColor};
  border-top: ${(props) => props.theme.filesPanels.footer.borderTop};
  box-sizing: border-box;

  .sharing_panel-checkbox {
    span {
      font-weight: 600;
      font-size: 14px;
    }

    .checkbox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 6px;
            `
          : css`
              margin-right: 6px;
            `}
    }
  }

  .sharing_panel-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
  }

  .new_file_panel-first-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }
  .new_files_panel-button {
    width: 100%;
  }

  @media ${desktop} {
    padding: 16px;
    min-height: 57px;

    .sharing_panel-checkbox {
      span {
        font-size: 13px;
      }
    }

    .sharing_panel-button {
      margin-top: 2px;
    }
  }
`;

StyledFooter.defaultProps = { theme: Base };

const StyledLinkRow = styled.div`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: -16px;
        `
      : css`
          margin-right: -16px;
        `}
  padding: 0 16px;
  box-sizing: border-box;
  background-color: ${(props) =>
    props.theme.filesPanels.linkRow.backgroundColor};

  .sharing-access-combo-box-icon {
    path {
      fill: ${(props) =>
        props.isDisabled
          ? props.theme.filesPanels.linkRow.disabledFill
          : props.theme.filesPanels.linkRow.fill};
    }
  }

  .sharing_panel-link-container {
    display: flex;

    .sharing_panel-link {
      a {
        text-decoration: none;

        ${(props) =>
          props.isDisabled &&
          css`
            :hover {
              text-decoration: none;
            }
          `};
      }
    }
  }

  .link-row {
    ${(props) => !props.withToggle && "border-bottom:none;"}
  }

  .sharing-row__toggle-button {
    margin-top: 1px;
  }

  .row_content {
    display: grid;
    grid-template-columns: 1fr 28px;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .combo-button {
    background: transparent;
  }

  @media ${desktop} {
    .sharing-row__toggle-button {
      margin-top: 0;
    }
  }
`;

StyledLinkRow.defaultProps = { theme: Base };

const StyledModalRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 47px;

  .link-row__container {
    display: flex;
    align-items: center;
    height: 41px;
    width: 100%;

    .link-row {
      border-bottom: none;
    }

    .link-row::after {
      height: 0;
    }
  }

  .panel_combo-box {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0px;
          `
        : css`
            margin-left: 0px;
          `}

    .combo-button {
      height: 30px;
      margin: 0;
      padding: 0;
      border: none;
    }

    .optionalBlock {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 4px;
            `
          : css`
              margin-right: 4px;
            `}

      display: flex;
    }

    .combo-button-label {
      margin: 0;
    }

    .sharing-access-combo-box-icon {
      height: 16px;
      path {
        fill: ${(props) =>
          props.isDisabled
            ? props.theme.filesPanels.modalRow.disabledFill
            : props.theme.filesPanels.modalRow.fill};
      }

      svg {
        width: 16px;
        min-width: 16px;
        height: 16px;
        min-height: 16px;
      }
    }
  }

  .embedding-panel_code-container {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .embedding-panel_text {
    padding: 8px 0 4px 0;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: 1;
    margin: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0px;
          `
        : css`
            right: 0px;
          `}
  }

  .embedding-panel_links-container {
    display: flex;

    .embedding-panel_link {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}

      border: 1px solid #eceef1;
      border-radius: 16px;
      line-height: 30px;
      padding: 4px 15px;
    }
  }

  .embedding-panel_inputs-container {
    display: flex;

    .embedding-panel_input {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}
      width: 94px;
    }
  }

  .embedding-panel_code-container {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .embedding-panel_text {
    padding: 8px 0 4px 0;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: 1;
    margin: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `}
  }

  .panel-loader-wrapper {
    margin-top: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 32px;
          `
        : css`
            padding-left: 32px;
          `}
  }
  .panel-loader {
    display: inline;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 10px;
          `
        : css`
            margin-right: 10px;
          `}
  }

  @media ${tablet} {
    .row_content {
      height: 19px;
      overflow: initial;
    }
  }
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.filesPanels.color};
`;

StyledModalRowContainer.defaultProps = { theme: Base };

const StyledUploadBody = styled.div`
  width: calc(100% + 16px);
  height: 100%;

  .scroll-body {
    padding-inline-end: 0px !important;
  }
`;

export {
  StyledAsidePanel,
  StyledEmbeddingPanel,
  StyledVersionHistoryPanel,
  StyledContent,
  StyledBody,
  StyledFooter,
  StyledLinkRow,
  StyledModalRowContainer,
  StyledLink,
  StyledNewFilesBody,
  StyledUploadBody,
};
