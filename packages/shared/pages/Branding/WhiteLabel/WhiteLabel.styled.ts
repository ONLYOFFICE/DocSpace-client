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

import styled from "styled-components";

import { mobile } from "../../../utils";

export const StyledHeader = styled.div`
  .subtitle {
    margin-bottom: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .header-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wl-subtitle {
    margin-top: 8px;
    margin-bottom: 20px;
  }

  .wl-helper {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-bottom: 16px;

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
`;

export const WhiteLabelWrapper = styled.div`
  .use-as-logo {
    margin-top: 12px;
    margin-bottom: 24px;
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

  .logos-editor-wrapper {
    display: grid;
    grid-gap: 16px;
    margin-bottom: 8px;

    @media ${mobile} {
      display: flex;
      gap: 8px;
      flex-direction: column;
    }
  }

  .logos-editor-container,
  .editor-header-container {
    display: flex;
    flex-direction: column;
    width: 310px;
  }

  .editor-logo-header {
    border: none !important;
    background-color: transparent !important;
    position: absolute;
  }

  .editor-header-container {
    position: relative;
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
    width: 86px;
    height: 20px;
    padding: 0;
    padding-right: 224px;
  }

  .logo-embedded-editor {
    width: 86px;
    height: 20px;
    left: 0px;
    padding: 0;
    margin-bottom: 8px;
  }

  .background-green {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.greenBackgroundColor};
  }

  .background-blue {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.blueBackgroundColor};
  }

  .background-orange {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.orangeBackgroundColor};
  }

  .background-red {
    background-color: ${(props) =>
      props.theme.client.settings.common.whiteLabel.redBackgroundColor};
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
