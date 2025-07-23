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
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

import {
  commonIconsStyles,
  mobile,
  injectDefaultTheme,
  commonInputStyles,
} from "../../../utils";
import { globalColors } from "../../../themes/globalColors";

const iconStyles = css`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesEditingWrapper.fill} !important;
  }
`;

export const StyledCrossIcon = styled(CrossIcon).attrs(injectDefaultTheme)`
  ${iconStyles}
`;

export const StyledHeader = styled.div`
  .header-container {
    display: flex;
    align-items: center;
    gap: 8px;

    @media ${mobile} {
      display: none;
    }
  }

  .wl-subtitle {
    margin-top: 16px;
    margin-bottom: 16px;
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};

    @media ${mobile} {
      margin-top: 0;
    }
  }

  .wl-helper {
    display: flex;
    gap: 4px;
    align-items: center;

    .wl-helper-label > div {
      display: inline-flex;
      margin: 0 4px;
    }
  }

  .paid-badge {
    cursor: auto;
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.paidBadgeBackground};
  }

  .field-label-icon {
      margin-top: 4px;
      margin-bottom: 16px;
    }
  }
`;

export const StyledWhiteLabelInput = styled.div<{ isShowCross: boolean }>`
  max-width: 350px;

  .input-link {
    height: 32px;
    border: 0px;

    > input {
      height: 30px;
    }
  }

  display: flex;
  border: ${(props) => props.theme.filesPanels.invite.border};
  border-radius: 3px;

  .copy-link-icon {
    padding: 0;
  }

  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  .append {
    display: ${(props) => (props.isShowCross ? "flex" : "none")};
    align-items: center;
    padding-inline-end: 8px;
    cursor: default;
  }

  ${commonInputStyles}

  :focus-within {
    border-color: ${(props) => props.theme.inputBlock.borderColor};
  }
`;

export const WhiteLabelWrapper = styled.div`
  .generate-logo {
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .subtitle {
    margin-bottom: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .input {
    max-width: 350px;
  }

  .logos-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .logo-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .logos-wrapper {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 20px;

    @media ${mobile} {
      flex-direction: column;
    }
  }

  .logos-login-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .logo-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
  }

  .border-img {
    border: ${(props) =>
      props.theme.client.settings.common.whiteLabel.borderImg};
    box-sizing: content-box;
  }

  .logo-header {
    width: 211px;
    height: 24px;
    padding: 22px 20px;
  }

  .logo-compact {
    width: 28px;
    height: 28px;
    padding: 15px;
  }

  .logo-big {
    width: 384px;
    height: 42px;
    padding: 12px 20px;

    @media ${mobile} {
      width: 310px;
      height: 35px;
    }
  }

  .logo-about {
    width: 211px;
    height: 24px;
    padding: 12px 20px;
  }

  .logo-favicon {
    width: 30px;
    height: 30px;
    margin-bottom: 5px;
  }

  .logo-docs-editor {
    width: 172px;
    height: 40px;
    padding: 0;
  }

  .background-light {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.backgroundColorLight};
  }

  .background-dark {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.backgroundColorDark};
  }

  .background-white {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.backgroundColorWhite};
  }

  .background-light-editor {
    background-color: ${globalColors.lightEditorBackground};
  }

  .background-dark-editor {
    background-color: ${globalColors.darkEditorBackground};
  }
  .hidden {
    display: none;
  }
`;

export const StyledSpacer = styled.div<{ showReminder: boolean }>`
  height: 24px;

  @media ${mobile} {
    height: ${(props) => (props.showReminder ? "64px" : "24px")};
  }
`;
