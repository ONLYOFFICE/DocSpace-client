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

export const StyledForm = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1fr 1fr;
  gap: 80px;
  flex-direction: row;
  justify-content: center;
  margin-top: 24px;

  @media ${tablet} {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  @media ${mobile} {
    margin: 0 auto;
    flex-direction: column;
    gap: 0px;

    padding-inline-end: 8px;
  }

  .app-code-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;

    @media ${tablet} {
      flex-direction: column;
    }
  }

  .logo-wrapper {
    max-width: 386px;
    height: 44px;
    width: auto;

    @media ${tablet} {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media ${mobile} {
      display: none;
    }
  }

  .set-app-description {
    box-sizing: border-box;
    margin: 0 0 32px 0;
    width: 100%;
    max-width: 480px;

    .portal-logo {
      margin: 0 auto;
      max-width: 386px;
      height: 44px;
    }
  }

  .set-app-title {
    margin-bottom: 4px;
  }

  .set-app-subtitle {
    margin-bottom: 20px;
  }
  .set-app-text {
    margin-top: 8px;
  }

  .qrcode-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px 80px;
    border-radius: 6px;
    margin-bottom: 32px;

    @media ${mobile} {
      display: none;
    }
  }

  .app-code-input,
  .app-code-continue-btn {
    box-sizing: border-box;
  }

  .description {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .description-item {
      display: flex;
      gap: 12px;
    }

    .icon-container {
      position: relative;
      height: 32px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .icon-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--accent-main);
      opacity: 0.1;
      border-radius: 6px;
      z-index: -1;
    }
  }

  strong {
    user-select: text;
  }
`;
