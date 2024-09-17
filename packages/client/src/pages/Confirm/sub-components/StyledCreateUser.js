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
import { Box } from "@docspace/shared/components/box";
import { mobile, tablet } from "@docspace/shared/utils";

const DESKTOP_WIDTH = 384;
const TABLET_WIDTH = 480;

export const StyledCreateUserContent = styled.div`
  margin: 88px auto;

  @media ${mobile} {
    margin-top: 0px;
  }
`;

export const GreetingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  height: 100%;
  width: ${DESKTOP_WIDTH}px;

  margin-bottom: 32px;

  @media ${tablet} {
    width: 100%;
    max-width: ${TABLET_WIDTH}px;
  }

  .tooltip {
    p {
      text-align: center;
      overflow-wrap: break-word;
    }

    @media ${mobile} {
      padding: 0 25px;
    }
  }

  .portal-logo {
    width: 100%;
    max-width: 386px;
    height: 44px;
    margin: 0 auto;
    padding-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const RegisterContainer = styled.div`
  
  height: 100%;
  width: 100%;

  .or-label {
    margin: 0 8px;
  }


  .line {
    display: flex;
    width: 100%;
    align-items: center;
    color: ${(props) => props.theme.invitePage.borderColor};;
    padding-top: 35px;
    margin-bottom: 32px;
  }

  .line:before,
  .line:after {
    content: "";
    flex-grow: 1;
    background: ${(props) => props.theme.invitePage.borderColor};
    height: 1px;
    font-size: 0px;
    line-height: 0px;
    margin: 0px;
  }
 
  .auth-form-fields {
    width: 100%;

    .password-field{
        margin-bottom: 24px;
    }

    .email-container{
      ${(props) => props.registrationForm && "display:none"};
    }

    .terms-conditions{
      margin: 20px 0;
    }
    @media ${tablet} {
      width: 100%;
    }
    @media ${mobile} {
      width: 100%;
    }
  }

  .password-field-wrapper {
    width: 100%;
  }

  .greeting-container{
    margin-bottom: 32px;
    p{
      text-align: center;
    }
    .back-sign-in-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      margin-bottom: 16px;
      .back-button {
        position: absolute;
        max-width: 60px;
        text-overflow: ellipsis;
        overflow: hidden;
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                right: 0;
              `
            : css`
                left: 0;
              `};
        display: flex;
        gap: 4px;

        svg {
          ${(props) =>
            props.theme.interfaceDirection === "rtl" &&
            " transform: rotate(180deg)"};
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
}`;
