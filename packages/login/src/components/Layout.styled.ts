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

import { injectDefaultTheme, mobile, tablet } from "@docspace/shared/utils";

export const ContentWrapper = styled.div.attrs(injectDefaultTheme)<{
  bgPattern: string;
}>`
  width: 100%;
  height: 100dvh;

  box-sizing: border-box;

  @media ${mobile} {
    height: calc(100% - 48px);
  }

  .bg-cover {
    background-image: ${(props) => props.bgPattern};
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
    position: fixed;
    inset: 0;

    @media ${mobile} {
      background-image: none;
      height: 0;
    }
  }

  .greeting-container {
    margin-bottom: 32px;
    max-width: 380px;
    min-width: 380px;

    @media ${tablet} {
      max-width: 480px;
      min-width: 480px;
    }

    @media ${mobile} {
      max-width: 100%;
      min-width: 100%;
    }

    p {
      text-align: center;
      overflow-wrap: break-word;

      @media ${mobile} {
        margin-top: 32px;

        &.confirm-email-change {
          margin-top: 0;
        }
      }
    }
  }

  .language-combo-box {
    position: fixed;
    inset-inline-end: 28px;
    top: 28px;

    @media ${mobile} {
      display: none;
    }
  }

  .subtitle {
    margin-bottom: 32px;
  }

  .sign-in-subtitle {
    margin-bottom: 32px;
    text-align: center;
    line-height: 22px;
  }

  .invitation-info-container {
    margin-bottom: 32px;

    p {
      text-align: center;
      line-height: 20px;
    }

    .sign-in-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      margin-bottom: 32px;

      .back-title {
        position: absolute;
        text-overflow: ellipsis;
        overflow: hidden;

        inset-inline-start: 0;

        display: flex;
        gap: 4px;

        svg {
          ${(props) =>
            props.theme.interfaceDirection === "rtl" &&
            " transform: rotate(180deg)"};
          padding-top: 2px;
        }

        p {
          color: ${(props) => props.theme.login.backTitle.color};
        }

        p:hover {
          cursor: pointer;
        }
      }
    }
  }
`;

export const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  max-width: 960px;
  box-sizing: border-box;
  min-height: 100vh;

  user-select: none;

  @media ${mobile} {
    justify-content: start;
    min-height: 100%;
  }
`;
