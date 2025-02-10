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
import { Link } from "@docspace/shared/components/link";
import {
  desktop,
  injectDefaultTheme,
  mobile,
  tablet,
} from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";

const PanelStyles = css`
  .panel_combo-box {
    margin-inline-start: 10px;

    .optionalBlock {
      margin-inline-end: 4px;
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
    inset-inline: 0;
  }
`;

const StyledAsidePanel = styled.div.attrs(injectDefaultTheme)`
  z-index: 310;

  .sharing_panel-header {
    width: 100%;
    font-weight: 700;
    margin: 14px 0;
    padding-inline-end: 10px;
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

const StyledEmbeddingPanel = styled.div`
  ${PanelStyles}
`;

const StyledContent = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${(props) =>
    props.theme.filesPanels.content.backgroundColor};

  .header_aside-panel-plus-icon {
    margin-inline-start: auto;
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
    padding-inline-start: 32px;
  }
  .panel-loader {
    display: inline;
    margin-inline-end: 10px;
  }

  .layout-progress-bar {
    position: fixed;
    inset-inline-end: 15px;
    bottom: 21px;

    @media ${tablet} {
      bottom: 83px;
    }
  }
`;

const StyledBody = styled.div.attrs(injectDefaultTheme)`
  height: 100%;
  width: 100%;

  &.files-operations-body {
    padding-block: 0;
    padding-inline: 16px 0;
    box-sizing: border-box;
    width: 100%;
    height: calc(100vh - 125px);

    .styled-element {
      margin-inline-start: -2px;
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

const StyledNewFilesBody = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  .row_content {
    overflow: visible;
    height: auto;
  }
`;

const StyledFooter = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  position: fixed;
  bottom: 0;
  padding: 16px;
  width: 100%;
  margin: auto;
  inset-inline: 0;
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
      margin-inline-end: 6px;
    }
  }

  .sharing_panel-button {
    margin-inline-start: auto;
  }

  .new_file_panel-first-button {
    margin-inline-end: 8px;
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

const StyledLinkRow = styled.div.attrs(injectDefaultTheme)`
  margin-inline-end: -16px;
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
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
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

const StyledModalRowContainer = styled.div.attrs(injectDefaultTheme)`
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
    margin-inline-start: 0;

    .combo-button {
      height: 30px;
      margin: 0;
      padding: 0;
      border: none;
    }

    .optionalBlock {
      margin-inline-end: 4px;
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
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  }

  .embedding-panel_text {
    padding: 8px 0 4px 0;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: 1;
    margin: 8px;
    inset-inline-end: 0;
  }

  .embedding-panel_links-container {
    display: flex;

    .embedding-panel_link {
      margin-inline-end: 8px;

      border: ${(props) => props.theme.filesPanels.embedding.border};
      border-radius: 16px;
      line-height: 30px;
      padding: 4px 15px;
    }
  }

  .embedding-panel_inputs-container {
    display: flex;

    .embedding-panel_input {
      margin-inline-end: 8px;
      width: 94px;
    }
  }

  .embedding-panel_code-container {
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  }

  .embedding-panel_text {
    padding: 8px 0 4px 0;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: 1;
    margin: 8px;
    inset-inline-end: 0;
  }

  .panel-loader-wrapper {
    margin-top: 8px;
    padding-inline-start: 32px;
  }
  .panel-loader {
    display: inline;
    margin-inline-end: 10px;
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
  StyledContent,
  StyledBody,
  StyledFooter,
  StyledLinkRow,
  StyledModalRowContainer,
  StyledLink,
  StyledNewFilesBody,
  StyledUploadBody,
};
