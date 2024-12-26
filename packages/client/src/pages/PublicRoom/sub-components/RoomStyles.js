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

import styled from "styled-components";
import { mobile, tablet } from "@docspace/shared/utils";
import BackgroundPatternReactSvgUrl from "PUBLIC_DIR/images/background.pattern.react.svg?url";

export const StyledPage = styled.div`
  width: 100%;
  height: 100%;

  background-image: url("${BackgroundPatternReactSvgUrl}");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;

  .public-room-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    max-width: 960px;
    box-sizing: border-box;
  }

  @media ${tablet} {
    padding: 0 16px;
  }

  @media ${mobile} {
    padding-block: 0;
    padding-inline: 16px 8px;
    background-image: none;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .password-form {
    width: 100%;
    margin-bottom: 8px;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .public-room-content {
    width: 100%;
    padding-top: 9%;
    justify-content: unset;
    min-height: unset;

    .public-room-text {
      margin: 8px 0;
      white-space: wrap;
    }

    .public-room-name {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .public-room-icon {
      min-width: 32px;
      min-height: 32px;
    }
  }
`;

export const StyledContent = styled.div`
  min-height: 100vh;
  flex: 1 0 auto;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;

  @media ${mobile} {
    justify-content: start;
    min-height: 100%;
  }
`;

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 56px auto;

  @media ${mobile} {
    width: 100%;
    margin: 0 auto;
  }

  .title {
    margin-bottom: 32px;
    text-align: center;
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .portal-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 64px;
  }

  .password-field-wrapper {
    width: 100%;
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
`;
