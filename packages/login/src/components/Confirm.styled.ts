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

"use client";

import styled from "styled-components";
import { mobile, tablet } from "@docspace/shared/utils";

export const StyledBody = styled.div`
  margin: 56px auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${tablet} {
    padding: 0 16px;
  }

  @media ${mobile} {
    margin: 0 auto;
    min-height: 100%;
    max-width: 100%;
    width: calc(100% - 24px);
    padding-block: 32px 0;
    padding-inline: 16px 8px;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .password-form {
    width: 100%;
  }

  .language-combo-box {
    position: absolute;
    inset-inline-end: 28px;
    top: 28px;
  }

  .pageLoader {
    display: flex;
    justify-content: center;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 386px;
    width: 100%;
    height: 44px;
    padding-bottom: 40px;

    svg {
      path:last-child {
        fill: ${(props) => props.theme.client.home.logoColor};
      }
    }

    @media ${mobile} {
      display: none;
    }

    &.guest {
      padding-bottom: 20px;
    }
  }

  .greeting-title {
    display: flex;
    justify-content: center;

    max-width: 480px;
    margin-bottom: 32px;
    text-align: center;

    @media ${mobile} {
      width: 100%;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
    }
  }

  .portal-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 40px;
    max-width: 386px;
    width: 100%;
    height: 44px;

    @media ${mobile} {
      display: none;
    }
  }

  button {
    margin-top: 8px;
  }

  .subtitle + button {
    margin-top: 0;
  }

  .subtitle + div {
    button {
      margin-top: 0;
    }
  }

  .password-field-wrapper {
    min-width: 100%;
  }

  .password-change-form {
    margin-top: 32px;
    margin-bottom: 16px;
  }

  .phone-input {
    margin-bottom: 24px;
  }

  .delete-profile-confirm {
    margin-bottom: 8px;
  }

  .phone-title {
    margin-bottom: 8px;
  }

  .app-code-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .app-code-description {
    box-sizing: border-box;
    margin: 0 0 32px 0;
  }

  .app-code-input,
  .app-code-continue-btn {
    box-sizing: border-box;
  }

  .app-code-text {
    margin-bottom: 8px;
  }

  .guest-avatar {
    margin-bottom: 8px;
  }

  .guest-info-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    margin-bottom: 16px;
  }

  .guest-email {
    color: ${(props) => props.theme.login.orTextColor};
  }

  .guest-info {
    text-align: center;
    margin-top: 24px;
    line-height: 16px;
  }

  .user-info-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;

    padding: 8px 0;

    margin-bottom: 8px;
  }

  .user-email {
    color: ${(props) => props.theme.login.textColor};
  }
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;

  &.buttons-guest {
    gap: 8px;
  }
`;
